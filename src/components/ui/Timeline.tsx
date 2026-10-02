"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import SpotlightCard from "@/components/fx/SpotlightCard";

export interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
  /** Optional mono label, e.g. "Work" or "Education". */
  tag?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const ease = [0.22, 1, 0.36, 1] as const;

/** A long description reads better as its sentences; every word is kept. */
function sentences(text: string): string[] {
  const parts = text.split(/\.\s+(?=[A-Z])/);
  return parts.map((s, i) => (i < parts.length - 1 ? `${s}.` : s)).filter(Boolean);
}

/**
 * Vertical timeline whose rail fills with a glowing caramel line as the
 * section scrolls past (Aceternity "Timeline"). Period on the left at md+,
 * above the card on mobile; each entry is a SpotlightCard.
 *
 * Rail geometry: the rail, its fill and every dot share one centre line,
 * 12.5px from the left on mobile and 220.5px at md+.
 */
const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative">
      <div aria-hidden="true" className="absolute bottom-2 left-[12px] top-2 w-px bg-[var(--border-mid)] md:left-[220px]" />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-2 left-[11.5px] top-2 w-[2px] origin-top rounded-full bg-gradient-to-b from-[var(--accent-fg)] via-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_14px_2px_rgba(224,168,120,0.45)] md:left-[219.5px]"
        style={{ scaleY: reduce ? 1 : fill }}
      />

      <ol className="space-y-12 md:space-y-16">
        {items.map((item) => (
          <li key={`${item.title}-${item.period}`} className="relative grid md:grid-cols-[220px_1fr]">
            <span
              aria-hidden="true"
              className="absolute left-[5.5px] top-px h-[14px] w-[14px] rounded-full border border-[var(--accent-border)] bg-[var(--background)] md:left-[213.5px] md:top-[34px]"
            >
              <motion.span
                className="absolute inset-[3px] rounded-full bg-[var(--accent-3)] shadow-[0_0_12px_3px_rgba(224,168,120,0.6)]"
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                transition={{ duration: 0.5, ease }}
              />
            </span>

            <div className="pl-10 md:pl-0 md:pr-10 md:pt-8 md:text-right">
              <p className="font-mono text-xs text-[var(--accent-3)]">{item.period}</p>
              {item.tag && <p className="eyebrow mt-1.5">{item.tag}</p>}
            </div>

            <motion.div
              className="mt-4 pl-10 md:mt-0"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease }}
            >
              <SpotlightCard className="p-6 md:p-8">
                <h3 className="text-lg font-medium text-[var(--text-1)] md:text-xl">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--accent-3)]">{item.subtitle}</p>
                <ul className="mt-5 space-y-2.5">
                  {sentences(item.description).map((line) => (
                    <li key={line} className="flex gap-3 text-sm leading-relaxed text-[var(--text-2)]">
                      <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-[var(--accent)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Timeline;
