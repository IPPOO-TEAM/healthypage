import { useEffect, useState } from "react";
import { ArrowLeft, Trees, Users, Phone, MapPin, Radio, Truck, BookOpen, HeartHandshake } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const RELAIS = [
  { id: "1", name: "Akossiwa Dogbé", village: "Tori-Bossito", commune: "Atlantique", phone: "+229 97 12 34 56", patients: 47, formation: "Premiers secours, paludisme" },
  { id: "2", name: "Mariam Souley", village: "Pèrèrè", commune: "Borgou", phone: "+229 96 45 78 90", patients: 38, formation: "Suivi materno-infantile" },
  { id: "3", name: "Kossi Adjo", village: "Adjarra", commune: "Ouémé", phone: "+229 95 22 11 88", patients: 52, formation: "Hygiène & assainissement" },
  { id: "4", name: "Fatouma Bio", village: "Tanguiéta", commune: "Atacora", phone: "+229 94 67 45 33", patients: 29, formation: "Nutrition infantile" },
  { id: "5", name: "Yawa Mensah", village: "Lokossa", commune: "Mono", phone: "+229 97 88 22 14", patients: 41, formation: "Drépanocytose, vaccins" },
];

const SERVICES_RURAL = [
  { icon: Phone, color: "bg-emerald-100 text-emerald-700", title: "Téléphone mobile simplifié", desc: "Tensions, blessures, fatigue, premiers conseils par SMS et appel." },
  { icon: Truck, color: "bg-amber-100 text-amber-700", title: "Transports sanitaires", desc: "Évacuation des urgences depuis zones enclavées vers centres référents." },
  { icon: Radio, color: "bg-cyan-100 text-cyan-700", title: "Radio communautaire", desc: "Émissions de prévention en langues locales (fon, yoruba, baatonu)." },
  { icon: BookOpen, color: "bg-violet-100 text-violet-700", title: "Éducation sanitaire", desc: "Hygiène, nutrition, premiers secours, prévention paludisme." },
  { icon: HeartHandshake, color: "bg-rose-100 text-rose-700", title: "Solidarité ville-campagne", desc: "Citadins parrainent ≥ 1 bénéficiaire rural via la même carte de santé." },
  { icon: Users, color: "bg-fuchsia-100 text-fuchsia-700", title: "Clubs Santé locaux", desc: "Mobilisation, dépistages gratuits, dons de médicaments, formations." },
];

const STORAGE_KEY = "healthy-page:rural";

type Stored = { adopted: string[]; suggestions: { id: string; date: string; village: string; besoin: string }[] };

function load(): Stored {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return { adopted: [], suggestions: [] };
}

export default function RuralScreen({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<Stored>(() => load());
  const [village, setVillage] = useState("");
  const [besoin, setBesoin] = useState("");

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }, [data]);

  const toggleAdopt = (id: string) => setData(d => ({ ...d, adopted: d.adopted.includes(id) ? d.adopted.filter(x => x !== id) : [...d.adopted, id] }));

  const submit = () => {
    if (!village.trim() || !besoin.trim()) return;
    setData(d => ({ ...d, suggestions: [{ id: Date.now().toString(), date: new Date().toISOString().slice(0, 10), village: village.trim(), besoin: besoin.trim() }, ...d.suggestions] }));
    setVillage(""); setBesoin("");
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-teal-50/30 to-cyan-50/30 pb-12 overflow-x-hidden">
      <div className="p-4 space-y-4">
        <div className="relative h-44 rounded-3xl overflow-hidden shadow-lg">
          <ImageWithFallback src="https://images.unsplash.com/photo-1547922938-a6dcb893f375?w=1080" alt="Communauté rurale" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/85 via-teal-600/70 to-cyan-600/60" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <button onClick={onBack} className="p-2 bg-white/20 hover:bg-white/30 rounded-full w-fit" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-white">
              <h1 className="text-xl font-bold flex items-center gap-2"><Trees className="w-5 h-5" /> Zones rurales & relais</h1>
              <p className="text-xs text-teal-50/95 mt-0.5">Maillage communautaire · solidarité ville-campagne</p>
            </div>
          </div>
        </div>
        <section className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-4 text-white">
          <p className="text-sm leading-relaxed">
            « Celui qui est en bonne santé aide celui qui en a besoin, aujourd'hui pour toi, demain pour moi. »
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs opacity-90">
            <Users className="w-4 h-4" /> {RELAIS.length} relais actifs · {RELAIS.reduce((s, r) => s + r.patients, 0)} bénéficiaires suivis
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          {SERVICES_RURAL.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-amber-100 p-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div className="text-sm text-amber-900">{s.title}</div>
                <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
              </div>
            );
          })}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4">
          <h2 className="text-amber-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Relais communautaires</h2>
          <ul className="space-y-2">
            {RELAIS.map(r => {
              const adopted = data.adopted.includes(r.id);
              return (
                <li key={r.id} className="p-3 bg-amber-50/40 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-amber-900">{r.name}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {r.village}, {r.commune}</div>
                      <div className="text-xs text-amber-700 mt-1">{r.formation} · {r.patients} bénéficiaires</div>
                    </div>
                    <a href={`tel:${r.phone}`} className="p-2 rounded-full bg-amber-100 text-amber-700"><Phone className="w-4 h-4" /></a>
                  </div>
                  <button onClick={() => toggleAdopt(r.id)}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs ${adopted ? "bg-emerald-600 text-white" : "bg-white border border-amber-200 text-amber-900"}`}>
                    {adopted ? "✓ Vous parrainez ce relais" : "Parrainer ce relais"}
                  </button>
                </li>
              );
            })}
          </ul>
          {data.adopted.length > 0 && (
            <div className="mt-3 text-xs text-emerald-800 bg-emerald-50 rounded-lg p-2">
              Vous soutenez actuellement <strong>{data.adopted.length}</strong> relais, la cotisation solidaire couvre leur équipement et formation.
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4">
          <h2 className="text-amber-900 mb-2">Signaler un besoin sur le terrain</h2>
          <p className="text-xs text-gray-600 mb-2">Aidez-nous à orienter les unités mobiles et les dotations de médicaments.</p>
          <input value={village} onChange={e => setVillage(e.target.value)} placeholder="Village / commune" className="w-full p-2 border border-amber-100 rounded-lg text-sm mb-2" />
          <textarea value={besoin} onChange={e => setBesoin(e.target.value)} placeholder="Besoin observé (ex : épidémie de paludisme, pénurie de moustiquaires…)" className="w-full p-2 border border-amber-100 rounded-lg text-sm min-h-[70px]" />
          <button onClick={submit} className="mt-2 w-full py-2 rounded-xl bg-amber-600 text-white text-sm">Envoyer au comité</button>
          {data.suggestions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {data.suggestions.slice(0, 5).map(s => (
                <li key={s.id} className="text-xs p-2 bg-amber-50/40 rounded-lg">
                  <span className="text-amber-700">{s.date}</span> · <strong className="text-amber-900">{s.village}</strong>, {s.besoin}
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-amber-700/70 text-center px-4 italic">
          Réseau « Ambassadeurs Santé et Bien-Être » · Solidarité transfrontalière encadrée
        </p>
      </div>
    </div>
  );
}
