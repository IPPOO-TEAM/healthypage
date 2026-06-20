import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Pill, MapPin, Truck, Recycle, AlertTriangle, Package, QrCode, CheckCircle2, Plus, Phone, Upload, FileText, X, Search, Send, Bike, Home, ShieldAlert, PiggyBank, ArrowDownRight, Sparkles, Leaf, Bell, MessageCircle, Eye } from "lucide-react";
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type Tab = "physique" | "virtuel" | "recuperation" | "optimisation";

type DrugAlt = {
  brand: string;
  generic: string;
  indication: string;
  brandPrice: number;
  genericPrice: number;
  altLocal?: { name: string; price: number; note: string };
  pharmacies: { name: string; price: number; available: boolean }[];
};

const DRUG_ALTERNATIVES: DrugAlt[] = [
  {
    brand: 'Doliprane 1000 mg',
    generic: 'Paracétamol 1000 mg',
    indication: 'Douleur · fièvre',
    brandPrice: 2500, genericPrice: 850,
    altLocal: { name: 'Décoction de Kinkéliba', price: 0, note: 'En appoint pour fièvre légère' },
    pharmacies: [
      { name: 'Pharmacie Étoile', price: 850, available: true },
      { name: 'Pharmacie du Lac', price: 950, available: true },
      { name: 'Pharmacie Soleil', price: 800, available: false }
    ]
  },
  {
    brand: 'Augmentin 1g',
    generic: 'Amoxicilline + acide clavulanique 1g',
    indication: 'Antibiotique large spectre',
    brandPrice: 8500, genericPrice: 3200,
    pharmacies: [
      { name: 'Pharmacie Étoile', price: 3200, available: true },
      { name: 'Pharmacie Saint-Michel', price: 3500, available: true },
      { name: 'Pharmacie Bariba', price: 3000, available: true }
    ]
  },
  {
    brand: 'Glucophage 850 mg',
    generic: 'Metformine 850 mg',
    indication: 'Diabète type 2',
    brandPrice: 4200, genericPrice: 1500,
    pharmacies: [
      { name: 'Pharmacie Étoile', price: 1500, available: true },
      { name: 'Pharmacie du Lac', price: 1450, available: true },
      { name: 'Pharmacie Yopougon', price: 1600, available: true }
    ]
  },
  {
    brand: 'Mopral 20 mg',
    generic: 'Oméprazole 20 mg',
    indication: 'Reflux gastrique · ulcère',
    brandPrice: 3800, genericPrice: 1100,
    pharmacies: [
      { name: 'Pharmacie Saint-Michel', price: 1100, available: true },
      { name: 'Pharmacie Soleil', price: 1200, available: true }
    ]
  },
  {
    brand: 'Lasilix 40 mg',
    generic: 'Furosémide 40 mg',
    indication: 'Hypertension · œdème',
    brandPrice: 2800, genericPrice: 950,
    pharmacies: [
      { name: 'Pharmacie Étoile', price: 950, available: true },
      { name: 'Pharmacie Bariba', price: 900, available: true }
    ]
  }
];

const KNOWN_DRUGS = [
  'Paracétamol', 'Ibuprofène', 'Aspirine', 'Amoxicilline', 'Ciprofloxacine',
  'Metformine', 'Glibenclamide', 'Insuline', 'Warfarine', 'Aténolol',
  'Amlodipine', 'Lisinopril', 'Hydrochlorothiazide', 'Oméprazole',
  'Loratadine', 'Cétirizine', 'Codéine', 'Tramadol', 'Diclofénac',
  'Artemether', 'Quinine', 'Chloroquine', 'Cotrimoxazole', 'Diazépam',
  'Sildénafil', 'Levothyroxine'
];

