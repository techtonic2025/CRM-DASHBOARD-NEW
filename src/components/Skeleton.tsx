export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-card)] rounded-xl border border-[var(--bg-border)]/50 ${className}`}
    />
  )
}
