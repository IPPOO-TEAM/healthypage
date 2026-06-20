// Mode démo désactivé en production.
// Les helpers sont conservés en no-op pour compat des imports existants,
// mais isDemoPatient/isDemoPro renvoient toujours false : aucun seed/donnée
// fictive ne sera injecté dans l'UI.

export const DEMO_PATIENT_KEY = 'healthy-page:demo-patient';
export const DEMO_PRO_KEY = 'healthy-page:demo-pro';

export const isDemoPatient = (): boolean => false;
export const isDemoPro = (): boolean => false;

export const enableDemoPatient = (): void => { /* no-op */ };
export const disableDemoPatient = (): void => { /* no-op */ };
export const enableDemoPro = (): void => { /* no-op */ };
export const disableDemoPro = (): void => { /* no-op */ };
