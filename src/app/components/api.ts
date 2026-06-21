import { projectId as _projectId, publicAnonKey as _publicAnonKey } from "../../../utils/supabase/info";
import { log } from "./logger";
import { enqueue } from "./offlineQueue";

// Prefer explicit env vars (production deployments) — fall back to the
// platform-generated values when running inside Figma Make.
//
// Supports two modes:
//  1. VITE_SUPABASE_URL  = domaine personnalisé (ex: https://essaisupabase.ippoo-aptdc.com)
//  2. VITE_SUPABASE_PROJECT_ID = ID projet standard (ex: twdhojynnxfqcgusdses → https://twdhojynnxfqcgusdses.supabase.co)
const supabaseUrl   = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const projectId     = import.meta.env.VITE_SUPABASE_PROJECT_ID || _projectId;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY   || _publicAnonKey;
const fnName        = import.meta.env.VITE_SUPABASE_FN_NAME    || "make-server-7cbeffac";

// Si une URL complète est fournie, on l'utilise directement ; sinon on
// reconstruit l'URL standard Supabase à partir du projectId.
const BASE = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${fnName}`
  : `https://${projectId}.supabase.co/functions/v1/${fnName}`;

/**
 * Runner pour `offlineQueue.flush` — rejoue une mutation persistée.
 * Throws sur erreur (réseau ou HTTP non-2xx) pour que la file le retienne.
 */
export async function replayMutation(m: { url: string; method: string; body?: unknown; headers?: Record<string, string> }): Promise<void> {
  const isAbsolute = /^https?:\/\//i.test(m.url);
  const res = await fetch(isAbsolute ? m.url : `${BASE}${m.url}`, {
    method: m.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
      ...(m.headers ?? {}),
    },
    body: m.body !== undefined ? JSON.stringify(m.body) : undefined,
  });
  if (!res.ok) throw new ApiError(`Rejeu HTTP ${res.status}`, { status: res.status });
}

/** Réponse enveloppe renvoyée par toutes les Edge Functions Healthy Page. */
interface ApiEnvelope {
  ok?: boolean;
  data?: unknown;
  error?: string;
  [k: string]: unknown;
}

