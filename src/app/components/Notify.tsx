import { Toaster, toast } from 'sonner';

/**
 * Toaster centralisé Healthy Page (basé sur Sonner).
 * À monter une seule fois au niveau App.
 */
export function HpToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand={false}
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl ring-1 ring-slate-200 shadow-lg',
          title: 'font-bold',
        },
      }}
    />
  );
}

/**
 * Helper unifié — préfère `notify.*` au lieu de `toast()` direct pour pouvoir
 * centraliser plus tard (analytics, throttling, traduction).
 */
export const notify = {
  success: (msg: string, opts?: Parameters<typeof toast.success>[1]) => toast.success(msg, opts),
  error:   (msg: string, opts?: Parameters<typeof toast.error>[1])   => toast.error(msg, opts),
  info:    (msg: string, opts?: Parameters<typeof toast.message>[1]) => toast.message(msg, opts),
  warning: (msg: string, opts?: Parameters<typeof toast.warning>[1]) => toast.warning(msg, opts),
  loading: (msg: string, opts?: Parameters<typeof toast.loading>[1]) => toast.loading(msg, opts),
  dismiss: (id?: string | number) => toast.dismiss(id),
  /** Affiche le détail d'une ApiError avec un message lisible. */
  apiError: (e: unknown, fallback = 'Une erreur est survenue.') => {
    const msg = (e instanceof Error && e.message) ? e.message : fallback;
    toast.error(msg);
  },
};
