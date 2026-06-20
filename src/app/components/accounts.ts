// Patient accounts storage (localStorage). Persists user/customer data across sessions.

export type PatientAccount = {
  id: string;
  backendId?: string;
  email: string;
  phone: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dob?: string;
  sex?: 'F' | 'M';
  address?: string;
  city?: string;
  country?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  insurer?: string;
  policyNumber?: string;
  emName?: string;
  emRelation?: string;
  emPhone?: string;
  height?: number;
  weight?: number;
  profession?: string;
  createdAt: number;
};

const ACCOUNTS_KEY = 'healthy-page:accounts';
const CURRENT_KEY = 'healthy-page:current-account-id';
const SESSION_KEY = 'healthy-page:session';

// Inactivity: 30 min sans interaction → déconnexion.
// Absolute: 7 jours max après la connexion, même si l'utilisateur reste actif.
export const SESSION_INACTIVITY_MS = 30 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

type SessionMeta = { loginAt: number; lastActivityAt: number };

function readSession(): SessionMeta | null {
  try { const raw = ls.get(SESSION_KEY); return raw ? JSON.parse(raw) as SessionMeta : null; } catch { return null; }
}
function writeSession(s: SessionMeta) { ls.set(SESSION_KEY, JSON.stringify(s)); }

export function isSessionExpired(now: number = Date.now()): boolean {
  const s = readSession();
  if (!s) return false;
  if (now - s.loginAt > SESSION_ABSOLUTE_MS) return true;
  if (now - s.lastActivityAt > SESSION_INACTIVITY_MS) return true;
  return false;
}

export function touchSession() {
  const s = readSession();
  if (!s) return;
  writeSession({ ...s, lastActivityAt: Date.now() });
}

export function getSessionMeta(): SessionMeta | null { return readSession(); }

const ls = {
  get: (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch {} },
  del: (k: string) => { try { window.localStorage.removeItem(k); } catch {} },
};

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return `hp_${(h >>> 0).toString(36)}_${s.length}`;
}

export function listAccounts(): PatientAccount[] {
  try { return JSON.parse(ls.get(ACCOUNTS_KEY) || '[]'); } catch { return []; }
}

export function saveAccounts(list: PatientAccount[]) {
  ls.set(ACCOUNTS_KEY, JSON.stringify(list));
}

export function getAccount(id: string): PatientAccount | undefined {
  return listAccounts().find((a) => a.id === id);
}

export function findAccountByLogin(login: string): PatientAccount | undefined {
  const norm = login.trim().toLowerCase();
  if (!norm) return undefined;
  const normNoSpace = norm.replace(/\s/g, '');
  return listAccounts().find((a) =>
    (!!a.email && a.email.toLowerCase() === norm) ||
    (!!a.phone && a.phone.replace(/\s/g, '') === normNoSpace)
  );
}

export function authenticate(login: string, password: string): PatientAccount | null {
  const acc = findAccountByLogin(login);
  if (!acc) return null;
  if (acc.passwordHash !== hash(password)) return null;
  return acc;
}

export function resetPassword(login: string, newPassword: string): PatientAccount | null {
  const acc = findAccountByLogin(login);
  if (!acc) return null;
  updateAccount(acc.id, { passwordHash: hash(newPassword) } as any);
  return getAccount(acc.id) ?? null;
}

