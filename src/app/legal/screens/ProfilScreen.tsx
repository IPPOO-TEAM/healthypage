import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Shield, Globe, FileText, ChevronRight, LogOut, Sparkles, Phone } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { LEGAL } from '../images';

export default function ProfilScreen() {
  const navigate = useNavigate();
  const [anonymous, setAnonymous] = useState(true);
  const [notif, setNotif] = useState(true);

  return (
    <div className="pb-6">
      <section className="relative h-44 overflow-hidden">
        <ImageWithFallback src={LEGAL.bookOpenTable} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-700/90 via-stone-800/85 to-blue-900/90" />
      </section>
      <div className="-mt-14 px-5 relative">
        <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-4 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
            <ImageWithFallback src={LEGAL.womanLocsB} alt="Avatar" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-stone-900 truncate">{anonymous ? 'Utilisateur anonyme' : 'Aïcha B.'}</div>
            <div className="text-xs text-stone-500 truncate">Cotonou · Bénin</div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
              <Sparkles className="w-3 h-3" /> 3 dossiers · 8 fiches consultées
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Dossiers', value: '3' },
          { label: 'Centres favoris', value: '4' },
          { label: 'Fiches lues', value: '8' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
            <div className="font-bold text-lg text-stone-900">{s.value}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="px-5 mt-7">
        <h2 className="text-base font-bold text-stone-900">Confidentialité</h2>
        <div className="mt-3 bg-white rounded-3xl border border-stone-100 overflow-hidden divide-y divide-stone-100">
          <Toggle label="Mode anonyme" Icon={Shield} value={anonymous} onChange={setAnonymous} />
          <Toggle label="Notifications discrètes" Icon={Bell} value={notif} onChange={setNotif} />
          <Row label="Langue" Icon={Globe} value="Français" />
          <Row label="Mes pièces & documents" Icon={FileText} value="0 fichier" />
        </div>
      </section>

      <section className="px-5 mt-7">
        <h2 className="text-base font-bold text-stone-900">Numéros d'urgence</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { num: '7028', label: 'Justice' },
            { num: '117', label: 'Police' },
            { num: '138', label: 'SOS' },
          ].map((n) => (
            <a key={n.num} href={`tel:${n.num}`} className="bg-white rounded-2xl border border-stone-100 p-3 text-center">
              <Phone className="w-4 h-4 mx-auto text-amber-600" />
              <div className="font-bold text-stone-900 mt-1">{n.num}</div>
              <div className="text-[10px] text-stone-500">{n.label}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="px-5 mt-7">
        <button
          onClick={() => navigate('/landing')}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200"
        >
          <LogOut className="w-4 h-4" /> Quitter Justice Page
        </button>
        <p className="text-center text-[11px] text-stone-400 mt-3">Justice Page · v1.0 · Bénin</p>
      </section>
    </div>
  );
}

function Toggle({ label, Icon, value, onChange }: { label: string; Icon: any; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-sm font-medium text-stone-800">{label}</div>
      <span className={`relative w-10 h-6 rounded-full transition ${value ? 'bg-amber-600' : 'bg-stone-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-[1.125rem]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function Row({ label, Icon, value }: { label: string; Icon: any; value: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-sm font-medium text-stone-800">{label}</div>
      <div className="text-xs text-stone-500">{value}</div>
      <ChevronRight className="w-4 h-4 text-stone-400" />
    </button>
  );
}
