// Logger Healthy Page.
//
// Pourquoi : 46 `console.*` éparpillés en code de prod fuitent des données
// internes (payload API, IDs patients) dans la console navigateur et polluent
// les outils de monitoring. On veut :
//  - silencer debug/info en prod par défaut,
//  - conserver warn/error pour le diagnostic,
//  - permettre de brancher Sentry / un endpoint custom plus tard,
//  - éviter de loguer des objets contenant de la PII par accident.

type Level = 'debug' | 'info' | 'warn' | 'error';

export type LogSink = (level: Level, msg: string, meta?: Record<string, unknown>) => void;

const IS_DEV = !!import.meta.env?.DEV;

let sink: LogSink | null = null;
/** Branche un collecteur externe (Sentry, Logflare, etc.) à l'init de l'app. */
export function setLogSink(fn: LogSink | null) { sink = fn; }

const DEFAULT_ENABLED: Record<Level, boolean> = {
  debug: IS_DEV,
  info: IS_DEV,
  warn: true,
  error: true,
};

/**
 * Liste de clés susceptibles de contenir de la PII / données santé.
 * Si une `meta` les contient, on remplace la valeur par "[redacted]".
 */
const PII_KEYS = new Set([
  'email', 'phone', 'password', 'token', 'authorization', 'apiKey',
  'firstName', 'lastName', 'dob', 'address', 'allergies', 'chronicDiseases',
  'policyNumber', 'emPhone', 'patientId', 'backendId',
]);

function redact(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    out[k] = PII_KEYS.has(k) ? '[redacted]' : v;
  }
  return out;
}

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (!DEFAULT_ENABLED[level]) return;
  const safe = redact(meta);
  const fn = level === 'debug' ? console.debug
           : level === 'info'  ? console.info
           : level === 'warn'  ? console.warn
           : console.error;
  if (safe) fn(`[hp] ${msg}`, safe); else fn(`[hp] ${msg}`);
  if (sink) {
    try { sink(level, msg, safe); } catch { /* sink ne doit jamais casser l'app */ }
  }
}

export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info:  (msg: string, meta?: Record<string, unknown>) => emit('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => emit('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
};
