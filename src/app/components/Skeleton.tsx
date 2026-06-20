import { HTMLAttributes } from 'react';

/**
 * Squelette de chargement — bloc gris animé qui réserve la place du contenu
 * pendant le fetch. Préférer aux spinners pour les listes, cards, profils.
 *
 * Respecte `prefers-reduced-motion` via la règle CSS globale.
 */
export function Skeleton({ className = '', style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-xl bg-slate-200/70 ${className}`}
      style={style}
      {...rest}
    >
      <div
        className="absolute inset-0 -translate-x-full hp-skeleton-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
        }}
      />
    </div>
  );
}

/** Ligne de texte. */
export function SkeletonLine({ w = '100%', className = '' }: { w?: string | number; className?: string }) {
  return <Skeleton className={`h-3 ${className}`} style={{ width: w }} />;
}

/** Avatar/rond. */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton className="rounded-full" style={{ width: size, height: size }} />;
}

/** Carte générique : avatar + 2 lignes. Utile pour listes de pros, RDV, etc. */
export function SkeletonCard() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex items-center gap-3 p-4 bg-white rounded-2xl ring-1 ring-slate-100"
    >
      <span className="sr-only">Chargement…</span>
      <SkeletonAvatar size={48} />
      <div className="flex-1 space-y-2">
        <SkeletonLine w="60%" />
        <SkeletonLine w="40%" />
      </div>
    </div>
  );
}

/** Liste de N cartes squelettes. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
