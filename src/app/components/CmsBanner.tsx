import { AlertTriangle, Info, CheckCircle2, Megaphone } from 'lucide-react';
import { useCms } from './cms';

const STYLES: Record<string, { bg: string; text: string; ring: string; Icon: any }> = {
  info: { bg: 'bg-sky-50', text: 'text-sky-800', ring: 'ring-sky-200', Icon: Info },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-800', ring: 'ring-emerald-200', Icon: CheckCircle2 },
  warning: { bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200', Icon: Megaphone },
  critical: { bg: 'bg-rose-50', text: 'text-rose-800', ring: 'ring-rose-200', Icon: AlertTriangle },
};

export function CmsBanner() {
  const { banner } = useCms();
  if (!banner.active || (!banner.title && !banner.message)) return null;
  const s = STYLES[banner.severity] ?? STYLES.info;
  const Icon = s.Icon;
  return (
    <div className={`${s.bg} ${s.text} ring-1 ${s.ring} rounded-2xl p-4 flex items-start gap-3`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {banner.title && <p className="font-semibold">{banner.title}</p>}
        {banner.message && <p className="text-sm opacity-90 mt-0.5">{banner.message}</p>}
        {banner.ctaLabel && banner.ctaHref && (
          <a
            href={banner.ctaHref}
            target={banner.ctaHref.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm font-semibold underline underline-offset-2"
          >
            {banner.ctaLabel} →
          </a>
        )}
      </div>
    </div>
  );
}
