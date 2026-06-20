import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Send, Phone, Info, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AFR } from '../images';
import { LIEUX } from '../data';
import { ensureThreadSeed, listThreads, saveThreads, MessageThread } from '../bookingStore';

export default function MessagesScreen() {
  const navigate = useNavigate();
  const { lieuId } = useParams();
  const [threads, setThreads] = useState<MessageThread[]>([]);

  useEffect(() => {
    ensureThreadSeed();
    setThreads(listThreads());
  }, []);

  // Vue conversation
  if (lieuId) {
    const thread = threads.find((t) => t.lieuId === lieuId) ?? createThreadFor(lieuId);
    return <Conversation thread={thread} onChange={() => setThreads(listThreads())} />;
  }

  // Vue inbox
  return (
    <div className="pb-10">
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-xl border-b border-stone-200/60 px-6 sm:px-8 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-stone-500">Messagerie</div>
          <div className="font-semibold text-stone-900">Conversations</div>
        </div>
      </header>

      <div className="px-6 sm:px-8 mt-4 space-y-2">
        {threads.length === 0 && (
          <div className="text-center text-sm text-stone-500 py-12">
            <MessageCircle className="w-6 h-6 text-stone-300 mx-auto mb-2" />
            Aucune conversation.<br /> Réservez un séjour pour échanger avec votre hôte.
          </div>
        )}
        {threads.map((t) => {
          const lieu = LIEUX.find((l) => l.id === t.lieuId);
          const last = t.messages[t.messages.length - 1];
          return (
            <button
              key={t.id}
              onClick={() => navigate(`/voyage-loisirs/messages/${t.lieuId}`)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-100 hover:bg-stone-50 text-left"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                {lieu && <ImageWithFallback src={AFR[lieu.hero]} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-stone-900 truncate">{t.hostName}</div>
                  <div className="text-[10px] text-stone-400 flex-shrink-0 ml-2">{fmtTime(last?.atISO)}</div>
                </div>
                <div className="text-xs text-stone-500 truncate">{last?.body ?? '…'}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Conversation({ thread, onChange }: { thread: MessageThread; onChange: () => void }) {
  const navigate = useNavigate();
  const lieu = LIEUX.find((l) => l.id === thread.lieuId);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState(thread.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    if (!text.trim()) return;
    const newMsg = { id: `m-${Date.now()}`, from: 'me' as const, body: text.trim(), atISO: new Date().toISOString() };
    const next = { ...thread, messages: [...msgs, newMsg], lastSeenISO: new Date().toISOString() };
    const all = listThreads().filter((t) => t.id !== thread.id);
    saveThreads([next, ...all]);
    setMsgs(next.messages);
    setText('');
    // Auto-réponse mock après 1.2 s
    setTimeout(() => {
      const reply = { id: `m-${Date.now() + 1}`, from: 'host' as const, body: pickReply(text), atISO: new Date().toISOString() };
      const next2 = { ...next, messages: [...next.messages, reply] };
      const all2 = listThreads().filter((t) => t.id !== thread.id);
      saveThreads([next2, ...all2]);
      setMsgs(next2.messages);
      onChange();
    }, 1200);
    onChange();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4.5rem)]">
      <header className="flex-shrink-0 sticky top-0 z-10 bg-white/85 backdrop-blur-xl border-b border-stone-200/60 px-6 sm:px-8 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/voyage-loisirs/messages')} aria-label="Retour" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
          {lieu && <ImageWithFallback src={AFR[lieu.hero]} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-stone-900 truncate">{thread.hostName}</div>
          <div className="text-[11px] text-emerald-600">En ligne</div>
        </div>
        <button aria-label="Appeler" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
          <Phone className="w-4 h-4" />
        </button>
        <button onClick={() => lieu && navigate(`/voyage-loisirs/lieu/${lieu.id}`)} aria-label="Infos" className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
          <Info className="w-4 h-4" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 bg-stone-50 space-y-2">
        {msgs.map((m) => {
          const me = m.from === 'me';
          return (
            <div key={m.id} className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-snug ${
                me ? 'bg-rose-600 text-white rounded-br-sm' : 'bg-white text-stone-800 border border-stone-200 rounded-bl-sm'
              }`}>
                <div>{m.body}</div>
                <div className={`mt-1 text-[10px] ${me ? 'text-rose-100' : 'text-stone-400'}`}>{fmtTime(m.atISO)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex-shrink-0 bg-white border-t border-stone-200 px-3 sm:px-4 py-2.5 flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 px-4 py-2.5 rounded-full bg-stone-100 border border-stone-200 outline-none text-sm focus:bg-white focus:border-rose-300"
        />
        <button type="submit" aria-label="Envoyer" className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center disabled:opacity-50" disabled={!text.trim()}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function createThreadFor(lieuId: string): MessageThread {
  const lieu = LIEUX.find((l) => l.id === lieuId);
  const t: MessageThread = {
    id: `th-${lieuId}`,
    lieuId,
    hostName: `Hôte ${lieu?.name ?? ''}`.trim(),
    lastSeenISO: new Date().toISOString(),
    messages: [
      { id: 'm-welcome', from: 'host', body: `Bonjour ! Bienvenue chez ${lieu?.name ?? 'nous'}. N'hésitez pas si vous avez des questions avant votre arrivée.`, atISO: new Date().toISOString() },
    ],
  };
  const all = listThreads();
  saveThreads([t, ...all.filter((x) => x.id !== t.id)]);
  return t;
}

function fmtTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso); const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function pickReply(input: string) {
  const t = input.toLowerCase();
  if (t.includes('arriv') || t.includes('check')) return "Notre check-in est à partir de 14 h. Souhaitez-vous une arrivée tardive ?";
  if (t.includes('repas') || t.includes('alimen') || t.includes('régime')) return "Aucun problème, notre cheffe adapte les menus aux régimes spécifiques.";
  if (t.includes('aéroport') || t.includes('transfert')) return "Nous proposons un transfert privé à 25 000 FCFA, je peux le réserver pour vous ?";
  if (t.includes('merci')) return "Avec grand plaisir, à très vite !";
  return "Merci pour votre message, je vous réponds dans la journée.";
}
