export function getPatientId(): string | null {
  try { return window.localStorage.getItem('healthy-page:patientId'); } catch { return null; }
}
