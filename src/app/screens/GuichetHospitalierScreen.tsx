import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Hospital, FileText, CreditCard, FilePlus, Stethoscope, Bed, ClipboardList, AlertTriangle, CheckCircle2, Clock, ChevronRight, QrCode, Search, MapPin, Phone, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props { onBack: () => void }

type ServiceId = 'admission' | 'urgences' | 'paiement' | 'certificat' | 'orientation' | 'sortie';
type Demande = {
  id: string;
  service: ServiceId;
  hospital: string;
  ticket: string;
  status: 'en attente' | 'en cours' | 'terminée';
  position: number;
  eta: number;
  createdAt: string;
};

const SERVICES: { id: ServiceId; label: string; desc: string; icon: typeof FileText; color: string }[] = [
  { id: 'admission', label: 'Admission programmée', desc: 'Hospitalisation prévue, formalités', icon: Bed, color: 'from-teal-500 to-cyan-500' },
  { id: 'urgences', label: 'Urgences', desc: 'Triage rapide & priorisation', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
  { id: 'paiement', label: 'Paiement & facturation', desc: 'Régler une consultation, un séjour', icon: CreditCard, color: 'from-blue-500 to-cyan-500' },
  { id: 'certificat', label: 'Certificats médicaux', desc: 'Travail, école, voyage, décès', icon: FilePlus, color: 'from-emerald-500 to-teal-500' },
  { id: 'orientation', label: 'Orientation service', desc: 'Vers cardio, gynéco, pédiatrie…', icon: Stethoscope, color: 'from-cyan-500 to-blue-500' },
  { id: 'sortie', label: 'Sortie d\'hospitalisation', desc: 'Décharge, ordonnance, suivi', icon: ClipboardList, color: 'from-purple-500 to-fuchsia-500' }
];

const HOSPITALS = [
  { id: 'h1', name: 'CNHU-HKM Cotonou', city: 'Cotonou', phone: '+229 21 30 11 99', wait: 18 },
  { id: 'h2', name: 'CHU de Treichville', city: 'Abidjan', phone: '+225 27 21 25 00 99', wait: 26 },
  { id: 'h3', name: 'Hôpital Principal de Dakar', city: 'Dakar', phone: '+221 33 839 50 50', wait: 12 },
  { id: 'h4', name: 'Hôpital Gabriel Touré', city: 'Bamako', phone: '+223 20 22 27 12', wait: 22 },
  { id: 'h5', name: 'CHU Sylvanus Olympio', city: 'Lomé', phone: '+228 22 21 25 01', wait: 15 }
];

const STORAGE = 'healthy-page:guichet';
const load = (): Demande[] => { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; } };
const save = (d: Demande[]) => { try { localStorage.setItem(STORAGE, JSON.stringify(d)); } catch {} };