export function createAccount(input: Omit<PatientAccount, 'id' | 'passwordHash' | 'createdAt'> & { password: string }): PatientAccount {
  const list = listAccounts();
  if (findAccountByLogin(input.email) || findAccountByLogin(input.phone)) {
    throw new Error('Un compte existe déjà avec cet email ou numéro.');
  }
  const acc: PatientAccount = {
    id: `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    email: input.email,
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName,
    dob: input.dob,
    sex: input.sex,
    address: input.address,
    city: input.city,
    country: input.country,
    bloodType: input.bloodType,
    allergies: input.allergies,
    chronicDiseases: input.chronicDiseases,
    insurer: input.insurer,
    policyNumber: input.policyNumber,
    emName: input.emName,
    emRelation: input.emRelation,
    emPhone: input.emPhone,
    height: input.height,
    weight: input.weight,
    profession: input.profession,
    passwordHash: hash(input.password),
    createdAt: Date.now(),
  };
  list.push(acc);
  saveAccounts(list);
  return acc;
}

export function setCurrentAccount(id: string) {
  ls.set(CURRENT_KEY, id);
  const acc = getAccount(id);
  ls.set('healthy-page:patientId', acc?.backendId || id);
  ls.set('healthy-page:role', 'patient');
  const now = Date.now();
  writeSession({ loginAt: now, lastActivityAt: now });
}

export function updateAccount(id: string, patch: Partial<PatientAccount>) {
  const list = listAccounts();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch };
  saveAccounts(list);
  if (patch.backendId && ls.get(CURRENT_KEY) === id) {
    ls.set('healthy-page:patientId', patch.backendId);
  }
}

export async function ensureBackendPatient(id: string): Promise<string | null> {
  const acc = getAccount(id);
  if (!acc) return null;
  if (acc.backendId) return acc.backendId;
  try {
    const { api } = await import('./api');
    const payload = {
      firstName: acc.firstName,
      lastName: acc.lastName,
      email: acc.email,
      phone: acc.phone,
      dob: acc.dob ?? '',
      sex: acc.sex ?? '',
      address: acc.address ?? '',
      city: acc.city ?? '',
      country: acc.country ?? 'Bénin',
      bloodType: acc.bloodType ?? '',
      allergies: acc.allergies ?? '',
      chronicDiseases: acc.chronicDiseases ?? '',
      insurer: acc.insurer ?? '',
      policyNumber: acc.policyNumber ?? '',
      emName: acc.emName ?? '',
      emRelation: acc.emRelation ?? '',
      emPhone: acc.emPhone ?? '',
      height: acc.height,
      weight: acc.weight,
      profession: acc.profession ?? '',
    };
    const res: any = await api.createPatient(payload);
    const newId = res?.id || res?.patient?.id;
    if (newId) {
      updateAccount(id, { backendId: newId });
      return newId;
    }
  } catch (e) {
    console.error('ensureBackendPatient failed:', e);
  }
  return null;
}

export function getCurrentAccount(): PatientAccount | null {
  const id = ls.get(CURRENT_KEY);
  if (!id) return null;
  if (isSessionExpired()) { logoutAccount(); return null; }
  return getAccount(id) ?? null;
}

export function logoutAccount() {
  ls.del(CURRENT_KEY);
  ls.del(SESSION_KEY);
}

// Demo Beninese user seed
const DEMO_ID = 'acc_demo_aicha_adjovi';
export const DEMO_CREDENTIALS = {
  email: 'aicha.adjovi@healthypage.bj',
  phone: '+229 01 97 12 34 56',
  password: 'HealthyPage2026',
};

export function ensureDemoSeed() {
  const list = listAccounts();
  if (list.find((a) => a.id === DEMO_ID)) return;
  const demo: PatientAccount = {
    id: DEMO_ID,
    email: DEMO_CREDENTIALS.email,
    phone: DEMO_CREDENTIALS.phone,
    passwordHash: hash(DEMO_CREDENTIALS.password),
    firstName: 'Aïcha',
    lastName: 'Adjovi',
    dob: '1992-04-15',
    sex: 'F',
    address: 'Lot 412, Quartier Cadjehoun',
    city: 'Cotonou',
    country: 'Bénin',
    bloodType: 'O+',
    allergies: 'Pénicilline',
    chronicDiseases: 'Hypertension légère',
    insurer: 'NSIA Assurances Bénin',
    policyNumber: 'NSIA-BJ-228451',
    emName: 'Koffi Adjovi',
    emRelation: 'Époux',
    emPhone: '+229 01 96 88 21 03',
    height: 168,
    weight: 64,
    profession: 'Sage-femme',
    createdAt: Date.now(),
  };
  list.push(demo);
  saveAccounts(list);

  // Seed local data stores so the demo account feels populated.
  const SEED_VERSION = '2';
  if (ls.get('healthy-page:famille-seed-v') !== SEED_VERSION) {
    ls.del('healthy-page:famille');
    ls.set('healthy-page:famille-seed-v', SEED_VERSION);
  }
  if (!ls.get('healthy-page:famille')) {
    const baseMember = (extra: any) => ({
      sex: 'F', blood: '', allergies: '', conditions: '', phone: '',
      shareRdv: true, shareMeds: true, shareAlerts: true,
      vaccinations: [], appointments: [], medications: [],
      ...extra,
    });
    ls.set('healthy-page:famille', JSON.stringify([
      baseMember({ id: 'm1', name: 'Koffi Adjovi', relation: 'conjoint', sex: 'M', dob: '1988-09-02', blood: 'A+', phone: '+229 01 96 88 21 03' }),
      baseMember({ id: 'm2', name: 'Naya Adjovi', relation: 'enfant', sex: 'F', dob: '2018-06-11', blood: 'O+' }),
      baseMember({ id: 'm3', name: 'Mariama Hounsou', relation: 'parent', sex: 'F', dob: '1965-02-28', blood: 'B+', phone: '+229 01 95 44 12 70' }),
    ]));
  }
  if (!ls.get('healthy-page:entreprise')) {
    ls.set('healthy-page:entreprise', JSON.stringify({
      profession: 'Sage-femme', employer: 'Maternité Lagune Cotonou', workMedic: 'Dr. Sodjinou', insurance: 'NSIA Assurances Bénin', policyNumber: 'NSIA-BJ-228451',
    }));
  }
  if (!ls.get('healthy-page:favorites')) {
    ls.set('healthy-page:favorites', JSON.stringify([1, 3, 7]));
  }
}
