import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wallet, HeartHandshake, Globe, ShieldCheck, TrendingUp, Users, FileText } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type Tab = "cotisation" | "solidarite" | "diaspora" | "gouvernance";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "cotisation", label: "Cotisation solidaire", icon: Wallet },
  { id: "solidarite", label: "Fonds solidarité", icon: HeartHandshake },
  { id: "diaspora", label: "Fonds diaspora", icon: Globe },
  { id: "gouvernance", label: "Gouvernance", icon: ShieldCheck },
];

const NIVEAUX = [
  { id: "essentiel", title: "Essentiel", monthly: 2500, color: "bg-emerald-100 text-emerald-700", desc: "Base couvrant les soins courants et la prévention." },
  { id: "famille", title: "Famille", monthly: 6500, color: "bg-cyan-100 text-cyan-700", desc: "Jusqu'à 5 personnes, suivi materno-infantile inclus." },
  { id: "premium", title: "Premium", monthly: 12000, color: "bg-violet-100 text-violet-700", desc: "Couverture élargie, urgences, hospitalisation décente." },
  { id: "solidaire", title: "Solidaire +", monthly: 18000, color: "bg-rose-100 text-rose-700", desc: "Premium + parraine 1 bénéficiaire rural." },
];

const ALLOCATIONS = [
  { label: "Soins des personnes en difficulté", pct: 40, color: "bg-emerald-500" },
  { label: "Transports sanitaires zones enclavées", pct: 20, color: "bg-cyan-500" },
  { label: "Campagnes dépistage & bilans", pct: 18, color: "bg-violet-500" },
  { label: "Urgences & hospitalisations", pct: 15, color: "bg-rose-500" },
  { label: "Innovation & plateforme", pct: 7, color: "bg-amber-500" },
];

const COMMISSIONS = [
  { name: "Comité de pilotage", role: "Stratégie générale & suivi des objectifs", icon: TrendingUp, color: "bg-violet-100 text-violet-700" },
  { name: "Commission médicale", role: "Évalue besoins de soins, urgences, priorités", icon: HeartHandshake, color: "bg-rose-100 text-rose-700" },
  { name: "Commission financière", role: "Gère cotisations, dépenses, reddition des comptes", icon: Wallet, color: "bg-emerald-100 text-emerald-700" },
  { name: "Commission transparence & contrôle", role: "Membres indépendants, vérification & rapports publics", icon: ShieldCheck, color: "bg-cyan-100 text-cyan-700" },
];

const STORAGE_KEY = "healthy-page:fonds";

type Stored = { niveau: string | null; contribution: number };

function load(): Stored {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return { niveau: null, contribution: 0 };
}

