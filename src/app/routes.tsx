import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate, useParams, RouterProvider } from 'react-router';
import { ComponentType, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import { SafeSuspense } from './components/ErrorBoundary';

// ── Core screens (main tabs — always in bundle) ──────────────────────────────
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import RdvScreen from './screens/RdvScreen';
import ExamensScreen from './screens/ExamensScreen';
import MedicamentsScreen from './screens/MedicamentsScreen';
import BienEtreScreen from './screens/BienEtreScreen';

// ── Startup screens (needed before auth) ─────────────────────────────────────
import RoleSelectScreen, { Role } from './screens/RoleSelectScreen';
import SplashGridScreen from './screens/SplashGridScreen';
import { useUniversalAuth, UniversalAuthScreen, completeAuthSession } from './auth/UniversalAuth';
import { ensureDemoSeed, getCurrentAccount, logoutAccount } from './components/accounts';
import { api } from './components/api';

// ── Pro layout shell (kept static — used on every pro route) ─────────────────
import ProLayout, { ProTab } from './screens/pro/ProLayout';

// ── Lazy screen fallback ──────────────────────────────────────────────────────
function ScreenFallback() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex items-center justify-center min-h-[40vh]">
      <span className="sr-only">Chargement…</span>
      <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
    </div>
  );
}

// ── Secondary patient screens (lazy) ─────────────────────────────────────────
const FavoritesScreen             = lazy(() => import('./screens/FavoritesScreen'));
const CenterDetailScreen          = lazy(() => import('./screens/CenterDetailScreen'));
const CentersMapScreen            = lazy(() => import('./screens/CentersMapScreen'));
const RateCenterScreen            = lazy(() => import('./screens/RateCenterScreen'));
const MesRessentisScreen          = lazy(() => import('./screens/MesRessentisScreen'));
const MesRdvScreen                = lazy(() => import('./screens/MesRdvScreen'));
const MesPaiementsScreen          = lazy(() => import('./screens/MesPaiementsScreen'));
const NotificationsScreen         = lazy(() => import('./screens/NotificationsScreen'));
const AlertesMedicalesScreen      = lazy(() => import('./screens/AlertesMedicalesScreen'));
const ChatMedicalScreen           = lazy(() => import('./screens/ChatMedicalScreen'));
const TeleconsultationScreen      = lazy(() => import('./screens/TeleconsultationScreen'));
const CarnetSanteScreen           = lazy(() => import('./screens/CarnetSanteScreen'));
const CoffreFortScreen            = lazy(() => import('./screens/CoffreFortScreen'));
const RappelsVaccinScreen         = lazy(() => import('./screens/RappelsVaccinScreen'));
const ProfilSanteScreen           = lazy(() => import('./screens/ProfilSanteScreen'));
const ProfilSanteSectionScreen    = lazy(() => import('./screens/ProfilSanteSectionScreen'));
const ParametresScreen            = lazy(() => import('./screens/ParametresScreen'));
const EditProfileScreen           = lazy(() => import('./screens/EditProfileScreen'));
const ConseilsPersonnalisesScreen = lazy(() => import('./screens/ConseilsPersonnalisesScreen'));
const HistoriqueSoinsScreen       = lazy(() => import('./screens/HistoriqueSoinsScreen'));
const NutritionScreen             = lazy(() => import('./screens/bienetre/NutritionScreen'));
const SommeilScreen               = lazy(() => import('./screens/bienetre/SommeilScreen'));
const ActivitePhysiqueScreen      = lazy(() => import('./screens/bienetre/ActivitePhysiqueScreen'));
const GestionStressScreen         = lazy(() => import('./screens/bienetre/GestionStressScreen'));
const ExercicesRespirationScreen  = lazy(() => import('./screens/bienetre/ExercicesRespirationScreen'));
const YogaScreen                  = lazy(() => import('./screens/bienetre/YogaScreen'));
const PosologieDetailScreen       = lazy(() => import('./screens/ordonnances/PosologieDetailScreen'));
const TraitementsEnCoursScreen    = lazy(() => import('./screens/ordonnances/TraitementsEnCoursScreen'));
const RenouvellementOrdonnanceScreen = lazy(() => import('./screens/ordonnances/RenouvellementOrdonnanceScreen'));
const AssistanceScreen            = lazy(() => import('./screens/AssistanceScreen'));
const AssurancesScreen            = lazy(() => import('./screens/AssurancesScreen'));
const ParrainageScreen            = lazy(() => import('./screens/ParrainageScreen'));
const ChoixSpecialisteScreen      = lazy(() => import('./screens/ChoixSpecialisteScreen'));
const MedecinsScreen              = lazy(() => import('./screens/MedecinsScreen'));
const AnnuaireProsScreen          = lazy(() => import('./screens/AnnuaireProsScreen'));
const ProPublicProfileScreen      = lazy(() => import('./screens/ProPublicProfileScreen'));
const PharmacopeeScreen           = lazy(() => import('./screens/PharmacopeeScreen'));
const TriageScreen                = lazy(() => import('./screens/TriageScreen'));
const CarsHelfyScreen             = lazy(() => import('./screens/CarsHelfyScreen'));
const HotelBienEtreScreen         = lazy(() => import('./screens/HotelBienEtreScreen'));
const PedoSuiviScreen             = lazy(() => import('./screens/PedoSuiviScreen'));
const DiasporaScreen              = lazy(() => import('./screens/DiasporaScreen'));
const EntrepriseScreen            = lazy(() => import('./screens/EntrepriseScreen'));
const CarnetFemmesScreen          = lazy(() => import('./screens/CarnetFemmesScreen'));
const LaboratoireScreen           = lazy(() => import('./screens/LaboratoireScreen'));
const MetaphysiqueScreen          = lazy(() => import('./screens/MetaphysiqueScreen'));
const FondsScreen                 = lazy(() => import('./screens/FondsScreen'));
const PharmacieScreen             = lazy(() => import('./screens/PharmacieScreen'));
const RuralScreen                 = lazy(() => import('./screens/RuralScreen'));
const MicroCabineScreen           = lazy(() => import('./screens/MicroCabineScreen'));
const MobiliteSanteScreen         = lazy(() => import('./screens/MobiliteSanteScreen'));
const BoxAlimentairesScreen       = lazy(() => import('./screens/BoxAlimentairesScreen'));
const CarnetFamilialScreen        = lazy(() => import('./screens/CarnetFamilialScreen'));
const BibliothequeScreen          = lazy(() => import('./screens/BibliothequeScreen'));
const CompagnieScreen             = lazy(() => import('./screens/CompagnieScreen'));
const PsychocorporelScreen        = lazy(() => import('./screens/PsychocorporelScreen'));
const GuichetHospitalierScreen    = lazy(() => import('./screens/GuichetHospitalierScreen'));
const CoDiagnosticScreen          = lazy(() => import('./screens/CoDiagnosticScreen'));
const SemaineSanteScreen          = lazy(() => import('./screens/SemaineSanteScreen'));
const CategorieAdherentScreen     = lazy(() => import('./screens/CategorieAdherentScreen'));
const VoyageLoisirsScreen         = lazy(() => import('./screens/VoyageLoisirsScreen'));
const UrgencesScreen              = lazy(() => import('./screens/UrgencesScreen'));
const JeuxScreen                  = lazy(() => import('./screens/JeuxScreen'));
const MaCarteScreen               = lazy(() => import('./screens/MaCarteScreen'));
const RdvActionScreen             = lazy(() => import('./screens/RdvActionScreen'));

