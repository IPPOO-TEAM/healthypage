import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Search, Send, ChevronLeft } from 'lucide-react';
import { api } from '../../components/api';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Props {
  proId: string;
}

export default function MessagerieProScreen({ proId }: Props) {
  const [patients, setPatients] = useState<any[]>([]);
  const [activePid, setActivePid] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!proId) { setLoading(false); setPatients([]); return; }
    api.listProPatients(proId)
      .then((list) => setPatients(list ?? []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [proId]);

  const conv = useMemo(() => activePid ? `${proId}__${activePid}` : null, [proId, activePid]);

  useEffect(() => {
    if (!conv) return;
    api.listMessages(conv).then((list) => setMessages(list ?? [])).catch(() => setMessages([]));
  }, [conv]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filtered = patients.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase().includes(q);
  });

  const send = async () => {
    if (!text.trim() || !conv) return;
    const body = { from: 'pro', authorId: proId, text: text.trim() };
    setText('');
    try {
      const saved = await api.sendMessage(conv, body);
      setMessages((m) => [...m, saved]);
    } catch (e) {
      console.error('send message failed', e);
    }
  };

  if (activePid) {
    const p = patients.find((x) => x.id === activePid);
    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <header className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white px-5 py-4 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => setActivePid(null)} className="bg-white/15 p-2 rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
              {(p?.firstName?.[0] ?? '?')}{(p?.lastName?.[0] ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold truncate">{p?.firstName} {p?.lastName}</h1>
              <p className="text-xs text-white/80 truncate">{p?.phone ?? ', '}</p>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500 mt-10">Aucun message, démarrez la conversation.</p>
          ) : messages.map((m) => {
            const mine = m.from === 'pro';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                  mine ? 'bg-blue-700 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md'
                }`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white border-t border-gray-200 p-3 flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Écrire un message…"
            rows={1}
            className="flex-1 px-3 py-2.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none max-h-32"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50"
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white px-5 py-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-2xl"><MessageSquare className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-white/80 uppercase tracking-widest">Messagerie</p>
            <h1 className="font-bold text-lg">Mes conversations</h1>
            <p className="text-xs text-white/80">{patients.length} patient(s)</p>
          </div>
        </div>
      </header>

      <main className="px-5 mt-5 space-y-4">
        <div className="relative h-32 rounded-2xl overflow-hidden">
          <ImageWithFallback src="https://images.unsplash.com/photo-1591854491132-9b4c4f7dba16?w=1080" alt="Communication soignant" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/75 to-transparent flex items-end p-4">
            <p className="text-white text-sm">Dialoguer avec vos patients · messagerie sécurisée</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un patient…"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {!query && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3">
              <span className="text-xs text-gray-500 whitespace-nowrap">Suggestions :</span>
              {['Non lu', 'Urgent', 'Aïcha', 'Kouamé', 'Marie', 'Yao', 'Suivi'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-3 py-1 rounded-full text-xs bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-500 text-center py-6">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Aucun patient.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePid(p.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-semibold">
                    {(p.firstName?.[0] ?? '?')}{(p.lastName?.[0] ?? '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">Ouvrir la conversation</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
