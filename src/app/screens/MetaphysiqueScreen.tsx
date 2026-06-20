import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Sparkles, Dna, Mountain, Leaf, Scan, MessageCircle, ChevronRight, Send, Flower, Wind, TreePine, Flame, Droplet, Moon } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type SectionId = "genetique" | "metaphysique" | "traditions" | "imagerie" | "spirituel";

const SECTIONS: { id: SectionId; icon: any; color: string; title: string; subtitle: string }[] = [
  { id: "genetique", icon: Dna, color: "from-violet-500 to-purple-600", title: "A. Génétique & hérédité", subtitle: "Antécédents familiaux, prédispositions, conseil génétique" },
  { id: "metaphysique", icon: Mountain, color: "from-indigo-500 to-blue-600", title: "B. Métaphysique & énergie", subtitle: "Équilibre énergétique, méditation, harmonie corps-esprit" },
  { id: "traditions", icon: Leaf, color: "from-emerald-500 to-teal-600", title: "C. Médecines traditionnelles", subtitle: "Tradi-praticiens reconnus, plantes, soins ancestraux" },
  { id: "imagerie", icon: Scan, color: "from-cyan-500 to-blue-600", title: "D. Analyses & radios", subtitle: "Imagerie, scanner, IRM, échographie" },
  { id: "spirituel", icon: MessageCircle, color: "from-amber-500 to-orange-600", title: "E. Dialogue spirituel", subtitle: "Écoute confidentielle, accompagnement, sens de la maladie" },
];

const GENETIQUE_QUESTIONS = [
  { id: "diabete", label: "Diabète dans la famille" },
  { id: "hta", label: "Hypertension artérielle" },
  { id: "cancer", label: "Cancer (sein, prostate, côlon…)" },
  { id: "drepano", label: "Drépanocytose / anémie falciforme" },
  { id: "cardio", label: "Maladies cardiovasculaires précoces" },
  { id: "neuro", label: "Maladies neurologiques (Alzheimer, Parkinson)" },
];

const TRADITIONS = [
  { name: "Tradi-praticien Vodoun (Bénin)", region: "Sud-Bénin", focus: "Plantes, rituels de purification" },
  { name: "Herboriste Yoruba", region: "Porto-Novo", focus: "Décoctions, soins digestifs" },
  { name: "Maître guérisseur Adja", region: "Mono-Couffo", focus: "Soins osseux, articulations" },
  { name: "Tradi-thérapeute Bariba", region: "Borgou", focus: "Plantes du Nord, fièvres" },
  { name: "Praticien Akan (Côte d'Ivoire)", region: "Abidjan", focus: "Soins maternels, post-partum" },
];

const IMAGERIE = [
  { code: "RX-THX", label: "Radiographie thoracique", price: 8000, delay: "1h" },
  { code: "ECHO-AB", label: "Échographie abdominale", price: 15000, delay: "24h" },
  { code: "ECHO-CARD", label: "Échographie cardiaque", price: 25000, delay: "48h" },
  { code: "SCAN-CER", label: "Scanner cérébral", price: 65000, delay: "48h" },
  { code: "IRM-LOM", label: "IRM lombaire", price: 95000, delay: "72h" },
  { code: "MAMMO", label: "Mammographie", price: 22000, delay: "24h" },
];

const STORAGE_KEY = "healthy-page:metaphysique";

type Stored = { genetique: Record<string, boolean>; spiritualNotes: { id: string; date: string; text: string }[] };

function load(): Stored {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return { genetique: {}, spiritualNotes: [] };
}