// ── Pro screens (lazy) ────────────────────────────────────────────────────────
const LoginProScreen              = lazy(() => import('./screens/pro/LoginProScreen'));
const DashboardProScreen          = lazy(() => import('./screens/pro/DashboardProScreen'));
const DossierPatientScreen        = lazy(() => import('./screens/pro/DossierPatientScreen'));
const AgendaProScreen             = lazy(() => import('./screens/pro/AgendaProScreen'));
const PatientsProScreen           = lazy(() => import('./screens/pro/PatientsProScreen'));
const MessagerieProScreen         = lazy(() => import('./screens/pro/MessagerieProScreen'));
const ProfilProScreen             = lazy(() => import('./screens/pro/ProfilProScreen'));

// ── Admin screens (lazy) ──────────────────────────────────────────────────────
const AdminBackoffice             = lazy(() => import('./screens/admin/AdminBackoffice'));
const AdminLoginScreen            = lazy(() => import('./screens/admin/AdminLoginScreen'));

// ── Public pages (lazy) ───────────────────────────────────────────────────────
const LandingScreen                       = lazy(() => import('./screens/LandingScreen'));
const AboutScreen                         = lazy(() => import('./screens/AboutScreen'));
const SpecialitesScreen                   = lazy(() => import('./screens/SpecialitesScreen'));
const KitGrossesseScreen                  = lazy(() => import('./screens/KitGrossesseScreen'));
const ScarificationScreen                 = lazy(() => import('./screens/ScarificationScreen'));
const CarnetSantePresentationScreen       = lazy(() => import('./screens/CarnetSantePresentationScreen'));
const PodcastSanteScreen                  = lazy(() => import('./screens/PodcastSanteScreen'));
const VoyagePublicScreen                  = lazy(() => import('./screens/VoyagePublicScreen'));
const UrgencesPublicScreen                = lazy(() => import('./screens/UrgencesPublicScreen'));
const AssistanceJuridiquePublicScreen     = lazy(() => import('./screens/AssistanceJuridiquePublicScreen'));
const JeuxPublicScreen                    = lazy(() => import('./screens/JeuxPublicScreen'));
const SejourDetailScreen                  = lazy(() => import('./screens/SejourDetailScreen'));

// ---------- Storage helpers ----------
const ls = {
  get: (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch {} },
  del: (k: string) => { try { window.localStorage.removeItem(k); } catch {} }
};

// ---------- Patient screen-id → path mapping ----------
const PATIENT_PATHS: Record<string, string> = {
  home: '/patient/home',
  profile: '/patient/profile',
  favorites: '/patient/favorites',
  rdv: '/patient/rdv',
  examens: '/patient/examens',
  medicaments: '/patient/medicaments',
  bienetre: '/patient/bienetre',
  ressentis: '/patient/ressentis',
  mesrdv: '/patient/mesrdv',
  paiements: '/patient/paiements',
  notifications: '/patient/notifications',
  alertes: '/patient/alertes',
  chat: '/patient/chat',
  teleconsultation: '/patient/teleconsultation',
  carnet: '/patient/carnet',
  coffre: '/patient/coffre',
  vaccins: '/patient/vaccins',
  profilSante: '/patient/profil-sante',
  parametres: '/patient/parametres',
  conseils: '/patient/conseils',
  historique: '/patient/historique',
  nutrition: '/patient/nutrition',
  sommeil: '/patient/sommeil',
  activite: '/patient/activite',
  stress: '/patient/stress',
  respiration: '/patient/respiration',
  yoga: '/patient/yoga',
  posologie: '/patient/posologie',
  traitements: '/patient/traitements',
  renouvellement: '/patient/renouvellement',
  assistance: '/patient/assistance',
  assurances: '/patient/assurances',
  parrainage: '/patient/parrainage',
  carte: '/patient/carte',
  pharmacopee: '/patient/pharmacopee',
  triage: '/patient/triage',
  cars: '/patient/cars',
  hotel: '/patient/hotel',
  pedo: '/patient/pedo',
  diaspora: '/patient/diaspora',
  entreprise: '/patient/entreprise',
  femmes: '/patient/femmes',
  laboratoire: '/patient/laboratoire',
  metaphysique: '/patient/metaphysique',
  fonds: '/patient/fonds',
  pharmacie: '/patient/pharmacie',
  rural: '/patient/rural',
  microcabine: '/patient/microcabine',
  mobilite: '/patient/mobilite',
  box: '/patient/box',
  famille: '/patient/famille',
  bibliotheque: '/patient/bibliotheque',
  compagnie: '/patient/compagnie',
  psychocorporel: '/patient/psychocorporel',
  guichet: '/patient/guichet',
  codiag: '/patient/codiag',
  sas: '/patient/sas',
  categorie: '/patient/categorie',
  specialistes: '/patient/specialistes',
  medecins: '/patient/medecins',
  annuaire: '/patient/annuaire',
  macarte: '/patient/macarte',
  editProfile: '/patient/edit-profile',
  voyage: '/patient/voyage',
  urgences: '/patient/urgences',
  jeux: '/patient/jeux'
};

