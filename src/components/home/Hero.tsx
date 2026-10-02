"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FaArrowDown, FaArrowRight, FaGithub, FaLinkedin } from "react-icons/fa";
import { siteConfig } from "@/config/siteConfig";

const ease = [0.22, 1, 0.36, 1] as const;

/** One masked line of the headline, rising into place. */
function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const SHOTS = [
  { src: "/images/showcase/dashboard-executive.png", alt: "Executive dashboard aggregating all nine systems" },
  { src: "/images/showcase/wms-dashboard.png", alt: "Warehouse management dashboard" },
  { src: "/images/showcase/pos-terminal.png", alt: "Point of sale terminal" },
];

export interface ProofStat {
  value: string;
  label: string;
}

export default function Hero({ proof }: { proof: ProofStat[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);

  return (
    <section ref={ref} className="relative px-5 md:px-10 pt-10 md:pt-6 pb-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Meta row: what, where, availability */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 eyebrow"
          style={{ borderColor: "var(--border-mid)" }}
        >
          <span>(01) — {siteConfig.owner.title}</span>
          <span className="hidden md:inline">Distributed systems · Cloud-native · Enterprise</span>
          <span className="inline-flex items-center gap-2" style={{ color: "var(--green)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse" aria-hidden="true" />
            Available for work
          </span>
        </motion.div>

        {/* Headline */}
        <h1
          className="display mt-8 md:mt-10 text-[clamp(3.4rem,10.2vw,10.5rem)]"
          style={{ color: "var(--text-1)" }}
        >
          <Line delay={0.15}>I build the systems</Line>
          <Line delay={0.27}>
            a business <em className="italic" style={{ color: "var(--accent-3)" }}>runs on.</em>
          </Line>
        </h1>

        <div className="mt-10 md:mt-12 grid gap-10 md:grid-cols-12 md:items-start">
          {/* Introduction and actions */}
          <motion.div
            className="md:col-span-5 md:pt-2"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.45 }}
          >
            <p className="max-w-md text-base md:text-lg leading-relaxed" style={{ color: "var(--text-2)" }}>
              I&apos;m {siteConfig.owner.name}. I design and ship enterprise software end to end —
              warehouse, transport, production and sales systems that talk to each other through
              signed events, share one user directory, and report into one dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                className="group inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium transition-colors"
                style={{ background: "var(--text-1)", color: "var(--background)" }}
              >
                See the work
                <FaArrowDown size={11} className="transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </a>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ borderColor: "var(--border-strong-visible)", color: "var(--text-1)" }}
              >
                Shop the systems
                <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <span className="mx-1 hidden h-5 w-px sm:block" style={{ background: "var(--border-mid)" }} aria-hidden="true" />
              <a href={siteConfig.social.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="p-2 transition-colors hover:text-[var(--text-1)]" style={{ color: "var(--text-3)" }}>
                <FaGithub size={18} />
              </a>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-2 transition-colors hover:text-[var(--text-1)]" style={{ color: "var(--text-3)" }}>
                <FaLinkedin size={18} />
              </a>
            </div>
          </motion.div>

          {/* Framed product imagery, inside the page margin */}
          <motion.figure
            className="md:col-span-7"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.35 }}
          >
            <div
              className="relative aspect-[16/11] overflow-hidden rounded-[22px] border"
              style={{
                borderColor: "var(--border-mid)",
                background: "radial-gradient(120% 90% at 85% 10%, rgba(192,133,82,0.28), transparent 60%), var(--surface)",
              }}
            >
              <motion.div style={{ y: backY }} className="absolute left-[6%] top-[9%] w-[72%] overflow-hidden rounded-xl border border-[var(--border-mid)] shadow-2xl">
                <Image src={SHOTS[0].src} alt={SHOTS[0].alt} width={1440} height={900} priority sizes="(min-width: 768px) 40vw, 90vw" className="block h-auto w-full" />
              </motion.div>
              <motion.div style={{ y: frontY }} className="absolute right-[5%] top-[34%] w-[46%] rotate-[2deg] overflow-hidden rounded-xl border border-[var(--border-mid)] shadow-2xl">
                <Image src={SHOTS[1].src} alt={SHOTS[1].alt} width={1440} height={900} sizes="(min-width: 768px) 26vw, 60vw" className="block h-auto w-full" />
              </motion.div>
              <motion.div style={{ y: frontY }} className="absolute bottom-[-6%] left-[14%] w-[38%] -rotate-[3deg] overflow-hidden rounded-xl border border-[var(--border-mid)] shadow-2xl">
                <Image src={SHOTS[2].src} alt={SHOTS[2].alt} width={1440} height={900} sizes="(min-width: 768px) 22vw, 50vw" className="block h-auto w-full" />
              </motion.div>
            </div>
            <figcaption className="eyebrow mt-3 flex justify-between gap-4 normal-case tracking-normal">
              <span>fig. 01 — Executive dashboard, warehouse, point of sale</span>
              <span className="hidden sm:inline">live on Vercel</span>
            </figcaption>
          </motion.figure>
        </div>

        {/* Proof strip: real figures, not adjectives */}
        <dl className="mt-16 grid grid-cols-2 md:grid-cols-4 border-t" style={{ borderColor: "var(--border-mid)" }}>
          {proof.map((p, i) => (
            <div
              key={p.label}
              className={`py-6 pr-4 ${i % 2 === 1 ? "pl-4 md:pl-6" : "md:pl-6"} ${i === 0 ? "md:pl-0" : ""} ${i > 0 ? "md:border-l" : ""} ${i % 2 === 1 ? "border-l md:border-l" : ""}`}
              style={{ borderColor: "var(--border-mid)" }}
            >
              <dt className="eyebrow">{p.label}</dt>
              <dd className="display mt-2 text-5xl md:text-6xl" style={{ color: "var(--text-1)" }}>{p.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
