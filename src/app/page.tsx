"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SiReact, SiTypescript, SiSharp, SiPython,
  SiGo, SiPostgresql, SiDocker,
} from "react-icons/si";
import { FaAws, FaGithub, FaLinkedin, FaArrowRight, FaChevronDown } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import CatWidget from "@/components/animations/CatWidget";

/* ── static data ──────────────────────────────────── */
const tech = [
  { name: "React / Next.js", icon: SiReact,      color: "#61DAFB" },
  { name: "TypeScript",      icon: SiTypescript, color: "#3178C6" },
  { name: "C# / .NET",       icon: SiSharp,      color: "#239120" },
  { name: "Python",          icon: SiPython,     color: "#3776AB" },
  { name: "Golang",          icon: SiGo,         color: "#00ADD8" },
  { name: "PostgreSQL",      icon: SiPostgresql, color: "#4169E1" },
  { name: "Docker",          icon: SiDocker,     color: "#2496ED" },
  { name: "AWS",             icon: FaAws,        color: "#FF9900" },
];

const featured = [
  {
    slug: "insurance-platform-api",
    href: "/shop/insurance-platform-api",
    category: "Enterprise / API",
    title: "Insurance & Fintech Platform",
    description: "High-concurrency workflow engine for financial transaction lifecycle. Real-time third-party API integrations, policy management, and granular access control.",
    tags: [".NET Core 8", "C#", "React", "PostgreSQL", "Docker"],
    accent: "from-emerald-500/10 to-transparent",
    dot: "#10b981",
    external: false,
  },
  {
    slug: "ecommerce-suite",
    href: process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3001",
    category: "Full-Stack / Live Demo",
    title: "E-Commerce Store",
    description: "Full e-commerce platform with product catalog, cart, PromptPay QR checkout, coupon system, and admin dashboard with weekly/monthly/yearly sales reports + CSV export.",
    tags: ["Next.js 15", "Prisma", "NextAuth", "Zustand", "Recharts"],
    accent: "from-emerald-500/10 to-transparent",
    dot: "#10b981",
    external: true,
  },
];

const stats = [
  { value: "3+",  label: "Years experience" },
  { value: "10+", label: "Projects shipped" },
  { value: "15",  label: "Technologies" },
];

/* ── animation presets ───────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

/* ── page ─────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="relative">

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">

        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          {/* Aurora glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]
            bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)]" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: "radial-gradient(rgba(16,185,129,0.2) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent)",
            }} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl w-full">

          {/* Available badge */}
          <motion.div {...fadeUp(0)} className="mb-7 flex justify-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
              bg-green-500/8 border border-green-500/20 text-green-400 text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Available for opportunities
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            {...fadeUp(0.08)}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 leading-none"
          >
            Sumet Buarod
          </motion.h1>

          {/* Title */}
          <motion.p {...fadeUp(0.15)} className="text-lg md:text-xl text-emerald-300 mb-6 font-medium">
            Software Engineer — Distributed Systems &amp; Cloud-Native
          </motion.p>

          {/* Bio */}
          <motion.p {...fadeUp(0.22)} className="text-gray-500 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            Building scalable distributed systems and cloud-native architectures.
            Expert in C#, .NET Core, Python, Golang, and React/Next.js.
          </motion.p>

          {/* CTAs + social */}
          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/showcase">
              <Button variant="primary" size="lg">Explore My Work</Button>
            </Link>
            <Link href="/shop">
              <Button variant="secondary" size="lg">Shop Templates</Button>
            </Link>
          </motion.div>

          {/* Social links */}
          <motion.div {...fadeUp(0.36)} className="flex items-center justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-gray-300 transition-colors duration-200"
            >
              <FaGithub size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-gray-300 transition-colors duration-200"
            >
              <FaLinkedin size={18} />
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-700"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <FaChevronDown size={13} />
        </motion.div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════ */}
      <section className="border-y border-gray-900/80 py-10">
        <div className="max-w-2xl mx-auto px-6 grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-white tracking-tight">{s.value}</p>
              <p className="text-xs text-gray-600 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ TECH STACK ══════════════════════════════════════ */}
      <section className="py-20 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] uppercase tracking-[0.2em] text-gray-700 mb-8"
        >
          Tech Stack
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {tech.map((t) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.name}
                variants={{
                  hidden: { opacity: 0, scale: 0.85 },
                  show:   { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
                }}
                whileHover={{ y: -2, scale: 1.04 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl
                  bg-gray-900/50 border border-gray-800/40 hover:border-gray-700/60
                  text-[12px] text-gray-500 hover:text-gray-300
                  transition-colors duration-200 cursor-default"
              >
                <Icon size={13} style={{ color: t.color }} />
                {t.name}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ══ FEATURED WORK ════════════════════════════════════ */}
      <section className="py-6 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-lg font-semibold text-white">Featured Work</h2>
            <Link
              href="/showcase"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-400 transition-colors duration-200 group"
            >
              View all
              <FaArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((item, i) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              >
                <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} className="block group">
                  <div className="relative overflow-hidden rounded-2xl border border-gray-800/40
                    bg-gray-900/40 hover:border-gray-700/50 hover:bg-gray-900/60
                    hover:-translate-y-1 transition-all duration-300 p-6 h-full">

                    {/* Accent gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

                    {/* Dot + category */}
                    <div className="flex items-center gap-2 mb-4 relative">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.dot }} />
                      <span className="text-[10px] uppercase tracking-widest text-gray-600">{item.category}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-white mb-2 relative
                      group-hover:text-emerald-300 transition-colors duration-200">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[12px] text-gray-600 leading-relaxed mb-5 relative line-clamp-3">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 relative">
                      {item.tags.map((tag) => (
                        <span key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800/60 text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Arrow / External badge */}
                    <div className="absolute bottom-5 right-5 flex items-center gap-1.5">
                      {item.external && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">LIVE</span>
                      )}
                      <span className="text-gray-700 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200">
                        <FaArrowRight size={11} />
                      </span>
                    </div>
                  </div>
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
