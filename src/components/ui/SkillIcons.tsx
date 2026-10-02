"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  SiReact, SiNextdotjs, SiVuedotjs, SiTypescript, SiTailwindcss,
  SiSharp, SiDotnet, SiPython, SiFastapi, SiGo, SiPostgresql,
  SiGraphql, SiKotlin, SiDocker, SiFlask,
} from "react-icons/si";
import {
  FaAws, FaCode, FaNetworkWired, FaSync, FaDatabase,
} from "react-icons/fa";
import { Skill } from "@/types/types";
import { LevelBar } from "./SkillBar";

type IconEntry = {
  icon: React.ReactNode;
  /** Shown on hover only: real brand colours for real brands, caramel for ideas. */
  color: string;
};

const CONCEPT = "var(--accent-3)";
const NEUTRAL = "var(--text-1)";

const SKILL_ICON_MAP: Record<string, IconEntry> = {
  // Frontend
  "React / Next.js":            { icon: <SiReact />,        color: "#61DAFB" },
  "Vue.js":                     { icon: <SiVuedotjs />,     color: "#4FC08D" },
  "TypeScript":                 { icon: <SiTypescript />,   color: "#3178C6" },
  "Tailwind CSS / Material UI": { icon: <SiTailwindcss />,  color: "#06B6D4" },
  // Backend
  "C# / .NET Core (Web API, Microservices)": { icon: <SiSharp />,     color: "#239120" },
  "Python (FastAPI / Flask)":   { icon: <SiPython />,       color: "#3776AB" },
  "Golang (Concurrency / Goroutines)": { icon: <SiGo />,    color: "#00ADD8" },
  "SQL / PostgreSQL (Performance Tuning)": { icon: <SiPostgresql />, color: "#4169E1" },
  "GraphQL":                    { icon: <SiGraphql />,      color: "#E10098" },
  "Kotlin (Android)":           { icon: <SiKotlin />,       color: "#7F52FF" },
  // Cloud & DevOps
  "AWS (S3, ECS, Lambda, API Gateway, CloudWatch)": { icon: <FaAws />, color: "#FF9900" },
  "Docker / Containerization":  { icon: <SiDocker />,       color: "#2496ED" },
  // Engineering Concepts
  "Distributed Systems / System Design": { icon: <FaNetworkWired />, color: CONCEPT },
  "SOLID Principles / OOP":     { icon: <FaCode />,         color: CONCEPT },
  "Agile / Feature-Driven Development (FDD)": { icon: <FaSync />, color: CONCEPT },
};

// Fallbacks for unmatched names
export function getIconEntry(name: string): IconEntry {
  if (SKILL_ICON_MAP[name]) return SKILL_ICON_MAP[name];
  // fuzzy match by keyword
  const lower = name.toLowerCase();
  if (lower.includes("react"))      return { icon: <SiReact />,       color: "#61DAFB" };
  if (lower.includes("next"))       return { icon: <SiNextdotjs />,   color: NEUTRAL };
  if (lower.includes("vue"))        return { icon: <SiVuedotjs />,    color: "#4FC08D" };
  if (lower.includes("typescript")) return { icon: <SiTypescript />,  color: "#3178C6" };
  if (lower.includes("tailwind"))   return { icon: <SiTailwindcss />, color: "#06B6D4" };
  if (lower.includes(".net") || lower.includes("dotnet"))
                                    return { icon: <SiDotnet />,      color: "#512BD4" };
  if (lower.includes("c#") || lower.includes("csharp"))
                                    return { icon: <SiSharp />,       color: "#239120" };
  if (lower.includes("python"))     return { icon: <SiPython />,      color: "#3776AB" };
  if (lower.includes("fastapi"))    return { icon: <SiFastapi />,     color: "#009688" };
  if (lower.includes("flask"))      return { icon: <SiFlask />,       color: NEUTRAL };
  if (lower.includes("go") || lower.includes("golang"))
                                    return { icon: <SiGo />,          color: "#00ADD8" };
  if (lower.includes("postgres") || lower.includes("sql"))
                                    return { icon: <SiPostgresql />,  color: "#4169E1" };
  if (lower.includes("graphql"))    return { icon: <SiGraphql />,     color: "#E10098" };
  if (lower.includes("kotlin"))     return { icon: <SiKotlin />,      color: "#7F52FF" };
  if (lower.includes("aws") || lower.includes("amazon"))
                                    return { icon: <FaAws />,         color: "#FF9900" };
  if (lower.includes("docker"))     return { icon: <SiDocker />,      color: "#2496ED" };
  if (lower.includes("agile") || lower.includes("scrum"))
                                    return { icon: <FaSync />,        color: CONCEPT };
  if (lower.includes("solid") || lower.includes("oop"))
                                    return { icon: <FaCode />,        color: CONCEPT };
  if (lower.includes("distributed") || lower.includes("system"))
                                    return { icon: <FaNetworkWired />, color: CONCEPT };
  return { icon: <FaDatabase />, color: CONCEPT };
}

/** "AWS (S3, ECS, …)" reads as a name and a detail line; nothing is dropped. */
function splitName(name: string): { main: string; detail: string | null } {
  const match = name.match(/^(.*?)\s*\((.+)\)$/);
  return match ? { main: match[1], detail: match[2] } : { main: name, detail: null };
}

interface SkillIconsProps {
  skills: Skill[];
  /** Layout of the list, e.g. two columns inside a wide card. */
  className?: string;
}

const SkillIcons: React.FC<SkillIconsProps> = ({ skills, className = "grid gap-y-5" }) => {
  const reduce = useReducedMotion();
  return (
    <ul className={className}>
      {skills.map((skill, i) => {
        const { icon, color } = getIconEntry(skill.name);
        const { main, detail } = splitName(skill.name);
        return (
          <motion.li
            key={skill.name}
            className="group/skill flex items-start gap-3.5"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-mid)] bg-white/[0.03] text-base text-[var(--text-2)] transition-colors duration-300 group-hover/skill:border-[var(--accent-border)] group-hover/skill:text-[var(--brand)]"
              style={{ ["--brand" as string]: color }}
            >
              {icon}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-1)]">{main}</span>
                {skill.level ? (
                  <span className="font-mono text-2xs tabular-nums text-[var(--text-3)]">
                    <span className="sr-only">proficiency </span>
                    {skill.level}%
                  </span>
                ) : null}
              </div>
              {detail && <p className="mt-0.5 text-xs leading-snug text-[var(--text-3)]">{detail}</p>}
              {skill.level ? <LevelBar level={skill.level} delay={0.15 + i * 0.06} className="mt-2.5" /> : null}
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
};

export default SkillIcons;
