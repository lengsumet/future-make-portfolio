"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

/**
 * The small vocabulary every admin screen shares: a page header, a surface
 * panel, a status pill and a segmented control. Calm on purpose — this is a
 * back-office tool, so no blur-in headlines or pointer effects here.
 */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display text-silver mt-3 pb-[0.06em] text-4xl md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 text-sm" style={{ color: "var(--text-3)" }}>
            {description}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}

export function Panel({
  title,
  aside,
  className = "",
  bodyClassName = "p-6",
  children,
}: {
  title?: string;
  aside?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-[20px] border border-[var(--border)] bg-[var(--surface)] ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-4">
          <h2 className="eyebrow">{title}</h2>
          {aside}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

type Tone = "positive" | "pending" | "negative" | "neutral";

const TONE: Record<Tone, { className: string; dot: string }> = {
  positive: { className: "border-[rgba(191,208,106,0.22)] bg-[var(--green-bg)] text-[var(--green)]", dot: "bg-[var(--green)]" },
  pending: { className: "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-3)]", dot: "bg-[var(--accent-3)]" },
  negative: { className: "border-red-400/20 bg-red-500/10 text-red-300", dot: "bg-red-300" },
  neutral: { className: "border-[var(--border-mid)] bg-white/[0.03] text-[var(--text-2)]", dot: "bg-[var(--text-3)]" },
};

const STATUS_TONE: Record<string, Tone> = {
  paid: "positive",
  active: "positive",
  delivered: "neutral",
  pending: "pending",
  draft: "pending",
  cancelled: "negative",
  failed: "negative",
  archived: "neutral",
};

/** A rounded status chip; the colour follows the word, so the same state looks the same on every screen. */
export function StatusPill({ status, tone }: { status: string; tone?: Tone }) {
  const t = TONE[tone ?? STATUS_TONE[status] ?? "neutral"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs capitalize ${t.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

/**
 * A row of pill buttons with a lit chip that glides to the selected one —
 * the same active-chip language as the site navigation.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[var(--border-mid)] bg-[var(--surface)] p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className="relative rounded-full! px-3.5 py-1.5 text-sm capitalize transition-colors hover:text-[var(--text-1)]"
            style={{ color: active ? "var(--text-1)" : "var(--text-3)" }}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full border border-[var(--border-mid)] bg-white/[0.07]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Table header cell in the eyebrow voice. */
export function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      scope="col"
      className={`eyebrow px-6 py-3 font-normal ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}
