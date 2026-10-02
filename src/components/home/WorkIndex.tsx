"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import SpotlightCard from "@/components/fx/SpotlightCard";

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
 * The work as a grid of spotlight cards (React Bits "Spotlight Card"):
 * each with its screenshot, which zooms slightly on hover while a light
 * follows the pointer. The first card is wide, so the grid reads as a
 * composed layout rather than a catalogue.
 *
 * The card's title link is stretched over the whole card for the pointer;
 * the Live link sits above it with its own destination.
 */
export default function WorkIndex({ items }: { items: WorkItem[] }) {
  const reduce = useReducedMotion();

  return (
    <section id="work" className="scroll-mt-24 px-5 py-24 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="display text-silver mt-3 text-[clamp(2.25rem,5vw,4rem)]">
              Nine systems, <span className="accent-serif">one platform.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
            Each one is live with demo data, and sold with its full source code.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.li
              key={item.slug}
              className={i === 0 ? "md:col-span-2" : ""}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.06 }}
            >
              <SpotlightCard className="group h-full">
                <div className="flex h-full flex-col">
                  {item.image && (
                    <div className="relative m-2 mb-0 aspect-[16/9] overflow-hidden rounded-[14px] border border-[var(--border)]">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes={i === 0 ? "(min-width: 1024px) 800px, 95vw" : "(min-width: 1024px) 400px, 95vw"}
                        className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--surface)] to-transparent" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5 pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="display text-2xl" style={{ color: "var(--text-1)" }}>
                        <span className="mr-2 font-mono text-xs font-normal tracking-normal" style={{ color: "var(--accent-3)" }} aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <Link href={`/shop/${item.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:underline">
                          {item.name}
                        </Link>
                      </h3>
                      <FaArrowRight size={12} className="shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" style={{ color: "var(--accent-3)" }} aria-hidden="true" />
                    </div>
                    {item.expansion && (
                      <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
                        {item.expansion}
                      </p>
                    )}
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                      {item.description}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-2xs" style={{ color: "var(--text-3)" }}>
                          {tag}
                        </span>
                      ))}
                      {item.liveUrl && (
                        <a
                          href={item.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative z-10 ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-0.5 font-mono text-2xs transition-colors hover:bg-[rgba(192,133,82,0.2)]"
                          style={{ color: "var(--accent-3)" }}
                          aria-label={`Open the live ${item.name} demo`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" aria-hidden="true" />
                          Live ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
