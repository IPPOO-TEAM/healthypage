import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookHeart, QrCode, Download, Syringe, Heart, AlertCircle, Users, Droplet, Ruler, Weight, User as UserIcon, Briefcase, Baby, Flower2, Plus, Trash2, Save, Printer, X, ShieldAlert, Share2, MessageCircle, Mail, FileCode2 } from 'lucide-react';
import { exportDmpPdf, exportDmpCdaXml, type DmpData } from '../components/dmpExport';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';
import { isDemoPatient } from '../components/demo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
}

type CarnetKind = 'personnel' | 'famille' | 'entreprise' | 'femme' | 'enfant';

const VACCINS = [
  { name: 'BCG', date: '2000', status: 'ok' },
  { name: 'Hépatite B', date: '2001', status: 'ok' },
  { name: 'Tétanos', date: '2018', status: 'expire-soon' },
  { name: 'Fièvre jaune', date: '2019', status: 'ok' },
  { name: 'COVID-19', date: '2023', status: 'ok' }
];

const VACCINS_ENFANT = [
  { name: 'BCG (naissance)', age: 'Naissance' },
  { name: 'Polio (OPV)', age: '6 sem.' },
  { name: 'Pentavalent 1', age: '6 sem.' },
  { name: 'Pentavalent 2', age: '10 sem.' },
  { name: 'Pentavalent 3', age: '14 sem.' },
  { name: 'Rougeole-Rubéole', age: '9 mois' },
  { name: 'Fièvre jaune', age: '9 mois' }
];

const ANTECEDENTS = [
  'Asthme léger (depuis 2010)',
  'Appendicectomie (2015)',
  'Hypertension légère (suivie depuis 2024)'
];

const ALLERGIES = ['Pénicilline', 'Arachides'];

const URGENCE = [
  { name: 'Aminata Akakpo', relation: 'Sœur', phone: '+229 01 11 22 33 44' },
  { name: 'Dr. Hounkpatin', relation: 'Médecin traitant', phone: '+229 01 21 30 30 30' }
];

interface FamilleMember {
  id: string;
  firstName: string;
  lastName: string;
  relation: string;
  dob?: string;
  bloodType?: string;
  phone?: string;
}

interface EntrepriseData {
  profession?: string;
  employer?: string;
  workMedic?: string;
  workMedicPhone?: string;
  insurance?: string;
  policyNumber?: string;
  lastCheckup?: string;
  notes?: string;
}

interface FemmeData {
  cycleLength?: string;
  lastPeriod?: string;
  pregnancies?: string;
  liveBirths?: string;
  gyneco?: string;
  gynecoPhone?: string;
  contraception?: string;
  lastSmear?: string;
  notes?: string;
}

interface EnfantData {
  birthWeight?: string;
  birthHeight?: string;
  pediatre?: string;
  pediatrePhone?: string;
  feeding?: string;
  notes?: string;
}

const RELATIONS = ['Conjoint(e)', 'Enfant', 'Père', 'Mère', 'Frère', 'Sœur', 'Grand-parent', 'Autre'];

