/**
 * Retourne l'ID Supabase du patient connecté.
 * Retourne null si l'ID est un ID local (acc_xxx) pas encore synchronisé,
 * ou si aucun patient n'est connecté.
 */
export function getPatientId(): string | null {
  try {
    const id = window.localStorage.getItem('healthy-page:patientId');
    // Filtrer les IDs locaux (acc_xxx) — pas encore synchro Supabase
    if (!id || id.startsWith('acc_')) return null;
    return id;
  } catch {
    return null;
  }
}
