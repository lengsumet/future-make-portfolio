"use client";

import { useRef, useState } from "react";
import Image from "next/image";

/**
 * A portrait with a hidden second image. A mouse or pen reveals it inside a
 * glowing circle that follows the pointer; a click or tap floods it across the
 * whole frame from that point; the caller owns that state. Touch gets tap only,
 * so the page still scrolls over the photo. Position lives in CSS variables,
 * so no re-render per move.
 */
export default function RevealPortrait({
  src,
  revealSrc,
  alt,
  revealAlt,
  sizes,
  revealed,
  onToggle,
}: {
  src: string;
  revealSrc: string;
  alt: string;
  revealAlt: string;
  sizes: string;
  revealed: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);

  const track = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ry", `${e.clientY - r.top}px`);
  };
  const isMouse = (e: React.PointerEvent) => e.pointerType !== "touch";

  return (
    <button
      ref={ref}
      type="button"
      data-hover={hover}
      data-revealed={revealed}
      aria-pressed={revealed}
      aria-label={revealed ? "Return to normal form and theme" : "Reveal Naga form and theme"}
      onPointerEnter={(e) => { if (isMouse(e)) { track(e); setHover(true); } }}
      onPointerMove={(e) => { if (isMouse(e)) track(e); }}
      onPointerLeave={() => setHover(false)}
      onPointerDown={track}
      onClick={onToggle}
      className={`reveal relative block aspect-[4/5] w-full overflow-hidden rounded-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-3)] ${
        hover && !revealed ? "cursor-none" : "cursor-pointer"
      }`}
    >
      <Image src={src} alt={alt} fill priority sizes={sizes} className="object-cover object-top" />
      <Image src={revealSrc} alt={revealAlt} fill sizes={sizes} className="reveal-layer object-cover object-top" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgb(var(--bg-rgb)/0.8)] to-transparent" aria-hidden="true" />
      <span className="reveal-lens" aria-hidden="true" />
      <span
        className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur transition-colors ${
          revealed
            ? "border-[var(--accent-border)] bg-[rgb(var(--accent-rgb)/0.25)] text-[var(--text-1)]"
            : "border-[var(--border-mid)] bg-black/40 text-[var(--text-2)]"
        }`}
        aria-hidden="true"
      >
        ✦ {revealed ? "Naga form" : "Reveal"}
      </span>
    </button>
  );
}
