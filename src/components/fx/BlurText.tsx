"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Words arrive one after another, out of a blur and up into place
 * (React Bits "Blur Text"). Words keep their own spans so the line still
 * wraps naturally; screen readers get the plain sentence once.
 */
export default function BlurText({
  text,
  delay = 0,
  step = 0.08,
  className = "",
  wordClassName = "",
}: {
  text: string;
  delay?: number;
  step?: number;
  className?: string;
  /**
   * Applied to every word. A gradient fill (background-clip: text) has to go
   * here: on a parent it cannot paint into the transformed word layers, and
   * the words would render transparent.
   */
  wordClassName?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden="true"
          className={`inline-block will-change-[filter,transform] ${wordClassName}`}
          initial={reduce ? false : { opacity: 0, filter: "blur(12px)", y: "0.25em" }}
          animate={{ opacity: 1, filter: "blur(0px)", y: "0em" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * step }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
