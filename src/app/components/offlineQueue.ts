// File d'attente de mutations offline pour Healthy Page.
//
// Pourquoi : `api.ts` court-circuite déjà les requêtes quand `navigator.onLine`
// est false, mais une mutation perdue (RDV pris dans le métro, note ajoutée
// en zone blanche…) doit pouvoir être rejouée à la reconnexion plutôt que
// de simplement échouer.
//
// Stratégie :
//  - On ne touche PAS aux GET (idempotents, sans effet → re-fetch suffit).
//  - On enfile uniquement les mutations explicitement marquées "queueable".
//  - Persistance via safeStorage (namespacé) pour survivre à un reload.
//  - Rejeu séquentiel à l'événement `online`, avec backoff léger en cas
//    d'échec serveur, et abandon définitif au-delà de N tentatives.

import { safeStorage } from './safeStorage';
import { log } from './logger';

const QUEUE_KEY = 'offlineQueue';
const MAX_ATTEMPTS = 5;

export interface QueuedMutation {
  id: string;
  /** Identifiant logique (ex. "createRdv", "savePodcastState") — pour la télémétrie. */
  kind: string;
  /** URL absolue OU chemin relatif à concaténer côté runner. */
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  createdAt: number;
  attempts: number;
}

type Runner = (m: QueuedMutation) => Promise<void>;

function readQueue(): QueuedMutation[] {
  return safeStorage.getJSON<QueuedMutation[]>(QUEUE_KEY, []);
}
function writeQueue(q: QueuedMutation[]): void {
  safeStorage.setJSON(QUEUE_KEY, q);
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Ajoute une mutation à la file. Retourne l'id assigné. */
export function enqueue(m: Omit<QueuedMutation, 'id' | 'createdAt' | 'attempts'>): string {
  const q = readQueue();
  const item: QueuedMutation = { ...m, id: newId(), createdAt: Date.now(), attempts: 0 };
  q.push(item);
  writeQueue(q);
  return item.id;
}

/** Vide la file (debug/admin). */
export function clearQueue(): void {
  writeQueue([]);
}

/** Snapshot pour UI (badge "N actions en attente"). */
export function pendingCount(): number {
  return readQueue().length;
}

export function listPending(): QueuedMutation[] {
  return readQueue();
}

/** Rejoue les mutations FIFO. Stoppe à la première erreur réseau (on retentera). */
export async function flush(runner: Runner): Promise<{ flushed: number; failed: number; dropped: number }> {
  let flushed = 0, failed = 0, dropped = 0;
  // On relit à chaque tour pour absorber les enqueues concurrents.
  while (true) {
    const q = readQueue();
    if (q.length === 0) break;
    const head = q[0];
    try {
      await runner(head);
      // Succès : on retire la tête (en relisant pour ne pas écraser un push).
      const fresh = readQueue();
      fresh.shift();
      writeQueue(fresh);
      flushed++;
    } catch (e) {
      head.attempts += 1;
      const fresh = readQueue();
      if (head.attempts >= MAX_ATTEMPTS) {
        fresh.shift();
        writeQueue(fresh);
        dropped++;
        log.error('offlineQueue: mutation abandonnée après MAX_ATTEMPTS', { kind: head.kind, id: head.id });
        continue;
      }
      // Persiste le compteur d'attempts et stoppe — on retentera plus tard.
      if (fresh[0]?.id === head.id) {
        fresh[0] = head;
        writeQueue(fresh);
      }
      failed++;
      break;
    }
  }
  return { flushed, failed, dropped };
}

let listenerInstalled = false;

/** Branche le rejeu automatique à l'événement `online`. Idempotent. */
export function installAutoFlush(runner: Runner): () => void {
  if (typeof window === 'undefined') return () => {};
  if (listenerInstalled) return () => {};
  listenerInstalled = true;
  const handler = () => {
    flush(runner).catch((e) => log.error('offlineQueue: flush a throw', { err: String(e) }));
  };
  window.addEventListener('online', handler);
  // Premier essai si déjà en ligne au boot et file non vide.
  if (navigator.onLine && pendingCount() > 0) handler();
  return () => {
    window.removeEventListener('online', handler);
    listenerInstalled = false;
  };
}
