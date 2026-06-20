import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Phone, MapPin, Droplet, AlertCircle, Activity, ShieldAlert, Calendar, Pill, FileText, X, Plus, StickyNote, Download, Users, Baby, TrendingUp, Smile, PenLine, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import { api } from '../../components/api';
import SignatureModal from '../../components/SignatureModal';

interface Props {
  patientId: string;
  onBack: () => void;
}

export default function DossierPatientScreen({ patientId, onBack }: Props) {
  const [data, setData] = useState<any>(null);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [ordos, setOrdos] = useState<any[]>([]);
  const [famille, setFamille] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [ressentis, setRessentis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOrdo, setShowOrdo] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [signOrdo, setSignOrdo] = useState<any>(null);
  const [proName, setProName] = useState<string>('Praticien');
  const proId = (typeof window !== 'undefined' ? localStorage.getItem('healthy-page:proId') : '') || '';

  useEffect(() => {
    if (!proId) return;
    api.getPro(proId).then((pro: any) => {
      const n = `${pro?.firstName ?? ''} ${pro?.lastName ?? ''}`.trim() || pro?.name || 'Praticien';
      setProName(`Dr ${n}`.replace(/^Dr Dr /, 'Dr '));
    }).catch(() => {});
  }, [proId]);

  useEffect(() => {
    Promise.all([
      api.getPatient(patientId),
      api.listRdv(patientId).catch(() => []),
      api.listTraitement(patientId).catch(() => []),
      api.listNote(patientId).catch(() => []),
      api.listOrdonnance(patientId).catch(() => []),
      api.listFamille(patientId).catch(() => []),
      api.listGrowth(patientId).catch(() => []),
      api.listRessenti(patientId).catch(() => [])
    ])
      .then(([d, r, m, n, o, f, g, rs]) => {
        setData(d);
        setRdvs(r ?? []);
        setMeds(m ?? []);
        setNotes(n ?? []);
        setOrdos(o ?? []);
        setFamille(f ?? []);
        setGrowth(g ?? []);
        setRessentis(rs ?? []);
      })
      .catch((e) => setError(e?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement du dossier…</p>
      </div>
    );
  }
  if (error || !data?.patient) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-gray-600 mb-4">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <p className="text-red-700">{error ?? 'Patient introuvable.'}</p>
      </div>
    );
  }

  const p = data.patient;
  const em = data.emergency;
  const fullName = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Patient';

  const exportOrdoPdf = (o: any) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 18;
    let y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ORDONNANCE', margin, y);
    y += 4;
    doc.setLineWidth(0.4);
    doc.line(margin, y, 210 - margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Patient : ${fullName}`, margin, y); y += 5;
    if (p.dob) { doc.text(`Né(e) le : ${p.dob}`, margin, y); y += 5; }
    doc.text(`Date : ${new Date(o.createdAt ?? Date.now()).toLocaleDateString('fr-FR')}`, margin, y); y += 5;
    if (o.title) { doc.text(`Objet : ${o.title}`, margin, y); y += 5; }
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Prescription', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    (o.items ?? []).forEach((it: any, idx: number) => {
      const line = `${idx + 1}. ${it.name}${it.dosage ? ', ' + it.dosage : ''}${it.duration ? ', ' + it.duration : ''}`;
      const wrapped = doc.splitTextToSize(line, 210 - margin * 2);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5 + 2;
      if (y > 270) { doc.addPage(); y = margin; }
    });

    y = Math.max(y, 230);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const sigX = 210 - margin - 60;
    doc.text('Cachet & signature du praticien', sigX, y);
    if (o.signature?.dataUrl) {
      try { doc.addImage(o.signature.dataUrl, 'PNG', sigX, y + 2, 60, 22); } catch {}
    }
    doc.line(sigX, y + 26, 210 - margin, y + 26);
    if (o.signature) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const sd = o.signature.signedAt ? new Date(o.signature.signedAt).toLocaleString('fr-FR') : '';
      const proLabel = o.signature.proName ? `${o.signature.proName} — ` : '';
      doc.text(`Signé électroniquement ${proLabel}${sd}`, margin, 285);
      if (o.signature.hash) doc.text(`SHA-256 : ${o.signature.hash}`, margin, 289);
      doc.setTextColor(15, 23, 42);
    }

    const safeTitle = (o.title || 'ordonnance').replace(/[^\w-]+/g, '_').slice(0, 40);
    doc.save(`${safeTitle}_${fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white px-5 py-6 rounded-b-3xl shadow-lg">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-white/90 mb-4">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {(p.firstName?.[0] ?? '?')}{(p.lastName?.[0] ?? '')}
          </div>
          <div>
            <h1 className="text-xl font-bold">{fullName}</h1>
            <p className="text-sm text-white/85">
              {p.dob && <>né(e) le {p.dob} • </>}
              {p.sex === 'm' ? 'H' : p.sex === 'f' ? 'F' : ', '}
            </p>
          </div>
        </div>
      </header>

      <main className="px-5 mt-5 space-y-5">
        {/* Identité */}
        <Card icon={User} color="blue" title="Identité & contact">
          <Field label="Téléphone" value={p.phone} icon={Phone} />
          <Field label="Email" value={p.email} />
          <Field label="Adresse" value={[p.address, p.city, p.country].filter(Boolean).join(', ')} icon={MapPin} />
        </Card>

        {/* Médical */}
        <Card icon={Activity} color="rose" title="Informations médicales">
          <Field label="Groupe sanguin" value={p.blood} icon={Droplet} />
          <Field label="Allergies" value={p.allergies} icon={AlertCircle} />
          <Field
            label="Maladies chroniques"
            value={[...(p.chronic ?? []), p.chronicOther].filter(Boolean).join(', ')}
          />
          <Field label="Assurance" value={[p.insurer, p.policyNumber].filter(Boolean).join(' • ')} />
        </Card>

        {/* Urgence */}
        {em && (
          <Card icon={ShieldAlert} color="orange" title="Contact d'urgence">
            <Field label="Nom" value={em.name} />
            <Field label="Lien" value={em.relation} />
            <Field label="Téléphone" value={em.phone} icon={Phone} />
          </Card>
        )}

        {/* RDV */}
        <Card icon={Calendar} color="teal" title={`Rendez-vous (${rdvs.length})`}>
          {rdvs.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun rendez-vous.</p>
          ) : rdvs.slice(0, 5).map((r: any) => (
            <div key={r.id} className="text-sm py-2 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-900">{r.doctor ?? ', '} <span className="text-gray-500">• {r.specialty ?? ''}</span></p>
              <p className="text-xs text-gray-500">{r.date} {r.time} • {r.location}</p>
              {r.forName && (
                <p className="text-[10px] text-fuchsia-700 mt-0.5 font-semibold">Pour {r.forName}{r.forRelation ? ` · ${r.forRelation}` : ''}</p>
              )}
              {r.questionnaire?.filledAt && (
                <details className="mt-2 bg-indigo-50 rounded-lg p-2">
                  <summary className="text-[11px] font-semibold text-indigo-800 cursor-pointer">📋 Questionnaire pré-RDV</summary>
                  <div className="mt-2 space-y-1 text-[11px] text-indigo-900">
                    {r.questionnaire.motif && <p><span className="font-semibold">Motif :</span> {r.questionnaire.motif}</p>}
                    {r.questionnaire.symptoms?.length > 0 && <p><span className="font-semibold">Symptômes :</span> {r.questionnaire.symptoms.join(', ')}</p>}
                    {r.questionnaire.duration && <p><span className="font-semibold">Durée :</span> {r.questionnaire.duration}</p>}
                    {typeof r.questionnaire.pain === 'number' && <p><span className="font-semibold">Douleur :</span> {r.questionnaire.pain}/10</p>}
                    {r.questionnaire.fever && <p className="text-rose-700 font-semibold">⚠ Fièvre {'>'} 38°C</p>}
                    {r.questionnaire.allergies && <p><span className="font-semibold">Allergies :</span> {r.questionnaire.allergies}</p>}
                    {r.questionnaire.treatments && <p><span className="font-semibold">Traitements :</span> {r.questionnaire.treatments}</p>}
                    {r.questionnaire.pregnancy && r.questionnaire.pregnancy !== 'na' && <p><span className="font-semibold">Grossesse :</span> {r.questionnaire.pregnancy === 'yes' ? 'Oui' : r.questionnaire.pregnancy === 'no' ? 'Non' : 'Possible'}</p>}
                    {r.questionnaire.notes && <p><span className="font-semibold">Notes :</span> {r.questionnaire.notes}</p>}
                  </div>
                </details>
              )}
            </div>
          ))}
        </Card>

        {/* Traitements */}
        <Card icon={Pill} color="emerald" title={`Traitements (${meds.length})`}>
          {meds.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun traitement en cours.</p>
          ) : meds.map((m) => (
            <div key={m.id} className="text-sm py-2 border-b border-gray-100 last:border-0">
              <p className="font-medium text-gray-900">{m.name} <span className="text-gray-500">• {m.dosage}</span></p>
              <p className="text-xs text-gray-500">{(m.schedule ?? []).join(' / ')}</p>
            </div>
          ))}
        </Card>

        {/* Ordonnances */}
        <Card icon={FileText} color="indigo" title={`Ordonnances (${ordos.length})`}>
          {ordos.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune ordonnance.</p>
          ) : ordos.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center gap-2 text-sm py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate flex items-center gap-2">
                  {o.title || 'Ordonnance'}
                  {o.signature && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Signée
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString('fr-FR')} • {(o.items ?? []).length} médicament(s)
                </p>
              </div>
              {!o.signature && (
                <button
                  onClick={() => setSignOrdo(o)}
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
                  aria-label="Signer"
                  title="Signer électroniquement"
                >
                  <PenLine className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => exportOrdoPdf(o)}
                className="bg-indigo-50 text-indigo-700 p-2 rounded-lg hover:bg-indigo-100"
                aria-label="Exporter PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </Card>

        {/* Notes */}
        <Card icon={StickyNote} color="amber" title={`Notes (${notes.length})`}>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune note.</p>
          ) : notes.slice(0, 5).map((n) => (
            <div key={n.id} className="text-sm py-2 border-b border-gray-100 last:border-0">
              <p className="text-gray-900 whitespace-pre-wrap">{n.text}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
            </div>
          ))}
        </Card>

        {/* Ressentis */}
        <Card icon={Smile} color="rose" title={`Ressentis (${ressentis.length})`}>
          {ressentis.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun ressenti enregistré.</p>
          ) : (() => {
            const sorted = [...ressentis].sort((a, b) => (b.date ?? b.createdAt ?? '').localeCompare(a.date ?? a.createdAt ?? ''));
            const moods = sorted.slice(0, 14).map((r) => Number(r.mood ?? r.score ?? 0)).filter((n) => !isNaN(n));
            const avg = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length) : 0;
            const moodEmoji = (m: number) => m >= 4 ? '😄' : m >= 3 ? '🙂' : m >= 2 ? '😐' : m >= 1 ? '😟' : '😢';
            return (
              <>
                <div className="flex items-center justify-between bg-rose-50 rounded-xl px-3 py-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-rose-700">Moyenne 14 derniers</span>
                  <span className="text-lg font-bold text-rose-800">{moodEmoji(avg)} {avg.toFixed(1)}/5</span>
                </div>
                <div className="space-y-1.5">
                  {sorted.slice(0, 6).map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{moodEmoji(Number(r.mood ?? r.score ?? 0))}</span>
                        <div>
                          <p className="text-xs text-gray-500">{r.date ?? new Date(r.createdAt ?? Date.now()).toLocaleDateString('fr-FR')}</p>
                          {r.note && <p className="text-gray-800">{r.note}</p>}
                          {Array.isArray(r.symptoms) && r.symptoms.length > 0 && (
                            <p className="text-xs text-gray-600 mt-0.5">{r.symptoms.join(' · ')}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{r.mood ?? r.score ?? '-'}/5</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </Card>

        {/* Famille */}
        <Card icon={Users} color="fuchsia" title={`Famille (${famille.length})`}>
          {famille.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun membre déclaré.</p>
          ) : famille.slice(0, 6).map((f) => (
            <div key={f.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{f.firstName} {f.lastName} <span className="text-xs text-gray-500 font-normal">· {f.relation}</span></p>
                <p className="text-xs text-gray-500">{[f.dob, f.bloodType, f.phone].filter(Boolean).join(' · ')}</p>
              </div>
              {f.diaspora && <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Diaspora</span>}
            </div>
          ))}
        </Card>

        {/* Pédo-suivi */}
        <Card icon={Baby} color="pink" title={`Mesures pédiatriques (${growth.length})`}>
          {growth.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune mesure enregistrée.</p>
          ) : (
            <div className="space-y-1.5">
              {[...growth].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 5).map((g) => (
                <div key={g.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-600" />
                    <span className="font-medium text-gray-900">{g.ageMonths ?? '?'} mois</span>
                    <span className="text-xs text-gray-500">{g.date}</span>
                  </div>
                  <div className="text-xs text-gray-700 flex gap-2">
                    <span>{g.weight}kg</span>
                    <span>{g.height}cm</span>
                    {g.headCirc && <span>PC {g.headCirc}cm</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowOrdo(true)}
            className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" /> Ordonnance
          </button>
          <button
            onClick={() => setShowNote(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 shadow-md"
          >
            <StickyNote className="w-5 h-5" /> Note
          </button>
        </div>
      </main>

      {showOrdo && (
        <OrdonnanceModal
          onClose={() => setShowOrdo(false)}
          onCreate={async (body) => {
            const saved = await api.createOrdonnance(patientId, body);
            setOrdos((list) => [saved as any, ...list]);
            setShowOrdo(false);
          }}
        />
      )}
      <SignatureModal
        open={!!signOrdo}
        onClose={() => setSignOrdo(null)}
        signerName={proName}
        title={signOrdo ? `Signer : ${signOrdo.title || 'Ordonnance'}` : undefined}
        payload={signOrdo ? { id: signOrdo.id, title: signOrdo.title, items: signOrdo.items, createdAt: signOrdo.createdAt, patientId } : null}
        onSign={async ({ dataUrl, hash, signedAt }) => {
          if (!signOrdo) return;
          const signature = { dataUrl, hash, signedAt, proId, proName };
          const updated = { ...signOrdo, signature };
          await api.updateOrdonnance(patientId, String(signOrdo.id), updated);
          setOrdos((list) => list.map((x) => (x.id === signOrdo.id ? updated : x)));
        }}
      />
      {showNote && (
        <NoteModal
          onClose={() => setShowNote(false)}
          onCreate={async (text) => {
            const saved = await api.createNote(patientId, { text });
            setNotes((list) => [saved as any, ...list]);
            setShowNote(false);
          }}
        />
      )}
    </div>
  );
}

function OrdonnanceModal({ onClose, onCreate }: { onClose: () => void; onCreate: (body: any) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<{ name: string; dosage: string; duration: string }[]>([
    { name: '', dosage: '', duration: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const inp = 'w-full px-3 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const valid = title.trim() && items.some((i) => i.name.trim());

  const updateItem = (i: number, patch: Partial<typeof items[0]>) => {
    setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Nouvelle ordonnance</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre (ex: HTA, avril 2026)" className={inp} />
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="bg-slate-50 p-3 rounded-xl space-y-2 relative">
              <input value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} placeholder="Médicament" className={inp} />
              <div className="grid grid-cols-2 gap-2">
                <input value={it.dosage} onChange={(e) => updateItem(i, { dosage: e.target.value })} placeholder="Posologie" className={inp} />
                <input value={it.duration} onChange={(e) => updateItem(i, { duration: e.target.value })} placeholder="Durée" className={inp} />
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => setItems((arr) => arr.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 bg-white border border-gray-200 rounded-full p-1"
                  aria-label="Retirer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setItems((arr) => [...arr, { name: '', dosage: '', duration: '' }])}
          className="w-full text-blue-700 py-2 text-sm font-medium border-2 border-dashed border-blue-200 rounded-xl"
        >
          + Ajouter un médicament
        </button>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium">Annuler</button>
          <button
            disabled={!valid || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onCreate({
                  title: title.trim(),
                  items: items.filter((i) => i.name.trim())
                });
              } finally { setSaving(false); }
            }}
            className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </motion.div>
    </div>
  );
}

function NoteModal({ onClose, onCreate }: { onClose: () => void; onCreate: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Nouvelle note médicale</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Observation, examen clinique, recommandations…"
          className="w-full px-3 py-2.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium">Annuler</button>
          <button
            disabled={!text.trim() || saving}
            onClick={async () => {
              setSaving(true);
              try { await onCreate(text.trim()); } finally { setSaving(false); }
            }}
            className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </motion.div>
    </div>
  );
}

function Card({ icon: Icon, color, title, children }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm"
    >
      <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Icon className={`w-5 h-5 text-${color}-600`} /> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </motion.section>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}
