import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'healthy-page:points';
const EVENT = 'healthy-page:points-changed';

export type PointsLedgerEntry = {
  id: string;
  delta: number;
  reason: string;
  source: 'voyage' | 'jeux' | 'urgences' | 'wheel' | 'quiz' | 'concours' | 'other';
  at: string;
  meta?: Record<string, any>;
};

export type PointsState = {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  level: number;
  ledger: PointsLedgerEntry[];
};

const empty: PointsState = { balance: 0, totalEarned: 0, totalSpent: 0, level: 1, ledger: [] };

function readState(): PointsState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded: PointsState = {
        balance: 50, totalEarned: 50, totalSpent: 0, level: 1,
        ledger: [{ id: `pt-init-${Date.now()}`, delta: 50, reason: 'Bienvenue HEALTHY PAGE', source: 'other', at: new Date().toISOString() }],
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

function writeState(s: PointsState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: s }));
  } catch {}
}

function levelFromTotal(total: number): number {
  if (total < 100) return 1;
  if (total < 300) return 2;
  if (total < 700) return 3;
  if (total < 1500) return 4;
  if (total < 3000) return 5;
  return 6;
}

export function awardPoints(delta: number, reason: string, source: PointsLedgerEntry['source'], meta?: Record<string, any>): PointsState {
  const cur = readState();
  const next: PointsState = {
    balance: cur.balance + delta,
    totalEarned: cur.totalEarned + (delta > 0 ? delta : 0),
    totalSpent: cur.totalSpent + (delta < 0 ? -delta : 0),
    level: 1,
    ledger: [
      {
        id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        delta,
        reason,
        source,
        at: new Date().toISOString(),
        meta,
      },
      ...cur.ledger,
    ].slice(0, 200),
  };
  next.level = levelFromTotal(next.totalEarned);
  writeState(next);
  return next;
}

export function spendPoints(amount: number, reason: string, source: PointsLedgerEntry['source'], meta?: Record<string, any>): { ok: boolean; state: PointsState } {
  const cur = readState();
  if (cur.balance < amount) return { ok: false, state: cur };
  return { ok: true, state: awardPoints(-amount, reason, source, meta) };
}

export function usePoints(): PointsState & {
  award: (delta: number, reason: string, source: PointsLedgerEntry['source'], meta?: Record<string, any>) => void;
  spend: (amount: number, reason: string, source: PointsLedgerEntry['source'], meta?: Record<string, any>) => boolean;
} {
  const [state, setState] = useState<PointsState>(() => (typeof window !== 'undefined' ? readState() : empty));

  useEffect(() => {
    const onChange = (e: any) => setState(e.detail ?? readState());
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) setState(readState()); };
    window.addEventListener(EVENT, onChange as any);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange as any);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const award = useCallback((delta: number, reason: string, source: PointsLedgerEntry['source'], meta?: Record<string, any>) => {
    setState(awardPoints(delta, reason, source, meta));
  }, []);

  const spend = useCallback((amount: number, reason: string, source: PointsLedgerEntry['source'], meta?: Record<string, any>) => {
    const r = spendPoints(amount, reason, source, meta);
    setState(r.state);
    return r.ok;
  }, []);

  return { ...state, award, spend };
}
