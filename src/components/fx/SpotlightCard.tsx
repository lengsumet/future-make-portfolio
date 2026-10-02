"use client";

import { useRef } from "react";

/**
 * A card with a soft light that follows the pointer across its surface and
 * lights its border on the way (React Bits "Spotlight Card", Aceternity
 * "Card Spotlight"). Pure CSS variables, so no re-render per mouse move.
 */
export default function SpotlightCard({
  children,
  className = "",
  color = "rgba(224, 168, 120, 0.16)",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={`group/spot relative overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] transition-colors duration-300 hover:border-[var(--border-mid)] ${className}`}
      style={{ ["--spot" as string]: color }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), var(--spot), transparent 60%)" }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
