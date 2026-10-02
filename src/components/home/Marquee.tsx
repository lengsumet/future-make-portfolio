import type { IconType } from "react-icons";
import { SiNextdotjs, SiTypescript, SiDotnet, SiGo, SiPython, SiPostgresql, SiPrisma, SiDocker, SiTailwindcss, SiReact, SiVercel } from "react-icons/si";
import { FaAws } from "react-icons/fa";

const STACK: { name: string; icon: IconType }[] = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "React", icon: SiReact },
  { name: "TypeScript", icon: SiTypescript },
  { name: "C# / .NET", icon: SiDotnet },
  { name: "Go", icon: SiGo },
  { name: "Python", icon: SiPython },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Prisma", icon: SiPrisma },
  { name: "Docker", icon: SiDocker },
  { name: "AWS", icon: FaAws },
  { name: "Tailwind CSS", icon: SiTailwindcss },
  { name: "Vercel", icon: SiVercel },
];

/**
 * The stack as an endless row of logo chips that fades out at both edges
 * (Aceternity "Infinite Moving Cards"). Rendered twice, moving by half; it
 * pauses on hover and stands still for reduced motion.
 */
export default function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={hidden || undefined}>
      {STACK.map(({ name, icon: Icon }) => (
        <li
          key={name}
          className="flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-4 py-2.5 text-sm"
          style={{ color: "var(--text-2)" }}
        >
          <Icon size={16} aria-hidden="true" />
          {name}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Technologies I work with" className="py-10">
      <p className="eyebrow text-center">Built with</p>
      <div className="marquee mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
