import type { IconType } from "react-icons";
import { SiNextdotjs, SiTypescript, SiDotnet, SiGo, SiPython, SiPostgresql, SiPrisma, SiDocker, SiTailwindcss, SiReact, SiVercel } from "react-icons/si";
import { FaAws } from "react-icons/fa";

type Tool = { name: string; icon: IconType; detail: string };

// What the nine systems on this page are actually built on (apps/*/package.json).
const IN_THE_SYSTEMS: Tool[] = [
  { name: "Next.js", icon: SiNextdotjs, detail: "16 · App Router" },
  { name: "React", icon: SiReact, detail: "19" },
  { name: "TypeScript", icon: SiTypescript, detail: "strict" },
  { name: "Prisma", icon: SiPrisma, detail: "5 · migrations" },
  { name: "PostgreSQL", icon: SiPostgresql, detail: "Neon · Singapore" },
  { name: "Tailwind CSS", icon: SiTailwindcss, detail: "4" },
  { name: "Vercel", icon: SiVercel, detail: "CI on every push" },
];

// The day job: banking and insurance backends.
const AT_WORK: Tool[] = [
  { name: "C# / .NET", icon: SiDotnet, detail: "services & APIs" },
  { name: "Go", icon: SiGo, detail: "services" },
  { name: "Python", icon: SiPython, detail: "APIs & tooling" },
  { name: "Docker", icon: SiDocker, detail: "containers" },
  { name: "AWS", icon: FaAws, detail: "cloud infrastructure" },
];

function Column({ id, title, note, tools, tag }: { id: string; title: string; note: string; tools: Tool[]; tag?: string }) {
  return (
    <div className="min-w-0 p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h3 id={id} className="text-base font-medium text-[var(--text-1)]">{title}</h3>
        {tag && <span className="font-mono text-2xs uppercase tracking-[0.12em] text-[var(--accent-3)]">{tag}</span>}
      </div>
      <p className="mt-1 text-sm text-[var(--text-3)]">{note}</p>
      <ul aria-labelledby={id} className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {tools.map(({ name, icon: Icon, detail }) => (
          <li key={name} className="group flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02]">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-white/[0.03] text-[var(--text-2)] transition-colors group-hover:border-[var(--border-mid)] group-hover:text-[var(--accent-3)]">
              <Icon size={15} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-1)]">{name}</span>
            <span className="shrink-0 text-right font-mono text-2xs text-[var(--text-3)]">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The stack as two honest lists: what the nine systems on this page run on,
 * and what the day job runs on. Replaces a scrolling logo strip that said
 * nothing about where each tool is used.
 */
export default function StackLedger() {
  return (
    <section aria-labelledby="stack-title" className="px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Built with</p>
            <h2 id="stack-title" className="display mt-3 text-[clamp(1.9rem,4vw,3rem)]">
              <span className="text-silver">The stack,</span> <span className="accent-serif">where it runs.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--text-2)]">
            The same toolset behind every system below, and the one I use at work on banking and insurance backends.
          </p>
        </div>

        <div className="relative mt-10 grid overflow-hidden rounded-[24px] border border-[var(--border-mid)] bg-[var(--surface)] md:grid-cols-[1.15fr_1fr]">
          <div className="absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent opacity-60" aria-hidden="true" />
          <Column id="stack-systems" title="In all nine systems" note="Every app on this page, same versions." tools={IN_THE_SYSTEMS} tag="9 / 9" />
          <div className="border-t border-[var(--border)] md:border-l md:border-t-0">
            <Column id="stack-work" title="In production at work" note="Ngernturbo · Thai Credit Bank" tools={AT_WORK} />
          </div>
        </div>
      </div>
    </section>
  );
}
