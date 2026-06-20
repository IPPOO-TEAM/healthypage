import { ArrowRight, Heart, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { HealthyPage } from './Brand';
import logo from '../../imports/1.png';

export type FooterAccent = 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet' | 'slate';

interface Props {
  accent?: FooterAccent;
  onStart?: () => void;
}

const ACCENTS: Record<FooterAccent, { btn: string; icon: string }> = {
  rose: { btn: 'bg-rose-600 hover:bg-rose-700', icon: 'text-rose-400 fill-rose-400' },
  emerald: { btn: 'bg-emerald-600 hover:bg-emerald-700', icon: 'text-emerald-400 fill-emerald-400' },
  amber: { btn: 'bg-amber-600 hover:bg-amber-700', icon: 'text-amber-400 fill-amber-400' },
  cyan: { btn: 'bg-cyan-600 hover:bg-cyan-700', icon: 'text-cyan-400 fill-cyan-400' },
  violet: { btn: 'bg-violet-600 hover:bg-violet-700', icon: 'text-violet-400 fill-violet-400' },
  slate: { btn: 'bg-slate-700 hover:bg-slate-800', icon: 'text-slate-300 fill-slate-300' },
};

export function LandingFooter({ accent = 'rose', onStart }: Props) {
  const a = ACCENTS[accent];
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <img src={logo} alt="Healthy Page" className="w-10 h-10 object-contain" />
            <HealthyPage className="text-lg" />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            La santé numérique pensée par et pour l'Afrique francophone et sa diaspora.
          </p>
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider text-slate-300">Cotonou</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider text-slate-300">Abidjan</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider text-slate-300">Dakar</span>
          </div>
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">Produit</div>
          <ul className="space-y-2 text-sm">
            <li><a href="/landing#modules" className="hover:text-white">Modules</a></li>
            <li><a href="/landing#qui" className="hover:text-white">Pour qui</a></li>
            <li><a href="/landing#tarifs" className="hover:text-white">Tarifs</a></li>
            <li><a href="/landing#avis" className="hover:text-white">Témoignages</a></li>
            <li><a href="/landing#faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">Entreprise</div>
          <ul className="space-y-2 text-sm">
            <li><a href="/a-propos" className="hover:text-white">À propos</a></li>
            <li><a href="/specialites" className="hover:text-white">Spécialités</a></li>
            <li><a href="/kit-grossesse" className="hover:text-white">Kit Grossesse</a></li>
            <li><a href="/scarification-tradition" className="hover:text-white">Tradition & Soin</a></li>
            <li><a href="/carnet-sante" className="hover:text-white">Carnet de santé</a></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">Contact</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> +229 21 30 11 11</li>
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" /> hello@healthypage.africa</li>
            <li className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 shrink-0" /> healthypage.africa</li>
            <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /> 12 pays · Diaspora mondiale</li>
          </ul>
          {onStart && (
            <button
              onClick={onStart}
              className={`mt-4 px-4 py-2 ${a.btn} text-white rounded-full text-xs font-medium inline-flex items-center gap-1.5`}
            >
              Commencer <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            © 2026 <HealthyPage />. Tous droits réservés. Made with{' '}
            <Heart className={`inline w-3 h-3 ${a.icon}`} /> à Cotonou, Abidjan & Dakar.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-white">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
