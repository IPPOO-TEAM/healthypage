import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, ScreenShare, X, Send, FileText, Pill, Calendar, Download, Wifi, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JitsiVideoCall from '../components/JitsiVideoCall';
import { getPatientId } from '../components/usePatientId';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

interface Msg { id: string; from: 'me' | 'doc'; text: string; time: string }

const DOC_NOTES = [
  'Auscultation : ras',
  'Tension : 125/80, normale',
  'Symptômes compatibles avec rhinopharyngite virale',
];

const PRESCRIPTION = [
  { name: 'Paracétamol 1g', dose: '1 cp x 3/jour si fièvre', duration: '5 jours' },
  { name: 'Sérum physiologique', dose: 'Lavage nasal matin/soir', duration: '7 jours' },
];

const getRoomFromUrl = (): string | null => {
  try {
    const sp = new URLSearchParams(window.location.search);
    const r = sp.get('room');
    if (r && r.trim()) return r.trim();
  } catch {}
  return null;
};

const computeRoomName = (): string => {
  const fromUrl = getRoomFromUrl();
  if (fromUrl) return fromUrl;
  const pid = getPatientId() ?? 'guest';
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `healthypage-${pid}-${day}`;
};

const getDisplayName = (): string => {
  try {
    const raw = window.localStorage.getItem('healthy-page:patient-name');
    if (raw) return raw;
  } catch {}
  return 'Patient';
};

export default function TeleconsultationScreen({ onBack, onNavigate }: Props) {
  const room = useMemo(computeRoomName, []);
  const displayName = useMemo(getDisplayName, []);

  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [duration, setDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'm1', from: 'doc', text: 'Bonjour, je vous écoute. Pouvez-vous décrire vos symptômes ?', time: '10:31' },
  ]);
  const [input, setInput] = useState('');
  const [quality, setQuality] = useState<'good' | 'ok' | 'poor'>('good');
  const [participants, setParticipants] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const apiRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setInterval(() => setDuration((d) => d + 1), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.random();
      setQuality(r > 0.85 ? 'poor' : r > 0.65 ? 'ok' : 'good');
    }, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, showChat]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const send = () => {
    const v = input.trim(); if (!v) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMessages((m) => [...m, { id: Date.now().toString(), from: 'me', text: v, time: now }]);
    setInput('');
    try { apiRef.current?.executeCommand('sendChatMessage', v); } catch {}
  };

  const downloadOrdonnance = () => {
    const txt = `ORDONNANCE - Healthy Page\nDr. Aïcha Diop · ${new Date().toLocaleDateString('fr-FR')}\n\n` +
      PRESCRIPTION.map((p) => `- ${p.name} : ${p.dose} (${p.duration})`).join('\n') +
      `\n\nNotes :\n${DOC_NOTES.map((n) => `• ${n}`).join('\n')}`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ordonnance-${Date.now()}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const toggleMic = () => {
    try { apiRef.current?.executeCommand('toggleAudio'); } catch {}
    setMic((v) => !v);
  };
  const toggleCam = () => {
    try { apiRef.current?.executeCommand('toggleVideo'); } catch {}
    setCam((v) => !v);
  };
  const shareScreen = () => {
    try { apiRef.current?.executeCommand('toggleShareScreen'); } catch {}
  };
  const hangUp = () => {
    try { apiRef.current?.executeCommand('hangup'); } catch {}
    setShowSummary(true);
  };

  const copyInviteLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-gray-700 hover:text-teal-700">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${quality === 'good' ? 'bg-green-100 text-green-700' : quality === 'ok' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>
            <Wifi className="w-3 h-3" /> {quality === 'good' ? 'HD' : quality === 'ok' ? 'Stable' : 'Faible'}
          </span>
          <span className="text-sm text-gray-500">Téléconsult • {fmt(duration)}</span>
          {participants > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{participants + 1} en ligne</span>
          )}
        </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[9/14] sm:aspect-video shadow-2xl">
        <JitsiVideoCall
          room={room}
          displayName={displayName}
          startWithAudioMuted={!mic}
          startWithVideoMuted={!cam}
          onApiReady={(api) => { apiRef.current = api; }}
          onParticipantJoined={() => setParticipants((n) => n + 1)}
          onParticipantLeft={() => setParticipants((n) => Math.max(0, n - 1))}
          onHangup={() => setShowSummary(true)}
        />

        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white/95 backdrop-blur shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold text-gray-900">Chat de séance</h3>
                <button onClick={() => setShowChat(false)} className="text-gray-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.from === 'me' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-0.5 ${m.from === 'me' ? 'text-teal-100' : 'text-gray-500'}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-2 border-t flex gap-1.5">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Écrire…" className="flex-1 px-3 py-2 rounded-xl bg-gray-100 text-sm" />
                <button onClick={send} className="px-3 py-2 bg-teal-600 text-white rounded-xl"><Send className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Salle de consultation</p>
          <p className="font-mono text-sm text-slate-800 truncate">{room}</p>
          <p className="text-xs text-slate-500">Partagez le lien pour inviter votre praticien.</p>
        </div>
        <button onClick={copyInviteLink} className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 flex-shrink-0">
          {linkCopied ? <><Check className="w-4 h-4" /> Copié</> : <><Copy className="w-4 h-4" /> Lien</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-teal-600" /> Notes en temps réel</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {DOC_NOTES.map((n, i) => <li key={i} className="flex gap-2"><span className="text-teal-600">•</span>{n}</li>)}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-around">
          <button onClick={toggleMic} className={`p-4 rounded-2xl transition ${mic ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
            {mic ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          <button onClick={toggleCam} className={`p-4 rounded-2xl transition ${cam ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
            {cam ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          <button onClick={shareScreen} className="p-4 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200">
            <ScreenShare className="w-6 h-6" />
          </button>
          <button onClick={() => setShowChat((s) => !s)} className={`p-4 rounded-2xl ${showChat ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'} relative`}>
            <MessageSquare className="w-6 h-6" />
          </button>
          <button onClick={hangUp} className="p-4 rounded-2xl bg-red-600 text-white shadow-lg hover:bg-red-700">
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onBack}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 flex items-center justify-between">
                <div><h3 className="font-bold">Consultation terminée</h3><p className="text-xs opacity-90">Durée : {fmt(duration)}</p></div>
                <button onClick={onBack} className="p-1.5 hover:bg-white/20 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <section>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Pill className="w-4 h-4 text-teal-600" /> Ordonnance</h4>
                  <ul className="space-y-1.5">
                    {PRESCRIPTION.map((p, i) => (
                      <li key={i} className="p-2 bg-teal-50 rounded-lg text-sm">
                        <div className="font-medium text-teal-900">{p.name}</div>
                        <div className="text-xs text-teal-800">{p.dose} · {p.duration}</div>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-teal-600" /> Notes</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {DOC_NOTES.map((n, i) => <li key={i} className="flex gap-2"><span className="text-teal-600">•</span>{n}</li>)}
                  </ul>
                </section>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button onClick={downloadOrdonnance} className="py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Ordonnance
                  </button>
                  <button onClick={() => onNavigate?.('rdv')} className="py-2.5 bg-white border-2 border-teal-600 text-teal-700 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" /> RDV de suivi
                  </button>
                </div>
                <button onClick={onBack} className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-sm">Fermer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