export default function GuichetHospitalierScreen({ onBack }: Props) {
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [search, setSearch] = useState('');
  const [picker, setPicker] = useState(false);
  const [openSvc, setOpenSvc] = useState<ServiceId | null>(null);
  const [demandes, setDemandes] = useState<Demande[]>(() => load());
  const [showQR, setShowQR] = useState<Demande | null>(null);

  useEffect(() => { save(demandes); }, [demandes]);

  const filteredHosps = useMemo(() => HOSPITALS.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase())), [search]);

  const submit = (svc: ServiceId) => {
    const ticket = svc.slice(0, 1).toUpperCase() + String(Math.floor(100 + Math.random() * 900));
    const d: Demande = {
      id: Date.now().toString(),
      service: svc,
      hospital: hospital.name,
      ticket,
      status: 'en attente',
      position: Math.floor(2 + Math.random() * 8),
      eta: hospital.wait + Math.floor(Math.random() * 10),
      createdAt: new Date().toISOString()
    };
    setDemandes((arr) => [d, ...arr]);
    setOpenSvc(null);
    setShowQR(d);
  };

  const cancel = (id: string) => setDemandes((arr) => arr.filter((d) => d.id !== id));

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl shadow-lg h-52">
        <ImageWithFallback src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1080" alt="Hôpital" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative p-6 text-white">
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Building2 className="w-5 h-5" /> Guichet unique hospitalier
          </div>
          <h2 className="text-2xl font-bold mt-1">Toutes vos démarches en un point</h2>
          <p className="text-sm text-white/85 mt-1">Admission · urgences · paiement · certificats</p>
        </div>
      </div>

      <button
        onClick={() => setPicker(true)}
        className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3 hover:border-teal-300 transition"
      >
        <div className="bg-teal-50 dark:bg-teal-900/30 p-2.5 rounded-xl">
          <Hospital className="w-5 h-5 text-teal-700 dark:text-teal-300" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Établissement</p>
          <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">{hospital.name}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{hospital.city} · attente moy. {hospital.wait} min</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setOpenSvc(s.id)}
              className="text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition"
            >
              <div className={`bg-gradient-to-br ${s.color} text-white p-3 rounded-xl w-fit shadow-sm`}><Icon className="w-5 h-5" /></div>
              <p className="font-semibold text-gray-900 dark:text-slate-100 mt-3">{s.label}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
              <p className="text-xs text-teal-700 dark:text-teal-300 mt-2 font-medium inline-flex items-center gap-1">
                Démarrer <ChevronRight className="w-3 h-3" />
              </p>
            </motion.button>
          );
        })}
      </div>

      {demandes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-teal-600" /> Mes tickets en cours
          </h3>
          <ul className="space-y-2">
            {demandes.map((d) => {
              const sv = SERVICES.find((s) => s.id === d.service)!;
              const Icon = sv.icon;
              return (
                <li key={d.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div className={`bg-gradient-to-br ${sv.color} text-white p-2 rounded-lg`}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{sv.label}</p>
                      <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300">#{d.ticket}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{d.hospital}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> ~{d.eta} min
                      </span>
                      <span className="text-gray-500 dark:text-slate-400">Position {d.position}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setShowQR(d)} aria-label="QR" className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700/40 rounded-md">
                      <QrCode className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                    </button>
                    <button onClick={() => cancel(d.id)} className="text-[10px] text-red-600 hover:text-red-700">Annuler</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <a href={`tel:${hospital.phone}`} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="bg-teal-50 dark:bg-teal-900/30 p-2.5 rounded-xl"><Phone className="w-4 h-4 text-teal-700 dark:text-teal-300" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Standard</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{hospital.phone}</p>
          </div>
        </a>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-red-600 text-white p-2.5 rounded-xl"><AlertTriangle className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">Urgence vitale</p>
            <p className="text-sm font-bold text-red-900 dark:text-red-100">Composez le 166</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-xs text-gray-600 dark:text-slate-300 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <span>Présentez le QR code de votre ticket à l'accueil pour gagner du temps. Suivi de file en temps réel et rappels SMS automatiques.</span>
      </div>

      <AnimatePresence>
        {picker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicker(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">Choisir un établissement</h3>
                  <button onClick={() => setPicker(false)} className="text-xs text-gray-500">Fermer</button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hôpital ou ville" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <ul className="p-3 space-y-2">
                {filteredHosps.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => { setHospital(h); setPicker(false); setSearch(''); }}
                      className={`w-full text-left p-3 rounded-xl border transition ${
                        hospital.id === h.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-teal-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-slate-100">{h.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{h.city}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />~{h.wait} min</span>
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openSvc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenSvc(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto p-5"
            >
              {(() => {
                const sv = SERVICES.find((s) => s.id === openSvc)!;
                const Icon = sv.icon;
                return (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`bg-gradient-to-br ${sv.color} text-white p-2.5 rounded-xl`}><Icon className="w-5 h-5" /></div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-slate-100">{sv.label}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{hospital.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{sv.desc}. Vous recevrez un ticket numérique avec QR code et notifications SMS de progression.</p>
                    <div className="space-y-2 mb-4">
                      {[
                        'Pièce d\'identité numérisée',
                        'Carte d\'assurance ou de mutuelle',
                        openSvc === 'admission' ? 'Lettre d\'orientation du médecin traitant' : openSvc === 'certificat' ? 'Motif détaillé (formulaire en ligne)' : openSvc === 'paiement' ? 'Référence de la facture ou du séjour' : 'Documents médicaux récents'
                      ].map((req) => (
                        <div key={req} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => submit(openSvc)} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2">
                      <Ticket className="w-5 h-5" /> Prendre un ticket
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQR && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQR(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              onClick={() => setShowQR(null)}
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">Ticket #{showQR.ticket}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100 mt-1">{SERVICES.find((s) => s.id === showQR.service)?.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{showQR.hospital}</p>
                <div className="my-5 bg-white p-4 rounded-2xl border-4 border-teal-600 mx-auto w-fit">
                  <div className="grid grid-cols-12 gap-0.5 w-44 h-44">
                    {Array.from({ length: 144 }).map((_, i) => {
                      const seed = (i * 31 + showQR.ticket.charCodeAt(0) * 7) % 100;
                      return <div key={i} className={seed > 45 ? 'bg-black' : 'bg-white'} />;
                    })}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Présentez ce code à l'accueil. Position dans la file : <span className="font-bold">{showQR.position}</span></p>
                <button onClick={() => setShowQR(null)} className="mt-4 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-2.5 rounded-xl">Fermer</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
