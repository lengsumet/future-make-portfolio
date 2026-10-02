"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FaCamera, FaMountain, FaGamepad, FaUtensils,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin,
  FaDesktop, FaServer, FaCloud, FaProjectDiagram, FaCode,
} from "react-icons/fa";
import { siteConfig } from "@/config/siteConfig";
import BlurText from "@/components/fx/BlurText";
import Spotlight from "@/components/fx/Spotlight";
import SpotlightCard from "@/components/fx/SpotlightCard";
import TiltCard, { TiltLayer } from "@/components/fx/TiltCard";
import NumberTicker from "@/components/fx/NumberTicker";
import SectionHeader from "@/components/ui/SectionHeader";
import Timeline, { type TimelineItem } from "@/components/ui/Timeline";
import SkillIcons from "@/components/ui/SkillIcons";
import { AboutData, Hobby, Skill } from "@/types/types";

const ease = [0.22, 1, 0.36, 1] as const;

const hobbyIcons: Record<string, React.ReactNode> = {
  camera:   <FaCamera size={18} />,
  mountain: <FaMountain size={18} />,
  gamepad:  <FaGamepad size={18} />,
  utensils: <FaUtensils size={18} />,
};

const categoryIcons: Record<string, IconType> = {
  Frontend: FaDesktop,
  Backend: FaServer,
  "Cloud & DevOps": FaCloud,
  "Engineering Concepts": FaProjectDiagram,
};

/** Bento widths on a six-column grid, in category order: two halves, then a third and two thirds. */
const BENTO = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-4"];

const chip =
  "inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-3.5 py-2 font-mono text-xs text-[var(--text-2)]";
const chipLink = `${chip} transition-colors hover:border-[var(--accent-border)] hover:text-[var(--text-1)]`;
const iconLink =
  "inline-flex rounded-full p-2.5 text-[var(--text-3)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]";

