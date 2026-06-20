import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ShieldCheck, Upload, FileText, Trash2, Eye, Download, Lock, Loader2, Search, Image as ImageIcon, FileType2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../components/api';
import { getPatientId } from '../components/usePatientId';

interface Doc {
  id: string;
  name: string;
  category: string;
  notes: string;
  mime: string;
  size: number;
  createdAt: string;
}

interface Props { onBack: () => void }

const CATEGORIES = ['Tous', 'Ordonnance', 'Examen', 'Imagerie', 'Compte-rendu', 'Vaccin', 'Assurance', 'Autre'];

const fmtSize = (n: number) => n < 1024 ? `${n} o` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} ko` : `${(n / 1024 / 1024).toFixed(2)} Mo`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const fileToDataUrl = (f: File) => new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result));
  r.onerror = () => reject(r.error);
  r.readAsDataURL(f);
});

const base64ToBlob = (b64: string, mime: string) => {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
};

export default function CoffreFortScreen({ onBack }: Props) {
  const pid = getPatientId() ?? '';
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Tous');
  const [query, setQuery] = useState('');
  const [pendingFile, setPendingFile] = useState<{ file: File; dataUrl: string } | null>(null);
  const [pendingCategory, setPendingCategory] = useState('Autre');
  const [pendingNotes, setPendingNotes] = useState('');
  const [previewing, setPreviewing] = useState<{ name: string; url: string; mime: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    if (!pid) { setDocs([]); setLoading(false); return; }
    setLoading(true);
    try {
      const list = await api.listVault(pid);
      setDocs(list ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [pid]);

  const onPickFile = async (f: File) => {
    if (f.size > 8 * 1024 * 1024) {
      setError('Fichier > 8 Mo.');
      return;
    }
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(f);
      setPendingFile({ file: f, dataUrl });
      setPendingCategory('Autre');
      setPendingNotes('');
    } catch (e: any) {
      setError(e?.message ?? 'Lecture du fichier impossible.');
    }
  };

  const confirmUpload = async () => {
    if (!pendingFile || !pid) return;
    setUploading(true);
    setError(null);
    try {
      await api.uploadVaultDoc(pid, {
        name: pendingFile.file.name,
        dataUrl: pendingFile.dataUrl,
        category: pendingCategory,
        notes: pendingNotes,
      });
      setPendingFile(null);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Envoi impossible.');
    } finally {
      setUploading(false);
    }
  };

  const openDoc = async (d: Doc, action: 'preview' | 'download') => {
    if (!pid) return;
    try {
      const c = await api.getVaultContent(pid, d.id);
      const blob = base64ToBlob(c.base64, c.mime);
      const url = URL.createObjectURL(blob);
      if (action === 'download') {
        const a = document.createElement('a');
        a.href = url; a.download = d.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        setPreviewing({ name: d.name, url, mime: c.mime });
      }
    } catch (e: any) {
      setError(e?.message ?? 'Ouverture impossible.');
    }
  };

  const remove = async (d: Doc) => {
    if (!pid) return;
    if (!confirm(`Supprimer définitivement « ${d.name} » ?`)) return;
    try {
      await api.deleteVaultDoc(pid, d.id);
      setDocs((list) => list.filter((x) => x.id !== d.id));
    } catch (e: any) {
      setError(e?.message ?? 'Suppression impossible.');
    }
  };

  const filtered = docs.filter((d) => (filter === 'Tous' || d.category === filter) && (!query || d.name.toLowerCase().includes(query.toLowerCase())));

  return (
    <div className="space-y-4">
      <header className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-700 text-white rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-80">Confidentiel</p>
            <h1 className="font-bold text-lg">Coffre-fort</h1>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs">
          <ShieldCheck className="w-4 h-4" /> Chiffrement AES-256-GCM côté serveur
        </div>
        <p className="text-sm text-white/90 mt-3">{docs.length} document{docs.length > 1 ? 's' : ''} sécurisé{docs.length > 1 ? 's' : ''}</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <input ref={fileRef} type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickFile(f); e.target.value = ''; }} />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold inline-flex items-center justify-center gap-2 shadow"
        >
          <Upload className="w-4 h-4" /> Ajouter un document
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                filter === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
          <Lock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm">Aucun document {docs.length === 0 ? 'pour le moment' : 'pour ce filtre'}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => {
            const isImg = d.mime.startsWith('image/');
            return (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 flex-shrink-0">
                  {isImg ? <ImageIcon className="w-5 h-5" /> : d.mime === 'application/pdf' ? <FileText className="w-5 h-5" /> : <FileType2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{d.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {d.category && <span className="inline-block bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded mr-1">{d.category}</span>}
                    {fmtSize(d.size)} · {fmtDate(d.createdAt)}
                  </p>
                  {d.notes && <p className="text-[11px] text-slate-500 truncate mt-0.5">{d.notes}</p>}
                </div>
                <button onClick={() => openDoc(d, 'preview')} className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-indigo-50" aria-label="Aperçu"><Eye className="w-4 h-4" /></button>
                <button onClick={() => openDoc(d, 'download')} className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-indigo-50" aria-label="Télécharger"><Download className="w-4 h-4" /></button>
                <button onClick={() => remove(d)} className="p-2 rounded-lg bg-slate-50 text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => !uploading && setPendingFile(null)}
          >
            <motion.div
              initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
            >
              <header className="px-5 py-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <p className="text-[11px] uppercase tracking-widest font-semibold">Nouveau document</p>
                <h2 className="font-bold truncate">{pendingFile.file.name}</h2>
                <p className="text-xs opacity-80">{fmtSize(pendingFile.file.size)}</p>
              </header>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Catégorie</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {CATEGORIES.filter((c) => c !== 'Tous').map((c) => (
                      <button
                        key={c}
                        onClick={() => setPendingCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                          pendingCategory === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Notes (optionnel)</label>
                  <textarea
                    value={pendingNotes}
                    onChange={(e) => setPendingNotes(e.target.value)}
                    rows={2}
                    placeholder="Date de l'examen, médecin, contexte…"
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={500}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setPendingFile(null)}
                    disabled={uploading}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold disabled:opacity-60"
                  >Annuler</button>
                  <button
                    onClick={confirmUpload}
                    disabled={uploading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Chiffrement…</> : <><Lock className="w-4 h-4" /> Chiffrer & envoyer</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {previewing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex flex-col"
            onClick={() => { URL.revokeObjectURL(previewing.url); setPreviewing(null); }}
          >
            <div className="flex items-center justify-between p-4 text-white">
              <p className="font-semibold truncate flex-1">{previewing.name}</p>
              <button className="px-3 py-1.5 bg-white/15 rounded-lg text-sm">Fermer</button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              {previewing.mime.startsWith('image/') ? (
                <img src={previewing.url} alt={previewing.name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
              ) : (
                <iframe src={previewing.url} title={previewing.name} className="w-full h-full bg-white rounded-xl" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