/** Erreur API normalisée : code HTTP, payload, et flag réseau. */
export class ApiError extends Error {
  status: number;
  payload: unknown;
  isNetwork: boolean;
  isTimeout: boolean;
  constructor(message: string, opts: { status?: number; payload?: unknown; isNetwork?: boolean; isTimeout?: boolean } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status ?? 0;
    this.payload = opts.payload;
    this.isNetwork = !!opts.isNetwork;
    this.isTimeout = !!opts.isTimeout;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function isIdempotent(method?: string) {
  const m = (method ?? 'GET').toUpperCase();
  return m === 'GET' || m === 'HEAD';
}

function backoffDelay(attempt: number, retryAfterHeader?: string | null): number {
  if (retryAfterHeader) {
    const s = Number(retryAfterHeader);
    if (Number.isFinite(s) && s > 0) return Math.min(s * 1000, 10_000);
  }
  // 400ms, 1200ms, 3600ms… + jitter
  const base = 400 * Math.pow(3, attempt);
  return Math.min(base + Math.random() * 200, 6_000);
}

/**
 * Variante "fire-and-forget" : tente la requête ; si on est offline ou que le
 * réseau échoue, on enfile la mutation pour rejeu automatique à la reconnexion
 * au lieu de propager l'erreur. À n'utiliser QUE pour les endpoints dont le
 * caller n'a pas besoin de l'id retourné immédiatement (notes, ressenti,
 * podcast-state, notifications…).
 */
async function fireAndForget(kind: string, path: string, method: 'POST' | 'PUT' | 'DELETE' | 'PATCH', body?: unknown): Promise<void> {
  try {
    await request<unknown>(path, { method, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch (e) {
    if (e instanceof ApiError && e.isNetwork) {
      enqueue({ kind, url: path, method, body });
      log.info('offlineQueue: mutation enfilée (réseau indisponible)', { kind, path });
      return;
    }
    throw e;
  }
}

async function request<T>(path: string, init: RequestInit & { timeoutMs?: number; retries?: number; silent?: boolean } = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = MAX_RETRIES, silent = false, ...rest } = init;
  const method = (rest.method ?? 'GET').toUpperCase();
  const canRetry = isIdempotent(method);
  const maxAttempts = canRetry ? retries + 1 : 1;

  // Court-circuit offline : évite d'attendre le timeout réseau quand le navigateur
  // sait déjà qu'il n'y a pas de connectivité.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError(`Hors ligne — action impossible pour le moment (${path})`, { isNetwork: true });
  }

  let lastErr: ApiError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        ...rest,
        signal: rest.signal ?? controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          ...(rest.headers ?? {}),
        },
      });
    } catch (e: unknown) {
      clearTimeout(timer);
      const name = e instanceof Error ? e.name : undefined;
      const isTimeout = name === 'AbortError';
      lastErr = new ApiError(
        isTimeout ? `Délai dépassé pour ${path}` : `Réseau indisponible (${path})`,
        { isNetwork: true, isTimeout },
      );
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, backoffDelay(attempt)));
        continue;
      }
      if (!silent) log.error(`API network error`, { path, name });
      throw lastErr;
    }
    clearTimeout(timer);

    const json: ApiEnvelope = await res.json().catch(() => ({} as ApiEnvelope));
    if (res.ok && json.ok !== false) {
      return json.data as T;
    }

    const msg = typeof json.error === 'string' ? json.error : `HTTP ${res.status}`;
    lastErr = new ApiError(msg, { status: res.status, payload: json });

    const retriable = RETRYABLE_STATUS.has(res.status) && canRetry;
    if (retriable && attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, backoffDelay(attempt, res.headers.get('Retry-After'))));
      continue;
    }
    if (!silent) log.error('API request failed', { path, status: res.status, msg });
    throw lastErr;
  }
  // Garde-fou — ne devrait jamais être atteint.
  throw lastErr ?? new ApiError(`Échec inconnu (${path})`);
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  createPatient: (payload: any) =>
    request<{ id: string; patient: any }>("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getPatient: (id: string) =>
    request<{ patient: any; emergency: any; consents: any; carnet: any }>(`/patients/${id}`),
  updatePatient: (id: string, payload: any) =>
    request(`/patients/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePatient: (id: string) =>
    request<{ id: string }>(`/patients/${id}`, { method: "DELETE" }),

  listRdv: (pid: string) => request<any[]>(`/patients/${pid}/rdv`),
  createRdv: (pid: string, body: any) =>
    request(`/patients/${pid}/rdv`, { method: "POST", body: JSON.stringify(body) }),
  updateRdv: (pid: string, id: string, body: any) =>
    request(`/patients/${pid}/rdv/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteRdv: (pid: string, id: string) =>
    request(`/patients/${pid}/rdv/${id}`, { method: "DELETE" }),

  listOrdonnance: (pid: string) => request<any[]>(`/patients/${pid}/ordonnance`),
  createOrdonnance: (pid: string, body: any) =>
    request(`/patients/${pid}/ordonnance`, { method: "POST", body: JSON.stringify(body) }),
  updateOrdonnance: (pid: string, id: string, body: any) =>
    request<any>(`/patients/${pid}/ordonnance/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  listTraitement: (pid: string) => request<any[]>(`/patients/${pid}/traitement`),
  upsertTraitement: (pid: string, id: string, body: any) =>
    request(`/patients/${pid}/traitement/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  listNotification: (pid: string) => request<any[]>(`/patients/${pid}/notification`),
  createNotification: (pid: string, body: any) =>
    fireAndForget('createNotification', `/patients/${pid}/notification`, 'POST', body),
  updateNotification: (pid: string, id: string, body: any) =>
    fireAndForget('updateNotification', `/patients/${pid}/notification/${id}`, 'PUT', body),
  deleteNotification: (pid: string, id: string) =>
    fireAndForget('deleteNotification', `/patients/${pid}/notification/${id}`, 'DELETE'),

  listRessenti: (pid: string) => request<any[]>(`/patients/${pid}/ressenti`),
  saveRessenti: (pid: string, body: any) =>
    fireAndForget('saveRessenti', `/patients/${pid}/ressenti`, 'POST', body),

  listNote: (pid: string) => request<any[]>(`/patients/${pid}/note`),
  createNote: (pid: string, body: any) =>
    fireAndForget('createNote', `/patients/${pid}/note`, 'POST', body),

  listAssistance: (pid: string) => request<any[]>(`/patients/${pid}/assistance`),
  createAssistance: (pid: string, body: any) =>
    request<any>(`/patients/${pid}/assistance`, { method: "POST", body: JSON.stringify(body) }),

  listFilleuls: (pid: string) => request<any[]>(`/patients/${pid}/filleul`),
  createFilleul: (pid: string, body: any) =>
    request<any>(`/patients/${pid}/filleul`, { method: "POST", body: JSON.stringify(body) }),
  updateFilleul: (pid: string, id: string, body: any) =>
    request(`/patients/${pid}/filleul/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteFilleul: (pid: string, id: string) =>
    request(`/patients/${pid}/filleul/${id}`, { method: "DELETE" }),

  listContributions: (pid: string) => request<any[]>(`/patients/${pid}/contribution`),
  createContribution: (pid: string, body: any) =>
    request<any>(`/patients/${pid}/contribution`, { method: "POST", body: JSON.stringify(body) }),

  listFamille: (pid: string) => request<any[]>(`/patients/${pid}/famille`),
  createFamille: (pid: string, body: any) =>
    request<any>(`/patients/${pid}/famille`, { method: "POST", body: JSON.stringify(body) }),
  updateFamille: (pid: string, id: string, body: any) =>
    request(`/patients/${pid}/famille/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteFamille: (pid: string, id: string) =>
    request(`/patients/${pid}/famille/${id}`, { method: "DELETE" }),

  listGrowth: (pid: string) => request<any[]>(`/patients/${pid}/growth`),
  createGrowth: (pid: string, body: any) =>
    request<any>(`/patients/${pid}/growth`, { method: "POST", body: JSON.stringify(body) }),
  deleteGrowth: (pid: string, id: string) =>
    request(`/patients/${pid}/growth/${id}`, { method: "DELETE" }),

  listMeals: (pid: string) => request<any[]>(`/patients/${pid}/meal`),
  createMeal: (pid: string, body: any) =>
    request<any>(`/patients/${pid}/meal`, { method: "POST", body: JSON.stringify(body) }),
  deleteMeal: (pid: string, id: string) =>
    request(`/patients/${pid}/meal/${id}`, { method: "DELETE" }),

  listMessages: (conv: string) => request<any[]>(`/messages/${conv}`),
  sendMessage: (conv: string, body: any) =>
    request(`/messages/${conv}`, { method: "POST", body: JSON.stringify(body) }),

  listAgendaPro: (pid: string) => request<any[]>(`/pro/${pid}/agenda`),
  listFreeSlotsForPro: async (pid: string) => {
    type AgendaSlot = { status?: string; patientId?: string | null; [k: string]: unknown };
    const slots = await request<AgendaSlot[]>(`/pro/${pid}/agenda`).catch(() => [] as AgendaSlot[]);
    return (slots ?? []).filter((s) => s?.status === 'free' && !s?.patientId);
  },
  createAgendaSlot: (pid: string, body: any) =>
    request<any>(`/pro/${pid}/agenda`, { method: "POST", body: JSON.stringify(body) }),
  updateAgendaSlot: (pid: string, id: string, body: any) =>
    request(`/pro/${pid}/agenda/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteAgendaSlot: (pid: string, id: string) =>
    request(`/pro/${pid}/agenda/${id}`, { method: "DELETE" }),

  /**
   * Réservation atomique d'un créneau libre par un patient.
   * 1) marque le slot comme confirmed + lie le patientId
   * 2) crée le RDV côté patient avec status='upcoming'
   * En cas d'échec de l'étape 2, le slot est rollback en 'free'.
   */
  bookFreeSlot: async (
    proId: string,
    slotId: string,
    patientId: string,
    payload: { date: string; time: string; doctor: string; specialty: string; location: string; type: 'cabinet' | 'tele'; patientName: string; forFamille?: { id: string; name: string; relation?: string } | null }
  ) => {
    const labelForPro = payload.forFamille
      ? `${payload.forFamille.name} (${payload.forFamille.relation ?? 'proche'} de ${payload.patientName})`
      : payload.patientName;
    await request(`/pro/${proId}/agenda/${slotId}`, {
      method: "PUT",
      body: JSON.stringify({
        patientId,
        patient: labelForPro,
        motif: payload.specialty,
        status: 'confirmed',
        forFamilleId: payload.forFamille?.id ?? null,
        forName: payload.forFamille?.name ?? null,
        forRelation: payload.forFamille?.relation ?? null,
      }),
    });
    try {
      const rdv = await request<{ id?: string } & Record<string, unknown>>(`/patients/${patientId}/rdv`, {
        method: "POST",
        body: JSON.stringify({
          doctor: payload.doctor,
          specialty: payload.specialty,
          date: payload.date,
          time: payload.time,
          location: payload.location,
          type: payload.type,
          status: 'upcoming',
          proId,
          forFamilleId: payload.forFamille?.id ?? null,
          forName: payload.forFamille?.name ?? null,
          forRelation: payload.forFamille?.relation ?? null,
        }),
      });
      const rdvId = rdv?.id;
      if (rdvId) {
        await request(`/pro/${proId}/agenda/${slotId}`, {
          method: "PUT",
          body: JSON.stringify({ rdvId }),
        }).catch(() => null);
      }
      return rdv;
    } catch (e) {
      await request(`/pro/${proId}/agenda/${slotId}`, {
        method: "PUT",
        body: JSON.stringify({ patientId: '', patient: 'Disponible', status: 'free' }),
      }).catch(() => null);
      throw e;
    }
  },

  listPros: () => request<any[]>("/pro").catch(() => [] as any[]),
  getPro: (id: string) => request<any>(`/pro/${id}`),
  createPro: (body: any) => request("/pro", { method: "POST", body: JSON.stringify(body) }),
  updatePro: (id: string, body: any) =>
    request<any>(`/pro/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePro: (id: string) =>
    request<{ id: string }>(`/pro/${id}`, { method: "DELETE" }),
  searchPros: (filters: { q?: string; specialty?: string; city?: string; minRating?: number; hasFreeSlots?: boolean; type?: string } = {}) => {
    const qs = new URLSearchParams();
    if (filters.q) qs.set('q', filters.q);
    if (filters.specialty) qs.set('specialty', filters.specialty);
    if (filters.city) qs.set('city', filters.city);
    if (filters.minRating) qs.set('minRating', String(filters.minRating));
    if (filters.hasFreeSlots) qs.set('hasFreeSlots', 'true');
    if (filters.type) qs.set('type', filters.type);
    const s = qs.toString();
    return request<any[]>(`/pros/search${s ? `?${s}` : ''}`);
  },
  listDelegates: (proId: string) => request<any[]>(`/pro/${proId}/delegates`),
  addDelegate: (proId: string, body: { delegateProId: string; role?: 'praticien' | 'secretaire' }) =>
    request<{ delegates: any[] }>(`/pro/${proId}/delegates`, { method: 'POST', body: JSON.stringify(body) }),
  removeDelegate: (proId: string, delegateProId: string) =>
    request<{ delegates: any[] }>(`/pro/${proId}/delegates/${delegateProId}`, { method: 'DELETE' }),
  listManagedPros: (proId: string) =>
    request<Array<{ proId: string; name: string; specialty: string; role: 'praticien' | 'secretaire' }>>(`/pros/${proId}/managed`),

  generateAgendaFeedToken: (proId: string) =>
    request<{ token: string }>(`/pro/${proId}/agenda/feed-token`, { method: 'POST' }),
  agendaFeedUrl: (proId: string, token: string) =>
    `${BASE}/pro/${proId}/agenda.ics?token=${encodeURIComponent(token)}`,

  listWaitlistForPro: (proId: string) => request<any[]>(`/pro/${proId}/waitlist`),
  joinWaitlist: (proId: string, body: { patientId: string; patientName?: string; patientPhone?: string; specialty?: string; desiredFrom?: string | null; desiredTo?: string | null }) =>
    request<any>(`/pro/${proId}/waitlist`, { method: 'POST', body: JSON.stringify(body) }),
  leaveWaitlist: (proId: string, id: string) =>
    request(`/pro/${proId}/waitlist/${id}`, { method: 'DELETE' }),
  listWaitlistForPatient: (pid: string) => request<any[]>(`/patients/${pid}/waitlist`),

  listProReviews: (pid: string) => request<any[]>(`/pro/${pid}/reviews`),
  createProReview: (pid: string, body: any) =>
    request<any>(`/pro/${pid}/reviews`, { method: "POST", body: JSON.stringify(body) }),
  deleteProReview: (pid: string, id: string) =>
    request(`/pro/${pid}/reviews/${id}`, { method: "DELETE" }),

  listCentres: () => request<any[]>("/centre").catch(() => [] as any[]),
  listCentreReviews: (cid: string | number) => request<any[]>(`/centre/${cid}/reviews`),
  createCentreReview: (cid: string | number, body: any) =>
    request<any>(`/centre/${cid}/reviews`, { method: "POST", body: JSON.stringify(body) }),
  deleteCentreReview: (cid: string | number, id: string) =>
    request(`/centre/${cid}/reviews/${id}`, { method: "DELETE" }),

  listVault: (pid: string) =>
    request<Array<{ id: string; name: string; category: string; notes: string; mime: string; size: number; createdAt: string }>>(`/patients/${pid}/vault`),
  uploadVaultDoc: (pid: string, body: { name: string; dataUrl: string; category?: string; notes?: string }) =>
    request<{ id: string; name: string; mime: string; size: number; createdAt: string }>(`/patients/${pid}/vault`, { method: 'POST', body: JSON.stringify(body) }),
  getVaultContent: (pid: string, id: string) =>
    request<{ name: string; mime: string; size: number; base64: string }>(`/patients/${pid}/vault/${id}/content`),
  deleteVaultDoc: (pid: string, id: string) =>
    request(`/patients/${pid}/vault/${id}`, { method: 'DELETE' }),

  uploadPhoto: (kind: 'patient' | 'pro', ownerId: string, dataUrl: string) =>
    request<{ path: string; url: string }>("/photos", {
      method: "POST",
      body: JSON.stringify({ kind, ownerId, dataUrl }),
    }),

  findPatientByPhone: (phone: string) =>
    request<{ id: string; firstName: string | null; lastName: string | null }>(`/patients/by-phone/${encodeURIComponent(phone)}`),
  listProPatients: (proId: string) => request<any[]>(`/pros/${proId}/patients`),

  getPodcastState: (pid: string) =>
    request<{ favs: string[]; downloads: string[]; history: { id: string; at: number; pos: number; duration?: number }[] }>(`/patients/${pid}/podcast-state`).catch(() => ({ favs: [], downloads: [], history: [] })),
  savePodcastState: (pid: string, body: { favs: string[]; downloads: string[]; history: { id: string; at: number; pos: number; duration?: number }[] }) =>
    fireAndForget('savePodcastState', `/patients/${pid}/podcast-state`, 'PUT', body).catch(() => null),

  podcastFeed: (lang?: string, since = 0) => {
    const qs = new URLSearchParams();
    if (lang) qs.set('lang', lang);
    qs.set('since', String(since));
    return request<Array<{ id: string; title: string; cat: string; host: string; duration: string; cover: string; lang: string; publishedAt: number }>>(`/podcast/feed?${qs.toString()}`).catch(() => []);
  },
  publishEpisode: (body: any) =>
    request(`/podcast/episodes`, { method: 'POST', body: JSON.stringify(body) }).catch(() => null),
  getPodcastNotif: (pid: string) =>
    request<{ enabled: boolean; lang: string; lastSeenAt: number } | null>(`/patients/${pid}/podcast-notif`).catch(() => null),
  savePodcastNotif: (pid: string, body: { enabled: boolean; lang: string; lastSeenAt: number; endpoint?: string | null; keys?: any }) =>
    fireAndForget('savePodcastNotif', `/patients/${pid}/podcast-notif`, 'PUT', body).catch(() => null),

  transcribeEpisode: (episodeId: string, audioUrl: string) =>
    request<{ words: { w: string; t: number }[]; lang: string }>(`/podcast/${episodeId}/transcribe`, {
      method: "POST",
      body: JSON.stringify({ audioUrl }),
    }).catch(() => null),

  initiatePayment: (body: {
    patientId: string;
    amount: number;
    currency?: string;
    method: 'mtn_momo' | 'orange_money' | 'moov_money' | 'wave' | 'card' | 'bank_transfer';
    purpose: string;
    phone?: string;
    bankIban?: string;
    cardLast4?: string;
    rdvId?: string;
    ordonnanceId?: string;
    proId?: string;
    ref?: string;
  }) => request<any>(`/payments/initiate`, { method: 'POST', body: JSON.stringify(body) }),

  getPayment: (pid: string, id: string) => request<any>(`/payments/${pid}/${id}`),

  listPayments: (pid: string) => request<any[]>(`/patients/${pid}/payments`).catch(() => [] as any[]),

  confirmBankTransfer: (pid: string, id: string) =>
    request<any>(`/payments/${pid}/${id}/confirm`, { method: 'POST' }),

  getRdvByToken: (token: string) =>
    request<{ rdv: any; patientName: string }>(`/rdv-action/${encodeURIComponent(token)}`),
  rdvAction: (token: string, action: 'confirm' | 'cancel') =>
    request<{ rdv: any }>(`/rdv-action/${encodeURIComponent(token)}/${action}`, { method: 'POST' }),

  scanReminders: (pid: string, channels?: string[]) =>
    request<{ sent: Array<{ rdvId: string; kind: 'J1' | 'H2'; smsOk?: boolean; mocked?: boolean }>; count: number }>(`/reminders/scan/${pid}`, {
      method: "POST",
      body: JSON.stringify({ channels: channels ?? ['sms', 'push', 'inapp'] }),
    }).catch(() => ({ sent: [], count: 0 })),

  listProfilSante: (pid: string) =>
    request<Array<{ id: string; section: string; label: string; detail?: string; date?: string; createdAt: string }>>(`/patients/${pid}/profilsante`),
  upsertProfilSante: (pid: string, body: { id?: string; section: string; label: string; detail?: string; date?: string }) => {
    if (body.id) return request<any>(`/patients/${pid}/profilsante/${body.id}`, { method: "PUT", body: JSON.stringify(body) });
    return request<any>(`/patients/${pid}/profilsante`, { method: "POST", body: JSON.stringify(body) });
  },
  deleteProfilSante: (pid: string, id: string) =>
    request(`/patients/${pid}/profilsante/${id}`, { method: "DELETE" }),

  scanVaccinReminders: (opts?: { withinDays?: number; channels?: string[]; token?: string }) =>
    request<{ sent: Array<{ patientId: string; vaccinId: string; name: string; daysLeft: number; smsOk: boolean; mocked?: boolean }>; count: number; scanned: number; withinDays: number; skipped: number }>(
      `/reminders/scan-vaccins`,
      { method: "POST", body: JSON.stringify(opts ?? {}), headers: opts?.token ? { 'x-cron-token': opts.token } : {} },
    ),

  testReminderSms: (to: string, body?: string) =>
    request<{ ok: boolean; mocked?: boolean; error?: string }>(`/reminders/test`, {
      method: "POST",
      body: JSON.stringify({ to, body: body ?? 'Healthy Page · Test rappel SMS' }),
    }),

  listVaccins: (pid: string) =>
    request<Array<{ id: string; name: string; doseLabel?: string; doseDate: string; nextDueDate?: string | null; lot?: string; site?: string; notes?: string; createdAt: string }>>(`/patients/${pid}/vaccin`),
  upsertVaccin: (pid: string, body: { id?: string; name: string; doseLabel?: string; doseDate: string; nextDueDate?: string | null; lot?: string; site?: string; notes?: string }) => {
    if (body.id) {
      return request<any>(`/patients/${pid}/vaccin/${body.id}`, { method: "PUT", body: JSON.stringify(body) });
    }
    return request<any>(`/patients/${pid}/vaccin`, { method: "POST", body: JSON.stringify(body) });
  },
  deleteVaccin: (pid: string, id: string) =>
    request(`/patients/${pid}/vaccin/${id}`, { method: "DELETE" }),

  triageAI: (body: { description: string; age?: number | string; sex?: string; context?: string }) =>
    request<{ urgency: 'urgence' | 'conseil' | 'rdv'; specialty: string; reasoning: string; redFlags: string[]; followUpQuestions: string[]; usage: any }>(
      `/triage/ai`,
      { method: "POST", body: JSON.stringify(body) },
    ),

  otpSend: (phone: string, scope: 'patient' | 'pro' | 'centre' | 'admin' = 'patient') =>
    request<{ sent: boolean; ttlSeconds: number; scope: string; demoCode: string | null }>(
      `/otp/send`,
      { method: 'POST', body: JSON.stringify({ phone, scope }) },
    ),

  otpVerify: (phone: string, code: string) =>
    request<{ verified: boolean; scope: string }>(
      `/otp/verify`,
      { method: 'POST', body: JSON.stringify({ phone, code }) },
    ),

  adminPatients: () => request<any[]>("/admin/patients").catch(() => [] as any[]),
  adminRdvs: () => request<any[]>("/admin/rdvs").catch(() => [] as any[]),
  adminStats: () => request<{ patients: number; pros: number; centres: number; rdvs: number; growth: number; famille: number; diaspora: number; meals: number; contributions: number; filleuls: number; notifications: number }>("/admin/stats").catch(() => ({ patients: 0, pros: 0, centres: 0, rdvs: 0, growth: 0, famille: 0, diaspora: 0, meals: 0, contributions: 0, filleuls: 0, notifications: 0 })),
};
