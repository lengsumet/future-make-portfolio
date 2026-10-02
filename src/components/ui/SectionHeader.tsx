"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Mono label above the heading. */
  eyebrow?: string;
  /** The one italic serif word(s), set after the title in the caramel gradient. */
  accent?: string;
  /** Lets the section point aria-labelledby at the heading. */
  id?: string;
  align?: "left" | "center";
}

/**
 * Section heading in the home page's language: a mono eyebrow, a tight sans
 * headline in the silver fill, one accent-serif phrase, an optional lede.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, eyebrow, accent, id, align = "left" }) => {
  const reduce = useReducedMotion();
  const centered = align === "center";

  return (
    <motion.div
      className={`mb-12 ${centered ? "text-center" : ""}`}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="display text-silver mt-3 pb-[0.08em] text-[clamp(2.25rem,5vw,4rem)]">
        {title}
        {accent && (
          <>
            {" "}
            <span className="accent-serif">{accent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className={`mt-4 max-w-xl text-base leading-relaxed text-[var(--text-2)] ${centered ? "mx-auto" : ""}`}>{subtitle}</p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
