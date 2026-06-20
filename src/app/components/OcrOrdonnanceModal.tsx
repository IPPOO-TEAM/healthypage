import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, ScanLine, Loader2, CheckCircle2, Plus, Trash2, Edit2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { api } from './api';
import { getPatientId } from './usePatientId';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: (count: number) => void;
}

interface ParsedMed {
  id: string;
  name: string;
  dosage: string;
  schedule: string[];
  duration?: string;
  raw: string;
}

const uid = () => `med_${Math.random().toString(36).slice(2, 10)}`;

const TIME_DEFAULTS: Record<number, string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};

const FRENCH_NUM: Record<string, number> = {
  'un': 1, 'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5, 'six': 6,
};

const parseLineToMed = (rawLine: string): ParsedMed | null => {
  const line = rawLine.replace(/\s+/g, ' ').trim();
  if (line.length < 4) return null;
  // Skip headers / metadata
  if (/^(ordonnance|dr\.?|docteur|patient|n°|date|cabinet|cachet|signature)/i.test(line)) return null;

  // Heuristic: drug name = first token group with optional dosage like 500mg, 1g, 5%
  const dosageMatch = line.match(/(\d+[.,]?\d*\s*(?:mg|g|ml|µg|ug|UI|%|mcg)\b)/i);
  let name = line;
  let dosage = dosageMatch?.[0] ?? '';

  if (dosageMatch) {
    const idx = line.toLowerCase().indexOf(dosageMatch[0].toLowerCase());
    name = line.slice(0, idx + dosageMatch[0].length).trim();
  } else {
    // Otherwise use the first 2-3 capitalized words as name
    const head = line.split(/[,;:·•]/)[0].trim();
    name = head.split(' ').slice(0, 4).join(' ');
  }

  if (!name || name.length < 3) return null;

  // Frequency: "3 fois par jour", "2x/j", "matin midi soir", etc.
  let freq = 0;
  const freqDigit = line.match(/(\d+)\s*(?:fois|x|cp|gel|gouttes?|prises?)\s*(?:\/|par)?\s*j(?:our)?/i);
  if (freqDigit) freq = Math.min(6, parseInt(freqDigit[1], 10));
  if (!freq) {
    const word = line.toLowerCase().match(/(un|une|deux|trois|quatre|cinq|six)\s+(?:fois|x|cp|gel|gouttes?|prises?)/);
    if (word) freq = FRENCH_NUM[word[1]] ?? 0;
  }
  if (!freq) {
    const slots = ['matin', 'midi', 'soir', 'coucher', 'après-midi', 'apres-midi'];
    freq = slots.filter((s) => new RegExp(`\\b${s}\\b`, 'i').test(line)).length;
  }
  if (!freq) freq = 1;

  const schedule = TIME_DEFAULTS[freq] ?? TIME_DEFAULTS[1];

  // Duration: "5 jours", "10j", "2 semaines"
  const dur = line.match(/(\d+)\s*(jour|j\b|semaine|sem|mois)/i);
  const duration = dur ? dur[0] : undefined;

  return { id: uid(), name, dosage, schedule, duration, raw: rawLine };
};

const parseOcrText = (text: string): ParsedMed[] => {
  const meds: ParsedMed[] = [];
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const m = parseLineToMed(line);
    if (!m) continue;
    const key = m.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    meds.push(m);
  }
  return meds;
};

