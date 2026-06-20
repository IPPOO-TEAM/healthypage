import { useState } from 'react';
import { Globe2, Check, ChevronDown } from 'lucide-react';
import { useT, LOCALES, Locale } from '../i18n';

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];

  if (compact) {
    return (
      <div className="relative">
        <button onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white ring-1 ring-[#E6EAF2] text-xs font-bold text-slate-700">
          {current.id.charAt(0).toUpperCase() + current.id.slice(1).toLowerCase()}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1.5 w-56 max-h-80 overflow-y-auto rounded-xl bg-white ring-1 ring-[#E6EAF2] shadow-lg z-50 p-1">
              {LOCALES.map((l) => (
                <button key={l.id} onClick={() => { setLocale(l.id as Locale); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm ${l.id === locale ? 'bg-[#E2ECFF] text-[#1E5BFF] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <span className="w-6">{l.flag}</span>
                  <span className="flex-1">{l.native}</span>
                  <span className="text-[11px] text-slate-400">{l.label}</span>
                  {l.id === locale && <Check className="w-3.5 h-3.5 text-[#1E5BFF]" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
        <Globe2 className="w-3.5 h-3.5" /> {t('common.choose_language')}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {LOCALES.map((l) => (
          <button key={l.id} onClick={() => setLocale(l.id as Locale)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ring-1 text-left text-sm transition ${
              l.id === locale
                ? 'bg-[#1E5BFF] text-white ring-transparent shadow-sm'
                : 'bg-white text-slate-700 ring-[#E6EAF2]'
            }`}>
            <span className="text-base">{l.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold leading-tight">{l.native}</div>
              <div className={`text-[11px] ${l.id === locale ? 'text-white/80' : 'text-slate-400'}`}>{l.label}</div>
            </div>
            {l.id === locale && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
