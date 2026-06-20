import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Activity, Heart, Droplet, Scale, Eye, Video, Lock, TrendingUp, Plus } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type MeasureKey = "tension" | "poids" | "glycemie" | "cardio" | "vue" | "stress";

type Reading = { id: string; date: string; key: MeasureKey; value: string; ok: boolean };

const MEASURES: { key: MeasureKey; icon: any; color: string; label: string; unit: string; placeholder: string; check: (v: string) => boolean }[] = [
  { key: "tension", icon: Activity, color: "bg-red-100 text-red-700", label: "Tension artérielle", unit: "mmHg", placeholder: "120/80", check: v => /^\d{2,3}\/\d{2,3}$/.test(v) && Number(v.split("/")[0]) < 140 && Number(v.split("/")[1]) < 90 },
  { key: "poids", icon: Scale, color: "bg-emerald-100 text-emerald-700", label: "Poids", unit: "kg", placeholder: "72", check: v => Number(v) > 0 && Number(v) < 200 },
  { key: "glycemie", icon: Droplet, color: "bg-cyan-100 text-cyan-700", label: "Glycémie", unit: "g/L", placeholder: "0.95", check: v => Number(v) >= 0.7 && Number(v) <= 1.1 },
  { key: "cardio", icon: Heart, color: "bg-rose-100 text-rose-700", label: "Rythme cardiaque", unit: "bpm", placeholder: "70", check: v => Number(v) >= 50 && Number(v) <= 100 },
  { key: "vue", icon: Eye, color: "bg-violet-100 text-violet-700", label: "Test de vue", unit: "/10", placeholder: "9", check: v => Number(v) >= 8 },
  { key: "stress", icon: TrendingUp, color: "bg-amber-100 text-amber-700", label: "Niveau de stress", unit: "/10", placeholder: "3", check: v => Number(v) <= 5 },
];

const STORAGE_KEY = "healthy-page:microcabine";

function load(): Reading[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function MicroCabineScreen({ onBack }: { onBack: () => void }) {
  const [readings, setReadings] = useState<Reading[]>(() => load());
  const [active, setActive] = useState<MeasureKey | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(readings)); } catch {} }, [readings]);

  const submit = () => {
    if (!active || !value.trim()) return;
    const m = MEASURES.find(x => x.key === active)!;
    const r: Reading = { id: Date.now().toString(), date: new Date().toISOString(), key: active, value: value.trim(), ok: m.check(value.trim()) };
    setReadings(rs => [r, ...rs]);
    setValue(""); setActive(null);
  };

  const lastByKey = useMemo(() => {
    const map: Partial<Record<MeasureKey, Reading>> = {};
    for (const r of readings) if (!map[r.key]) map[r.key] = r;
    return map;
  }, [readings]);

  const alertsCount = useMemo(() => Object.values(lastByKey).filter(r => r && !r.ok).length, [lastByKey]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080" alt="Médecin auscultation" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Activity className="w-5 h-5" /> Micro-cabine sanitaire
          </div>
          <h2 className="text-2xl font-bold mt-1">Auto-bilan rapide</h2>
          <p className="text-sm text-white/85 mt-1">Espace confidentiel en entreprise</p>
        </div>
      </div>

      <div className="space-y-4">
        <section className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 text-xs opacity-90 mb-2"><Lock className="w-3.5 h-3.5" /> Données strictement personnelles & chiffrées</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-75">Dernière session</div>
              <div className="text-base">{readings[0] ? new Date(readings[0].date).toLocaleDateString("fr-FR") : "Aucune"}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">Alertes</div>
              <div className={`text-base ${alertsCount > 0 ? "text-amber-300" : "text-emerald-300"}`}>{alertsCount}</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {MEASURES.map(m => {
            const Icon = m.icon;
            const last = lastByKey[m.key];
            return (
              <button key={m.key} onClick={() => { setActive(m.key); setValue(""); }}
                className="bg-white rounded-2xl border border-slate-200 p-3 text-left hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color}`}><Icon className="w-4 h-4" /></div>
                  {last && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${last.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{last.ok ? "OK" : "À vérifier"}</span>}
                </div>
                <div className="text-sm text-slate-900">{m.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {last ? `${last.value} ${m.unit}` : `Mesurer (${m.unit})`}
                </div>
              </button>
            );
          })}
        </section>

        <button className="w-full py-3 rounded-2xl bg-blue-600 text-white text-sm flex items-center justify-center gap-2">
          <Video className="w-4 h-4" /> Téléconsultation immédiate (médecin / nutritionniste / psy)
        </button>

        {readings.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-slate-900 mb-2">Historique récent</h2>
            <ul className="space-y-1.5 max-h-64 overflow-y-auto">
              {readings.slice(0, 12).map(r => {
                const m = MEASURES.find(x => x.key === r.key)!;
                return (
                  <li key={r.id} className="flex items-center justify-between text-sm p-2 bg-slate-50/60 rounded-lg">
                    <div>
                      <div className="text-slate-900">{m.label}</div>
                      <div className="text-xs text-slate-500">{new Date(r.date).toLocaleString("fr-FR")}</div>
                    </div>
                    <div className={`text-sm ${r.ok ? "text-emerald-700" : "text-amber-700"}`}>{r.value} {m.unit}</div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="text-xs text-slate-500 px-2">
          Cabine compacte installée dans les locaux : tension, poids, glycémie, rythme cardiaque, vue, stress, dépistages rapides + téléconsultation visioconférence.
        </p>
      </div>

      {active && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={() => setActive(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3" onClick={e => e.stopPropagation()}>
            {(() => {
              const m = MEASURES.find(x => x.key === active)!;
              const Icon = m.icon;
              return (
                <>
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color}`}><Icon className="w-4 h-4" /></div>
                    <h3 className="text-slate-900">{m.label}</h3>
                  </div>
                  <input value={value} onChange={e => setValue(e.target.value)} placeholder={`Ex : ${m.placeholder}`} autoFocus
                    className="w-full p-3 border border-slate-200 rounded-xl text-base" />
                  <div className="text-xs text-slate-500">Unité : {m.unit}</div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setActive(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-900">Annuler</button>
                    <button onClick={submit} className="flex-1 py-2 rounded-xl bg-blue-600 text-white flex items-center justify-center gap-1"><Plus className="w-4 h-4" /> Enregistrer</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