type InteractionLevel = 'majeure' | 'modérée' | 'mineure';
const INTERACTIONS: { drugs: [string, string]; level: InteractionLevel; effect: string }[] = [
  { drugs: ['Warfarine', 'Aspirine'], level: 'majeure', effect: 'Risque hémorragique majoré' },
  { drugs: ['Warfarine', 'Ibuprofène'], level: 'majeure', effect: 'Augmentation du saignement' },
  { drugs: ['Warfarine', 'Diclofénac'], level: 'majeure', effect: 'Risque hémorragique élevé' },
  { drugs: ['Sildénafil', 'Lisinopril'], level: 'modérée', effect: 'Hypotension possible' },
  { drugs: ['Aspirine', 'Ibuprofène'], level: 'modérée', effect: 'Toxicité gastrique cumulée' },
  { drugs: ['Codéine', 'Diazépam'], level: 'majeure', effect: 'Dépression respiratoire' },
  { drugs: ['Tramadol', 'Diazépam'], level: 'majeure', effect: 'Sédation excessive' },
  { drugs: ['Metformine', 'Quinine'], level: 'modérée', effect: 'Risque d\'hypoglycémie' },
  { drugs: ['Ciprofloxacine', 'Warfarine'], level: 'modérée', effect: 'Effet anticoagulant majoré' },
  { drugs: ['Oméprazole', 'Diazépam'], level: 'mineure', effect: 'Sédation prolongée' },
  { drugs: ['Aténolol', 'Insuline'], level: 'modérée', effect: 'Masquage des signes d\'hypoglycémie' },
  { drugs: ['Glibenclamide', 'Cotrimoxazole'], level: 'modérée', effect: 'Risque d\'hypoglycémie sévère' }
];

function checkInteractions(drugs: string[]) {
  const findings: { pair: [string, string]; level: InteractionLevel; effect: string }[] = [];
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const a = drugs[i], b = drugs[j];
      const match = INTERACTIONS.find((it) =>
        (it.drugs[0] === a && it.drugs[1] === b) || (it.drugs[0] === b && it.drugs[1] === a)
      );
      if (match) findings.push({ pair: [a, b], level: match.level, effect: match.effect });
    }
  }
  return findings;
}

type EOrdo = {
  id: string;
  date: string;
  fileName: string;
  pharmacy: string;
  drugs: string[];
  status: 'envoyée' | 'préparée' | 'en livraison' | 'livrée';
  delivery: { address: string; eta: number; courier: string };
};

const ORDO_STORAGE = 'healthy-page:pharmacie-eordo';
const loadOrdos = (): EOrdo[] => { try { return JSON.parse(localStorage.getItem(ORDO_STORAGE) || '[]'); } catch { return []; } };
const saveOrdos = (o: EOrdo[]) => { try { localStorage.setItem(ORDO_STORAGE, JSON.stringify(o)); } catch {} };

const STEPS: EOrdo['status'][] = ['envoyée', 'préparée', 'en livraison', 'livrée'];

const PHARMACIES = [
  { id: "1", name: "Pharmacie Étoile", city: "Cotonou", area: "Akpakpa", phone: "+229 21 33 12 45", garde: true, livraison: true },
  { id: "2", name: "Pharmacie Saint-Michel", city: "Cotonou", area: "Cadjehoun", phone: "+229 21 30 45 67", garde: false, livraison: true },
  { id: "3", name: "Pharmacie du Lac", city: "Porto-Novo", area: "Ouando", phone: "+229 20 21 33 88", garde: true, livraison: false },
  { id: "4", name: "Pharmacie Soleil", city: "Abomey-Calavi", area: "Godomey", phone: "+229 21 36 99 21", garde: false, livraison: true },
  { id: "5", name: "Pharmacie Bariba", city: "Parakou", area: "Banikanni", phone: "+229 23 61 04 50", garde: true, livraison: false },
  { id: "6", name: "Pharmacie Yopougon", city: "Abidjan", area: "Yopougon", phone: "+225 23 45 67 89", garde: true, livraison: true },
];

