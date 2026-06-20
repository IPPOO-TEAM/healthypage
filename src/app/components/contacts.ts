// Coordonnées de contact Healthy Page.
// Centralisées ici pour éviter d'éparpiller les numéros dans les écrans.
// Un numéro vide ('') doit masquer / désactiver le bouton côté UI.

export const CONTACTS = {
  // Cellule support principale (téléphone)
  supportPhone: '',
  // WhatsApp (format wa.me sans le +)
  supportWhatsapp: '',
  // Email cellule entreprise / RH
  enterpriseEmail: '',
  // Numéro de la marraine "Carnet Femmes"
  marraineWhatsapp: '',
} as const;

export function telHref(num: string | undefined | null): string | undefined {
  if (!num) return undefined;
  return `tel:${num}`;
}

export function waHref(num: string | undefined | null, text?: string): string | undefined {
  if (!num) return undefined;
  const t = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${num}${t}`;
}

export function hasContact(num: string | undefined | null): num is string {
  return typeof num === 'string' && num.trim().length > 0;
}
