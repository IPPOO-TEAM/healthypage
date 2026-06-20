export function HealthyPage({ className = '' }: { className?: string }) {
  return (
    <strong className={`font-bold bg-gradient-to-br from-rose-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent ${className}`}>
      HEALTHY PAGE
    </strong>
  );
}