const TOP_TABS = new Set(['home', 'profile', 'favorites', 'rdv', 'examens', 'medicaments', 'bienetre']);

function usePatientNavigate() {
  const navigate = useNavigate();
  return (screen: string) => {
    const path = PATIENT_PATHS[screen];
    if (path) navigate(path);
    else console.warn('Unknown patient screen id:', screen);
  };
}

// ---------- Root gate (role + onboarding) ----------
function RootIndex() {
  useEffect(() => {
    ensureDemoSeed();
    // Nettoyer les données démo fictives si l'user connecté n'est PAS le compte démo.
    // Cela corrige les utilisateurs qui avaient des données famille/entreprise pré-remplies.
    const currentId = ls.get('healthy-page:current-account-id');
    if (currentId && currentId !== 'acc_demo_aicha_adjovi') {
      ls.del('healthy-page:famille');
      ls.del('healthy-page:famille-seed-v');
      ls.del('healthy-page:entreprise');
      ls.del('healthy-page:favorites');
    }
  }, []);
  const role = ls.get('healthy-page:role') as Role | null;
  const { open, user } = useUniversalAuth();
  const [splashDone, setSplashDone] = useState<boolean>(() => ls.get('healthy-page:splash-seen') === '1');
  const [pickedRole, setPickedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (user && !ls.get('healthy-page:role')) {
      ls.set('healthy-page:role', 'patient');
      ls.set('healthy-page:onboarded', 'true');
      window.location.href = '/patient/home';
    }
  }, [user]);

  if (typeof window !== 'undefined' && window.location.search.includes('admin')) {
    try { window.localStorage.removeItem('healthy-page:role'); } catch {}
    return (
      <SafeSuspense fallback={<ScreenFallback />}>
        <AdminLoginScreen
          onLogin={() => { window.location.href = '/admin'; }}
          onBack={() => { window.location.href = '/'; }}
        />
      </SafeSuspense>
    );
  }
  if (role) return <Navigate to={roleHome(role)} replace />;

  if (!splashDone) {
    return <SplashGridScreen onDone={() => { ls.set('healthy-page:splash-seen', '1'); setSplashDone(true); }} />;
  }
  if (!pickedRole) {
    return <RoleSelectScreen onSelect={(r) => {
      if (r === 'admin') { window.location.href = '/?admin=1'; return; }
      if (r === 'pro') { window.location.href = '/pro/login'; return; }
      setPickedRole(r);
      open({ from: 'Sélection profil' });
    }} />;
  }
  return <RoleSelectScreen onSelect={(r) => {
    if (r === 'admin') { window.location.href = '/?admin=1'; return; }
    if (r === 'pro') { window.location.href = '/pro/login'; return; }
    setPickedRole(r);
    open({ from: 'Sélection profil' });
  }} />;
}

function roleHome(r: Role): string {
  if (r === 'admin') return '/admin';
  if (r === 'pro') return '/pro';
  return '/patient';
}

// ---------- Patient shell ----------
function PatientShell() {
  const role = ls.get('healthy-page:role');
  const onboarded = ls.get('healthy-page:onboarded') === 'true';
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pid = ls.get('healthy-page:patientId');
    if (!pid || !pid.startsWith('acc_')) return;
    const cur = getCurrentAccount();
    if (!cur || cur.id !== pid || cur.backendId) return;
    (async () => {
      try {
        const { ensureBackendPatient } = await import('./components/accounts');
        await ensureBackendPatient(cur.id);
      } catch {}
    })();
  }, []);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = ls.get('healthy-page:theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark'); else root.classList.remove('dark');
    ls.set('healthy-page:theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const scrollMem = useRef<Record<string, number>>({});
  const prevKey = useRef<string>(location.pathname);
  useLayoutEffect(() => {
    const el = document.getElementById('hp-scroll-area');
    if (!el) return;
    if (prevKey.current !== location.pathname) {
      scrollMem.current[prevKey.current] = el.scrollTop;
    }
    const saved = scrollMem.current[location.pathname];
    el.scrollTo({ top: saved ?? 0, behavior: saved != null ? 'auto' : 'smooth' });
    prevKey.current = location.pathname;
  }, [location.pathname]);

  if (!role) return <Navigate to="/" replace />;
  if (role !== 'patient') return <Navigate to={roleHome(role as Role)} replace />;
  if (!onboarded) ls.set('healthy-page:onboarded', 'true');

  const segment = location.pathname.split('/')[2] || 'home';
  const activeTab = TOP_TABS.has(segment) ? segment : 'home';

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(tab) => navigate(PATIENT_PATHS[tab] ?? '/patient/home')}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((d) => !d)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

