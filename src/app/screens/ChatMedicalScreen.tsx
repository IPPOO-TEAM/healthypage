import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

interface Msg {
  id: number;
  from: 'me' | 'doc';
  text?: string;
  image?: string;
  time: string;
}

export default function ChatMedicalScreen({ onBack, onNavigate }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = () => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMsgs((m) => [...m, { id: Date.now(), from: 'me', text, time }]);
    setText('');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMsgs((m) => [...m, { id: Date.now(), from: 'me', image: url, time }]);
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-12rem)]">
      <div className="relative overflow-hidden rounded-3xl shadow-lg p-5 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1769072610024-5b8a50f05c73?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative">
        <button onClick={onBack} className="mb-2 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl"><Stethoscope className="w-6 h-6" /></div>
            <div>
              <h2 className="font-bold">Messagerie médicale</h2>
              <p className="text-xs text-white/85">Communiquez avec votre praticien</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate?.('teleconsultation')}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-medium"
          >
            Vidéo
          </button>
        </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl p-4 shadow-sm space-y-3">
        {msgs.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[78%] px-4 py-2.5 rounded-2xl ${
                m.from === 'me'
                  ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              {m.image && <img src={m.image} alt="envoi" className="rounded-lg mb-1 max-h-48" />}
              {m.text && <p className="text-sm">{m.text}</p>}
              <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-teal-100' : 'text-gray-500'}`}>{m.time}</p>
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-600">
          <Paperclip className="w-5 h-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Écrire un message..."
          className="flex-1 px-3 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
        <button
          onClick={send}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-2.5 rounded-xl shadow hover:shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
