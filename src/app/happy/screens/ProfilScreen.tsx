import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Volume2, Moon, Globe, Heart, ChevronRight, LogOut, Sparkles, Star } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { HAPPY } from '../images';

export default function ProfilScreen() {
  const navigate = useNavigate();
  const [sound, setSound] = useState(true);
  const [notif, setNotif] = useState(true);
  const [reduce, setReduce] = useState(false);

  return (
    <div className="pb-6">
      {/* Profil card */}
      <section className="relative h-44 overflow-hidden">
        <ImageWithFallback src={HAPPY.kaleidoFlower} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/85 via-fuchsia-500/80 to-violet-700/85" />
      </section>
      <div className="-mt-14 px-5 relative">
        <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-4 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
            <ImageWithFallback src={HAPPY.manDreads} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-stone-900 truncate">Komla A.</div>
            <div className="text-xs text-stone-500 truncate inline-flex items-center gap-1">Niveau 7 · 1240 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
              <Sparkles className="w-3 h-3" /> Membre Happy depuis mars
            </div>
          </div>
          <button onClick={() => navigate('/jeux-bien-etre/jeu/avatarfun')} className="px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold">
            Modifier
          </button>
        </div>
      </div>

      {/* Stats */}
      <section className="px-5 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Sessions', value: '48' },
          { label: 'Jeux essayés', value: '7/12' },
          { label: 'Temps zen', value: '5h12' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
            <div className="font-bold text-lg text-stone-900">{s.value}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Settings */}
      <section className="px-5 mt-7">
        <h2 className="text-base font-bold text-stone-900">Préférences</h2>
        <div className="mt-3 bg-white rounded-3xl border border-stone-100 overflow-hidden divide-y divide-stone-100">
          <Toggle label="Sons et ambiance" Icon={Volume2} value={sound} onChange={setSound} />
          <Toggle label="Notifications douces" Icon={Bell} value={notif} onChange={setNotif} />
          <Toggle label="Animations réduites" Icon={Moon} value={reduce} onChange={setReduce} />
          <Row label="Langue" Icon={Globe} value="Français" />
          <Row label="Mes favoris" Icon={Heart} value="6 jeux" onClick={() => navigate('/jeux-bien-etre/catalogue')} />
        </div>
      </section>

      <section className="px-5 mt-7">
        <button
          onClick={() => navigate('/landing')}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200"
        >
          <LogOut className="w-4 h-4" /> Quitter Happy Page
        </button>
        <p className="text-center text-[11px] text-stone-400 mt-3">Happy Page · v1.0 · Détente & évasion</p>
      </section>
    </div>
  );
}

function Toggle({ label, Icon, value, onChange }: { label: string; Icon: any; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 text-sm font-medium text-stone-800">{label}</div>
      <span className={`relative w-10 h-6 rounded-full transition ${value ? 'bg-rose-500' : 'bg-stone-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-[1.125rem]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function Row({ label, Icon, value, onClick }: { label: string; Icon: any; value: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 text-sm font-medium text-stone-800">{label}</div>
      <div className="text-xs text-stone-500">{value}</div>
      <ChevronRight className="w-4 h-4 text-stone-400" />
    </button>
  );
}