export default function AboutContent({ data }: { data: AboutData }) {
  const { introduction, education, experience, skills, hobbies } = data;
  const reduce = useReducedMotion();

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay },
  });
  const reveal = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease, delay: i * 0.06 },
  });

  /* ── derived ─────────────────────────────────── */
  const nameWords = introduction.name.trim().split(/\s+/);
  const lastName = nameWords.length > 1 ? nameWords[nameWords.length - 1] : "";
  const firstName = nameWords.length > 1 ? nameWords.slice(0, -1).join(" ") : introduction.name;

  const current = experience.find((e) => /present/i.test(e.period)) ?? experience[0];

  const startYears = experience
    .map((e) => Number(e.period.match(/\d{4}/)?.[0]))
    .filter((y) => Number.isFinite(y) && y > 0);
  const years = startYears.length ? new Date().getFullYear() - Math.min(...startYears) : 0;
  const gpa = education.map((e) => e.description.match(/GPA:\s*(\d+(?:\.\d+)?)/)?.[1]).find(Boolean);

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const timeline: TimelineItem[] = [
    ...experience.map((e) => ({ title: e.role, subtitle: e.company, period: e.period, description: e.description, tag: "Work" })),
    ...education.map((e) => ({ title: e.degree, subtitle: e.institution, period: e.period, description: e.description, tag: "Education" })),
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────── */}
      <section aria-labelledby="about-title" className="relative isolate overflow-hidden px-5 pb-20 pt-16 md:-mt-20 md:px-10 md:pt-40">
        <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
        <Spotlight className="-z-10" />

        <div className="mx-auto grid max-w-[1200px] items-center gap-16 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
          <div>
            <motion.div {...fade(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-3.5 py-1.5 text-xs backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-3)] shadow-[0_0_8px_2px_rgba(224,168,120,0.6)]" aria-hidden="true" />
                <span className="shiny font-medium">About me</span>
              </span>
            </motion.div>

            <h1 id="about-title" className="display mt-8 text-[clamp(3rem,8vw,6.5rem)]">
              <BlurText text={firstName} wordClassName="text-silver pb-[0.08em]" />
              {lastName && (
                <>
                  {" "}
                  <BlurText text={lastName} delay={0.16} wordClassName="accent-serif pb-[0.08em]" />
                </>
              )}
            </h1>

            <motion.p {...fade(0.4)} className="mt-6 max-w-xl text-lg font-medium leading-snug text-[var(--text-1)] md:text-xl">
              {introduction.title}
            </motion.p>
            <motion.p {...fade(0.5)} className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text-2)]">
              {introduction.bio}
            </motion.p>

            <motion.ul {...fade(0.62)} aria-label="Contact details" className="mt-8 flex flex-wrap items-center gap-2.5">
              <li>
                <a href={siteConfig.social.email} className={chipLink}>
                  <FaEnvelope size={12} aria-hidden="true" /> {siteConfig.owner.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.owner.phone.replace(/-/g, "")}`} className={chipLink}>
                  <FaPhone size={12} aria-hidden="true" /> {siteConfig.owner.phone}
                </a>
              </li>
              <li>
                <span className={chip}>
                  <FaMapMarkerAlt size={12} aria-hidden="true" /> Khon Kaen, Thailand
                </span>
              </li>
              <li className="flex items-center">
                <a href={siteConfig.social.github} target="_blank" rel="noreferrer" aria-label="GitHub" className={iconLink}>
                  <FaGithub size={17} />
                </a>
                <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={iconLink}>
                  <FaLinkedin size={17} />
                </a>
              </li>
            </motion.ul>
          </div>

          {/* Portrait on a tilting card with a caramel glow behind it */}
          <motion.div
            className="relative mx-auto w-full max-w-[360px] lg:max-w-none"
            initial={reduce ? false : { opacity: 0, y: 40, rotateX: 14 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
            style={{ transformPerspective: 1200 }}
          >
            <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(192,133,82,0.42),transparent)] blur-2xl" aria-hidden="true" />
            <TiltCard className="rounded-[24px] border border-[var(--border-mid)] bg-[var(--surface)] p-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]" max={8}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px]">
                <Image
                  src={introduction.profileImage}
                  alt={introduction.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, 360px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(12,9,8,0.8)] to-transparent" aria-hidden="true" />
              </div>
              <div className="absolute inset-x-[18%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />
              {current && (
                <TiltLayer depth={60} className="absolute -bottom-6 -left-3 right-8 md:-left-8 md:right-12">
                  <div className="rounded-2xl border border-[var(--border-mid)] bg-[var(--surface-2)] p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)]">
                    <p className="eyebrow flex items-center gap-2">
                      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-60 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                      </span>
                      Currently
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-1)]">{current.role}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-3)]">{current.company}</p>
                  </div>
                </TiltLayer>
              )}
            </TiltCard>
          </motion.div>
        </div>

        {/* Figures */}
        <dl className="mx-auto mt-24 grid max-w-[1200px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-4">
          {years > 0 && (
            <div className="flex flex-col-reverse bg-[var(--background)] px-6 py-6 text-center">
              <dt className="eyebrow mt-2">Years in production</dt>
              <dd className="display text-silver text-4xl md:text-5xl">
                <NumberTicker value={years} />+
              </dd>
            </div>
          )}
          <div className="flex flex-col-reverse bg-[var(--background)] px-6 py-6 text-center">
            <dt className="eyebrow mt-2">Automated tests</dt>
            <dd className="display text-silver text-4xl md:text-5xl">
              <NumberTicker value={1156} />
            </dd>
          </div>
          <div className="flex flex-col-reverse bg-[var(--background)] px-6 py-6 text-center">
            <dt className="eyebrow mt-2">Core skills</dt>
            <dd className="display text-silver text-4xl md:text-5xl">
              <NumberTicker value={skills.length} />
            </dd>
          </div>
          {gpa && (
            <div className="flex flex-col-reverse bg-[var(--background)] px-6 py-6 text-center">
              <dt className="eyebrow mt-2">GPA, Computer Eng.</dt>
              <dd className="display text-silver text-4xl tabular-nums md:text-5xl">{gpa}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* ── Experience & education ──────────────── */}
      <section aria-labelledby="experience-title" className="px-5 pb-20 pt-8 md:px-10 md:pb-28 md:pt-12">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader id="experience-title" eyebrow="Work experience & education" title="The road" accent="so far." />
          <Timeline items={timeline} />
        </div>
      </section>

      {/* ── Skills ──────────────────────────────── */}
      <section aria-labelledby="skills-title" className="px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader id="skills-title" eyebrow="Skills & knowledge" title="The tools I" accent="reach for." />
          <div className="grid gap-4 md:grid-cols-6">
            {Object.entries(groupedSkills).map(([category, categorySkills], gi) => {
              const Icon = categoryIcons[category] ?? FaCode;
              const span = BENTO[gi] ?? "md:col-span-3";
              const wide = span === "md:col-span-4";
              return (
                <motion.div key={category} className={span} {...reveal(gi)}>
                  <SpotlightCard className="h-full p-6 md:p-8">
                    {gi === 1 && (
                      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" aria-hidden="true" />
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-mid)] bg-white/[0.03] text-[var(--accent-3)]">
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <h3 className="text-lg font-medium text-[var(--text-1)]">{category}</h3>
                      </div>
                      <span className="font-mono text-xs text-[var(--text-3)]">
                        {String(categorySkills.length).padStart(2, "0")}
                        <span className="sr-only"> skills</span>
                      </span>
                    </div>
                    <div className="mt-7">
                      <SkillIcons
                        skills={categorySkills}
                        className={wide ? "grid gap-x-10 gap-y-5 sm:grid-cols-2" : "grid gap-y-5"}
                      />
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Hobbies ─────────────────────────────── */}
      <section aria-labelledby="hobbies-title" className="px-5 pb-24 pt-12 md:px-10 md:pb-28">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader id="hobbies-title" eyebrow="Hobbies & interests" title="Off the" accent="clock." />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {hobbies.map((hobby: Hobby, i: number) => (
              <motion.li key={hobby.name} {...reveal(i)}>
                <SpotlightCard className="h-full p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-mid)] bg-white/[0.03] text-[var(--accent-3)]" aria-hidden="true">
                    {hobbyIcons[hobby.icon] ?? <FaCode size={18} />}
                  </span>
                  <p className="mt-8 text-base font-medium text-[var(--text-1)]">{hobby.name}</p>
                </SpotlightCard>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
