import React from "react";

/**
 * Placeholder blocks shown while data is on its way.
 *
 * Uses the .skeleton-luxury sweep already defined in globals.css, which
 * nothing had been using — every loading state in the app had rolled its own
 * animate-pulse box, so they shimmered differently from one screen to the
 * next, and the screens that fetch without one showed an empty table as though
 * there were nothing to see.
 *
 * The sweep stops under prefers-reduced-motion; globals.css handles that.
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return <div aria-hidden className={`skeleton-luxury ${className}`} {...props} />;
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
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-24" />
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
      <div className="flex gap-4 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
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
