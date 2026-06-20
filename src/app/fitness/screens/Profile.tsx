import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Crown, Download, LogOut, Moon, Settings, ShieldCheck, Trash2, ChevronRight, Edit3, ChevronLeft, Check, Sun } from 'lucide-react';
import { getState, setState, useStore, dailyTargets, type Profile as ProfileT } from '../store';

type SubRoute = 'edit' | 'notifications' | 'theme' | 'units' | 'consents';

const PREFS_KEY = 'fitnessflow:prefs:v1';
type Prefs = { notifications: boolean; theme: 'light' | 'dark' | 'system'; units: 'metric' | 'imperial'; lang: 'fr' | 'en' };
const defaultPrefs: Prefs = { notifications: true, theme: 'system', units: 'metric', lang: 'fr' };
function readPrefs(): Prefs {
  try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch { return defaultPrefs; }
}
function writePrefs(p: Prefs) { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }

export function Profile() {
  const profile = useStore((s) => s.profile)!;
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const targets = dailyTargets(profile);
  const [route, setRoute] = useState<SubRoute | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(() => readPrefs());

  useEffect(() => {
    writePrefs(prefs);
    const root = document.documentElement;
    if (prefs.theme === 'dark') root.classList.add('dark');
    else if (prefs.theme === 'light') root.classList.remove('dark');
    else {
      const m = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', m);
    }
  }, [prefs]);

  const reset = () => {
    if (confirm('Réinitialiser toutes tes données ?')) {
      localStorage.removeItem('fitnessflow:state:v1');
      location.reload();
    }
  };

  if (route === 'edit') return <EditProfilePage profile={profile} onBack={() => setRoute(null)} />;
  if (route === 'notifications') return <NotificationsPage prefs={prefs} onChange={setPrefs} onBack={() => setRoute(null)} />;
  if (route === 'theme') return <ThemePage prefs={prefs} onChange={setPrefs} onBack={() => setRoute(null)} />;
  if (route === 'units') return <UnitsPage prefs={prefs} onChange={setPrefs} onBack={() => setRoute(null)} />;
  if (route === 'consents') return <ConsentsPage onBack={() => setRoute(null)} />;

  return (
    <div className="pb-28">
      <header className="px-5 pt-12 pb-6 bg-gradient-to-br from-slate-900 to-emerald-900 text-white rounded-b-3xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold" style={{ fontSize: 24 }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="tracking-tight" style={{ fontSize: 22, fontWeight: 800 }}>{profile.name}</h1>
            <div className="text-sm text-white/75">{profile.heightCm} cm · {profile.weightKg} kg · {profile.age} ans</div>
          </div>
          <button onClick={() => setRoute('edit')} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition" aria-label="Modifier le profil"><Edit3 className="w-4 h-4" /></button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="font-bold" style={{ fontSize: 18 }}>{streak}</div>
            <div className="text-xs text-white/70">Streak</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="font-bold" style={{ fontSize: 18 }}>{xp}</div>
            <div className="text-xs text-white/70">XP</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="font-bold" style={{ fontSize: 18 }}>{targets.kcal}</div>
            <div className="text-xs text-white/70">kcal/jour</div>
          </div>
        </div>
      </header>

      <div className="px-5 mt-6 space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-90"><Crown className="w-4 h-4" /> Premium</div>
          <h3 className="mt-1 tracking-tight" style={{ fontSize: 20, fontWeight: 800 }}>Débloque tout ton potentiel</h3>
          <p className="text-sm text-white/85 mt-1">Programmes spécialisés, IA coach, contenus exclusifs.</p>
          <button className="mt-4 px-5 h-11 rounded-xl bg-white text-orange-600 font-semibold text-sm">Essai gratuit 7 jours</button>
        </div>

        <Card title="Mes objectifs">
          <Row label="Objectif" value={labelGoal(profile.goal)} />
          <Row label="Niveau" value={labelLevel(profile.level)} />
          <Row label="Lieu" value={profile.place === 'home' ? 'Maison' : profile.place === 'gym' ? 'Salle' : 'Maison + salle'} />
          <Row label="Disponibilité" value={`${profile.daysPerWeek}j/sem · ${profile.minutesPerDay} min`} />
          <Row label="Eau / jour" value={`${(targets.waterMl / 1000).toFixed(1)} L`} />
        </Card>

        <Card title="Santé & matériel">
          <Row label="Matériel" value={profile.equipment.join(', ') || '—'} />
          <Row label="Contraintes" value={profile.constraints.join(', ') || 'Aucune'} />
          <Row label="Régime" value={profile.diet.join(', ')} />
          <Row label="Allergies" value={profile.allergies.join(', ') || 'Aucune'} />
        </Card>

        <Card title="Préférences">
          <Item icon={<Bell className="w-5 h-5" />} label="Notifications" value={prefs.notifications ? 'Activées' : 'Désactivées'} onClick={() => setRoute('notifications')} />
          <Item icon={prefs.theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} label="Thème" value={prefs.theme === 'light' ? 'Clair' : prefs.theme === 'dark' ? 'Sombre' : 'Système'} onClick={() => setRoute('theme')} />
          <Item icon={<Settings className="w-5 h-5" />} label="Unités & langue" value={`${prefs.units === 'metric' ? 'Métriques' : 'Impériales'} · ${prefs.lang.toUpperCase()}`} onClick={() => setRoute('units')} />
        </Card>

        <Card title="Données & confidentialité">
          <Item icon={<ShieldCheck className="w-5 h-5" />} label="Gestion des consentements" onClick={() => setRoute('consents')} />
          <Item icon={<Download className="w-5 h-5" />} label="Exporter mes données" onClick={() => {
            const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'fitnessflow-data.json'; a.click();
            URL.revokeObjectURL(url);
          }} />
          <Item icon={<Trash2 className="w-5 h-5 text-rose-500" />} label="Effacer mes données" onClick={reset} />
        </Card>

        <button onClick={() => setState((s) => ({ ...s, onboarded: false }))} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium inline-flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Refaire l’onboarding
        </button>

        <div className="text-center text-xs text-slate-400 pt-2">FitnessFlow · v1.0 · Cette app n’a pas vocation à remplacer un avis médical.</div>
      </div>

    </div>
  );
}

function SubPage({ title, onBack, children, footer }: { title: string; onBack: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-28"
    >
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-100 dark:border-slate-800 px-3 pt-12 pb-3 flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Retour">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="tracking-tight" style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
      </header>
      <div className="flex-1 px-5 py-5">{children}</div>
      {footer && <div className="sticky bottom-16 px-5 py-3 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent">{footer}</div>}
    </motion.div>
  );
}

function EditProfilePage({ profile, onBack }: { profile: ProfileT; onBack: () => void }) {
  const [draft, setDraft] = useState<ProfileT>(profile);
  const save = () => {
    setState((s) => ({ ...s, profile: draft }));
    onBack();
  };
  return (
    <SubPage
      title="Modifier le profil"
      onBack={onBack}
      footer={
        <button onClick={save} className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30">
          <Check className="w-4 h-4" /> Enregistrer
        </button>
      }
    >
      <div className="space-y-4">
        <SubField label="Prénom">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        </SubField>
        <div className="grid grid-cols-3 gap-2">
          <SubField label="Âge">
            <input type="number" value={draft.age} onChange={(e) => setDraft({ ...draft, age: +e.target.value || 0 })} className="w-full h-12 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          </SubField>
          <SubField label="Taille (cm)">
            <input type="number" value={draft.heightCm} onChange={(e) => setDraft({ ...draft, heightCm: +e.target.value || 0 })} className="w-full h-12 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          </SubField>
          <SubField label="Poids (kg)">
            <input type="number" value={draft.weightKg} onChange={(e) => setDraft({ ...draft, weightKg: +e.target.value || 0 })} className="w-full h-12 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          </SubField>
        </div>
        <SubField label="Poids cible (kg)">
          <input type="number" value={draft.targetWeightKg ?? ''} placeholder="optionnel" onChange={(e) => setDraft({ ...draft, targetWeightKg: e.target.value ? +e.target.value : undefined })} className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        </SubField>
        <SubField label={`Disponibilité : ${draft.daysPerWeek}j/sem · ${draft.minutesPerDay} min`}>
          <input type="range" min={1} max={7} value={draft.daysPerWeek} onChange={(e) => setDraft({ ...draft, daysPerWeek: +e.target.value })} className="w-full accent-emerald-600" />
          <input type="range" min={10} max={90} step={5} value={draft.minutesPerDay} onChange={(e) => setDraft({ ...draft, minutesPerDay: +e.target.value })} className="w-full accent-emerald-600 mt-2" />
        </SubField>
      </div>
    </SubPage>
  );
}

function NotificationsPage({ prefs, onChange, onBack }: { prefs: Prefs; onChange: (p: Prefs) => void; onBack: () => void }) {
  return (
    <SubPage title="Notifications" onBack={onBack}>
      <button onClick={() => onChange({ ...prefs, notifications: !prefs.notifications })} className="w-full flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="text-left">
          <div className="font-medium text-sm">Rappels quotidiens</div>
          <div className="text-xs text-slate-500">Hydratation, séance, repas.</div>
        </div>
        <span className={`w-10 h-6 rounded-full relative transition ${prefs.notifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${prefs.notifications ? 'left-4' : 'left-0.5'}`} />
        </span>
      </button>
    </SubPage>
  );
}

function ThemePage({ prefs, onChange, onBack }: { prefs: Prefs; onChange: (p: Prefs) => void; onBack: () => void }) {
  return (
    <SubPage title="Thème" onBack={onBack}>
      <div className="space-y-2">
        {(['system', 'light', 'dark'] as const).map((t) => (
          <button key={t} onClick={() => onChange({ ...prefs, theme: t })} className={`w-full flex items-center gap-3 p-4 rounded-2xl border ${prefs.theme === t ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
            {t === 'light' ? <Sun className="w-5 h-5" /> : t === 'dark' ? <Moon className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            <span className="flex-1 text-left text-sm font-medium">{t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Automatique (système)'}</span>
            {prefs.theme === t && <Check className="w-4 h-4 text-emerald-600" />}
          </button>
        ))}
      </div>
    </SubPage>
  );
}

function UnitsPage({ prefs, onChange, onBack }: { prefs: Prefs; onChange: (p: Prefs) => void; onBack: () => void }) {
  return (
    <SubPage title="Unités & langue" onBack={onBack}>
      <div className="space-y-5">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Unités</div>
          <div className="grid grid-cols-2 gap-2">
            {(['metric', 'imperial'] as const).map((u) => (
              <button key={u} onClick={() => onChange({ ...prefs, units: u })} className={`p-4 rounded-2xl border text-sm ${prefs.units === u ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                {u === 'metric' ? 'Métriques (kg, cm)' : 'Impériales (lb, in)'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Langue</div>
          <div className="grid grid-cols-2 gap-2">
            {(['fr', 'en'] as const).map((l) => (
              <button key={l} onClick={() => onChange({ ...prefs, lang: l })} className={`p-4 rounded-2xl border text-sm ${prefs.lang === l ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                {l === 'fr' ? 'Français' : 'English'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SubPage>
  );
}

function ConsentsPage({ onBack }: { onBack: () => void }) {
  return (
    <SubPage title="Consentements" onBack={onBack}>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 text-sm text-slate-600 dark:text-slate-300 space-y-3">
        <p>Tes données restent stockées localement sur cet appareil. Aucun partage automatique.</p>
        <p className="text-xs text-slate-500">Tu peux exporter ou effacer tes données depuis la section Données &amp; confidentialité du profil.</p>
      </div>
    </SubPage>
  );
}

function SubField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-2">{label}</div>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2 text-slate-500 uppercase tracking-wide">{title}</h3>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-sm font-medium text-right max-w-[60%]">{value}</div>
    </div>
  );
}

function Item({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
      <div className="text-slate-500">{icon}</div>
      <div className="flex-1 text-sm">{label}</div>
      {value && <div className="text-xs text-slate-400">{value}</div>}
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </button>
  );
}

function labelGoal(g: string) {
  const m: Record<string, string> = { lose: 'Perte de poids', gain: 'Prise de muscle', tone: 'Tonification', health: 'Forme & santé', perf: 'Performance' };
  return m[g] || g;
}
function labelLevel(l: string) {
  const m: Record<string, string> = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' };
  return m[l] || l;
}