export default function CarnetSanteScreen({ onBack }: Props) {
  const demo = isDemoPatient();
  const [pid] = useState<string | null>(getPatientId());
  const [tab, setTab] = useState<CarnetKind>('personnel');
  const [error, setError] = useState<string | null>(null);

  // Personnel data
  const [blood, setBlood] = useState<string>(demo ? 'O+' : '');
  const [allergies, setAllergies] = useState<string[]>(demo ? ALLERGIES : []);
  const [antecedents, setAntecedents] = useState<string[]>(demo ? ANTECEDENTS : []);
  const [urgence, setUrgence] = useState(demo ? URGENCE : []);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [patientGender, setPatientGender] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showShare, setShowShare] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  // Typed data
  const [famille, setFamille] = useState<FamilleMember[]>([]);
  const [entreprise, setEntreprise] = useState<EntrepriseData>({});
  const [femme, setFemme] = useState<FemmeData>({});
  const [enfant, setEnfant] = useState<EnfantData>({});

  useEffect(() => {
    if (!pid) return;
    api.getPatient(pid)
      .then(({ patient, emergency }: any) => {
        if (patient?.blood || patient?.bloodType) setBlood(patient.blood || patient.bloodType);
        if (patient?.height) setHeight(patient.height);
        if (patient?.weight) setWeight(patient.weight);
        if (patient?.bloodPressure) setBp(patient.bloodPressure);
        if (patient?.gender) setPatientGender(patient.gender);
        if (patient?.allergies) {
          const arr = String(patient.allergies).split(/[,\n;]+/).map((s: string) => s.trim()).filter(Boolean);
          if (arr.length) setAllergies(arr);
        }
        const chronic = [...(patient?.chronic ?? [])];
        if (patient?.chronicOther) chronic.push(patient.chronicOther);
        if (chronic.length) setAntecedents(chronic);
        if (patient?.firstName || patient?.lastName) {
          setPatientName(`${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim());
        }
        if (emergency?.phone) {
          setUrgence([{ name: emergency.name, relation: emergency.relation, phone: emergency.phone }, ...(demo ? URGENCE.slice(1) : [])]);
        }
        if (patient?.carnets) {
          if (patient.carnets.entreprise) setEntreprise(patient.carnets.entreprise);
          if (patient.carnets.femme) setFemme(patient.carnets.femme);
          if (patient.carnets.enfant) setEnfant(patient.carnets.enfant);
        }
      })
      .catch((e) => console.error('Load carnet:', e));
    api.listFamille(pid).then((arr: any) => setFamille((arr ?? []) as FamilleMember[])).catch(() => {});
  }, [pid, demo]);

  const saveTyped = async (kind: 'entreprise' | 'femme' | 'enfant', data: any) => {
    if (!pid) { setError('Aucun compte patient actif.'); return; }
    setError(null);
    try {
      // fetch latest patient first to avoid clobbering other carnets
      const { patient } = await api.getPatient(pid);
      const carnets = { ...(patient?.carnets ?? {}), [kind]: data };
      await api.updatePatient(pid, { carnets });
    } catch (e: any) { setError(e?.message ?? 'Enregistrement impossible'); }
  };

  const TABS: { key: CarnetKind; label: string; icon: any; show: boolean }[] = [
    { key: 'personnel', label: 'Personnel', icon: UserIcon, show: true },
    { key: 'famille', label: 'Famille', icon: Users, show: true },
    { key: 'entreprise', label: 'Entreprise', icon: Briefcase, show: true },
    { key: 'femme', label: 'Femme', icon: Flower2, show: patientGender === 'F' || patientGender === '' },
    { key: 'enfant', label: 'Enfant', icon: Baby, show: true },
  ];
  const visibleTabs = TABS.filter((t) => t.show);

  const buildSummary = () => {
    const lines = [
      `Carnet de santé, ${patientName ?? 'Patient'}`,
      `Émis le ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      `Groupe sanguin : ${blood || ', '}`,
      `Taille : ${height || ', '} · Poids : ${weight || ', '} · Tension : ${bp || ', '}`,
      '',
      `Allergies : ${allergies.length ? allergies.join(', ') : 'Aucune'}`,
      `Antécédents : ${antecedents.length ? antecedents.join(' ; ') : 'Aucun'}`,
      '',
      `Contacts d'urgence :`,
      ...urgence.map(u => `- ${u.name} (${u.relation}) : ${u.phone}`)
    ];
    return lines.join('\n');
  };

  const printCarnet = () => {
    const w = window.open('', '_blank', 'width=720,height=900');
    if (!w) return;
    const vaccins = demo ? VACCINS : [];
    w.document.write(`<!DOCTYPE html><html><head><title>Carnet de santé, ${patientName ?? 'Patient'}</title>
      <style>
        body{font-family:system-ui,sans-serif;margin:0;padding:24px;color:#0f172a;max-width:760px;margin:auto}
        h1{color:#0f766e;margin:0 0 4px;font-size:22px}
        h2{color:#0f766e;font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin:18px 0 6px;border-bottom:1px solid #ccfbf1;padding-bottom:4px}
        .meta{color:#64748b;font-size:11px;margin-bottom:16px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}
        .stat{border:1px solid #e2e8f0;border-radius:8px;padding:8px}
        .stat .l{font-size:10px;color:#64748b}
        .stat .v{font-size:16px;font-weight:bold}
        ul{margin:0;padding-left:18px;font-size:13px}
        .pill{display:inline-block;background:#fee2e2;color:#b91c1c;border:1px solid #fecaca;border-radius:999px;padding:2px 10px;margin:2px 4px 2px 0;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        td,th{text-align:left;padding:6px 8px;border-bottom:1px solid #f1f5f9}
        th{color:#0f766e;font-size:11px;text-transform:uppercase}
        .footer{font-size:10px;color:#64748b;text-align:center;margin-top:24px;font-style:italic}
        @media print{body{padding:0}}
      </style></head><body>
      <h1>Carnet de santé</h1>
      <div class="meta">${patientName ?? 'Patient'} · Édité le ${new Date().toLocaleDateString('fr-FR')} · Healthy Page</div>
      <div class="grid">
        <div class="stat"><div class="l">Groupe</div><div class="v">${blood || ', '}</div></div>
        <div class="stat"><div class="l">Taille</div><div class="v">${height || ', '}</div></div>
        <div class="stat"><div class="l">Poids</div><div class="v">${weight || ', '}</div></div>
        <div class="stat"><div class="l">Tension</div><div class="v">${bp || ', '}</div></div>
      </div>
      <h2>Allergies</h2>
      <div>${allergies.length ? allergies.map(a => `<span class="pill">${a}</span>`).join('') : '<i>Aucune renseignée</i>'}</div>
      <h2>Antécédents</h2>
      <ul>${antecedents.length ? antecedents.map(a => `<li>${a}</li>`).join('') : '<li><i>Aucun renseigné</i></li>'}</ul>
      <h2>Vaccinations</h2>
      ${vaccins.length ? `<table><tr><th>Vaccin</th><th>Dernière dose</th><th>Statut</th></tr>${vaccins.map(v => `<tr><td>${v.name}</td><td>${v.date}</td><td>${v.status === 'ok' ? 'À jour' : 'Rappel proche'}</td></tr>`).join('')}</table>` : '<i>Aucun vaccin enregistré</i>'}
      <h2>Contacts d'urgence</h2>
      <ul>${urgence.length ? urgence.map(u => `<li><b>${u.name}</b> (${u.relation}), ${u.phone}</li>`).join('') : '<li><i>Non renseigné</i></li>'}</ul>
      <div class="footer">Document confidentiel · Healthy Page</div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
      </body></html>`);
    w.document.close();
  };

  const addAllergy = () => {
    const v = newAllergy.trim(); if (!v) return;
    if (allergies.includes(v)) { setNewAllergy(''); return; }
    setAllergies([...allergies, v]); setNewAllergy('');
    if (pid) api.updatePatient(pid, { allergies: [...allergies, v].join(', ') }).catch(() => {});
  };
  const removeAllergy = (a: string) => {
    const next = allergies.filter(x => x !== a);
    setAllergies(next);
    if (pid) api.updatePatient(pid, { allergies: next.join(', ') }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl shadow-lg bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600 p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1576089235406-0612d7bb033e?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none" />
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl"><BookHeart className="w-7 h-7" /></div>
            <div>
              <h2 className="text-2xl font-bold">Carnet de santé</h2>
              <p className="text-sm text-white/85">{patientName ?? 'Synchronisé avec votre carnet physique'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEmergencyCard(true)}
            title="Fiche d'urgence détachable QR"
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl"
          >
            <QrCode className="w-6 h-6" />
          </button>
        </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl p-1 shadow-sm flex gap-1 overflow-x-auto">
        {visibleTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 min-w-[88px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === key ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-xl">{error}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="space-y-6"
        >
          {tab === 'personnel' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Droplet, label: 'Groupe sanguin', value: blood || ', ', color: 'rose' },
                  { icon: Ruler, label: 'Taille', value: height || (demo ? '1,72 m' : ', '), color: 'cyan' },
                  { icon: Weight, label: 'Poids', value: weight || (demo ? '68 kg' : ', '), color: 'amber' },
                  { icon: Heart, label: 'Tension', value: bp || (demo ? '125/82' : ', '), color: 'teal' }
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-4 rounded-2xl shadow-sm"
                  >
                    <div className={`bg-${s.color}-50 p-2 rounded-lg w-fit`}>
                      <s.icon className={`w-4 h-4 text-${s.color}-600`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{s.label}</p>
                    <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Syringe className="w-5 h-5 text-teal-600" /> Vaccins
                </h3>
                <div className="space-y-2">
                  {(demo ? VACCINS : []).map((v) => (
                    <div key={v.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{v.name}</p>
                        <p className="text-xs text-gray-500">Dernière dose : {v.date}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        v.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {v.status === 'ok' ? 'À jour' : 'Rappel proche'}
                      </span>
                    </div>
                  ))}
                  {!demo && <p className="text-sm text-gray-500 text-center py-2">Aucun vaccin enregistré.</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-rose-600" /> Allergies & antécédents
                </h3>
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {allergies.length === 0 && <span className="text-sm text-gray-500">Aucune renseignée</span>}
                    {allergies.map((a) => (
                      <span key={a} className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full border border-red-200 inline-flex items-center gap-1">
                        {a}
                        <button onClick={() => removeAllergy(a)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAllergy()} placeholder="Ajouter une allergie…" className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
                    <button onClick={addAllergy} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Antécédents médicaux</p>
                  <ul className="space-y-1.5">
                    {antecedents.length === 0 && <li className="text-sm text-gray-500">Aucun renseigné</li>}
                    {antecedents.map((a) => (
                      <li key={a} className="text-sm text-gray-700 flex gap-2"><span>•</span>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-600" /> Contacts d'urgence
                </h3>
                <div className="space-y-2">
                  {urgence.length === 0 && <p className="text-sm text-gray-500">Aucun contact d'urgence.</p>}
                  {urgence.map((u) => (
                    <a key={u.phone} href={`tel:${u.phone}`} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.relation}</p>
                      </div>
                      <span className="text-sm text-blue-700 font-medium">{u.phone}</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'famille' && (
            <FamilleTab
              pid={pid}
              members={famille}
              setMembers={setFamille}
              setError={setError}
            />
          )}

          {tab === 'entreprise' && (
            <EntrepriseTab
              data={entreprise}
              setData={setEntreprise}
              onSave={() => saveTyped('entreprise', entreprise)}
            />
          )}

          {tab === 'femme' && (
            <FemmeTab
              data={femme}
              setData={setFemme}
              onSave={() => saveTyped('femme', femme)}
            />
          )}

          {tab === 'enfant' && (
            <EnfantTab
              data={enfant}
              setData={setEnfant}
              onSave={() => saveTyped('enfant', enfant)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            const payload: DmpData = {
              patientName: patientName ?? 'Patient',
              patientId: pid,
              blood, height, weight, bp,
              allergies, antecedents,
              vaccins: demo ? VACCINS : [],
              urgence,
            };
            exportDmpPdf(payload);
          }}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 rounded-2xl font-semibold shadow-md inline-flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" /> PDF
        </button>
        <button
          onClick={() => {
            const payload: DmpData = {
              patientName: patientName ?? 'Patient',
              patientId: pid,
              blood, height, weight, bp,
              allergies, antecedents,
              vaccins: demo ? VACCINS : [],
              urgence,
            };
            exportDmpCdaXml(payload);
          }}
          className="bg-white border-2 border-indigo-600 text-indigo-700 py-3.5 rounded-2xl font-semibold shadow-sm inline-flex items-center justify-center gap-2"
          title="Export DMP au format CDA-XML (HL7) — interopérable avec les SI hospitaliers"
        >
          <FileCode2 className="w-5 h-5" /> DMP XML
        </button>
        <button onClick={() => setShowShare(true)} className="bg-white border-2 border-teal-600 text-teal-700 py-3.5 rounded-2xl font-semibold shadow-sm inline-flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" /> Partager
        </button>
      </div>

      {showShare && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowShare(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-md p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Partager mon carnet</h3>
              <button onClick={() => setShowShare(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <p className="text-sm text-gray-600">Envoyez un résumé de vos données médicales à un proche ou à votre médecin.</p>
            <a href={`https://wa.me/?text=${encodeURIComponent(buildSummary())}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <MessageCircle className="w-5 h-5 text-green-700" /><span className="text-sm font-medium text-green-900">WhatsApp</span>
            </a>
            <a href={`mailto:?subject=${encodeURIComponent('Mon carnet de santé')}&body=${encodeURIComponent(buildSummary())}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Mail className="w-5 h-5 text-blue-700" /><span className="text-sm font-medium text-blue-900">E-mail</span>
            </a>
            <button onClick={() => { navigator.clipboard?.writeText(buildSummary()); setShowShare(false); }} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700">
              Copier le résumé
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showEmergencyCard && (
          <EmergencyCard
            onClose={() => setShowEmergencyCard(false)}
            patientName={patientName}
            blood={blood}
            allergies={allergies}
            antecedents={antecedents}
            urgence={urgence}
            qrDataUrl={qrDataUrl}
            setQrDataUrl={setQrDataUrl}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmergencyCard({ onClose, patientName, blood, allergies, antecedents, urgence, qrDataUrl, setQrDataUrl }: {
  onClose: () => void;
  patientName: string | null;
  blood: string;
  allergies: string[];
  antecedents: string[];
  urgence: { name: string; relation: string; phone: string }[];
  qrDataUrl: string;
  setQrDataUrl: (s: string) => void;
}) {
  useEffect(() => {
    const payload = {
      v: 1,
      name: patientName ?? 'Patient',
      blood: blood || ', ',
      allergies,
      antecedents,
      urgence: urgence.slice(0, 2),
      issued: new Date().toISOString().slice(0, 10)
    };
    QRCode.toDataURL(JSON.stringify(payload), { width: 240, margin: 1, color: { dark: '#0f766e', light: '#ffffff' } })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [patientName, blood, allergies, antecedents, urgence, setQrDataUrl]);

  const printCard = () => {
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Fiche d'urgence, ${patientName ?? 'Patient'}</title>
      <style>
        body{font-family:system-ui,sans-serif;margin:0;padding:24px;color:#0f172a}
        .card{border:2px dashed #0d9488;border-radius:16px;padding:20px;max-width:520px;margin:0 auto}
        .head{display:flex;align-items:center;gap:12px;border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:12px}
        .head h1{margin:0;font-size:18px;color:#0f766e}
        .head p{margin:0;font-size:11px;color:#64748b}
        .row{display:flex;gap:16px;margin-top:12px}
        .col{flex:1}
        h3{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#0f766e;margin:0 0 4px}
        ul{margin:0;padding-left:18px;font-size:13px}
        .blood{font-size:32px;font-weight:bold;color:#dc2626;text-align:center}
        .qr{text-align:center;margin-top:12px}
        .qr img{width:160px;height:160px}
        .footer{font-size:10px;color:#64748b;text-align:center;margin-top:12px;font-style:italic}
        @media print { body { padding: 0 } }
      </style></head><body>
      <div class="card">
        <div class="head">
          <div style="background:#0d9488;color:white;padding:8px;border-radius:8px;font-weight:bold">URGENCE</div>
          <div><h1>${patientName ?? 'Patient'}</h1><p>Fiche d'urgence détachable · Healthy Page</p></div>
        </div>
        <div class="row">
          <div class="col"><h3>Groupe sanguin</h3><div class="blood">${blood || ', '}</div></div>
          <div class="col"><h3>Allergies</h3><ul>${(allergies.length?allergies:['Aucune connue']).map(a=>`<li>${a}</li>`).join('')}</ul></div>
        </div>
        <div style="margin-top:12px"><h3>Antécédents</h3><ul>${(antecedents.length?antecedents:['Aucun signalé']).map(a=>`<li>${a}</li>`).join('')}</ul></div>
        <div style="margin-top:12px"><h3>Contacts d'urgence</h3><ul>${urgence.slice(0,2).map(u=>`<li><b>${u.name}</b> (${u.relation}), ${u.phone}</li>`).join('') || '<li>Non renseigné</li>'}</ul></div>
        <div class="qr">${qrDataUrl?`<img src="${qrDataUrl}" alt="QR"/>`:''}<p style="font-size:10px;color:#64748b;margin:4px 0 0">Scannez en cas de besoin</p></div>
        <div class="footer">Émise le ${new Date().toLocaleDateString('fr-FR')} · À détacher et conserver dans le portefeuille</div>
      </div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold">Fiche d'urgence</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="border-2 border-dashed border-teal-500 rounded-2xl p-4 space-y-3 bg-teal-50/30">
            <div className="flex items-center gap-3">
              <div className="bg-teal-700 text-white px-2 py-1 rounded-md text-xs font-bold">URGENCE</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{patientName ?? 'Patient'}</p>
                <p className="text-[10px] text-gray-500">Fiche détachable · Healthy Page</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-teal-700 font-semibold">Groupe</p>
                <p className="text-2xl font-bold text-red-600 text-center">{blood || ', '}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-teal-700 font-semibold">Allergies</p>
                <ul className="text-xs text-gray-800 list-disc pl-4">
                  {(allergies.length ? allergies : ['Aucune connue']).map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-teal-700 font-semibold">Contacts d'urgence</p>
              <ul className="text-xs text-gray-800 space-y-0.5">
                {urgence.slice(0, 2).map((u, i) => (
                  <li key={i}><b>{u.name}</b> ({u.relation}), {u.phone}</li>
                ))}
                {urgence.length === 0 && <li className="italic text-gray-500">Non renseigné</li>}
              </ul>
            </div>
            <div className="flex items-center justify-center pt-2 border-t border-teal-200">
              {qrDataUrl ? <img src={qrDataUrl} alt="QR" className="w-32 h-32" /> : <div className="w-32 h-32 bg-gray-100 animate-pulse rounded" />}
            </div>
            <p className="text-[10px] text-gray-500 italic text-center">Scannez en cas de besoin</p>
          </div>

          <button onClick={printCard} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-2xl font-semibold inline-flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Imprimer la fiche
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────── Famille tab ───────
function FamilleTab({ pid, members, setMembers, setError }: {
  pid: string | null; members: FamilleMember[]; setMembers: (m: FamilleMember[]) => void; setError: (e: string | null) => void;
}) {
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState<Partial<FamilleMember>>({ relation: RELATIONS[0] });
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const add = async () => {
    if (!pid) { setError('Aucun compte patient actif.'); return; }
    if (!draft.firstName || !draft.lastName || !draft.relation) { setError('Prénom, nom et relation requis.'); return; }
    setBusy(true); setError(null);
    try {
      const created = await api.createFamille(pid, draft);
      setMembers([...members, created as FamilleMember]);
      setDraft({ relation: RELATIONS[0] });
      setShow(false);
    } catch (e: any) { setError(e?.message ?? 'Ajout impossible'); }
    finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!pid) return;
    try { await api.deleteFamille(pid, id); setMembers(members.filter((m) => m.id !== id)); setConfirmId(null); }
    catch (e: any) { setError(e?.message ?? 'Suppression impossible'); }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Membres de la famille
          </h3>
          <button onClick={() => setShow(true)} className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm px-3 py-1.5 rounded-xl">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Aucun membre enregistré.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-gray-500">{m.relation}{m.dob ? ` · né(e) ${new Date(m.dob).toLocaleDateString('fr-FR')}` : ''}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 flex-wrap">
                    {m.bloodType && <span className="inline-flex items-center gap-1"><Droplet className="w-3 h-3 text-rose-500" /> {m.bloodType}</span>}
                    {m.phone && <a href={`tel:${m.phone}`} className="text-blue-700">{m.phone}</a>}
                  </div>
                </div>
                <button onClick={() => setConfirmId(m.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {show && (
          <ModalShell onClose={() => setShow(false)} title="Ajouter un membre">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input label="Prénom" value={draft.firstName ?? ''} onChange={(v) => setDraft({ ...draft, firstName: v })} />
                <Input label="Nom" value={draft.lastName ?? ''} onChange={(v) => setDraft({ ...draft, lastName: v })} />
              </div>
              <Field label="Relation">
                <select value={draft.relation ?? RELATIONS[0]} onChange={(e) => setDraft({ ...draft, relation: e.target.value })} className={inputCls}>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Date de naissance" type="date" value={draft.dob ?? ''} onChange={(v) => setDraft({ ...draft, dob: v })} />
                <Input label="Groupe sanguin" value={draft.bloodType ?? ''} onChange={(v) => setDraft({ ...draft, bloodType: v })} placeholder="O+" />
              </div>
              <Input label="Téléphone" value={draft.phone ?? ''} onChange={(v) => setDraft({ ...draft, phone: v })} />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShow(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700">Annuler</button>
                <button onClick={add} disabled={busy} className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-medium disabled:opacity-60">{busy ? 'Ajout…' : 'Ajouter'}</button>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmId && (
          <ModalShell onClose={() => setConfirmId(null)} title="Supprimer ce membre ?">
            <p className="text-sm text-gray-700 mb-3">Cette action est définitive.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700">Annuler</button>
              <button onClick={() => remove(confirmId)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium">Supprimer</button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────── Entreprise tab ───────
function EntrepriseTab({ data, setData, onSave }: { data: EntrepriseData; setData: (d: EntrepriseData) => void; onSave: () => void; }) {
  const [saved, setSaved] = useState(false);
  const set = (k: keyof EntrepriseData, v: string) => setData({ ...data, [k]: v });
  const save = async () => { await onSave(); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  return (
    <>
      <Section title="Activité professionnelle" icon={Briefcase} color="indigo">
        <Input label="Profession" value={data.profession ?? ''} onChange={(v) => set('profession', v)} placeholder="Ex. Comptable" />
        <Input label="Employeur" value={data.employer ?? ''} onChange={(v) => set('employer', v)} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Médecin du travail" value={data.workMedic ?? ''} onChange={(v) => set('workMedic', v)} />
          <Input label="Téléphone" value={data.workMedicPhone ?? ''} onChange={(v) => set('workMedicPhone', v)} />
        </div>
      </Section>
      <Section title="Assurance santé" icon={Heart} color="rose">
        <Input label="Mutuelle / assurance" value={data.insurance ?? ''} onChange={(v) => set('insurance', v)} />
        <Input label="N° de police" value={data.policyNumber ?? ''} onChange={(v) => set('policyNumber', v)} />
        <Input label="Dernière visite médicale" type="date" value={data.lastCheckup ?? ''} onChange={(v) => set('lastCheckup', v)} />
      </Section>
      <Section title="Notes" icon={AlertCircle} color="amber">
        <textarea value={data.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={3} className={inputCls} placeholder="Aptitudes, restrictions, accidents du travail…" />
      </Section>
      <SaveButton onClick={save} saved={saved} />
    </>
  );
}

// ─────── Femme tab ───────
function FemmeTab({ data, setData, onSave }: { data: FemmeData; setData: (d: FemmeData) => void; onSave: () => void; }) {
  const [saved, setSaved] = useState(false);
  const set = (k: keyof FemmeData, v: string) => setData({ ...data, [k]: v });
  const save = async () => { await onSave(); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  return (
    <>
      <Section title="Cycle menstruel" icon={Flower2} color="pink">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Durée du cycle (jours)" type="number" value={data.cycleLength ?? ''} onChange={(v) => set('cycleLength', v)} placeholder="28" />
          <Input label="Dernières règles" type="date" value={data.lastPeriod ?? ''} onChange={(v) => set('lastPeriod', v)} />
        </div>
        <Input label="Contraception" value={data.contraception ?? ''} onChange={(v) => set('contraception', v)} placeholder="Pilule, DIU, aucune…" />
      </Section>
      <Section title="Grossesses" icon={Baby} color="rose">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Nombre de grossesses" type="number" value={data.pregnancies ?? ''} onChange={(v) => set('pregnancies', v)} />
          <Input label="Naissances vivantes" type="number" value={data.liveBirths ?? ''} onChange={(v) => set('liveBirths', v)} />
        </div>
      </Section>
      <Section title="Suivi gynéco" icon={Heart} color="purple">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Gynécologue" value={data.gyneco ?? ''} onChange={(v) => set('gyneco', v)} />
          <Input label="Téléphone" value={data.gynecoPhone ?? ''} onChange={(v) => set('gynecoPhone', v)} />
        </div>
        <Input label="Dernier frottis" type="date" value={data.lastSmear ?? ''} onChange={(v) => set('lastSmear', v)} />
      </Section>
      <Section title="Notes" icon={AlertCircle} color="amber">
        <textarea value={data.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={3} className={inputCls} />
      </Section>
      <SaveButton onClick={save} saved={saved} />
    </>
  );
}

// ─────── Enfant tab ───────
function EnfantTab({ data, setData, onSave }: { data: EnfantData; setData: (d: EnfantData) => void; onSave: () => void; }) {
  const [saved, setSaved] = useState(false);
  const set = (k: keyof EnfantData, v: string) => setData({ ...data, [k]: v });
  const save = async () => { await onSave(); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  return (
    <>
      <Section title="Naissance" icon={Baby} color="cyan">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Poids (kg)" value={data.birthWeight ?? ''} onChange={(v) => set('birthWeight', v)} placeholder="3.2" />
          <Input label="Taille (cm)" value={data.birthHeight ?? ''} onChange={(v) => set('birthHeight', v)} placeholder="50" />
        </div>
        <Input label="Alimentation" value={data.feeding ?? ''} onChange={(v) => set('feeding', v)} placeholder="Allaitement maternel, mixte, etc." />
      </Section>
      <Section title="Pédiatre référent" icon={Heart} color="teal">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Nom" value={data.pediatre ?? ''} onChange={(v) => set('pediatre', v)} />
          <Input label="Téléphone" value={data.pediatrePhone ?? ''} onChange={(v) => set('pediatrePhone', v)} />
        </div>
      </Section>
      <Section title="Calendrier vaccinal (PEV)" icon={Syringe} color="emerald">
        <ul className="text-sm text-gray-700 space-y-1.5">
          {VACCINS_ENFANT.map((v) => (
            <li key={v.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span>{v.name}</span><span className="text-xs text-gray-500">{v.age}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Notes" icon={AlertCircle} color="amber">
        <textarea value={data.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={3} className={inputCls} placeholder="Allergies, hospitalisations, antécédents…" />
      </Section>
      <SaveButton onClick={save} saved={saved} />
    </>
  );
}

// ─────── helpers ───────
const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white';

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 text-${color}-600`} /> {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <Field label={label}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    </Field>
  );
}
function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button onClick={onClick} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 rounded-2xl font-semibold shadow-md inline-flex items-center justify-center gap-2">
      <Save className="w-4 h-4" /> {saved ? '✓ Enregistré' : 'Enregistrer'}
    </button>
  );
}

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </div>
  );
}
