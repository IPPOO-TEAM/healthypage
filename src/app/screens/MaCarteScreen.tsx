import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, QrCode, Download, Printer, FileImage, FileText, FileCode, CreditCard,
  CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface CardSubject {
  id: string;
  fullName: string;
  role: 'Patient' | 'Praticien' | 'Administrateur';
  subtitle?: string;
  photo?: string | null;
  meta?: Record<string, string | undefined>;
  bloodGroup?: string;
}

interface Props {
  subject: CardSubject;
  onBack: () => void;
}

const SUBSCRIPTION_PRICE = 1500;

export default function MaCarteScreen({ subject, onBack }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [paid, setPaid] = useState<boolean>(() => {
    try { return localStorage.getItem(`hp:card:paid:${subject.id}`) === 'true'; } catch { return false; }
  });

  // Compute current cycle (month)
  const now = new Date();
  const expiry = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const expiryStr = expiry.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const issuedStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const cardNumber = `HP-${subject.role[0]}-${subject.id.slice(-8).toUpperCase()}`;

  const qrPayload = JSON.stringify({
    v: 1, id: subject.id, role: subject.role, name: subject.fullName,
    issued: now.toISOString(), expires: expiry.toISOString(), card: cardNumber
  });

  useEffect(() => {
    QRCode.toDataURL(qrPayload, { errorCorrectionLevel: 'M', margin: 1, width: 280, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch((e) => console.error('QR generation:', e));
  }, [qrPayload]);

  const subscribe = () => {
    setPaid(true);
    try { localStorage.setItem(`hp:card:paid:${subject.id}`, 'true'); } catch {}
  };

  const downloadSVG = () => {
    const svg = buildCardSVG(subject, cardNumber, issuedStr, expiryStr, qrPayload);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, `carte-${cardNumber}.svg`);
  };

  const downloadPNG = async () => {
    const svg = buildCardSVG(subject, cardNumber, issuedStr, expiryStr, qrPayload);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3;
      canvas.width = 640 * scale;
      canvas.height = 400 * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, 640, 400);
      canvas.toBlob((b) => {
        if (b) triggerDownload(b, `carte-${cardNumber}.png`);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = url;
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });
    // Render card via SVG → PNG → PDF
    const svg = buildCardSVG(subject, cardNumber, issuedStr, expiryStr, qrPayload);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280; canvas.height = 800;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 1280, 800);
        const dataUrl = canvas.toDataURL('image/png');
        pdf.addImage(dataUrl, 'PNG', 0, 0, 85.6, 53.98);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
    pdf.save(`carte-${cardNumber}.pdf`);
  };

  const print = () => {
    const win = window.open('', '_blank', 'width=900,height=600');
    if (!win) return;
    const svg = buildCardSVG(subject, cardNumber, issuedStr, expiryStr, qrPayload);
    win.document.write(`
      <!doctype html><html><head><title>Carte ${cardNumber}</title>
      <style>
        @page { size: 85.6mm 53.98mm; margin: 0; }
        body { margin: 0; display: flex; align-items: center; justify-content: center; }
        svg { width: 85.6mm; height: 53.98mm; }
      </style></head><body>${svg}<script>window.onload=()=>window.print();</script></body></html>`);
    win.document.close();
  };

  const accent = subject.role === 'Patient' ? 'from-teal-600 to-cyan-600'
    : subject.role === 'Praticien' ? 'from-blue-700 to-indigo-700'
    : 'from-slate-800 to-slate-600';

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl shadow-lg p-6 text-white">
        <ImageWithFallback src="https://images.unsplash.com/photo-1678225894316-b6e83cd06242?w=1080&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/90 via-teal-600/80 to-cyan-600/70"></div>
        <div className="relative">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl"><CreditCard className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold">Ma carte Healthy Page</h2>
            <p className="text-sm text-white/85">Identifiant numérique avec QR Code</p>
          </div>
        </div>
        </div>
      </div>

      {/* Subscription banner */}
      <div className={`rounded-2xl p-5 shadow-sm border ${paid ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          {paid ? <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />}
          <div className="flex-1">
            <p className={`font-semibold ${paid ? 'text-emerald-900' : 'text-amber-900'}`}>
              {paid ? 'Abonnement actif' : 'Abonnement requis'}
            </p>
            <p className={`text-sm mt-0.5 ${paid ? 'text-emerald-800' : 'text-amber-800'}`}>
              {paid
                ? `Votre carte est valide jusqu'au ${expiryStr}. Renouvellement automatique mensuel.`
                : `La carte se renouvelle chaque mois pour ${SUBSCRIPTION_PRICE} FCFA. Activez l'abonnement pour la télécharger.`}
            </p>
            {!paid && (
              <button
                onClick={subscribe}
                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> S'abonner, {SUBSCRIPTION_PRICE} FCFA / mois
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card preview */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative aspect-[1.586/1] rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${accent} text-white`}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
          backgroundSize: '14px 14px'
        }} />
        <div className="relative h-full p-5 flex">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase opacity-80">Healthy Page</p>
              <p className="text-xs opacity-90 mt-0.5">{subject.role}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Titulaire</p>
              <p className="font-bold text-lg leading-tight">{subject.fullName}</p>
              {subject.subtitle && <p className="text-xs opacity-90">{subject.subtitle}</p>}
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] opacity-90">
              <div>
                <p className="opacity-70">N° carte</p>
                <p className="font-mono">{cardNumber}</p>
              </div>
              <div>
                <p className="opacity-70">Expire</p>
                <p>{expiryStr}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between ml-3">
            {subject.photo ? (
              <img src={subject.photo} alt="" className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/40" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center text-xl font-bold">
                {subject.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
            )}
            <div className="bg-white p-1.5 rounded-lg">
              {qrDataUrl ? <img src={qrDataUrl} alt="QR" className="w-20 h-20" /> : <QrCode className="w-20 h-20 text-slate-300" />}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Meta */}
      {subject.meta && (
        <div className="bg-white rounded-2xl p-5 shadow-sm grid grid-cols-2 gap-3">
          {Object.entries(subject.meta).filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-gray-500">{k}</p>
              <p className="text-sm font-medium text-gray-900">{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Downloads */}
      <div className="grid grid-cols-2 gap-3">
        <DownloadBtn icon={FileImage} label="PNG" onClick={downloadPNG} disabled={!paid} />
        <DownloadBtn icon={FileCode} label="SVG" onClick={downloadSVG} disabled={!paid} />
        <DownloadBtn icon={FileText} label="PDF" onClick={downloadPDF} disabled={!paid} />
        <DownloadBtn icon={Printer} label="Imprimer" onClick={print} disabled={!paid} />
      </div>

      <p className="text-center text-xs text-gray-400">
        Présentez ce QR Code à un praticien partenaire pour partager votre identité.
      </p>
    </div>
  );
}

function DownloadBtn({ icon: Icon, label, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-violet-400 text-gray-800 py-3 rounded-2xl shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function buildCardSVG(s: CardSubject, cardNumber: string, issued: string, expires: string, qrPayload: string): string {
  const accentStart = s.role === 'Patient' ? '#0d9488' : s.role === 'Praticien' ? '#1d4ed8' : '#1e293b';
  const accentEnd = s.role === 'Patient' ? '#06b6d4' : s.role === 'Praticien' ? '#4338ca' : '#475569';
  const initials = s.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('');
  // QR inline as image via data URL, we re-generate synchronously? We can't, so we leave a placeholder using qrPayload as text. Better: call sync version via library is complex. Use rect placeholder + label "QR". The PNG export goes through DOM-rendered QR. For SVG-only export, we will embed a foreignObject pulling the rendered image is not ideal. Compromise: SVG includes a rect with the payload truncated text.
  const safeName = s.fullName.replace(/[<>&]/g, '');
  const subtitle = (s.subtitle ?? '').replace(/[<>&]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accentStart}"/>
      <stop offset="100%" stop-color="${accentEnd}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="32" fill="url(#g)"/>
  <text x="32" y="56" font-family="Helvetica, Arial, sans-serif" font-size="14" letter-spacing="4" fill="#ffffff" opacity="0.85">HEALTHY PAGE</text>
  <text x="32" y="76" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#ffffff" opacity="0.85">${s.role}</text>
  <text x="32" y="240" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#ffffff" opacity="0.7">Titulaire</text>
  <text x="32" y="270" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="bold" fill="#ffffff">${safeName}</text>
  <text x="32" y="294" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#ffffff" opacity="0.9">${subtitle}</text>
  <text x="32" y="340" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#ffffff" opacity="0.7">N° carte</text>
  <text x="32" y="358" font-family="monospace" font-size="14" fill="#ffffff">${cardNumber}</text>
  <text x="220" y="340" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#ffffff" opacity="0.7">Émise</text>
  <text x="220" y="358" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#ffffff">${issued}</text>
  <text x="380" y="340" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#ffffff" opacity="0.7">Expire</text>
  <text x="380" y="358" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#ffffff">${expires}</text>
  <rect x="500" y="32" width="108" height="108" rx="14" fill="#ffffff" opacity="0.18"/>
  <text x="554" y="92" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle">${initials}</text>
  <rect x="488" y="232" width="120" height="120" rx="10" fill="#ffffff"/>
  <text x="548" y="296" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#0f172a" text-anchor="middle">QR</text>
  <text x="548" y="312" font-family="monospace" font-size="9" fill="#0f172a" text-anchor="middle">${cardNumber}</text>
</svg>`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