// ---------- Patient route wrappers ----------
function HomeRoute() {
  const nav = usePatientNavigate();
  return <HomeScreen onNavigate={nav} />;
}
function ProfileRoute() {
  const nav = usePatientNavigate();
  return <ProfileScreen onNavigate={nav} />;
}
function FavoritesRoute() {
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <FavoritesScreen onBack={() => navigate('/patient/profile')} onSelectCenter={(id) => navigate(`/patient/center/${id}`)} />
    </SafeSuspense>
  );
}
function RdvRoute() {
  const nav = usePatientNavigate();
  const navigate = useNavigate();
  return <RdvScreen onSelectCenter={(id) => navigate(`/patient/center/${id}`)} onNavigate={nav} />;
}
function ExamensRoute() { return <ExamensScreen />; }
function MedicamentsRoute() {
  const nav = usePatientNavigate();
  return <MedicamentsScreen onNavigate={nav} />;
}
function BienEtreRoute() {
  const nav = usePatientNavigate();
  return <BienEtreScreen onNavigate={nav} />;
}
function CenterRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <CenterDetailScreen centerId={Number(id)} onBack={() => navigate(-1)} onRate={() => navigate(`/patient/center/${id}/rate`)} />
    </SafeSuspense>
  );
}
function CentersMapRoute() {
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <CentersMapScreen onBack={() => navigate(-1)} onSelectCenter={(id) => navigate(`/patient/center/${id}`)} />
    </SafeSuspense>
  );
}
function RateCenterRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <RateCenterScreen centerId={Number(id)} onBack={() => navigate(-1)} />
    </SafeSuspense>
  );
}

// withBack wraps lazy components — Suspense included
function withBack<P extends { onBack: () => void }>(
  Comp: ComponentType<P>,
  extra?: (nav: ReturnType<typeof usePatientNavigate>) => Partial<P>
) {
  return function Wrapped() {
    const navigate = useNavigate();
    const nav = usePatientNavigate();
    const props = { onBack: () => navigate(-1), ...(extra ? extra(nav) : {}) } as P;
    return (
      <SafeSuspense fallback={<ScreenFallback />}>
        <Comp {...props} />
      </SafeSuspense>
    );
  };
}

const RessentisRoute        = withBack(MesRessentisScreen, (nav) => ({ onNavigate: nav }) as any);
const MesRdvRoute           = withBack(MesRdvScreen, (nav) => ({ onNavigate: nav }) as any);
const MesPaiementsRoute     = withBack(MesPaiementsScreen);
const NotificationsRoute    = withBack(NotificationsScreen);
const AlertesRoute          = withBack(AlertesMedicalesScreen, (nav) => ({ onNavigate: nav }) as any);
const ChatRoute             = withBack(ChatMedicalScreen, (nav) => ({ onNavigate: nav }) as any);
const TeleconsultationRoute = withBack(TeleconsultationScreen, (nav) => ({ onNavigate: nav }) as any);
const CarnetRoute           = withBack(CarnetSanteScreen);
const CoffreFortRoute       = withBack(CoffreFortScreen);
const RappelsVaccinRoute    = withBack(RappelsVaccinScreen);
const ProfilSanteRoute      = withBack(ProfilSanteScreen);
const ProfilSanteSectionRoute = withBack(ProfilSanteSectionScreen);
const ParametresRoute       = withBack(ParametresScreen);
const EditProfileRoute      = withBack(EditProfileScreen);
const ConseilsRoute         = withBack(ConseilsPersonnalisesScreen, (nav) => ({ onNavigate: nav }) as any);
const HistoriqueRoute       = withBack(HistoriqueSoinsScreen);
const NutritionRoute        = withBack(NutritionScreen);
const SommeilRoute          = withBack(SommeilScreen);
const ActiviteRoute         = withBack(ActivitePhysiqueScreen);
const StressRoute           = withBack(GestionStressScreen, (nav) => ({ onNavigate: nav }) as any);
const RespirationRoute      = withBack(ExercicesRespirationScreen);
const YogaRoute             = withBack(YogaScreen);
const PosologieRoute        = withBack(PosologieDetailScreen);
const TraitementsRoute      = withBack(TraitementsEnCoursScreen, (nav) => ({ onNavigate: nav }) as any);
const RenouvellementRoute   = withBack(RenouvellementOrdonnanceScreen);
const AssistanceRoute       = withBack(AssistanceScreen);
const AssurancesRoute       = withBack(AssurancesScreen);
const ParrainageRoute       = withBack(ParrainageScreen);
const PharmacopeeRoute      = withBack(PharmacopeeScreen);
const TriageRoute           = withBack(TriageScreen);
const CarsHelfyRoute        = withBack(CarsHelfyScreen);
const HotelRoute            = withBack(HotelBienEtreScreen);
const PedoRoute             = withBack(PedoSuiviScreen);
const DiasporaRoute         = withBack(DiasporaScreen);
const EntrepriseRoute       = withBack(EntrepriseScreen);
const FemmesRoute           = withBack(CarnetFemmesScreen);
const LaboratoireRoute      = withBack(LaboratoireScreen);
const MetaphysiqueRoute     = withBack(MetaphysiqueScreen);
const FondsRoute            = withBack(FondsScreen);
const PharmacieRoute        = withBack(PharmacieScreen);
const RuralRoute            = withBack(RuralScreen);
const MicroCabineRoute      = withBack(MicroCabineScreen);
const MobiliteRoute         = withBack(MobiliteSanteScreen);
const BoxRoute              = withBack(BoxAlimentairesScreen);
const FamilleRoute          = withBack(CarnetFamilialScreen);
const BibliothequeRoute     = withBack(BibliothequeScreen);
const CompagnieRoute        = withBack(CompagnieScreen);
const PsychocorporelRoute   = withBack(PsychocorporelScreen);
const GuichetRoute          = withBack(GuichetHospitalierScreen);
const CoDiagRoute           = withBack(CoDiagnosticScreen);
const SasRoute              = withBack(SemaineSanteScreen);
const CategorieRoute        = withBack(CategorieAdherentScreen);
const VoyageRoute           = withBack(VoyageLoisirsScreen);
const UrgencesRoute         = withBack(UrgencesScreen);
const JeuxRoute             = withBack(JeuxScreen);

