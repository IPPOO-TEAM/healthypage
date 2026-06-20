import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plane, Car, Utensils, Sparkles, Shield, Bell, ConciergeBell, Phone, Send } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { CONCIERGE_SERVICES } from '../voyageContent';

const ICONS = { plane: Plane, car: Car, utensils: Utensils, sparkles: Sparkles, shield: Shield, bell: Bell };

export default function ConciergerieScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div>
      <section className="relative h-56 overflow-hidden">
        <ImageWithFallback src={AFR.riadHall} alt="Conciergerie" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/55" />
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-amber-300/30 blur-3xl" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-medium uppercase tracking-[0.18em]">
            <ConciergeBell className="w-3.5 h-3.5 text-amber-200" /> Conciergerie
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Un voyage sur-mesure,<br />sans charge mentale.</h1>
          <p className="mt-2 text-sm text-white/80 max-w-md">Notre équipe orchestre vol, transferts, expériences et imprévus.</p>
        </div>
      </section>

      <div className="px-6 sm:px-8 mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONCIERGE_SERVICES.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <article key={s.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-3 hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-stone-900 text-sm">{s.title}</div>
                    {s.price && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">{s.price}</span>}
                  </div>
                  <p className="mt-1 text-sm text-stone-600 leading-relaxed">{s.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <section className="px-6 sm:px-8 mt-7 pb-10">
        <div className="bg-stone-900 text-white rounded-2xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-rose-500/30 blur-3xl" />
          <h2 className="text-xl font-bold tracking-tight">On vous rappelle dans 30 minutes</h2>
          <p className="mt-1 text-sm text-white/70">Décrivez votre projet, on s’occupe du reste.</p>
          {sent ? (
            <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-sm">
              Merci {name || 'à vous'}. Un conseiller vous contactera très vite.
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="mt-4 space-y-2"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder:text-white/50 outline-none focus:border-amber-300 text-sm"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre projet (dates, envies, contraintes…)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder:text-white/50 outline-none focus:border-amber-300 text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold text-sm">
                  <Send className="w-4 h-4" /> Envoyer
                </button>
                <a href="tel:+221000000000" className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 inline-flex items-center justify-center text-sm">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
