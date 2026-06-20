import { useState } from "react";
import {
  ArrowRight, Menu, X, Sparkles, Users, HeartHandshake, Leaf,
  GraduationCap, Baby, Wallet, Star, Smartphone, BookOpen, FolderHeart,
  Headphones, Dumbbell, Plane, Siren, Gamepad2, Scale,
} from "lucide-react";
import logo from "../../imports/1.png";
import { LanguagePicker } from "./LanguagePicker";

interface Props { onStart: () => void }

const NAV_LINKS = [
  { href: "/landing#modules", label: "Modules" },
  { href: "/landing#qui", label: "Pour qui" },
  { href: "/landing#seniors", label: "Séniors" },
  { href: "/landing#heritage", label: "Pharmacopée" },
  { href: "/landing#offres-dediees", label: "Offres" },
  { href: "/kit-grossesse", label: "Kit Grossesse" },
  { href: "/scarification-tradition", label: "Tradition & Soin" },
  { href: "/carnet-sante", label: "Carnet de santé" },
  { href: "/podcast-sante", label: "Podcast Santé" },
  { href: "/podcast", label: "Écouter le podcast" },
  { href: "/fitness", label: "FitnessFlow" },
  { href: "/voyage-loisirs", label: "Voyage & Loisirs" },
  { href: "/urgences-publiques", label: "Urgences" },
  { href: "/jeux-bien-etre", label: "Jeux" },
  { href: "/assistance-juridique", label: "Assistance juridique" },
  { href: "/landing#tarifs", label: "Tarifs" },
  { href: "/landing#avis", label: "Témoignages" },
  { href: "/landing#telecharger", label: "Télécharger" },
  { href: "/landing#faq", label: "FAQ" },
  { href: "/specialites", label: "Spécialités" },
  { href: "/a-propos", label: "À propos" },
];

const DRAWER_LINKS = [
  { href: "/landing#modules", label: "Modules", Icon: Sparkles },
  { href: "/landing#qui", label: "Pour qui", Icon: Users },
  { href: "/landing#seniors", label: "Programme Séniors", Icon: HeartHandshake },
  { href: "/landing#heritage", label: "Pharmacopée & traditions", Icon: Leaf },
  { href: "/landing#offres-dediees", label: "Offres dédiées", Icon: GraduationCap },
  { href: "/kit-grossesse", label: "Kit Préparation Grossesse", Icon: Baby },
  { href: "/scarification-tradition", label: "Tradition & Tattoo-thérapie", Icon: Leaf },
  { href: "/carnet-sante", label: "Carnet de santé numérique", Icon: FolderHeart },
  { href: "/podcast-sante", label: "Podcast Santé HEALTHY PAGE", Icon: Headphones },
  { href: "/podcast", label: "Écouter le podcast (app)", Icon: Headphones },
  { href: "/fitness", label: "FitnessFlow — coach fitness", Icon: Dumbbell },
  { href: "/voyage-loisirs", label: "Voyage & Loisirs", Icon: Plane },
  { href: "/urgences-publiques", label: "Urgences (Pompiers, Police, Ambulances)", Icon: Siren },
  { href: "/jeux-bien-etre", label: "Jeux & Bien-être", Icon: Gamepad2 },
  { href: "/assistance-juridique", label: "Assistance juridique", Icon: Scale },
  { href: "/landing#tarifs", label: "Tarifs & forfaits", Icon: Wallet },
  { href: "/landing#avis", label: "Témoignages", Icon: Star },
  { href: "/landing#telecharger", label: "Télécharger l'app", Icon: Smartphone },
  { href: "/landing#faq", label: "Questions fréquentes", Icon: BookOpen },
  { href: "/specialites", label: "Spécialités médicales", Icon: HeartHandshake },
  { href: "/a-propos", label: "À propos", Icon: Sparkles },
];

export function LandingNav({ onStart }: Props) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <a href="/landing" className="flex items-center gap-2">
            <img src={logo} alt="Healthy Page" className="w-20 h-20 sm:w-25 sm:h-25 object-contain" />
          </a>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-slate-600">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-rose-600 transition">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguagePicker compact />
            <button onClick={onStart} className="text-xs sm:text-sm px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-medium inline-flex items-center gap-1.5 shadow-sm">
              Commencer <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Ouvrir le menu"
              className="lg:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <div aria-hidden className="h-14 sm:h-16" />

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div onClick={() => setNavOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <aside className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <img src={logo} alt="Healthy Page" className="w-14 h-14 object-contain" />
              <button onClick={() => setNavOpen(false)} aria-label="Fermer" className="p-2 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {DRAWER_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setNavOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 hover:bg-rose-50 hover:text-rose-700 font-medium"
                >
                  <Icon className="w-5 h-5 text-rose-500" />
                  {label}
                </a>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => { setNavOpen(false); onStart(); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-3 shadow-sm"
              >
                Commencer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