const SERVICES_VIRTUELS: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Bell, title: "Rappels de traitement", desc: "Notifications automatiques selon votre posologie." },
  { Icon: FileText, title: "Ordonnance électronique", desc: "Transmettez votre ordonnance, recevez la disponibilité." },
  { Icon: AlertTriangle, title: "Vérification interactions", desc: "Contrôle automatique des interactions médicamenteuses." },
  { Icon: Truck, title: "Livraison à domicile", desc: "Selon votre zone, livraison sous 24-48h." },
  { Icon: MessageCircle, title: "Pharmacien à distance", desc: "Posez vos questions par chat sécurisé." },
  { Icon: Eye, title: "Suivi effets secondaires", desc: "Signalez et recevez un avis professionnel." },
];

const STORAGE_KEY = "healthy-page:pharmacie";

type Recup = { id: string; date: string; nom: string; lot: string; peremption: string; etat: "vérification" | "validé" | "détruit" };

function load(): Recup[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function PharmacieScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("physique");
  const [filter, setFilter] = useState<"all" | "garde" | "livraison">("all");
  const [recups, setRecups] = useState<Recup[]>(() => load());
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Recup>({ id: "", date: new Date().toISOString().slice(0, 10), nom: "", lot: "", peremption: "", etat: "vérification" });

  const [ordos, setOrdos] = useState<EOrdo[]>(() => loadOrdos());
  const [drugQuery, setDrugQuery] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [ordoFile, setOrdoFile] = useState<string>('');
  const [ordoPharmacy, setOrdoPharmacy] = useState<string>(PHARMACIES[0].id);
  const [ordoAddress, setOrdoAddress] = useState('');

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recups)); } catch {} }, [recups]);
  useEffect(() => { saveOrdos(ordos); }, [ordos]);

  const drugSuggestions = useMemo(() => {
    if (!drugQuery.trim()) return [];
    const q = drugQuery.toLowerCase();
    return KNOWN_DRUGS.filter(d => d.toLowerCase().includes(q) && !selectedDrugs.includes(d)).slice(0, 5);
  }, [drugQuery, selectedDrugs]);

  const interactions = useMemo(() => checkInteractions(selectedDrugs), [selectedDrugs]);

  const sendOrdo = () => {
    if (!ordoFile.trim() || selectedDrugs.length === 0 || !ordoAddress.trim()) return;
    const pharm = PHARMACIES.find(p => p.id === ordoPharmacy);
    const ordo: EOrdo = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      fileName: ordoFile,
      pharmacy: pharm?.name || ', ',
      drugs: [...selectedDrugs],
      status: 'envoyée',
      delivery: { address: ordoAddress, eta: 45, courier: 'Helfy Bike' },
    };
    setOrdos(o => [ordo, ...o]);
    setOrdoFile(''); setSelectedDrugs([]); setOrdoAddress(''); setDrugQuery('');
  };

  const advance = (id: string) => {
    setOrdos(os => os.map(o => {
      if (o.id !== id) return o;
      const i = STEPS.indexOf(o.status);
      return { ...o, status: STEPS[Math.min(i + 1, STEPS.length - 1)] };
    }));
  };

  const filteredPharma = useMemo(() => PHARMACIES.filter(p => {
    if (filter === "garde") return p.garde;
    if (filter === "livraison") return p.livraison;
    return true;
  }), [filter]);

  const submit = () => {
    if (!draft.nom.trim() || !draft.lot.trim()) return;
    setRecups(rs => [{ ...draft, id: Date.now().toString() }, ...rs]);
    setDraft({ id: "", date: new Date().toISOString().slice(0, 10), nom: "", lot: "", peremption: "", etat: "vérification" });
    setShowAdd(false);
  };

  const stats = useMemo(() => ({
    total: recups.length,
    valides: recups.filter(r => r.etat === "validé").length,
    detruits: recups.filter(r => r.etat === "détruit").length,
  }), [recups]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1765031092161-a9ebe556117e?w=1080" alt="Pharmacie" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Pill className="w-5 h-5" /> Pharmacie double pôle
          </div>
          <h2 className="text-2xl font-bold mt-1">Pharmacie</h2>
          <p className="text-sm text-white/85 mt-1">Physique, virtuel & récupération solidaire</p>
        </div>
      </div>

      <div>
        <div className="flex gap-1.5">
          {([
            { id: "physique" as Tab, label: "Physique", icon: MapPin },
            { id: "virtuel" as Tab, label: "Virtuel", icon: Truck },
            { id: "recuperation" as Tab, label: "Récupération", icon: Recycle },
            { id: "optimisation" as Tab, label: "Optimiser", icon: PiggyBank },
          ]).map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs ${tab === t.id ? "bg-teal-600 text-white" : "bg-white border border-teal-100 text-teal-900"}`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {tab === "physique" && (
          <>
            <div className="flex gap-1.5">
              {([
                { id: "all" as const, label: "Toutes" },
                { id: "garde" as const, label: "🌙 De garde" },
                { id: "livraison" as const, label: "🚚 Livraison" },
              ]).map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-xs ${filter === f.id ? "bg-teal-600 text-white" : "bg-white border border-teal-100 text-teal-900"}`}>{f.label}</button>
              ))}
            </div>
            <ul className="space-y-2">
              {filteredPharma.map(p => (
                <li key={p.id} className="bg-white rounded-2xl border border-teal-100 p-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center"><Pill className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <div className="text-teal-900 text-sm">{p.name}</div>
                    <div className="text-xs text-gray-600">{p.area}, {p.city}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {p.garde && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">De garde</span>}
                      {p.livraison && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Livraison</span>}
                    </div>
                  </div>
                  <a href={`tel:${p.phone}`} className="p-2 rounded-full bg-teal-50 text-teal-700"><Phone className="w-4 h-4" /></a>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === "virtuel" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {SERVICES_VIRTUELS.slice(0, 6).map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-teal-100 p-2 text-center">
                  <s.Icon className="w-5 h-5 mx-auto text-teal-700" strokeWidth={1.75} />
                  <div className="text-[11px] text-teal-900 leading-tight mt-0.5">{s.title}</div>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-2xl border border-teal-100 p-3 space-y-2">
              <div className="flex items-center gap-2 text-teal-900">
                <FileText className="w-4 h-4" />
                <h3 className="text-sm">E-ordonnance</h3>
              </div>
              <label className="flex items-center gap-2 p-2 border border-dashed border-teal-200 rounded-lg cursor-pointer text-xs text-teal-800">
                <Upload className="w-4 h-4" />
                <span>{ordoFile || 'Téléverser une photo / PDF d\'ordonnance'}</span>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (f) setOrdoFile(f.name);
                }} />
              </label>
              <select value={ordoPharmacy} onChange={(e) => setOrdoPharmacy(e.target.value)} className="w-full p-2 border border-teal-100 rounded-lg text-sm">
                {PHARMACIES.filter(p => p.livraison).map(p => (
                  <option key={p.id} value={p.id}>{p.name}, {p.area}, {p.city}</option>
                ))}
              </select>
              <input value={ordoAddress} onChange={(e) => setOrdoAddress(e.target.value)} placeholder="Adresse de livraison" className="w-full p-2 border border-teal-100 rounded-lg text-sm" />
            </section>

            <section className="bg-white rounded-2xl border border-teal-100 p-3 space-y-2">
              <div className="flex items-center gap-2 text-teal-900">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="text-sm">Vérificateur d'interactions</h3>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-teal-600" />
                <input value={drugQuery} onChange={(e) => setDrugQuery(e.target.value)} placeholder="Ajouter un médicament" className="w-full pl-8 p-2 border border-teal-100 rounded-lg text-sm" />
                {drugSuggestions.length > 0 && (
                  <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-teal-100 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {drugSuggestions.map(d => (
                      <li key={d}>
                        <button onClick={() => { setSelectedDrugs(s => [...s, d]); setDrugQuery(''); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-teal-50 text-teal-900">{d}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedDrugs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDrugs.map(d => (
                    <span key={d} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 text-teal-800 text-xs">
                      {d}
                      <button onClick={() => setSelectedDrugs(s => s.filter(x => x !== d))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              {interactions.length > 0 && (
                <ul className="space-y-1.5">
                  {interactions.map((it, i) => (
                    <li key={i} className={`p-2 rounded-lg text-xs ${
                      it.level === 'majeure' ? 'bg-red-50 border border-red-200 text-red-800' :
                      it.level === 'modérée' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                      'bg-slate-50 border border-slate-200 text-slate-700'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="font-semibold capitalize">{it.level}</span>
                        <span>· {it.pair[0]} + {it.pair[1]}</span>
                      </div>
                      <div className="mt-0.5 opacity-90">{it.effect}</div>
                    </li>
                  ))}
                </ul>
              )}
              {selectedDrugs.length >= 2 && interactions.length === 0 && (
                <p className="text-xs text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Aucune interaction connue.</p>
              )}
            </section>

            <button onClick={sendOrdo} disabled={!ordoFile || selectedDrugs.length === 0 || !ordoAddress.trim()} className="w-full py-2.5 rounded-xl bg-teal-600 disabled:bg-gray-300 text-white text-sm flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Envoyer l'ordonnance
            </button>

            {ordos.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm text-teal-900 flex items-center gap-2"><Bike className="w-4 h-4" /> Suivi de livraison</h3>
                <AnimatePresence initial={false}>
                  {ordos.map(o => {
                    const stepIdx = STEPS.indexOf(o.status);
                    return (
                      <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-teal-100 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-teal-900">{o.pharmacy}</div>
                            <div className="text-xs text-gray-600">{o.fileName} · {o.date}</div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${o.status === 'livrée' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{o.status}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {STEPS.map((s, i) => (
                            <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= stepIdx ? 'bg-teal-500' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-1 mt-1 text-[10px] text-gray-500 text-center">
                          {STEPS.map(s => <div key={s} className="capitalize">{s}</div>)}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="flex items-center gap-1 text-gray-600"><Home className="w-3 h-3" /> {o.delivery.address}</span>
                          {o.status !== 'livrée' && (
                            <button onClick={() => advance(o.id)} className="px-2 py-1 rounded-full bg-teal-50 text-teal-700">Étape suivante</button>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500">Médicaments : {o.drugs.join(', ')}</div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </section>
            )}

            <p className="text-xs text-gray-500 px-2">Supervision continue : prévention de l'automédication, sécurité thérapeutique, alerte en cas d'effet indésirable.</p>
          </>
        )}

        {tab === "recuperation" && (
          <>
            <section className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2"><Recycle className="w-5 h-5" /><h2>Reclassification solidaire</h2></div>
              <p className="text-sm opacity-90">Donnez vos médicaments inutilisés (emballage intact, péremption suffisante). Tri certifié, redistribution au Fonds de solidarité médicale.</p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="bg-white/15 rounded-lg p-2"><div className="opacity-75">Reçus</div><div className="text-base">{stats.total}</div></div>
                <div className="bg-white/15 rounded-lg p-2"><div className="opacity-75">Validés</div><div className="text-base">{stats.valides}</div></div>
                <div className="bg-white/15 rounded-lg p-2"><div className="opacity-75">Détruits</div><div className="text-base">{stats.detruits}</div></div>
              </div>
            </section>

            <button onClick={() => setShowAdd(true)} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Déposer un médicament</button>

            {recups.length > 0 && (
              <ul className="space-y-2">
                {recups.map(r => (
                  <li key={r.id} className="bg-white rounded-xl border border-emerald-100 p-3 flex items-start gap-3">
                    <Package className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <div className="text-emerald-900">{r.nom}</div>
                      <div className="text-xs text-gray-600">Lot {r.lot} · péremption {r.peremption || ", "} · {r.date}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <QrCode className="w-3 h-3 text-emerald-600" />
                        <span className={`px-2 py-0.5 rounded-full ${r.etat === "validé" ? "bg-emerald-100 text-emerald-800" : r.etat === "détruit" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{r.etat}</span>
                      </div>
                    </div>
                    {r.etat === "vérification" && (
                      <div className="flex flex-col gap-1">
                        <button onClick={() => setRecups(rs => rs.map(x => x.id === r.id ? { ...x, etat: "validé" } : x))} className="p-1.5 rounded bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setRecups(rs => rs.map(x => x.id === r.id ? { ...x, etat: "détruit" } : x))} className="p-1.5 rounded bg-red-100 text-red-700"><AlertTriangle className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-emerald-700/70 px-2 italic">« Chaque comprimé récupéré et contrôlé devient un acte de partage maîtrisé. »</p>
          </>
        )}

        {tab === "optimisation" && (
          <>
            <div className="rounded-2xl p-4 bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Optimiser le coût de vos médicaments</h3>
              </div>
              <p className="text-xs text-white/90">Génériques équivalents, alternatives locales et comparaison entre pharmacies du réseau.</p>
            </div>

            <ul className="space-y-3">
              {DRUG_ALTERNATIVES.map((d) => {
                const savings = Math.round(((d.brandPrice - d.genericPrice) / d.brandPrice) * 100);
                const cheapest = Math.min(...d.pharmacies.map(p => p.price));
                return (
                  <li key={d.brand} className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-teal-900">{d.brand}</div>
                        <div className="text-xs text-gray-500">DCI : {d.generic}</div>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" />-{savings}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-gray-50 p-2">
                        <div className="text-gray-500">Marque</div>
                        <div className="font-semibold text-gray-800">{d.brandPrice.toLocaleString()} F</div>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2">
                        <div className="text-emerald-700">Générique</div>
                        <div className="font-semibold text-emerald-800">{d.genericPrice.toLocaleString()} F</div>
                      </div>
                    </div>
                    {d.altLocal && (
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-2 text-xs text-amber-900 flex items-start gap-2">
                        <Leaf className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span><b>Alternative locale :</b> {d.altLocal}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <PiggyBank className="w-3.5 h-3.5" /> Comparatif pharmacies
                      </div>
                      <ul className="space-y-1">
                        {d.pharmacies.map((p) => (
                          <li key={p.name} className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${p.price === cheapest ? 'bg-teal-50 border border-teal-200 font-semibold text-teal-800' : 'bg-gray-50 text-gray-700'}`}>
                            <span>{p.name}</span>
                            <span>{p.price.toLocaleString()} F</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-teal-700/70 px-2 italic">« Le médicament juste, au prix juste : un droit du patient africain. »</p>
          </>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-emerald-900">Déposer un médicament</h3>
            <input value={draft.nom} onChange={e => setDraft(d => ({ ...d, nom: e.target.value }))} placeholder="Nom (DCI ou marque)" className="w-full p-2 border border-emerald-100 rounded-lg text-sm" />
            <input value={draft.lot} onChange={e => setDraft(d => ({ ...d, lot: e.target.value }))} placeholder="Numéro de lot" className="w-full p-2 border border-emerald-100 rounded-lg text-sm" />
            <input type="month" value={draft.peremption} onChange={e => setDraft(d => ({ ...d, peremption: e.target.value }))} className="w-full p-2 border border-emerald-100 rounded-lg text-sm" />
            <p className="text-xs text-gray-500">Le tri est effectué par un pharmacien inspecteur. Statut initial : vérification.</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border border-emerald-200 text-emerald-900">Annuler</button>
              <button onClick={submit} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white">Déposer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
