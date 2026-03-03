"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  SiReact, SiNextdotjs, SiVuedotjs, SiTypescript, SiTailwindcss,
  SiSharp, SiDotnet, SiPython, SiFastapi, SiGo, SiPostgresql,
  SiGraphql, SiKotlin, SiDocker, SiFlask,
} from "react-icons/si";
import {
  FaAws, FaCode, FaNetworkWired, FaSync, FaDatabase,
} from "react-icons/fa";
import { Skill } from "@/types/types";

type IconEntry = {
  icon: React.ReactNode;
  color: string;
};

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
  "Distributed Systems / System Design": { icon: <FaNetworkWired />, color: "#9333ea" },
  "SOLID Principles / OOP":     { icon: <FaCode />,         color: "#10B981" },
  "Agile / Feature-Driven Development (FDD)": { icon: <FaSync />, color: "#F59E0B" },
};

// Fallbacks for unmatched names
function getIconEntry(name: string): IconEntry {
  if (SKILL_ICON_MAP[name]) return SKILL_ICON_MAP[name];
  // fuzzy match by keyword
  const lower = name.toLowerCase();
  if (lower.includes("react"))      return { icon: <SiReact />,       color: "#61DAFB" };
  if (lower.includes("next"))       return { icon: <SiNextdotjs />,   color: "#FFFFFF" };
  if (lower.includes("vue"))        return { icon: <SiVuedotjs />,    color: "#4FC08D" };
  if (lower.includes("typescript")) return { icon: <SiTypescript />,  color: "#3178C6" };
  if (lower.includes("tailwind"))   return { icon: <SiTailwindcss />, color: "#06B6D4" };
  if (lower.includes(".net") || lower.includes("dotnet"))
                                    return { icon: <SiDotnet />,      color: "#512BD4" };
  if (lower.includes("c#") || lower.includes("csharp"))
                                    return { icon: <SiSharp />,       color: "#239120" };
  if (lower.includes("python"))     return { icon: <SiPython />,      color: "#3776AB" };
  if (lower.includes("fastapi"))    return { icon: <SiFastapi />,     color: "#009688" };
  if (lower.includes("flask"))      return { icon: <SiFlask />,       color: "#FFFFFF" };
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
                                    return { icon: <FaSync />,        color: "#F59E0B" };
  if (lower.includes("solid") || lower.includes("oop"))
                                    return { icon: <FaCode />,        color: "#10B981" };
  if (lower.includes("distributed") || lower.includes("system"))
                                    return { icon: <FaNetworkWired />, color: "#9333ea" };
  return { icon: <FaDatabase />, color: "#6B7280" };
}

interface SkillIconsProps {
  skills: Skill[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
};

const SkillIcons: React.FC<SkillIconsProps> = ({ skills }) => {
  return (
    <motion.div
      className="flex flex-wrap gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {skills.map((skill) => {
        const { icon, color } = getIconEntry(skill.name);
        return (
          <motion.div
            key={skill.name}
            className="group flex flex-col items-center gap-2 cursor-default"
            variants={item}
            whileHover={{ scale: 1.12 }}
            title={skill.name}
          >
            {/* Icon circle */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-800/80 border border-gray-700/50 group-hover:border-opacity-80 transition-all duration-200"
              style={{
                boxShadow: `0 0 0 0 ${color}33`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 16px 4px ${color}40`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${color}60`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${color}33`;
                (e.currentTarget as HTMLDivElement).style.borderColor = "";
              }}
            >
              <span className="text-2xl" style={{ color }}>
                {icon}
              </span>
            </div>

            {/* Skill name */}
            <span className="text-xs text-gray-400 text-center max-w-[72px] leading-tight group-hover:text-gray-200 transition-colors line-clamp-2">
              {/* Shorten long names for display */}
              {skill.name
                .replace(" (Web API, Microservices)", "")
                .replace(" (Concurrency / Goroutines)", "")
                .replace(" (Performance Tuning)", "")
                .replace(" (FastAPI / Flask)", "")
                .replace(" / Feature-Driven Development (FDD)", "")
                .replace(" / Containerization", "")
                .replace(" (S3, ECS, Lambda, API Gateway, CloudWatch)", "")
                .replace(" / Material UI", "")
                .replace(" / Next.js", " /\nNext.js")
                .replace(" (Android)", "")}
            </span>

            {/* Level badge on hover */}
            {skill.level && (
              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-purple-400 transition-opacity">
                {skill.level}%
              </span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SkillIcons;
