"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { SiNextdotjs, SiReact, SiZod, SiPrisma, SiPostgresql, SiDotnet, SiGo, SiPython, SiDocker } from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { LuShieldCheck, LuRotateCw } from "react-icons/lu";
import { useLoading } from "@/contexts/LoadingContext";

type Hop = { title: string; tool: string; icon: IconType };

// One request through any of the nine systems, in order.
const HOPS: Hop[] = [
  { title: "Browser", tool: "React 19 UI", icon: SiReact },
  { title: "Server action", tool: "Next.js 16", icon: SiNextdotjs },
  { title: "Validate", tool: "Zod schema", icon: SiZod },
  { title: "Authorise", tool: "role · organisation", icon: LuShieldCheck },
  { title: "Query", tool: "Prisma 5", icon: SiPrisma },
  { title: "Store", tool: "PostgreSQL · Neon", icon: SiPostgresql },
];

// The day job: banking backends.
const AT_WORK: { name: string; icon: IconType }[] = [
  { name: "C# / .NET", icon: SiDotnet },
  { name: "Go", icon: SiGo },
  { name: "Python", icon: SiPython },
  { name: "Docker", icon: SiDocker },
  { name: "AWS", icon: FaAws },
];

const STEP_MS = 620;

/**
 * The stack told as the path one request takes: a pulse runs from the browser
 * to the database, lighting each tool as it passes. Complete and still for
 * reduced motion; vertical on phones, where the pulse is left out.
 */
export default function RequestPath() {
  // How many hops are lit. All of them at rest, so the section reads complete
  // before (and without) the animation.
  const [lit, setLit] = useState(HOPS.length);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);
  const trackRef = useRef<HTMLOListElement>(null);

  const clear = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  const run = useCallback(() => {
    clear();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(HOPS.length);
      return;
    }
    setRunning(true);
    setLit(0);
    HOPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setLit(i + 1), 200 + i * STEP_MS));
    });
    timers.current.push(window.setTimeout(() => setRunning(false), 200 + HOPS.length * STEP_MS + 400));
  }, []);

  // Not while the loading screen still covers the page.
  const { isLoading } = useLoading();

  useEffect(() => {
    const el = trackRef.current;
    if (!el || isLoading) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, [run, isLoading]);

  // Centre of the hop the pulse is on, as a share of the track (desktop row).
  const pulseAt = `${((Math.max(lit, 1) - 0.5) / HOPS.length) * 100}%`;

  return (
    <section aria-labelledby="stack-title" className="px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Built with</p>
            <h2 id="stack-title" className="display mt-3 text-[clamp(1.9rem,4vw,3rem)]">
              <span className="text-silver">Follow one</span> <span className="accent-serif">request.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--text-2)]">
            What happens between a click and the database in each of the nine systems below.
          </p>
        </div>

        <div className="relative mt-12">
          {/* Dashed rail: across on desktop, down the icons on phones */}
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-[34px] top-8 w-px bg-[repeating-linear-gradient(180deg,var(--border-mid)_0_6px,transparent_6px_12px)] md:bottom-auto md:left-[calc(100%/12)] md:right-[calc(100%/12)] md:top-[34px] md:h-px md:w-auto md:bg-[repeating-linear-gradient(90deg,var(--border-mid)_0_6px,transparent_6px_12px)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[30px] z-10 hidden h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-[var(--accent-3)] shadow-[0_0_14px_3px_rgba(224,168,120,0.8)] transition-[left,opacity] duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] md:block"
            style={{ left: pulseAt, opacity: running && lit > 0 ? 1 : 0 }}
          />

          <ol ref={trackRef} aria-label="The path of one request" className="relative grid gap-5 md:grid-cols-6 md:gap-0">
            {HOPS.map(({ title, tool, icon: Icon }, i) => {
              const on = i < lit;
              return (
                <li
                  key={title}
                  className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-x-4 md:grid-cols-1 md:justify-items-center md:gap-y-2.5 md:text-center"
                >
                  <span
                    className={`relative z-[1] row-span-2 grid h-[68px] w-[68px] place-items-center rounded-[20px] border bg-[var(--surface)] transition-[color,border-color,box-shadow,transform] duration-300 md:row-span-1 ${
                      on
                        ? "-translate-y-[3px] border-[var(--accent)] text-[var(--accent-3)] shadow-[0_0_0_6px_rgba(192,133,82,0.10),0_0_36px_-6px_rgba(224,168,120,0.55)]"
                        : "border-[var(--border-mid)] text-[var(--text-2)]"
                    }`}
                  >
                    <Icon aria-hidden="true" size={28} />
                  </span>
                  <span className="self-end text-sm text-[var(--text-1)] md:self-auto">{title}</span>
                  <span className="self-start font-mono text-2xs text-[var(--text-3)] md:self-auto">{tool}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs text-[var(--text-3)]">
            Runs in <span className="text-[var(--accent-fg)]">sin1</span> (Singapore), next to the database · CI on every push
          </p>
          <button
            type="button"
            onClick={run}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] px-3.5 py-1.5 font-mono text-xs text-[var(--text-1)] transition-colors hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:outline-none"
          >
            <LuRotateCw aria-hidden="true" /> Replay
          </button>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 border-t border-[var(--border)] pt-6">
          <span className="mr-1.5 font-mono text-2xs uppercase tracking-[0.14em] text-[var(--text-3)]">
            At work <span className="text-[var(--text-2)]">· Ngernturbo · Thai Credit Bank</span>
          </span>
          {AT_WORK.map(({ name, icon: Icon }) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] px-3 py-1.5 text-sm text-[var(--text-2)]"
            >
              <Icon aria-hidden="true" size={15} /> {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
