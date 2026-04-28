"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaCamera, FaMountain, FaGamepad, FaUtensils,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
} from "react-icons/fa";
import SkillIcons from "@/components/ui/SkillIcons";
import { AboutData, Experience, Education, Hobby, Skill } from "@/types/types";

/* ── animation helpers ─────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: "-60px" },
  transition:  { duration: 0.55, ease: "easeOut" as const, delay },
});

/* ── section heading ────────────────────────────── */
function SectionHeading({ title }: { title: string }) {
  return (
    <motion.div {...fadeUp()} className="mb-10 text-center">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="h-px w-12 rounded-full" style={{ background: "rgba(192, 133, 82,0.3)" }} />
        <div className="h-1 w-1 rounded-full" style={{ background: "rgba(192, 133, 82,0.5)" }} />
        <div className="h-px w-12 rounded-full" style={{ background: "rgba(192, 133, 82,0.3)" }} />
      </div>
    </motion.div>
  );
}

/* ── experience / education card ───────────────── */
function ExpCard({ title, subtitle, period, description, delay }: {
  title: string; subtitle: string; period: string; description: string; delay: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group cursor-default"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(192, 133, 82,0.25)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Bottom sweep line on hover */}
      <div
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500 ease-out"
        style={{ background: "linear-gradient(90deg, rgba(192, 133, 82,0.5), rgba(140, 90, 60,0.3), transparent)" }}
      />

      {/* Period badge */}
      <span
        className="absolute top-5 right-5 text-[11px] font-mono px-2.5 py-1 rounded-lg tracking-tight"
        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}
      >
        {period}
      </span>

      <h3
        className="text-base font-semibold pr-28 mb-0.5 transition-colors duration-200"
        style={{ color: "#fff" }}
      >
        {title}
      </h3>
      <p className="text-sm mb-4" style={{ color: "#E0A878" }}>{subtitle}</p>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{description}</p>
    </motion.div>
  );
}

const hobbyIcons: Record<string, React.ReactNode> = {
  camera:   <FaCamera size={22} />,
  mountain: <FaMountain size={22} />,
  gamepad:  <FaGamepad size={22} />,
  utensils: <FaUtensils size={22} />,
};

/* ── main component ─────────────────────────────── */
export default function AboutContent({ data }: { data: AboutData }) {
  const { introduction, education, experience, skills, hobbies } = data;

  /* ── Grouped skills ─────────────────────── */
  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <>
      {/* ── Profile ─────────────────────────────── */}
      <section className="text-center mb-24">
        <motion.div {...fadeUp(0)}>
          {/* Profile image */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none z-[1]"
              style={{ boxShadow: "0 0 0 3px rgba(192, 133, 82,0.2), 0 0 30px rgba(192, 133, 82,0.1)" }}
            />

            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={introduction.profileImage}
                alt={introduction.name}
                fill
                className="rounded-full object-cover"
              />
            </motion.div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">{introduction.name}</h1>
          <p className="text-lg mb-5" style={{ color: "#F2C9A0" }}>{introduction.title}</p>
        </motion.div>

        <motion.p
          {...fadeUp(0.1)}
          className="max-w-2xl mx-auto leading-relaxed mb-8 text-sm"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {introduction.bio}
        </motion.p>

        <motion.div
          {...fadeUp(0.18)}
          className="flex flex-wrap items-center justify-center gap-5 text-sm"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <a
            href="mailto:sumet.buarod@gmail.com"
            className="flex items-center gap-2 transition-colors duration-200"
            onMouseEnter={e => (e.currentTarget.style.color = "#E0A878")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            <FaEnvelope size={13} /> sumet.buarod@gmail.com
          </a>
          <a
            href="tel:0958039303"
            className="flex items-center gap-2 transition-colors duration-200"
            onMouseEnter={e => (e.currentTarget.style.color = "#E0A878")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            <FaPhone size={13} /> 095-803-9303
          </a>
          <span className="flex items-center gap-2">
            <FaMapMarkerAlt size={13} /> Khon Kaen, Thailand
          </span>
        </motion.div>
      </section>

      {/* ── Experience ──────────────────────────── */}
      <section className="mb-24">
        <SectionHeading title="Work Experience" />
        <div className="space-y-4 max-w-3xl mx-auto">
          {experience.map((exp: Experience, i: number) => (
            <ExpCard
              key={i}
              title={exp.role}
              subtitle={exp.company}
              period={exp.period}
              description={exp.description}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>

      {/* ── Education ───────────────────────────── */}
      <section className="mb-24">
        <SectionHeading title="Education" />
        <div className="space-y-4 max-w-3xl mx-auto">
          {education.map((edu: Education, i: number) => (
            <ExpCard
              key={i}
              title={edu.degree}
              subtitle={edu.institution}
              period={edu.period}
              description={edu.description}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>

      {/* ── Skills ──────────────────────────────── */}
      <section className="mb-24">
        <SectionHeading title="Skills & Knowledge" />
        <div className="max-w-4xl mx-auto space-y-12">
          {Object.entries(groupedSkills).map(([category, categorySkills], gi) => (
            <motion.div key={category} {...fadeUp(gi * 0.06)}>
              <p
                className="text-xs uppercase tracking-widest text-center mb-6"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {category}
              </p>
              <SkillIcons skills={categorySkills} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Hobbies ─────────────────────────────── */}
      <section>
        <SectionHeading title="Hobbies & Interests" />
        <motion.div
          className="flex justify-center flex-wrap gap-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {hobbies.map((hobby: Hobby) => (
            <motion.div
              key={hobby.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
              }}
              whileHover={{ y: -4, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 cursor-default group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.3)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(192, 133, 82,0.35)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(192, 133, 82,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "#E0A878";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)";
                }}
              >
                {hobbyIcons[hobby.icon] ?? null}
              </div>
              <p
                className="text-sm transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                {hobby.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
