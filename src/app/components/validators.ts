// Validateurs côté client pour les formulaires sensibles (auth, profil).
// Toujours doublés côté backend — ne JAMAIS faire confiance à la validation client seule.

export type ValidationResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(raw: string): ValidationResult {
  const v = raw.trim();
  if (!v) return { ok: false, error: 'Email requis.' };
  if (v.length > 254) return { ok: false, error: 'Email trop long.' };
  if (!EMAIL_RE.test(v)) return { ok: false, error: 'Format email invalide.' };
  return { ok: true };
}

/** Téléphone E.164 (ex: +22901971234) — 8 à 15 chiffres après le +. */
export function validatePhoneE164(raw: string): ValidationResult {
  const v = raw.replace(/\s/g, '');
  if (!v) return { ok: false, error: 'Numéro requis.' };
  if (!/^\+\d{8,15}$/.test(v)) {
    return { ok: false, error: 'Numéro invalide (format international attendu).' };
  }
  return { ok: true };
}

/** Identifiant générique : email OU téléphone (utilisé au login). */
export function validateLoginIdentifier(raw: string): ValidationResult {
  const v = raw.trim();
  if (!v) return { ok: false, error: 'Identifiant requis.' };
  if (v.includes('@')) return validateEmail(v);
  return validatePhoneE164(v.replace(/\s/g, ''));
}

/**
 * Mot de passe — règles raisonnables pour une plateforme santé sans frustrer les usagers :
 * 8+ caractères, au moins 1 lettre et 1 chiffre, pas de répétition triviale.
 */
export function validatePassword(raw: string): ValidationResult {
  if (!raw) return { ok: false, error: 'Mot de passe requis.' };
  if (raw.length < 8) return { ok: false, error: 'Mot de passe : 8 caractères minimum.' };
  if (raw.length > 128) return { ok: false, error: 'Mot de passe trop long (max 128).' };
  if (!/[A-Za-zÀ-ÿ]/.test(raw)) return { ok: false, error: 'Le mot de passe doit contenir au moins une lettre.' };
  if (!/\d/.test(raw)) return { ok: false, error: 'Le mot de passe doit contenir au moins un chiffre.' };
  if (/^(.)\1+$/.test(raw)) return { ok: false, error: 'Mot de passe trop simple.' };
  return { ok: true };
}

/** Nom / prénom : 2+ caractères, lettres, espaces, tirets et apostrophes uniquement. */
export function validateName(raw: string, field = 'Nom'): ValidationResult {
  const v = raw.trim();
  if (v.length < 2) return { ok: false, error: `${field} : 2 caractères minimum.` };
  if (v.length > 60) return { ok: false, error: `${field} trop long.` };
  if (!/^[\p{L}][\p{L}\s'’-]*$/u.test(v)) {
    return { ok: false, error: `${field} contient des caractères invalides.` };
  }
  return { ok: true };
}

/** Date de naissance : ISO YYYY-MM-DD, entre 1900 et aujourd'hui. */
export function validateDob(raw: string): ValidationResult {
  if (!raw) return { ok: false, error: 'Date de naissance requise.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { ok: false, error: 'Date invalide.' };
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { ok: false, error: 'Date invalide.' };
  const year = d.getUTCFullYear();
  if (year < 1900) return { ok: false, error: 'Année invalide.' };
  if (d.getTime() > Date.now()) return { ok: false, error: 'Date dans le futur.' };
  return { ok: true };
}

/** Sanitise un texte libre : retire les caractères de contrôle ASCII puis tronque. */
export function sanitizeText(raw: string, maxLen = 500): string {
  let out = '';
  for (const ch of raw) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code === 127) continue;
    out += ch;
  }
  return out.trim().slice(0, maxLen);
}

/**
 * Échappe le HTML d'une chaîne pour la rendre sûre à injecter dans le DOM.
 * Préférer cette fonction à `dangerouslySetInnerHTML`. Si du HTML *riche*
 * (gras, listes) est nécessaire depuis une source non-sûre, installer DOMPurify
 * et l'utiliser à la place.
 */
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Normalise un identifiant pour comparaisons (login, email). */
export function normalizeIdentifier(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s/g, '');
}
