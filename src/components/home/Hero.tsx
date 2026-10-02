"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FaArrowRight, FaGithub, FaLinkedin } from "react-icons/fa";
import { siteConfig } from "@/config/siteConfig";
import BlurText from "@/components/fx/BlurText";
import Spotlight from "@/components/fx/Spotlight";
import TiltCard, { TiltLayer } from "@/components/fx/TiltCard";
import Magnetic from "@/components/fx/Magnetic";

const ease = [0.22, 1, 0.36, 1] as const;

export interface ProofStat {
  value: string;
  label: string;
}

/**
 * Hero in the language of the references: a centred sans headline on a
 * near-black ground lit by two drifting spotlights over a fading dot grid
 * (Aceternity), words blurring into place (React Bits), one italic serif
 * accent word (21st.dev), a shiny availability pill, a magnetic button with
 * a turning border, and the product itself on a card that tilts toward the
 * pointer.
 */
export default function Hero({ proof }: { proof: ProofStat[] }) {
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay },
  });

  return (
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-16 md:-mt-20 md:px-10 md:pt-40">
      <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
      <Spotlight className="-z-10" />

      <div className="mx-auto max-w-[1200px] text-center">
        <motion.div {...fade(0)} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-3.5 py-1.5 text-xs backdrop-blur">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--green)]" />
            </span>
            <span className="shiny font-medium">Available for work — {siteConfig.owner.location.replace(/\s+\d{5}$/, "")}</span>
          </span>
        </motion.div>

        <h1 className="display mx-auto mt-8 max-w-5xl text-[clamp(2.75rem,7.4vw,6.25rem)]">
          <BlurText text="I build the systems" wordClassName="text-silver pb-[0.08em]" />
          <br />
          <BlurText text="a business" delay={0.32} wordClassName="text-silver pb-[0.08em]" />{" "}
          <BlurText text="runs on." delay={0.48} wordClassName="accent-serif pb-[0.08em]" />
        </h1>

        <motion.p {...fade(0.6)} className="mx-auto mt-7 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-2)" }}>
          I&apos;m {siteConfig.owner.name}, a software engineer who designs and ships enterprise software end to end —
          warehouse, transport, production and sales systems that talk through signed events, share one user
          directory, and report into one dashboard.
        </motion.p>

        <motion.div {...fade(0.72)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <a
              href="#work"
              className="border-spin group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium shadow-[0_0_40px_-10px_rgba(224,168,120,0.6)]"
              style={{ color: "var(--text-1)" }}
            >
              See the work
              <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </Magnetic>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors hover:bg-white/[0.06]"
            style={{ color: "var(--text-2)" }}
          >
            Shop the systems
          </Link>
          <span className="mx-1 hidden h-5 w-px bg-[var(--border-mid)] sm:block" aria-hidden="true" />
          <a href={siteConfig.social.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="rounded-full p-2.5 text-[var(--text-3)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]">
            <FaGithub size={17} />
          </a>
          <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-full p-2.5 text-[var(--text-3)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]">
            <FaLinkedin size={17} />
          </a>
        </motion.div>
      </div>

      {/* The product, on a card that tilts toward the pointer */}
      <motion.div
        className="relative mx-auto mt-16 max-w-[1100px] md:mt-20"
        initial={reduce ? false : { opacity: 0, y: 40, rotateX: 18 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.1, ease, delay: 0.55 }}
        style={{ transformPerspective: 1200 }}
      >
        <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(192,133,82,0.35),transparent)] blur-2xl" aria-hidden="true" />
        <TiltCard className="rounded-[22px] border border-[var(--border-mid)] bg-[var(--surface)] p-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]" max={6}>
          <div className="overflow-hidden rounded-[16px]">
            <Image
              src="/images/showcase/dashboard-executive.png"
              alt="Executive dashboard aggregating all nine systems"
              width={1440}
              height={900}
              priority
              sizes="(min-width: 1100px) 1100px, 95vw"
              className="block h-auto w-full"
            />
          </div>
          <TiltLayer depth={60} className="absolute -bottom-8 -left-4 hidden w-[34%] md:block">
            <div className="overflow-hidden rounded-xl border border-[var(--border-mid)] shadow-2xl">
              <Image src="/images/showcase/pos-terminal.png" alt="Point of sale terminal" width={1440} height={900} sizes="380px" className="block h-auto w-full" />
            </div>
          </TiltLayer>
          <TiltLayer depth={80} className="absolute -right-6 -top-8 hidden w-[30%] md:block">
            <div className="overflow-hidden rounded-xl border border-[var(--border-mid)] shadow-2xl">
              <Image src="/images/showcase/wms-dashboard.png" alt="Warehouse management dashboard" width={1440} height={900} sizes="340px" className="block h-auto w-full" />
            </div>
          </TiltLayer>
        </TiltCard>
      </motion.div>

      {/* Proof strip: real figures */}
      <dl className="mx-auto mt-20 grid max-w-[1100px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-4">
        {proof.map((p) => (
          <div key={p.label} className="flex flex-col-reverse bg-[var(--background)] px-6 py-6 text-center">
            <dt className="eyebrow mt-2">{p.label}</dt>
            <dd className="display text-silver text-4xl md:text-5xl">{p.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