export default function OcrOrdonnanceModal({ open, onClose, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'reading' | 'review' | 'saving' | 'done' | 'error'>('idle');
  const [rawText, setRawText] = useState('');
  const [meds, setMeds] = useState<ParsedMed[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setImageUrl((url) => { if (url) URL.revokeObjectURL(url); return null; });
      setProgress(0);
      setStatus('idle');
      setRawText('');
      setMeds([]);
      setError(null);
      setEditingId(null);
    }
  }, [open]);

  const runOcr = async (file: File) => {
    setError(null);
    setStatus('reading');
    setProgress(0);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(file, 'fra', {
        logger: (m: any) => {
          if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const text = data?.text ?? '';
      setRawText(text);
      const parsed = parseOcrText(text);
      setMeds(parsed);
      setStatus('review');
    } catch (e: any) {
      console.error('OCR failed', e);
      setError(e?.message ?? "Lecture impossible. Réessayez avec une photo plus nette.");
      setStatus('error');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    runOcr(f);
  };

  const updateMed = (id: string, patch: Partial<ParsedMed>) => {
    setMeds((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeMed = (id: string) => setMeds((list) => list.filter((m) => m.id !== id));

  const addBlank = () => setMeds((list) => [...list, { id: uid(), name: '', dosage: '', schedule: ['08:00'], raw: '' }]);

  const save = async () => {
    const pid = getPatientId();
    const valid = meds.filter((m) => m.name.trim());
    if (valid.length === 0) { setError('Aucun médicament à enregistrer.'); return; }
    setStatus('saving');
    setError(null);
    try {
      if (pid) {
        for (const m of valid) {
          const body = {
            id: m.id,
            name: m.name.trim(),
            dosage: m.dosage.trim() || '1 prise',
            schedule: m.schedule,
            taken: m.schedule.map(() => false),
            duration: m.duration,
            source: 'ocr',
          };
          try { await api.upsertTraitement(pid, m.id, body); } catch (e) { console.error('upsertTraitement', e); }
        }
      }
      setStatus('done');
      onSaved?.(valid.length);
      setTimeout(() => onClose(), 1100);
    } catch (e: any) {
      setError(e?.message ?? 'Enregistrement impossible.');
      setStatus('review');
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="ocr-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col"
        >
          <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-semibold">OCR Ordonnance</p>
                <h2 className="font-bold text-slate-900">Scanner une ordonnance papier</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {status === 'idle' && (
              <>
                <p className="text-sm text-slate-600">
                  Prenez une photo nette de votre ordonnance. Les médicaments seront extraits automatiquement et ajoutés à vos traitements.
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 inline-flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" /> Photo ou import
                </button>
                <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-3 text-xs text-amber-800 flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>L'OCR fonctionne entièrement sur votre appareil — aucune image n'est envoyée à un serveur. Vérifiez toujours les médicaments extraits avant validation.</span>
                </div>
              </>
            )}

            {status === 'reading' && (
              <div className="text-center py-8 space-y-3">
                {imageUrl && (
                  <img src={imageUrl} alt="Ordonnance" className="mx-auto max-h-44 rounded-xl shadow ring-1 ring-slate-200" />
                )}
                <div className="inline-flex items-center gap-2 text-slate-700">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span className="font-medium">Lecture en cours…</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-500">{progress}% — premier scan : ~10–20s (téléchargement du modèle).</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-6 space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="text-sm text-slate-700">{error}</p>
                <button
                  onClick={() => { setStatus('idle'); setError(null); }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
                >Réessayer</button>
              </div>
            )}

            {status === 'review' && (
              <>
                {imageUrl && (
                  <div className="flex gap-3 items-start bg-slate-50 rounded-2xl p-3">
                    <img src={imageUrl} alt="Ordonnance" className="w-20 h-20 object-cover rounded-xl ring-1 ring-slate-200" />
                    <div className="flex-1 min-w-0 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800 mb-1 inline-flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> Source scannée
                      </p>
                      <p className="line-clamp-3 whitespace-pre-line">{rawText.slice(0, 220) || '—'}{rawText.length > 220 ? '…' : ''}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{meds.length} médicament{meds.length > 1 ? 's' : ''} détecté{meds.length > 1 ? 's' : ''}</p>
                  <button onClick={addBlank} className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>

                {meds.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-3">Aucun médicament détecté. Ajoutez-les manuellement.</p>
                )}

                <div className="space-y-2">
                  {meds.map((m) => {
                    const editing = editingId === m.id;
                    return (
                      <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          {editing ? (
                            <input
                              autoFocus
                              value={m.name}
                              onChange={(e) => updateMed(m.id, { name: e.target.value })}
                              onBlur={() => setEditingId(null)}
                              className="flex-1 px-2 py-1 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="Nom du médicament"
                            />
                          ) : (
                            <button onClick={() => setEditingId(m.id)} className="flex-1 text-left">
                              <p className="font-semibold text-slate-900 text-sm">{m.name || <span className="italic text-slate-400">Nom manquant</span>}</p>
                            </button>
                          )}
                          <button onClick={() => setEditingId(editing ? null : m.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => removeMed(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={m.dosage}
                            onChange={(e) => updateMed(m.id, { dosage: e.target.value })}
                            placeholder="Dosage / posologie"
                            className="px-2 py-1.5 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <input
                            value={m.duration ?? ''}
                            onChange={(e) => updateMed(m.id, { duration: e.target.value })}
                            placeholder="Durée"
                            className="px-2 py-1.5 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500 mb-1">Horaires :</p>
                          <div className="flex flex-wrap gap-1">
                            {m.schedule.map((t, i) => (
                              <input
                                key={i}
                                type="time"
                                value={t}
                                onChange={(e) => {
                                  const next = [...m.schedule];
                                  next[i] = e.target.value;
                                  updateMed(m.id, { schedule: next });
                                }}
                                className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            ))}
                            <button
                              onClick={() => updateMed(m.id, { schedule: [...m.schedule, '12:00'] })}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs inline-flex items-center gap-1"
                            ><Plus className="w-3 h-3" /> Prise</button>
                            {m.schedule.length > 1 && (
                              <button
                                onClick={() => updateMed(m.id, { schedule: m.schedule.slice(0, -1) })}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                              >−</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}

                <button
                  onClick={save}
                  disabled={meds.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Ajouter aux traitements ({meds.length})
                </button>
              </>
            )}

            {status === 'saving' && (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-slate-700">Enregistrement…</p>
              </div>
            )}

            {status === 'done' && (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-900">Traitements ajoutés</p>
                <p className="text-sm text-slate-600">Retrouvez-les dans « Traitements en cours ».</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
