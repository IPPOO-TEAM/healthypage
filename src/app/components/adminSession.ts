const KEY_SESSION = 'healthy-page:admin-session';
const KEY_AUDIT = 'healthy-page:admin-audit';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type AdminSession = {
  email: string;
  loggedAt: string;
  expiresAt: string;
};

export function startAdminSession(email: string): AdminSession {
  const now = Date.now();
  const session: AdminSession = {
    email,
    loggedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
  try {
    window.localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    window.localStorage.setItem('healthy-page:role', 'admin');
  } catch {}
  logAudit('login', email);
  return session;
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(KEY_SESSION);
    if (!raw) return null;
    const s: AdminSession = JSON.parse(raw);
    if (Date.now() > new Date(s.expiresAt).getTime()) {
      endAdminSession();
      return null;
    }
    return s;
  } catch { return null; }
}

export function endAdminSession() {
  try {
    const s = getAdminSession();
    if (s) logAudit('logout', s.email);
    window.localStorage.removeItem(KEY_SESSION);
    window.localStorage.removeItem('healthy-page:role');
  } catch {}
}

export type AuditEntry = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target?: string;
};

export function logAudit(action: string, actor: string, target?: string) {
  try {
    const raw = window.localStorage.getItem(KEY_AUDIT);
    const list: AuditEntry[] = raw ? JSON.parse(raw) : [];
    const entry: AuditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ts: new Date().toISOString(),
      actor,
      action,
      target,
    };
    list.unshift(entry);
    window.localStorage.setItem(KEY_AUDIT, JSON.stringify(list.slice(0, 500)));
  } catch {}
}

export function readAudit(): AuditEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY_AUDIT);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