function SpecialistesRoute() {
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <ChoixSpecialisteScreen onBack={() => navigate(-1)} onSelect={(s) => navigate(`/patient/medecins?specialty=${encodeURIComponent(s)}`)} />
    </SafeSuspense>
  );
}

function AnnuaireProsRoute() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const initialSpecialty = params.get('specialty') ?? '';
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <AnnuaireProsScreen
        onBack={() => navigate(-1)}
        onSelectPro={(id) => navigate(`/patient/pro/${id}`)}
        initialSpecialty={initialSpecialty}
      />
    </SafeSuspense>
  );
}

function ProPublicProfileRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState<string>('Patient');
  useEffect(() => {
    const pid = ls.get('healthy-page:patientId');
    if (!pid) return;
    api.getPatient(pid).then(({ patient }) => {
      const name = `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim();
      if (name) setPatientName(name);
    }).catch(() => {});
  }, []);
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <ProPublicProfileScreen proId={id!} onBack={() => navigate(-1)} patientName={patientName} />
    </SafeSuspense>
  );
}

function MedecinsRoute() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const initialQuery = params.get('specialty') ?? '';
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <MedecinsScreen onBack={() => navigate(-1)} onBook={() => navigate('/patient/mesrdv')} initialQuery={initialQuery} />
    </SafeSuspense>
  );
}

function MaCarteRoute() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const pid = ls.get('healthy-page:patientId');
    if (!pid) {
      setSubject({ id: 'demo', fullName: 'Patient démo', role: 'Patient', subtitle: 'Compte non synchronisé' });
      return;
    }
    api.getPatient(pid)
      .then(({ patient }) => {
        const fullName = `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() || 'Patient';
        setSubject({
          id: patient.id, fullName, role: 'Patient', photo: patient.photo ?? null,
          subtitle: [patient.city, patient.country].filter(Boolean).join(', '),
          meta: {
            'Date de naissance': patient.dob,
            'Groupe sanguin': patient.blood,
            'Téléphone': patient.phone,
            'Assurance': patient.insurer
          }
        });
      })
      .catch((e) => setError(e?.message ?? 'Erreur chargement'));
  }, []);
  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!subject) return <ScreenFallback />;
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <MaCarteScreen subject={subject} onBack={() => navigate(-1)} />
    </SafeSuspense>
  );
}

// ---------- Pro shell ----------
const PRO_TAB_BY_PATH: Record<string, ProTab> = {
  home: 'home', agenda: 'agenda', patients: 'patients', messages: 'messages', profil: 'profil'
};

function ProShell() {
  const role = ls.get('healthy-page:role');
  const proId = ls.get('healthy-page:proId');
  const location = useLocation();
  const navigate = useNavigate();

  if (!role) return <Navigate to="/" replace />;
  if (role !== 'pro') return <Navigate to={roleHome(role as Role)} replace />;
  if (!proId && !location.pathname.startsWith('/pro/login')) {
    return <Navigate to="/pro/login" replace />;
  }

  if (location.pathname.startsWith('/pro/login') || location.pathname.startsWith('/pro/patient/')) {
    return <Outlet />;
  }

  const seg = location.pathname.split('/')[2] || 'home';
  const tab = PRO_TAB_BY_PATH[seg] ?? 'home';

  return (
    <ProLayout active={tab} onChange={(t) => navigate(`/pro/${t === 'home' ? 'home' : t}`)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </ProLayout>
  );
}

function resetRoleAndGoHome(navigate: ReturnType<typeof useNavigate>) {
  ls.del('healthy-page:role');
  ls.del('healthy-page:proId');
  ls.del('healthy-page:proOwnerId');
  ls.del('healthy-page:patientId');
  ls.del('healthy-page:onboarded');
  ls.del('healthy-page:demo-patient');
  ls.del('healthy-page:demo-pro');
  logoutAccount();
  ls.del('healthy-page:demo-patientId');
  ls.del('healthy-page:demo-proId');
  navigate('/', { replace: true });
}

function ProLoginRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/30">
      <SafeSuspense fallback={<ScreenFallback />}>
        <LoginProScreen
          onBack={() => resetRoleAndGoHome(navigate)}
          onComplete={(id) => { ls.set('healthy-page:proId', id); ls.set('healthy-page:proOwnerId', id); window.location.href = '/pro/home'; }}
        />
      </SafeSuspense>
    </div>
  );
}
function ProHomeRoute() {
  const proId = ls.get('healthy-page:proId') as string;
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <DashboardProScreen proId={proId} onLogout={() => resetRoleAndGoHome(navigate)} onOpenPatient={(id) => navigate(`/pro/patient/${id}`)} />
    </SafeSuspense>
  );
}
function ProAgendaRoute() {
  const proId = ls.get('healthy-page:proId') as string;
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <AgendaProScreen proId={proId} />
    </SafeSuspense>
  );
}
function ProPatientsRoute() {
  const navigate = useNavigate();
  const proId = ls.get('healthy-page:proId') as string;
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <PatientsProScreen proId={proId} onOpenPatient={(id) => navigate(`/pro/patient/${id}`)} />
    </SafeSuspense>
  );
}
function ProMessagesRoute() {
  const proId = ls.get('healthy-page:proId') as string;
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <MessagerieProScreen proId={proId} />
    </SafeSuspense>
  );
}
function ProProfilRoute() {
  const proId = ls.get('healthy-page:proId') as string;
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <ProfilProScreen proId={proId} onLogout={() => resetRoleAndGoHome(navigate)} />
    </SafeSuspense>
  );
}
function ProDossierRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="h-full overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <DossierPatientScreen patientId={id!} onBack={() => navigate(-1)} />
      </SafeSuspense>
    </div>
  );
}

function AuthRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') ?? undefined;
  const method = (params.get('method') as any) ?? undefined;
  return (
    <UniversalAuthScreen
      from={from}
      initialMethod={method}
      onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }}
      onSuccess={async (acc) => {
        await completeAuthSession(acc);
        if (!ls.get('healthy-page:role')) {
          ls.set('healthy-page:role', 'patient');
          ls.set('healthy-page:onboarded', 'true');
        }
        window.location.href = '/patient/home';
      }}
    />
  );
}

// ── Admin ----------
function AdminLoginRoute() {
  const navigate = useNavigate();
  return (
    <SafeSuspense fallback={<ScreenFallback />}>
      <AdminLoginScreen onLogin={() => { window.location.href = '/admin'; }} onBack={() => navigate('/')} />
    </SafeSuspense>
  );
}

function AdminRoute() {
  const role = ls.get('healthy-page:role');
  const navigate = useNavigate();
  if (!role || role !== 'admin') {
    return (
      <SafeSuspense fallback={<ScreenFallback />}>
        <AdminLoginScreen onLogin={() => { window.location.href = '/admin'; }} onBack={() => navigate('/')} />
      </SafeSuspense>
    );
  }
  return (
    <div className="h-full overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <AdminBackoffice onLogout={() => resetRoleAndGoHome(navigate)} />
      </SafeSuspense>
    </div>
  );
}

// ── Public page wrappers ──────────────────────────────────────────────────────
function AboutRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-screen overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <AboutScreen onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} />
      </SafeSuspense>
    </div>
  );
}
function SpecialitesRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-screen overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <SpecialitesScreen onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} />
      </SafeSuspense>
    </div>
  );
}
function KitGrossesseRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-screen overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <KitGrossesseScreen onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} onStart={() => navigate('/')} />
      </SafeSuspense>
    </div>
  );
}
function CarnetSantePresentationRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-screen overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <CarnetSantePresentationScreen onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} onStart={() => navigate('/')} />
      </SafeSuspense>
    </div>
  );
}
function PodcastSanteRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-screen overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <PodcastSanteScreen onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} onStart={() => navigate('/')} />
      </SafeSuspense>
    </div>
  );
}
function ScarificationRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-screen overflow-y-auto">
      <SafeSuspense fallback={<ScreenFallback />}>
        <ScarificationScreen onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }} onStart={() => navigate('/')} />
      </SafeSuspense>
    </div>
  );
}

