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
        ? "radial-gradient(68% 68% at 55% 31%, rgba(224,168,120,0.16) 0, rgba(192,133,82,0.05) 50%, transparent 80%)"
        : "radial-gradient(68% 68% at 45% 31%, rgba(255,248,240,0.10) 0, rgba(224,168,120,0.04) 50%, transparent 80%)",
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
