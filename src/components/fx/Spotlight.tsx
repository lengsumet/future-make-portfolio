"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Two soft cones of light from the top corners that drift slowly
 * (Aceternity "Spotlight New"), tinted with the caramel accent. Purely
 * decorative and behind everything.
 */
export default function Spotlight({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const cone = (side: "left" | "right") => ({
    background:
      side === "left"
        ? "radial-gradient(68% 68% at 55% 31%, rgb(var(--accent-3-rgb)/0.16) 0, rgb(var(--accent-rgb)/0.05) 50%, transparent 80%)"
        : "radial-gradient(68% 68% at 45% 31%, rgb(var(--cream-rgb)/0.10) 0, rgb(var(--accent-3-rgb)/0.04) 50%, transparent 80%)",
  });
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <motion.div
        className="absolute -top-[30%] -left-[10%] h-[140%] w-[60%] -rotate-45"
        style={cone("left")}
        animate={reduce ? undefined : { x: [0, 80, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-[30%] -right-[10%] h-[140%] w-[60%] rotate-45"
        style={cone("right")}
        animate={reduce ? undefined : { x: [0, -80, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </div>
  );
}
