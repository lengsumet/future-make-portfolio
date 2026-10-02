"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Skill {
  name: string;
  level: number;
}

interface SkillBarProps {
  skills: Skill[];
}

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * A slim caramel bar that draws itself in the first time it scrolls into
 * view. Decorative: the percentage beside it is the readable value.
 */
export function LevelBar({ level, delay = 0, className = "" }: { level: number; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const width = Math.min(100, Math.max(0, level));
  return (
    <div aria-hidden="true" className={`relative h-1 w-full rounded-full bg-white/[0.06] ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent-2)] via-[var(--accent)] to-[var(--accent-3)] shadow-[0_0_10px_rgba(224,168,120,0.45)]"
        style={{ width: `${width}%`, originX: 0 }}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease, delay }}
      />
    </div>
  );
}

const SkillBar: React.FC<SkillBarProps> = ({ skills }) => {
  return (
    <ul className="space-y-5">
      {skills.map((skill, index) => (
        <li key={skill.name} className="w-full">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-[var(--text-1)]">{skill.name}</span>
            <span className="font-mono text-2xs tabular-nums text-[var(--text-3)]">
              <span className="sr-only">proficiency </span>
              {skill.level}%
            </span>
          </div>
          <LevelBar level={skill.level} delay={0.1 + index * 0.06} />
        </li>
      ))}
    </ul>
  );
};

export default SkillBar;
