import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GraduationCap, Briefcase, Wrench, Cpu, BookOpen, Shield, Flower2, CheckCircle2, AlertTriangle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type Cat = "etudiant" | "fonctionnaire" | "informel" | "ingenieur" | "enseignant" | "terrain" | "senior";

const CATEGORIES: { id: Cat; icon: any; color: string; title: string; tagline: string; suivi: string[]; preventions: string[] }[] = [
  {
    id: "etudiant", icon: GraduationCap, color: "from-violet-500 to-fuchsia-600", title: "Étudiant", tagline: "Rythme de vie & santé universitaire",
    suivi: ["Sommeil & nutrition restauration universitaire", "Stress des examens", "Santé psycho-neurologique", "Sport universitaire"],
    preventions: ["Dépistage IST", "Vaccination (méningite, hépatite B, COVID)", "Bilan ophtalmo annuel"],
  },
  {
    id: "fonctionnaire", icon: Briefcase, color: "from-blue-500 to-cyan-600", title: "Fonctionnaire / Agent public", tagline: "Sédentarité & charge psycho-neurologique",
    suivi: ["Bilans administratifs périodiques", "Évaluation risques sédentarité", "Ergonomie poste de travail", "Stress professionnel"],
    preventions: ["Bilan cardiovasculaire annuel", "Dépistage diabète & cholestérol", "Vaccination grippe saisonnière"],
  },
  {
    id: "informel", icon: Wrench, color: "from-amber-500 to-orange-600", title: "Travailleur du secteur informel", tagline: "APE, commerçant, artisan, ouvrier, agriculteur",
    suivi: ["Suivi simplifié par téléphone (SMS)", "Tensions, blessures, fatigue", "Expositions environnementales", "Hygiène alimentaire"],
    preventions: ["Premiers secours", "Lien avec unités mobiles de santé", "Vaccination tétanos"],
  },
  {
    id: "ingenieur", icon: Cpu, color: "from-indigo-500 to-purple-600", title: "Ingénieur / Cadre technique", tagline: "Cardiovasculaire & santé numérique",
    suivi: ["Prévention cardiovasculaire", "Gestion du stress", "Repos visuel & posture (écrans)", "Équilibre vie pro / vie perso"],
    preventions: ["Bilan stress travail", "Activité physique régulière", "Suivi tension & glycémie"],
  },
  {
    id: "enseignant", icon: BookOpen, color: "from-emerald-500 to-teal-600", title: "Enseignant / Éducateur", tagline: "Voix, audition & gestion de classe",
    suivi: ["Suivi vocal & auditif", "Prévention surmenage", "Bilans visuels", "Respiration & gestion classe saine"],
    preventions: ["Cordothérapie / phoniatrie", "Vaccination grippe & rougeole", "Audiogramme bisannuel"],
  },
  {
    id: "terrain", icon: Shield, color: "from-red-500 to-rose-600", title: "Agent de terrain", tagline: "Sécurité, chauffeur, technicien",
    suivi: ["Risques professionnels (fatigue, traumas)", "Troubles du sommeil", "Bilans réguliers", "Prévention paludisme"],
    preventions: ["Suivi vaccinal complet", "Test fatigue & vigilance", "Dépistage diabète sédentaire"],
  },
  {
    id: "senior", icon: Flower2, color: "from-pink-500 to-rose-600", title: "Sénior / Retraité", tagline: "Vieillissement actif & autonome",
    suivi: ["Maladies chroniques (HTA, diabète, articulations)", "Physiothérapie & équilibre", "Activité physique adaptée", "Prévention chutes"],
    preventions: ["Bilan annuel complet", "Vaccination grippe + pneumocoque", "Dépistage cognitif (MMS)"],
  },
];

const STORAGE_KEY = "healthy-page:categorie";

type Stored = { cat: Cat | null; checks: Record<string, boolean> };

function load(): Stored {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return { cat: null, checks: {} };
}

export default function CategorieAdherentScreen({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Stored>(() => load());

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }, [data]);

  const cat = useMemo(() => CATEGORIES.find(c => c.id === data.cat), [data.cat]);
  const totalActions = cat ? cat.suivi.length + cat.preventions.length : 0;
  const doneActions = useMemo(() => {
    if (!cat) return 0;
    return [...cat.suivi, ...cat.preventions].filter(k => data.checks[`${cat.id}:${k}`]).length;
  }, [cat, data.checks]);

  const toggle = (key: string) => setData(d => ({ ...d, checks: { ...d.checks, [key]: !d.checks[key] } }));

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-teal-50/30 to-cyan-50/30 pb-12 overflow-x-hidden">
      <div className="p-4 space-y-3">
        <div className="relative h-44 rounded-3xl overflow-hidden shadow-lg">
          <ImageWithFallback src="https://images.unsplash.com/photo-1761666519882-59ab0dbe5059?w=1080" alt="Communauté" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/85 via-teal-600/70 to-cyan-600/60" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <button onClick={() => cat ? setData(d => ({ ...d, cat: null })) : onBack()} className="p-2 bg-white/20 hover:bg-white/30 rounded-full w-fit" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-white">
              <h1 className="text-xl font-bold">Mon profil adhérent</h1>
              <p className="text-xs text-teal-50/95 mt-0.5">Un parcours de prévention adapté à votre vie</p>
            </div>
          </div>
        </div>
        {!cat && (
          <>
            <p className="text-sm text-slate-700 px-2">Sélectionnez votre profil pour activer un tableau de bord et un plan de prévention adaptés.</p>
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              return (
                <button key={c.id} onClick={() => setData(d => ({ ...d, cat: c.id }))}
                  className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex items-center gap-3 text-left hover:shadow-md transition">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center`}><Icon className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <div className="text-slate-900">{c.title}</div>
                    <div className="text-xs text-slate-500">{c.tagline}</div>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {cat && (() => {
          const Icon = cat.icon;
          const pct = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;
          return (
            <>
              <section className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 text-white`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Icon className="w-6 h-6" /></div>
                  <div>
                    <div>{cat.title}</div>
                    <div className="text-xs opacity-85">{cat.tagline}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                  <span>Plan de prévention</span><span>{doneActions}/{totalActions}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${pct}%` }} />
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h2 className="text-slate-900 mb-2">🩺 Suivi spécifique</h2>
                <ul className="space-y-1.5">
                  {cat.suivi.map(s => {
                    const k = `${cat.id}:${s}`;
                    const done = !!data.checks[k];
                    return (
                      <li key={s}>
                        <button onClick={() => toggle(k)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-left">
                          {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                          <span className={`text-sm ${done ? "text-slate-400 line-through" : "text-slate-800"}`}>{s}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h2 className="text-slate-900 mb-2">🛡️ Préventions recommandées</h2>
                <ul className="space-y-1.5">
                  {cat.preventions.map(p => {
                    const k = `${cat.id}:${p}`;
                    const done = !!data.checks[k];
                    return (
                      <li key={p}>
                        <button onClick={() => toggle(k)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-left">
                          {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                          <span className={`text-sm ${done ? "text-slate-400 line-through" : "text-slate-800"}`}>{p}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {pct < 50 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-900">Plan partiellement complété. Pensez à programmer vos prochains bilans avec votre médecin référent.</p>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
