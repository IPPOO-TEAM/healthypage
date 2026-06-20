import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';

export function QRCode({ value, size = 192, className = '' }: { value: string; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    QRCodeLib.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#0B1220', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).catch((e) => setError(e?.message ?? 'QR error'));
  }, [value, size]);

  if (error) {
    return <div className={`text-xs text-rose-600 ${className}`}>QR indisponible : {error}</div>;
  }
  return <canvas ref={ref} width={size} height={size} className={className} />;
}
