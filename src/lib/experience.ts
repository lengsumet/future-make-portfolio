import type { Experience } from "@/types/types";

/** Whole years since the earliest role started — the "N+ years" figure on Home and About. */
export function yearsSinceFirstRole(experience: Experience[], now = new Date()): number {
  const startYears = experience
    .map((e) => Number(e.period.match(/\d{4}/)?.[0]))
    .filter((y) => Number.isFinite(y) && y > 0);
  return startYears.length ? now.getFullYear() - Math.min(...startYears) : 0;
}
