"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import {
  FaCamera, FaMountain, FaGamepad, FaUtensils,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
} from "react-icons/fa";
import SkillIcons from "@/components/ui/SkillIcons";
import { AboutData, Experience, Education, Hobby, Skill } from "@/types/types";

/* ── animation helpers ─────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" as const, delay },
});

/* ── section heading ────────────────────────────── */
function SectionHeading({ title }: { title: string }) {
  return (
    <motion.div {...fadeUp()} className="mb-10 text-center">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="h-px w-12 bg-emerald-500/30 rounded-full" />
        <div className="h-1 w-1 rounded-full bg-emerald-500/50" />
        <div className="h-px w-12 bg-emerald-500/30 rounded-full" />
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
      className="relative overflow-hidden rounded-2xl border border-gray-700/30 bg-gray-900/40
        hover:border-emerald-500/25 hover:bg-gray-900/60 hover:-translate-y-1
        transition-all duration-300 group cursor-default p-6"
    >
      {/* Bottom sweep line on hover */}
      <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full
        bg-gradient-to-r from-emerald-500/50 via-emerald-400/30 to-transparent
        transition-all duration-500 ease-out" />

      {/* Period badge */}
      <span className="absolute top-5 right-5 text-[11px] text-gray-600 font-mono
        bg-gray-800/70 px-2.5 py-1 rounded-lg tracking-tight">
        {period}
      </span>

      <h3 className="text-lg font-semibold text-white pr-28 mb-0.5
        group-hover:text-emerald-300 transition-colors duration-200">
        {title}
      </h3>
      <p className="text-emerald-400 text-sm mb-4">{subtitle}</p>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

const hobbyIcons: Record<string, React.ReactNode> = {
  camera:   <FaCamera size={26} />,
  mountain: <FaMountain size={26} />,
  gamepad:  <FaGamepad size={26} />,
  utensils: <FaUtensils size={26} />,
};

/* ── main component ─────────────────────────────── */
export default function AboutContent({ data }: { data: AboutData }) {
  const { introduction, education, experience, skills, hobbies } = data;

  /* ── Profile spin ──────────────────────────── */
  const spinCtrl    = useAnimation();
  const isSpinning  = useRef(false);
  const [sparkles, setSparkles] = useState<{ id: number; angle: number; char: string }[]>([]);

  const handleSpin = useCallback(async () => {
    if (isSpinning.current) return;
    isSpinning.current = true;

    // Spawn sparkles radiating outward
    const chars = ["✦", "★", "✨", "◆", "✦", "★", "✨", "◆"];
    setSparkles(chars.map((char, i) => ({ id: Date.now() + i, angle: (i / chars.length) * 360, char })));

    // Cartoon: wind-up back → fast spin forward
    await spinCtrl.start({ rotate: -20, transition: { duration: 0.13, ease: "easeIn" } });
    await spinCtrl.start({ rotate: 365, transition: { duration: 0.62, ease: [0.2, 1.55, 0.36, 1] } });
    spinCtrl.set({ rotate: 0 });

    setTimeout(() => { setSparkles([]); isSpinning.current = false; }, 850);
  }, [spinCtrl]);

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
          {/* Profile image with cartoon spin */}
          <div className="relative w-36 h-36 mx-auto mb-6">

            {/* Sparkles */}
            <AnimatePresence>
              {sparkles.map((s) => (
                <motion.span
                  key={s.id}
                  className="absolute top-1/2 left-1/2 pointer-events-none select-none
                    text-yellow-300 text-base z-10"
                  style={{ translateX: "-50%", translateY: "-50%" }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos((s.angle * Math.PI) / 180) * 80,
                    y: Math.sin((s.angle * Math.PI) / 180) * 80,
                    opacity: 0,
                    scale: 1.4,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                >
                  {s.char}
                </motion.span>
              ))}
            </AnimatePresence>

            {/* Outer glow ring — pulses while spinning */}
            <div className="absolute inset-0 rounded-full ring-4 ring-emerald-500/20
              shadow-xl shadow-emerald-900/20 pointer-events-none z-[1]" />

            {/* Spinning image */}
            <motion.div
              animate={spinCtrl}
              onMouseEnter={handleSpin}
              className="absolute inset-0 rounded-full cursor-pointer overflow-hidden"
              style={{ transformOrigin: "center" }}
              whileHover={{ scale: 1.06 }}
              transition={{ scale: { duration: 0.2 } }}
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
          <p className="text-lg text-emerald-300 mb-5">{introduction.title}</p>
        </motion.div>

        <motion.p {...fadeUp(0.1)} className="max-w-2xl mx-auto text-gray-400 leading-relaxed mb-8">
          {introduction.bio}
        </motion.p>

        <motion.div
          {...fadeUp(0.18)}
          className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-500"
        >
          <a href="mailto:sumet.buarod@gmail.com"
            className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-200">
            <FaEnvelope size={13} /> sumet.buarod@gmail.com
          </a>
          <a href="tel:0958039303"
            className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-200">
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
        <div className="space-y-5 max-w-3xl mx-auto">
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
        <div className="space-y-5 max-w-3xl mx-auto">
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
              <p className="text-xs text-gray-600 uppercase tracking-widest text-center mb-6">
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
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
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
              <div className="w-14 h-14 rounded-2xl bg-gray-900/50 border border-gray-800/40
                group-hover:border-emerald-500/30 group-hover:bg-gray-900/80
                flex items-center justify-center text-gray-500 group-hover:text-emerald-400
                transition-all duration-300">
                {hobbyIcons[hobby.icon] ?? null}
              </div>
              <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors duration-200">
                {hobby.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
