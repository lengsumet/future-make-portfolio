"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

export interface WorkItem {
  slug: string;
  name: string;
  expansion: string | null;
  description: string;
  tags: string[];
  image: string | null;
  liveUrl: string | null;
}

/**
 * The work as a numbered index, the most common portfolio pattern on
 * godly.design: one row per project on hairline rules, the name set large,
 * and a screenshot that follows the cursor while a row is hovered. On touch
 * screens, where there is no hover, each row shows its thumbnail inline.
 */
export default function WorkIndex({ items }: { items: WorkItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [finePointer, setFinePointer] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    x.set(e.clientX + 28);
    y.set(e.clientY - 120);
  };

  const preview = active !== null ? items[active] : null;

  return (
    <section id="work" ref={sectionRef} className="px-5 md:px-10 py-24 md:py-32 scroll-mt-20" onMouseMove={finePointer ? onMove : undefined}>
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">(02) Selected work</p>
            <h2 className="display mt-4 text-[clamp(2.5rem,6vw,5.5rem)]" style={{ color: "var(--text-1)" }}>
              Nine systems, <em className="italic" style={{ color: "var(--accent-3)" }}>one platform.</em>
            </h2>
          </div>
          <p className="eyebrow max-w-xs text-right normal-case tracking-normal">
            Each one is live, seeded with demo data, and sold with its source.
          </p>
        </div>

        <ol className="mt-14 border-t" style={{ borderColor: "var(--border-mid)" }} onMouseLeave={() => setActive(null)}>
          {items.map((item, i) => (
            <li
              key={item.slug}
              className="group relative border-b transition-colors duration-300 hover:bg-white/[0.025]"
              style={{ borderColor: "var(--border-mid)" }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              {/* The whole row opens the project for a mouse. Hidden from
                  keyboards and screen readers, which use the title link; it
                  sits under the content so the Live link keeps its own target. */}
              <Link href={`/shop/${item.slug}`} className="absolute inset-0" tabIndex={-1} aria-hidden="true" />
              <div className="pointer-events-none relative grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_auto] items-baseline gap-x-4 py-6 md:py-8">
                <span className="font-mono text-xs transition-colors duration-300 group-hover:text-[var(--accent-3)]" style={{ color: "var(--text-4)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-3">
                  <h3 className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <Link href={`/shop/${item.slug}`} className="pointer-events-auto display text-[clamp(2rem,4.6vw,4rem)] focus-visible:underline" style={{ color: "var(--text-1)" }}>
                      {item.name}
                    </Link>
                    {item.expansion && (
                      <span className="text-sm md:text-base" style={{ color: "var(--text-3)" }}>
                        {item.expansion}
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-3)" }}>
                    {item.description}
                  </p>
                  {item.image && (
                    <div className="mt-4 overflow-hidden rounded-lg border md:hidden" style={{ borderColor: "var(--border-mid)" }}>
                      <Image src={item.image} alt="" width={1440} height={900} sizes="90vw" className="h-auto w-full" />
                    </div>
                  )}
                </div>

                <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 flex flex-wrap items-center gap-2 md:justify-end md:self-center">
                  {item.tags.map((tag) => (
                    <span key={tag} className="font-mono text-2xs rounded-full border px-2.5 py-1" style={{ borderColor: "var(--border-mid)", color: "var(--text-3)" }}>
                      {tag}
                    </span>
                  ))}
                  {item.liveUrl && (
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="pointer-events-auto ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-2xs transition-colors hover:bg-[var(--accent-bg)]"
                      style={{ color: "var(--accent-3)" }}
                      aria-label={`Open the live ${item.name} demo`}
                    >
                      Live ↗
                    </a>
                  )}
                  <FaArrowRight size={12} className="ml-2 hidden md:block transition-transform duration-300 group-hover:translate-x-1" style={{ color: "var(--text-4)" }} aria-hidden="true" />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Cursor-following preview, decorative: the row carries the name. */}
      {finePointer && !reduce && (
        <motion.div className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block" style={{ x: sx, y: sy }} aria-hidden="true">
          <AnimatePresence>
            {preview?.image && (
              <motion.div
                key={preview.slug}
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-[400px] overflow-hidden rounded-xl border shadow-2xl"
                style={{ borderColor: "var(--border-mid)", background: "var(--surface)" }}
              >
                <Image src={preview.image} alt="" width={1440} height={900} sizes="400px" className="block h-auto w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
