import React from "react";

/**
 * Placeholder blocks shown while data is on its way.
 *
 * A faint cream wash with a highlight sweeping across it, reusing the
 * `skeleton-sweep` keyframes from globals.css so every loading state in the
 * app shimmers the same way.
 *
 * The sweep stops under prefers-reduced-motion; globals.css handles that.
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const sweep: React.CSSProperties = {
  backgroundImage: "linear-gradient(90deg, transparent 25%, rgba(255, 248, 240, 0.06) 50%, transparent 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-sweep 1.6s ease-in-out infinite",
};

export function Skeleton({ className = "", style, ...props }: SkeletonProps) {
  // Default corner only when the caller has not chosen one: two radius
  // utilities on one element resolve by stylesheet order, not class order.
  const radius = /\brounded/.test(className) ? "" : "rounded-lg";
  return <div aria-hidden className={`${radius} bg-white/[0.05] ${className}`} style={{ ...sweep, ...style }} {...props} />;
}

/** A run of text lines, the last one short so it reads as a paragraph. */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/** Stand-in for a metric card: small caption over a big number. */
export function SkeletonStat({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="mt-6 h-9 w-28" />
      <Skeleton className="mt-3 h-3 w-16" />
    </div>
  );
}

/**
 * Stand-in for a table. Takes the real column count so the placeholder lines
 * up with what replaces it and the layout does not jump on arrival.
 */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      <div className="flex gap-4 px-6 py-3.5">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-t border-[var(--border)] px-6 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Announces to a screen reader that something is loading. The blocks above are
 * aria-hidden — a shimmering rectangle means nothing read aloud — so without
 * this the wait is silent.
 */
export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
