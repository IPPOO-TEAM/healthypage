import { useNavigate } from 'react-router';
import {
  User, Bell, CreditCard, Shield, HelpCircle, Globe, ChevronRight,
  Sparkles, LogOut, Languages, Hand, Plane, MessageCircle, Star,
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { usePatientPreferences } from '../../components/useStoredState';
import { INTENT_LABEL, Intent } from '../data';

const INTENTS: Intent[] = ['souffler', 'nature', 'spa', 'meditation', 'detox', 'famille', 'senior', 'cure'];

export default function ProfilScreen() {
  const navigate = useNavigate();
  const { prefs, update } = usePatientPreferences();

  const groups = [
    {
      title: 'Mon espace voyageur',
      items: [
        { Icon: Plane, label: 'Mes voyages', sub: 'Réservations à venir, passées, annulées', onClick: () => navigate('/voyage-loisirs/mes-voyages') },
        { Icon: MessageCircle, label: 'Messagerie', sub: 'Discutez avec vos hôtes', onClick: () => navigate('/voyage-loisirs/messages') },
        { Icon: Star, label: 'Mes avis', sub: 'Partagez votre expérience', onClick: () => navigate('/voyage-loisirs/mes-voyages') },
      ],
    },
    {
      title: 'Mes préférences',
      items: [
        { Icon: Sparkles, label: 'Préférences bien-être', sub: 'Intentions, rythme, besoins', onClick: () => {} },
        { Icon: Bell, label: 'Notifications', sub: 'Offres flash, baisse de prix, rappels', onClick: () => {} },
        { Icon: Languages, label: 'Langue', sub: prefs.language ?? 'Français', onClick: () => {} },
      ],
    },
    {
      title: 'Paiement & sécurité',
      items: [
        { Icon: CreditCard, label: 'Moyens de paiement', sub: 'Mobile money, carte', onClick: () => {} },
        { Icon: Shield, label: 'Sécurité du compte', sub: 'Mot de passe, 2FA', onClick: () => {} },
      ],
    },
    {
      title: 'Aide',
      items: [
        { Icon: HelpCircle, label: 'Centre d\'aide', sub: 'Articles & contact support', onClick: () => {} },
        { Icon: Globe, label: 'À propos de HEALTHY PAGE', sub: 'Mission & contacts', onClick: () => navigate('/a-propos') },
      ],
    },
  ];

  return (
    <div>
      {/* Header avec photo */}
      <section className="relative h-44 overflow-hidden">
        <ImageWithFallback src={AFR.africanGreenDress} alt="Profil" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/55" />
        <div className="absolute bottom-4 left-5 right-5 text-white flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-rose-400 ring-4 ring-white/30 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg leading-tight inline-flex items-center gap-2">Bonjour <Hand className="w-4 h-4" /></div>
            <div className="text-xs text-white/80">Niveau Or · 1 240 points</div>
          </div>
        </div>
      </section>

      <div className="px-6 -mt-4 relative z-10">
        {/* Préférences bien-être rapides */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-stone-900">Préférences bien-être</div>
              <div className="text-xs text-stone-500">Personnalise Explorer et les résultats.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTENTS.map((i) => {
              const active = prefs.preferredFormule === i;
              return (
                <button
                  key={i}
                  onClick={() => update({ preferredFormule: active ? undefined : i })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    active
                      ? 'bg-rose-600 text-white border-rose-600 shadow'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-rose-300'
                  }`}
                >
                  {INTENT_LABEL[i]}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Toggle
              label="Notifications email"
              value={!!prefs.notificationsEmail}
              onChange={(v) => update({ notificationsEmail: v })}
            />
            <Toggle
              label="Notifications SMS"
              value={!!prefs.notificationsSms}
              onChange={(v) => update({ notificationsSms: v })}
            />
            <Toggle
              label="Mouvement réduit"
              value={!!prefs.reducedMotion}
              onChange={(v) => update({ reducedMotion: v })}
            />
            <Toggle
              label="Mode sombre"
              value={false}
              onChange={() => {}}
              disabled
            />
          </div>
        </div>

        {/* Groups */}
        {groups.map((g) => (
          <section key={g.title} className="mt-6">
            <div className="text-xs uppercase tracking-wider text-stone-500 mb-2 px-1">{g.title}</div>
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {g.items.map((it, i) => (
                <button
                  key={it.label}
                  onClick={it.onClick}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-stone-50 transition ${
                    i > 0 ? 'border-t border-stone-100' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                    <it.Icon className="w-4 h-4 text-stone-700" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-stone-900">{it.label}</div>
                    <div className="text-xs text-stone-500">{it.sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <button
          onClick={() => navigate('/landing')}
          className="mt-6 mb-4 w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold inline-flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Quitter l'app Voyage
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
        disabled ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-stone-200 hover:border-stone-300'
      }`}
    >
      <span className="text-sm text-stone-700">{label}</span>
      <span
        className={`relative w-9 h-5 rounded-full transition ${value ? 'bg-rose-500' : 'bg-stone-300'}`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition ${value ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}
