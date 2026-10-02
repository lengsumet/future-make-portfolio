"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up to its value the first time it scrolls into view (Magic UI
 * "Number Ticker"). The final value is in the markup from the start, so it
 * is correct without JavaScript and for screen readers.
 */
export default function NumberTicker({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

  useEffect(() => {
    if (!inView || reduce) return;
    setShown(0);
    const controls = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: setShown });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={fmt(value)}>
      <span aria-hidden="true">{fmt(shown)}</span>
    </span>
  );
}