export default function FondsScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("cotisation");
  const [data, setData] = useState<Stored>(() => load());
  const [extra, setExtra] = useState(5000);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }, [data]);

  const niveau = useMemo(() => NIVEAUX.find(n => n.id === data.niveau), [data.niveau]);

  // Mock totals
  const COLLECTE = 24_580_000;
  const BENEFICIAIRES = 1_847;

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-teal-50/30 to-cyan-50/30 pb-12 overflow-x-hidden">
      <div className="p-4 pb-0">
        <div className="relative h-44 rounded-3xl overflow-hidden shadow-lg">
          <ImageWithFallback src="https://images.unsplash.com/photo-1764407395696-495d7fb7fc71?w=1080" alt="Solidarité financière" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700/85 via-teal-600/70 to-cyan-600/60" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <button onClick={onBack} className="p-2 bg-white/20 hover:bg-white/30 rounded-full w-fit" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-white">
              <h1 className="text-xl font-bold flex items-center gap-2"><Wallet className="w-5 h-5" /> Fonds & cotisations</h1>
              <p className="text-xs text-teal-50/95 mt-0.5">Solidarité, transparence, gouvernance partagée</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${tab === t.id ? "bg-emerald-600 text-white" : "bg-white border border-emerald-100 text-emerald-900"}`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tab === "cotisation" && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4">
              <h2 className="text-emerald-900 mb-3">Choisir mon niveau d'adhésion</h2>
              <div className="space-y-2">
                {NIVEAUX.map(n => (
                  <button key={n.id} onClick={() => setData(d => ({ ...d, niveau: n.id }))}
                    className={`w-full text-left p-3 rounded-xl border transition ${data.niveau === n.id ? "bg-emerald-50 border-emerald-300" : "border-emerald-100 hover:bg-emerald-50/40"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${n.color}`}>{n.title}</span>
                      <span className="text-emerald-900">{n.monthly.toLocaleString()} FCFA / mois</span>
                    </div>
                    <p className="text-xs text-gray-600">{n.desc}</p>
                  </button>
                ))}
              </div>
              {niveau && (
                <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl text-sm text-emerald-900">
                  Niveau actif : <strong>{niveau.title}</strong>, engagement annuel {(niveau.monthly * 12).toLocaleString()} FCFA.
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4">
              <h2 className="text-emerald-900 mb-3">Contribution volontaire ponctuelle</h2>
              <p className="text-xs text-gray-600 mb-2">Soutien direct au Fonds de solidarité médicale.</p>
              <div className="flex gap-2 items-center">
                <input type="number" min={500} step={500} value={extra} onChange={e => setExtra(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl border border-emerald-100 bg-emerald-50/30 text-sm" />
                <span className="text-sm text-emerald-700">FCFA</span>
                <button onClick={() => { setData(d => ({ ...d, contribution: d.contribution + extra })); }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm">Donner</button>
              </div>
              <div className="text-xs text-emerald-700 mt-2">Total contribué : <strong>{data.contribution.toLocaleString()} FCFA</strong></div>
            </section>
          </>
        )}

        {tab === "solidarite" && (
          <>
            <section className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-5 text-white">
              <div className="text-xs opacity-80 mb-1">Fonds collectif (T1 2026)</div>
              <div className="text-2xl">{COLLECTE.toLocaleString()} FCFA</div>
              <div className="flex items-center gap-3 mt-3 text-xs">
                <Users className="w-4 h-4" /> {BENEFICIAIRES.toLocaleString()} bénéficiaires soutenus
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4">
              <h2 className="text-emerald-900 mb-3">Allocation des ressources</h2>
              <ul className="space-y-2">
                {ALLOCATIONS.map(a => (
                  <li key={a.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700">{a.label}</span>
                      <span className="text-emerald-900">{a.pct}%</span>
                    </div>
                    <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
                      <div className={`h-full ${a.color}`} style={{ width: `${a.pct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4">
              <h2 className="text-emerald-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Rapports trimestriels</h2>
              <ul className="space-y-1 text-sm">
                {["T1 2026, Activité & comptes", "T4 2025, Bilan annuel", "T3 2025, Campagnes"].map((r, i) => (
                  <li key={i} className="p-2 bg-emerald-50/40 rounded-lg flex items-center justify-between">
                    <span className="text-emerald-900">{r}</span>
                    <span className="text-xs text-emerald-700">PDF</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {tab === "diaspora" && (
          <section className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-4 space-y-3">
            <h2 className="text-cyan-900 flex items-center gap-2"><Globe className="w-4 h-4" /> Fonds de correspondance diaspora</h2>
            <p className="text-sm text-gray-700">
              Plateforme sécurisée pour les membres de la diaspora souhaitant cotiser en faveur de leurs proches au pays.
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "Paiement depuis l'étranger (EUR / USD / XOF)",
                "Suivi numérique des bénéficiaires (consultations, analyses, bilans)",
                "Rapports périodiques aux membres cotisants",
                "10 % redistribué au Fonds d'Aide Humanitaire",
              ].map((x, i) => (
                <li key={i} className="flex items-start gap-2 p-2 bg-cyan-50/40 rounded-lg">
                  <span className="text-cyan-600 mt-0.5">✓</span>
                  <span className="text-cyan-900">{x}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => alert("Redirection vers l'espace Diaspora")} className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm">Accéder à l'espace Diaspora</button>
          </section>
        )}

        {tab === "gouvernance" && (
          <section className="space-y-3">
            <p className="text-sm text-gray-700 px-2">Gouvernance mixte garantissant crédibilité et durabilité du modèle.</p>
            {COMMISSIONS.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-violet-100 p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <div className="text-violet-900">{c.name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{c.role}</div>
                  </div>
                </div>
              );
            })}
            <div className="bg-violet-50/60 rounded-2xl p-4 text-xs text-violet-900">
              📊 Un rapport d'activité et financier est publié <strong>chaque trimestre</strong> pour garantir la transparence et la confiance des contributeurs.
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
