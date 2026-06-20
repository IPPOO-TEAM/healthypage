import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from 'react';
import { dictionaries, Locale, LOCALES } from './dictionaries';
import { translateBatch, getCached } from './translator';

export type { Locale } from './dictionaries';
export { LOCALES } from './dictionaries';

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tr: (text: string) => string;
  dir: 'ltr' | 'rtl';
  translating: boolean;
  translationError: string | null;
};

const LocaleContext = createContext<Ctx | null>(null);
const STORAGE_KEY = 'hp.locale';

const interpolate = (str: string, vars?: Record<string, string | number>) =>
  vars ? str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : str;

export function LocaleProvider({ children, defaultLocale = 'fr' as Locale }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && stored in dictionaries) return stored;
    } catch {}
    return defaultLocale;
  });

  const [translating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [dynVersion, setDynVersion] = useState(0);

  const dynQueue = useRef<Set<string>>(new Set());
  const dynTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, locale); } catch {}
    document.documentElement.lang = locale;
  }, [locale]);

  const flushDynamic = useCallback(() => {
    const target = locale;
    if (target === 'fr') {
      dynQueue.current.clear();
      return;
    }
    const pending = Array.from(dynQueue.current).filter((s) => getCached(target, s) == null);
    dynQueue.current.clear();
    if (!pending.length) return;
    translateBatch(pending, target)
      .then(() => setDynVersion((v) => v + 1))
      .catch(() => {/* silencieux : tr() retournera le FR original */});
  }, [locale]);

  const enqueueDynamic = useCallback((text: string) => {
    if (!text) return;
    if (locale === 'fr') return;
    if (getCached(locale, text)) return;
    if (dynQueue.current.has(text)) return;
    dynQueue.current.add(text);
    if (dynTimer.current) clearTimeout(dynTimer.current);
    dynTimer.current = setTimeout(flushDynamic, 120);
  }, [locale, flushDynamic]);

  const setLocale = useCallback((l: Locale) => {
    setTranslationError(null);
    setLocaleState(l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    const dict = dictionaries[locale] ?? dictionaries.fr;
    const value = (dict as Record<string, string>)[key]
      ?? (dictionaries.fr as Record<string, string>)[key]
      ?? key;
    return interpolate(value, vars);
  }, [locale]);

  const tr = useCallback((text: string): string => {
    if (!text) return text;
    if (locale === 'fr') return text;
    const cached = getCached(locale, text);
    if (cached) return cached;
    enqueueDynamic(text);
    return text;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, enqueueDynamic, dynVersion]);

  const value = useMemo<Ctx>(() => ({
    locale, setLocale, t, tr, dir: 'ltr', translating, translationError,
  }), [locale, setLocale, t, tr, translating, translationError]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
      {translating && <TranslationOverlay locale={locale} />}
      {translationError && !translating && (
        <TranslationErrorBanner message={translationError} onDismiss={() => setTranslationError(null)} />
      )}
    </LocaleContext.Provider>
  );
}

function TranslationOverlay({ locale }: { locale: Locale }) {
  const meta = LOCALES.find((l) => l.id === locale);
  return (
    <div className="fixed inset-0 z-[9999] bg-white/85 backdrop-blur-sm flex items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white ring-1 ring-[#E6EAF2] shadow-lg px-6 py-5">
        <div className="w-8 h-8 rounded-full border-2 border-[#1E5BFF] border-t-transparent animate-spin" />
        <div className="text-slate-700 font-bold">
          Traduction vers {meta?.native ?? locale}…
        </div>
        <div className="text-xs text-slate-500">L'interface se met à jour intégralement.</div>
      </div>
    </div>
  );
}

function TranslationErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[90%] rounded-xl bg-rose-600 text-white px-4 py-3 shadow-lg flex items-start gap-3">
      <div className="flex-1">
        <div className="font-bold text-sm">Traduction indisponible</div>
        <div className="text-xs opacity-90 mt-0.5">{message}</div>
      </div>
      <button onClick={onDismiss} className="text-white/90 text-xs font-bold underline">Fermer</button>
    </div>
  );
}

const FALLBACK_CTX: Ctx = {
  locale: 'fr' as Locale,
  setLocale: () => {},
  t: (key, vars) => {
    const v = (dictionaries.fr as Record<string, string>)[key] ?? key;
    return interpolate(v, vars);
  },
  tr: (text) => text,
  dir: 'ltr',
  translating: false,
  translationError: null,
};

export function useT() {
  const ctx = useContext(LocaleContext);
  return ctx ?? FALLBACK_CTX;
}

export function useLocale() {
  return useT();
}

// Hook pratique pour traduire un texte libre (non clé) — par ex. issu d'un fichier de données.
export function useTr(text: string): string {
  const { tr } = useT();
  return tr(text);
}

// Composant <Tr>texte</Tr> pour traduire du texte inline.
export function Tr({ children }: { children: string }) {
  const { tr } = useT();
  return <>{tr(children)}</>;
}