export default function MetaphysiqueScreen({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState<SectionId | null>(null);
  const [data, setData] = useState<Stored>(() => load());
  const [draft, setDraft] = useState("");

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }, [data]);

  const riskCount = Object.values(data.genetique).filter(Boolean).length;

  const addNote = () => {
    if (!draft.trim()) return;
    setData(d => ({ ...d, spiritualNotes: [{ id: Date.now().toString(), date: new Date().toISOString().slice(0, 10), text: draft.trim() }, ...d.spiritualNotes] }));
    setDraft("");
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-teal-50/30 to-cyan-50/30 pb-12 overflow-x-hidden">
      <div className="p-4 space-y-3">
        <div className="relative h-44 rounded-3xl overflow-hidden shadow-lg">
          <ImageWithFallback src={section ? "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1080" : "https://images.unsplash.com/photo-1776680255189-34d703e28e16?w=1080"} alt="Méditation" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/85 via-teal-600/70 to-cyan-600/60" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <button onClick={() => section ? setSection(null) : onBack()} className="p-2 bg-white/20 hover:bg-white/30 rounded-full w-fit" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-white">
              <h1 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5" /> Santé métaphysique</h1>
              <p className="text-xs text-teal-50/95 mt-0.5">Au-delà du visible : génétique, énergie, traditions, esprit</p>
            </div>
          </div>
        </div>
        {!section && SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setSection(s.id)}
              className="w-full bg-white rounded-2xl shadow-sm border border-teal-100 p-4 flex items-center gap-3 hover:shadow-md transition text-left">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-teal-900">{s.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.subtitle}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-violet-400" />
            </button>
          );
        })}

        {section === "genetique" && (
          <section className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4 space-y-3">
            <h2 className="text-teal-900">Antécédents familiaux</h2>
            <p className="text-xs text-gray-600">Cochez les pathologies présentes chez vos parents proches (parents, frères/sœurs, grands-parents).</p>
            <ul className="space-y-2">
              {GENETIQUE_QUESTIONS.map(q => (
                <li key={q.id}>
                  <label className="flex items-center gap-3 p-3 bg-violet-50/40 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={!!data.genetique[q.id]}
                      onChange={e => setData(d => ({ ...d, genetique: { ...d.genetique, [q.id]: e.target.checked } }))}
                      className="w-4 h-4 accent-violet-600" />
                    <span className="text-sm text-teal-900">{q.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="bg-violet-100/50 rounded-xl p-3 text-sm text-teal-900">
              <div>Risques familiaux identifiés : <strong>{riskCount}</strong></div>
              <p className="text-xs text-violet-700/80 mt-1">{riskCount >= 3 ? "Conseil génétique recommandé : prenez RDV avec un médecin référent." : riskCount >= 1 ? "Surveillance préventive conseillée selon les antécédents." : "Aucun antécédent signalé."}</p>
            </div>
          </section>
        )}

        {section === "metaphysique" && (
          <section className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4 space-y-3">
            <h2 className="text-indigo-900">Équilibre énergétique</h2>
            <p className="text-sm text-gray-700">La santé métaphysique reconnaît l'unité corps-esprit-énergie. L'équilibre s'entretient par des pratiques quotidiennes.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { Icon: Flower, title: "Méditation", desc: "10 min / jour" },
                { Icon: Wind, title: "Respiration consciente", desc: "Cohérence cardiaque" },
                { Icon: TreePine, title: "Connexion nature", desc: "Marche, pieds nus" },
                { Icon: Flame, title: "Rituels intérieurs", desc: "Gratitude, intention" },
                { Icon: Droplet, title: "Hydratation rituelle", desc: "Eau bénite, infusions" },
                { Icon: Moon, title: "Cycles lunaires", desc: "Repos, introspection" },
              ].map((p, i) => (
                <div key={i} className="bg-indigo-50/40 rounded-xl p-3">
                  <p.Icon className="w-6 h-6 mb-1 text-indigo-700" strokeWidth={1.75} />
                  <div className="text-sm text-indigo-900">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {section === "traditions" && (
          <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 space-y-3">
            <h2 className="text-emerald-900">Tradi-praticiens partenaires</h2>
            <p className="text-xs text-gray-600">Réseau encadré. Les soins traditionnels complètent, sans remplacer, la médecine moderne.</p>
            <ul className="space-y-2">
              {TRADITIONS.map((t, i) => (
                <li key={i} className="p-3 bg-emerald-50/40 rounded-xl">
                  <div className="text-sm text-emerald-900">{t.name}</div>
                  <div className="text-xs text-gray-600">{t.region} · {t.focus}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {section === "imagerie" && (
          <section className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-4 space-y-3">
            <h2 className="text-cyan-900">Imagerie & analyses approfondies</h2>
            <ul className="space-y-2">
              {IMAGERIE.map(i => (
                <li key={i.code} className="p-3 bg-cyan-50/40 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm text-cyan-900">{i.label}</div>
                    <div className="text-xs text-gray-500">{i.code} · délai {i.delay}</div>
                  </div>
                  <div className="text-sm text-cyan-700">{i.price.toLocaleString()} FCFA</div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500">Sur prescription médicale. Centres partenaires accessibles via la carte.</p>
          </section>
        )}

        {section === "spirituel" && (
          <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 space-y-3">
            <h2 className="text-amber-900">Dialogue spirituel & sens</h2>
            <p className="text-sm text-gray-700">Espace confidentiel. Notez vos questionnements, intentions, ressentis sur le sens de votre parcours de santé.</p>
            <div className="flex gap-2">
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="Écrire une réflexion…"
                className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              <button onClick={addNote} className="px-3 py-2 bg-amber-600 text-white rounded-xl"><Send className="w-4 h-4" /></button>
            </div>
            {data.spiritualNotes.length === 0 ? (
              <p className="text-xs text-gray-500">Aucune note. Cet espace est strictement personnel.</p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {data.spiritualNotes.map(n => (
                  <li key={n.id} className="p-3 bg-amber-50/50 rounded-xl">
                    <div className="text-xs text-amber-700 mb-1">{n.date}</div>
                    <div className="text-sm text-amber-900 whitespace-pre-wrap">{n.text}</div>
                    <button onClick={() => setData(d => ({ ...d, spiritualNotes: d.spiritualNotes.filter(x => x.id !== n.id) }))}
                      className="text-xs text-red-500 mt-1">Supprimer</button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-amber-700/70 italic">« Le corps parle quand l'esprit n'est pas écouté. »</p>
          </section>
        )}
      </div>
    </div>
  );
}
