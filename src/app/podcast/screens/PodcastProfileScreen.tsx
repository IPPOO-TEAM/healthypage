import { Headphones, Globe, Gauge, Moon, Repeat, Trash2, HardDrive, Bell, BellOff, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePodcastPlayer } from '../PodcastPlayerContext';
import { listCachedUrls } from '../../components/offlineAudio';
import { usePodcastNotifications } from '../usePodcastNotifications';
import { useT, LOCALES } from '../../i18n';

const LANGS: { id: 'fr' | 'fon' | 'yor' | 'wol' | 'hau' | 'ibo' | 'lin' | 'bam' | 'ful' | 'dyu' | 'sen' | 'zar'; label: string }[] = [
  { id: 'fr', label: 'Français' },
  { id: 'fon', label: 'Fon' },
  { id: 'yor', label: 'Yoruba' },
  { id: 'wol', label: 'Wolof' },
  { id: 'hau', label: 'Haoussa' },
  { id: 'ibo', label: 'Igbo' },
  { id: 'lin', label: 'Lingala' },
  { id: 'bam', label: 'Bambara' },
  { id: 'ful', label: 'Peul' },
  { id: 'dyu', label: 'Dioula' },
  { id: 'sen', label: 'Sénoufo' },
  { id: 'zar', label: 'Djerma' },
];

export default function PodcastProfileScreen() {
  const { state, prefs, setPrefs, clearHistory, episodes } = usePodcastPlayer();
  const [cachedCount, setCachedCount] = useState(0);
  const notif = usePodcastNotifications(prefs.lang);
  const { t, locale, setLocale } = useT();

  useEffect(() => { listCachedUrls().then((u) => setCachedCount(u.length)); }, [state.downloads]);
  useEffect(() => { if (notif.prefs.enabled && notif.prefs.lang !== prefs.lang) notif.setLang(prefs.lang); }, [prefs.lang]);

  return (
    <div className="px-4 pt-5 space-y-5">
      <header className="rounded-3xl bg-gradient-to-br from-[#0B1220] via-[#1E5BFF] to-[#12C76F] text-white p-5">
        <Headphones className="w-7 h-7" />
        <h1 className="font-black text-2xl mt-2">Profil podcast</h1>
        <p className="text-white/80 text-sm mt-1">Préférences d'écoute, hors-ligne et historique.</p>
      </header>

      <Section icon={<Gauge className="w-4 h-4" />} title="Vitesse de lecture">
        <div className="flex flex-wrap gap-2">
          {[0.75, 1, 1.25, 1.5, 2].map((r) => (
            <button key={r} onClick={() => setPrefs({ rate: r })}
              className={`px-3 py-1.5 rounded-full text-sm font-bold ring-1 ${prefs.rate === r ? 'bg-[#1E5BFF] text-white ring-transparent' : 'bg-white text-slate-700 ring-slate-200'}`}>
              ×{r}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Globe className="w-4 h-4" />} title={t('profile.language_choice')}>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {LOCALES.map((l) => (
            <button key={l.id} onClick={() => { setLocale(l.id as any); setPrefs({ lang: l.id as any }); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ring-1 text-left text-sm transition ${
                l.id === locale ? 'bg-[#1E5BFF] text-white ring-transparent shadow-sm' : 'bg-white text-slate-700 ring-[#E6EAF2]'
              }`}>
              <span className="text-base">{l.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold leading-tight">{l.native}</div>
                <div className={`text-[11px] ${l.id === locale ? 'text-white/80' : 'text-slate-400'}`}>{l.label}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 mb-2 font-bold">{t('profile.language_help')}</div>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button key={l.id} onClick={() => setPrefs({ lang: l.id })}
              className={`px-3 py-1.5 rounded-full text-sm font-bold ring-1 ${prefs.lang === l.id ? 'bg-[#1E5BFF] text-white ring-transparent' : 'bg-white text-slate-700 ring-slate-200'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Repeat className="w-4 h-4" />} title="Lecture automatique">
        <Toggle on={prefs.autoplay} onChange={(v) => setPrefs({ autoplay: v })} label="Enchaîner l'épisode suivant" />
      </Section>

      <Section icon={<Moon className="w-4 h-4" />} title="Minuteur de sommeil">
        <div className="flex flex-wrap gap-2">
          {[null, 10, 20, 30, 60].map((m) => (
            <button key={String(m)} onClick={() => setPrefs({ sleepMin: m })}
              className={`px-3 py-1.5 rounded-full text-sm font-bold ring-1 ${prefs.sleepMin === m ? 'bg-[#1E5BFF] text-white ring-transparent' : 'bg-white text-slate-700 ring-slate-200'}`}>
              {m === null ? 'Désactivé' : `${m} min`}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={notif.prefs.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />} title="Notifications nouveaux épisodes">
        {notif.permission === 'unsupported' ? (
          <p className="text-sm text-slate-500">Votre navigateur ne supporte pas les notifications.</p>
        ) : notif.permission === 'denied' ? (
          <p className="text-sm text-rose-600">Notifications bloquées dans les réglages du navigateur. Autorisez le site pour réactiver.</p>
        ) : (
          <div className="space-y-3">
            <Toggle on={notif.prefs.enabled}
              onChange={(v) => { v ? notif.enable() : notif.disable(); }}
              label={`Recevoir une alerte pour les nouveaux épisodes en ${LANGS.find((l) => l.id === notif.prefs.lang)?.label ?? 'français'}`} />
            <div className="flex flex-wrap gap-2">
              <button onClick={notif.checkNow} disabled={!notif.prefs.enabled}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-white ring-1 ring-slate-200 disabled:opacity-50">
                Vérifier maintenant
              </button>
              <button onClick={notif.sendTest} disabled={!notif.prefs.enabled}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#1E5BFF] text-white disabled:opacity-50">
                <Send className="w-3 h-3" /> Notification test
              </button>
            </div>
            {notif.recent.length > 0 && (
              <div className="text-xs text-slate-500">Dernière alerte envoyée : {new Date(notif.recent[0].at).toLocaleTimeString()}.</div>
            )}
          </div>
        )}
      </Section>

      <Section icon={<HardDrive className="w-4 h-4" />} title="Stockage hors-ligne">
        <div className="text-sm text-slate-600">
          {cachedCount} fichier{cachedCount > 1 ? 's' : ''} en cache · {state.downloads.length} épisode{state.downloads.length > 1 ? 's' : ''} marqué{state.downloads.length > 1 ? 's' : ''} hors-ligne sur {episodes.length}.
        </div>
      </Section>

      <Section icon={<Trash2 className="w-4 h-4" />} title="Données">
        <button onClick={clearHistory} className="px-3 py-2 rounded-full text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100">
          Effacer l'historique d'écoute
        </button>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-slate-100 p-4">
      <h2 className="font-bold text-sm inline-flex items-center gap-2 text-slate-700">{icon} {title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className={`w-11 h-6 rounded-full transition relative ${on ? 'bg-[#1E5BFF]' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${on ? 'left-5' : 'left-0.5'}`} />
      </span>
    </button>
  );
}
