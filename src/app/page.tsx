"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  SiReact, SiTypescript, SiSharp, SiPython,
  SiGo, SiPostgresql, SiDocker,
} from "react-icons/si";
import { FaAws, FaGithub, FaLinkedin, FaArrowRight } from "react-icons/fa";
import CatWidget from "@/components/animations/CatWidget";

/* ── data ─────────────────────────────────────────── */
const tech = [
  { name: "React / Next.js", icon: SiReact,      color: "#61DAFB" },
  { name: "TypeScript",      icon: SiTypescript, color: "#818cf8" },
  { name: "C# / .NET",       icon: SiSharp,      color: "#a78bfa" },
  { name: "Python",          icon: SiPython,     color: "#67e8f9" },
  { name: "Golang",          icon: SiGo,         color: "#22d3ee" },
  { name: "PostgreSQL",      icon: SiPostgresql, color: "#818cf8" },
  { name: "Docker",          icon: SiDocker,     color: "#67e8f9" },
  { name: "AWS",             icon: FaAws,        color: "#fbbf24" },
];

const featured = [
  {
    slug: "insurance-platform-api",
    href: "/shop/insurance-platform-api",
    category: "Enterprise / API",
    title: "Insurance & Fintech Platform",
    description: "High-concurrency workflow engine for financial transaction lifecycle. Real-time third-party API integrations, policy management, and granular access control.",
    tags: [".NET Core 8", "C#", "React", "PostgreSQL", "Docker"],
    external: false,
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    border: "group-hover:border-indigo-500/30",
  },
  {
    slug: "ecommerce-suite",
    href: process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3001",
    category: "Full-Stack / Live Demo",
    title: "E-Commerce Store",
    description: "Full e-commerce platform with product catalog, cart, PromptPay QR checkout, coupon system, and admin dashboard with weekly/monthly/yearly sales reports.",
    tags: ["Next.js 15", "Prisma", "NextAuth", "Zustand", "Recharts"],
    external: true,
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    border: "group-hover:border-cyan-500/30",
  },
];

const stats = [
  { value: "3+",  label: "Years" },
  { value: "10+", label: "Projects" },
  { value: "15",  label: "Technologies" },
];

/* ── animation helpers ───────────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 32 },
  animate:    { opacity: 1, y: 0 },
  transition: { ...spring, delay },
});

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { ...spring } },
};

/* ── page ─────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY   = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOp  = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div style={{ background: "var(--background)" }}>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">

        {/* Aurora mesh background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Primary aurora blob */}
          <motion.div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(ellipse, #6366f1 0%, #8b5cf6 30%, transparent 70%)",
              filter: "blur(80px)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.35, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Secondary cyan blob */}
          <motion.div
            className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse, #06b6d4 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{ scale: [1, 1.12, 1], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center max-w-4xl w-full"
          style={{ y: heroY, opacity: heroOp }}
        >
          {/* Available badge */}
          <motion.div {...fadeUp(0)} className="mb-8 flex justify-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#86efac",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Available for opportunities
            </span>
          </motion.div>

          {/* Name — huge, gradient */}
          <motion.h1
            {...fadeUp(0.08)}
            className="text-gradient-subtle font-bold tracking-tight leading-none mb-6"
            style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
          >
            Sumet Buarod
          </motion.h1>

          {/* Role */}
          <motion.p
            {...fadeUp(0.16)}
            className="text-lg md:text-xl mb-5 font-medium"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Software Engineer —{" "}
            <span className="text-gradient" style={{ fontStyle: "normal" }}>
              Distributed Systems &amp; Cloud-Native
            </span>
          </motion.p>

          {/* Bio */}
          <motion.p
            {...fadeUp(0.22)}
            className="text-sm md:text-base leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Building scalable distributed systems and cloud-native architectures.
            Expert in C#, .NET Core, Python, Golang, and React/Next.js.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.28)} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 glow-accent"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Explore My Work
              <FaArrowRight size={11} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              Shop Templates
            </Link>
          </motion.div>

          {/* Social + stats */}
          <motion.div {...fadeUp(0.34)} className="flex items-center justify-center gap-6">
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.25)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              className="transition-colors duration-150">
              <FaGithub size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.25)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              className="transition-colors duration-150">
              <FaLinkedin size={18} />
            </a>
            <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", display: "inline-block" }} />
            {stats.map((s, i) => (
              <span key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{s.value}</span> {s.label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="w-px h-10 rounded-full"
            style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.6), transparent)" }}
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ══ TECH STACK ══════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] uppercase tracking-[0.22em] mb-8"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Tech Stack
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {tech.map((t) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.name}
                variants={itemAnim}
                whileHover={{ y: -3, scale: 1.06 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] cursor-default transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.4)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.35)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <Icon size={13} style={{ color: t.color, flexShrink: 0 }} />
                {t.name}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══ FEATURED WORK ════════════════════════════════════ */}
      <section className="py-6 pb-28 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8 pt-16"
          >
            <h2 className="text-lg font-semibold" style={{ color: "#fff" }}>Featured Work</h2>
            <Link
              href="/showcase"
              className="flex items-center gap-1.5 text-xs transition-colors duration-200 group"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              View all
              <FaArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((item, i) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ...spring, delay: i * 0.1 }}
              >
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="block group h-full"
                >
                  <motion.div
                    className={`relative overflow-hidden rounded-2xl p-6 h-full transition-all duration-300 ${item.border}`}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                    }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none`} />

                    {/* Category */}
                    <div className="flex items-center gap-2 mb-4 relative">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {item.category}
                      </span>
                      {item.external && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
                          style={{ background: "rgba(34,197,94,0.12)", color: "#86efac" }}>
                          Live
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold mb-2 relative transition-colors duration-200"
                      style={{ color: "#fff" }}>
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[12px] leading-relaxed mb-5 relative line-clamp-3"
                      style={{ color: "rgba(255,255,255,0.3)" }}>
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 relative">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-5 right-5">
                      <motion.span
                        className="block"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                        whileHover={{ x: 3, color: "#818cf8" }}
                      >
                        <FaArrowRight size={11} />
                      </motion.span>
                    </div>
                  </motion.div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CAT WIDGET ══════════════════════════════════ */}
      <CatWidget />
    </div>
  );
}