// ---------- Router ----------
export const router = createBrowserRouter([
  {
    path: '/',
    index: true,
    lazy: async () => {
      const { default: C } = await import('./screens/LandingScreen');
      return { Component: () => <C onStart={() => { window.location.href = '/start'; }} /> };
    },
    HydrateFallback: ScreenFallback
  },
  { path: '/start', Component: RootIndex },
  { path: '/landing', element: <Navigate to="/" replace /> },
  { path: '/auth', Component: AuthRoute },
  {
    path: '/r/:token',
    Component: function RdvActionRoute() {
      const { token } = useParams();
      const navigate = useNavigate();
      return (
        <SafeSuspense fallback={<ScreenFallback />}>
          <RdvActionScreen token={token!} onDone={() => navigate('/')} />
        </SafeSuspense>
      );
    }
  },
  { path: '/a-propos', Component: AboutRoute },
  { path: '/specialites', Component: SpecialitesRoute },
  { path: '/kit-grossesse', Component: KitGrossesseRoute },
  { path: '/scarification-tradition', Component: ScarificationRoute },
  { path: '/carnet-sante', Component: CarnetSantePresentationRoute },
  { path: '/podcast-sante', Component: PodcastSanteRoute },
  {
    path: '/voyage-loisirs/about',
    lazy: async () => ({ Component: (await import('./screens/VoyagePublicScreen')).default })
  },
  {
    path: '/voyage-loisirs',
    lazy: async () => ({ Component: (await import('./voyage/VoyageShell')).default }),
    children: [
      { index: true, element: <Navigate to="/voyage-loisirs/explorer" replace /> },
      { path: 'explorer',      lazy: async () => ({ Component: (await import('./voyage/screens/ExplorerScreen')).default }) },
      { path: 'carte',         lazy: async () => ({ Component: (await import('./voyage/screens/CarteScreen')).default }) },
      { path: 'favoris',       lazy: async () => ({ Component: (await import('./voyage/screens/FavorisScreen')).default }) },
      { path: 'avantages',     lazy: async () => ({ Component: (await import('./voyage/screens/AvantagesScreen')).default }) },
      { path: 'profil',        lazy: async () => ({ Component: (await import('./voyage/screens/ProfilScreen')).default }) },
      { path: 'lieu/:id',      lazy: async () => ({ Component: (await import('./voyage/screens/LieuDetailScreen')).default }) },
      { path: 'recherche',     lazy: async () => ({ Component: (await import('./voyage/screens/RechercheScreen')).default }) },
      { path: 'collection/:id',lazy: async () => ({ Component: (await import('./voyage/screens/CollectionScreen')).default }) },
      { path: 'inspirations',  lazy: async () => ({ Component: (await import('./voyage/screens/InspirationsScreen')).default }) },
      { path: 'experiences',   lazy: async () => ({ Component: (await import('./voyage/screens/ExperiencesScreen')).default }) },
      { path: 'guides',        lazy: async () => ({ Component: (await import('./voyage/screens/GuidesScreen')).default }) },
      { path: 'guide/:country',lazy: async () => ({ Component: (await import('./voyage/screens/GuideDetailScreen')).default }) },
      { path: 'evenements',    lazy: async () => ({ Component: (await import('./voyage/screens/EvenementsScreen')).default }) },
      { path: 'communaute',    lazy: async () => ({ Component: (await import('./voyage/screens/CommunauteScreen')).default }) },
      { path: 'conciergerie',  lazy: async () => ({ Component: (await import('./voyage/screens/ConciergerieScreen')).default }) },
      { path: 'reservation/:id',lazy: async () => ({ Component: (await import('./voyage/screens/ReservationScreen')).default }) },
      { path: 'mes-voyages',   lazy: async () => ({ Component: (await import('./voyage/screens/MesVoyagesScreen')).default }) },
      { path: 'avis/:id',      lazy: async () => ({ Component: (await import('./voyage/screens/AvisScreen')).default }) },
      { path: 'messages',      lazy: async () => ({ Component: (await import('./voyage/screens/MessagesScreen')).default }) },
      { path: 'messages/:lieuId', lazy: async () => ({ Component: (await import('./voyage/screens/MessagesScreen')).default }) },
    ],
  },
  {
    path: '/sejour/:sejourId',
    Component: function SejourRoute() {
      const { sejourId } = useParams();
      return (
        <SafeSuspense fallback={<ScreenFallback />}>
          <SejourDetailScreen sejourId={sejourId} />
        </SafeSuspense>
      );
    }
  },
  {
    path: '/urgences-publiques',
    lazy: async () => ({ Component: (await import('./screens/UrgencesPublicScreen')).default })
  },
  {
    path: '/assistance-juridique/about',
    lazy: async () => ({ Component: (await import('./screens/AssistanceJuridiquePublicScreen')).default })
  },
  {
    path: '/assistance-juridique',
    lazy: async () => ({ Component: (await import('./legal/LegalShell')).default }),
    children: [
      { index: true, element: <Navigate to="/assistance-juridique/accueil" replace /> },
      { path: 'accueil',      lazy: async () => ({ Component: (await import('./legal/screens/AccueilScreen')).default }) },
      { path: 'domaines',     lazy: async () => ({ Component: (await import('./legal/screens/DomainesScreen')).default }) },
      { path: 'dossiers',     lazy: async () => ({ Component: (await import('./legal/screens/DossiersScreen')).default }) },
      { path: 'profil',       lazy: async () => ({ Component: (await import('./legal/screens/ProfilScreen')).default }) },
      { path: 'domaine/:id',  lazy: async () => ({ Component: (await import('./legal/screens/DomainDetailScreen')).default }) },
      { path: 'centre/:id',   lazy: async () => ({ Component: (await import('./legal/screens/CentreDetailScreen')).default }) },
    ],
  },
  {
    path: '/jeux-bien-etre/about',
    lazy: async () => ({ Component: (await import('./screens/JeuxPublicScreen')).default })
  },
  {
    path: '/jeux-bien-etre',
    lazy: async () => ({ Component: (await import('./happy/HappyShell')).default }),
    children: [
      { index: true, element: <Navigate to="/jeux-bien-etre/accueil" replace /> },
      { path: 'accueil',    lazy: async () => ({ Component: (await import('./happy/screens/AccueilScreen')).default }) },
      { path: 'catalogue',  lazy: async () => ({ Component: (await import('./happy/screens/CatalogueScreen')).default }) },
      { path: 'recompenses',lazy: async () => ({ Component: (await import('./happy/screens/RecompensesScreen')).default }) },
      { path: 'profil',     lazy: async () => ({ Component: (await import('./happy/screens/ProfilScreen')).default }) },
      { path: 'jeu/:id',    lazy: async () => ({ Component: (await import('./happy/screens/GameDetailScreen')).default }) },
    ],
  },
  {
    path: '/patient',
    Component: PatientShell,
    children: [
      { index: true, element: <Navigate to="/patient/home" replace /> },
      { path: 'home',           Component: HomeRoute },
      { path: 'profile',        Component: ProfileRoute },
      { path: 'favorites',      Component: FavoritesRoute },
      { path: 'rdv',            Component: RdvRoute },
      { path: 'examens',        Component: ExamensRoute },
      { path: 'medicaments',    Component: MedicamentsRoute },
      { path: 'bienetre',       Component: BienEtreRoute },
      { path: 'ressentis',      Component: RessentisRoute },
      { path: 'mesrdv',         Component: MesRdvRoute },
      { path: 'paiements',      Component: MesPaiementsRoute },
      { path: 'notifications',  Component: NotificationsRoute },
      { path: 'alertes',        Component: AlertesRoute },
      { path: 'chat',           Component: ChatRoute },
      { path: 'teleconsultation',Component: TeleconsultationRoute },
      { path: 'carnet',         Component: CarnetRoute },
      { path: 'coffre',         Component: CoffreFortRoute },
      { path: 'vaccins',        Component: RappelsVaccinRoute },
      { path: 'profil-sante',   Component: ProfilSanteRoute },
      { path: 'profil-sante/:section', Component: ProfilSanteSectionRoute },
      { path: 'parametres',     Component: ParametresRoute },
      { path: 'edit-profile',   Component: EditProfileRoute },
      { path: 'conseils',       Component: ConseilsRoute },
      { path: 'historique',     Component: HistoriqueRoute },
      { path: 'nutrition',      Component: NutritionRoute },
      { path: 'sommeil',        Component: SommeilRoute },
      { path: 'activite',       Component: ActiviteRoute },
      { path: 'stress',         Component: StressRoute },
      { path: 'respiration',    Component: RespirationRoute },
      { path: 'yoga',           Component: YogaRoute },
      { path: 'posologie',      Component: PosologieRoute },
      { path: 'traitements',    Component: TraitementsRoute },
      { path: 'renouvellement', Component: RenouvellementRoute },
      { path: 'assistance',     Component: AssistanceRoute },
      { path: 'assurances',     Component: AssurancesRoute },
      { path: 'parrainage',     Component: ParrainageRoute },
      { path: 'specialistes',   Component: SpecialistesRoute },
      { path: 'medecins',       Component: MedecinsRoute },
      { path: 'annuaire',       Component: AnnuaireProsRoute },
      { path: 'pro/:id',        Component: ProPublicProfileRoute },
      { path: 'macarte',        Component: MaCarteRoute },
      { path: 'center/:id',     Component: CenterRoute },
      { path: 'center/:id/rate',Component: RateCenterRoute },
      { path: 'carte',          Component: CentersMapRoute },
      { path: 'pharmacopee',    Component: PharmacopeeRoute },
      { path: 'triage',         Component: TriageRoute },
      { path: 'cars',           Component: CarsHelfyRoute },
      { path: 'hotel',          Component: HotelRoute },
      { path: 'pedo',           Component: PedoRoute },
      { path: 'diaspora',       Component: DiasporaRoute },
      { path: 'entreprise',     Component: EntrepriseRoute },
      { path: 'femmes',         Component: FemmesRoute },
      { path: 'laboratoire',    Component: LaboratoireRoute },
      { path: 'metaphysique',   Component: MetaphysiqueRoute },
      { path: 'fonds',          Component: FondsRoute },
      { path: 'pharmacie',      Component: PharmacieRoute },
      { path: 'rural',          Component: RuralRoute },
      { path: 'microcabine',    Component: MicroCabineRoute },
      { path: 'mobilite',       Component: MobiliteRoute },
      { path: 'box',            Component: BoxRoute },
      { path: 'famille',        Component: FamilleRoute },
      { path: 'bibliotheque',   Component: BibliothequeRoute },
      { path: 'compagnie',      Component: CompagnieRoute },
      { path: 'psychocorporel', Component: PsychocorporelRoute },
      { path: 'guichet',        Component: GuichetRoute },
      { path: 'codiag',         Component: CoDiagRoute },
      { path: 'sas',            Component: SasRoute },
      { path: 'categorie',      Component: CategorieRoute },
      { path: 'voyage',         Component: VoyageRoute },
      { path: 'urgences',       Component: UrgencesRoute },
      { path: 'jeux',           Component: JeuxRoute }
    ]
  },
  { path: '/patient/onboarding', element: <Navigate to="/patient/home" replace /> },
  {
    path: '/pro',
    Component: ProShell,
    children: [
      { index: true, element: <Navigate to="/pro/home" replace /> },
      { path: 'login',    Component: ProLoginRoute },
      { path: 'home',     Component: ProHomeRoute },
      { path: 'agenda',   Component: ProAgendaRoute },
      { path: 'patients', Component: ProPatientsRoute },
      { path: 'messages', Component: ProMessagesRoute },
      { path: 'profil',   Component: ProProfilRoute },
      { path: 'patient/:id', Component: ProDossierRoute }
    ]
  },
  {
    path: '/podcast',
    lazy: async () => ({ Component: (await import('./podcast/PodcastShell')).default }),
    children: [
      { index: true,         lazy: async () => ({ Component: (await import('./podcast/screens/PodcastHomeScreen')).default }) },
      { path: 'pour-vous',   lazy: async () => ({ Component: (await import('./podcast/screens/PodcastForYouScreen')).default }) },
      { path: 'decouvrir',   lazy: async () => ({ Component: (await import('./podcast/screens/PodcastDiscoverScreen')).default }) },
      { path: 'recherche',   lazy: async () => ({ Component: (await import('./podcast/screens/PodcastSearchScreen')).default }) },
      { path: 'bibliotheque',lazy: async () => ({ Component: (await import('./podcast/screens/PodcastLibraryScreen')).default }) },
      { path: 'profil',      lazy: async () => ({ Component: (await import('./podcast/screens/PodcastProfileScreen')).default }) },
    ],
  },
  {
    path: '/live',
    lazy: async () => ({ Component: (await import('./live/LiveShell')).default }),
    children: [
      { index: true,   lazy: async () => ({ Component: (await import('./live/screens/LiveHomeScreen')).default }) },
      { path: 'radio', lazy: async () => ({ Component: (await import('./live/screens/LiveRadioScreen')).default }) },
      { path: 'tv',    lazy: async () => ({ Component: (await import('./live/screens/LiveTVScreen')).default }) },
      { path: 'grille',lazy: async () => ({ Component: (await import('./live/screens/LiveScheduleScreen')).default }) },
      { path: 'favoris',lazy: async () => ({ Component: (await import('./live/screens/LiveFavoritesScreen')).default }) },
    ],
  },
  { path: '/fitness/*', lazy: async () => ({ Component: (await import('./fitness/FitnessApp')).default, HydrateFallback: () => null }) },
  { path: '/admin/login', Component: AdminLoginRoute },
  { path: '/admin', Component: AdminRoute },
  { path: '*', element: <Navigate to="/" replace /> }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
