"use client";

import { useEffect, useState } from "react";

/**
 * The owner's local time, as several godly-featured sites show in their nav:
 * it says "a person, somewhere" more quietly than a photo does.
 *
 * Rendered as a placeholder on the server and filled after mount, so the
 * visitor's clock never causes a hydration mismatch.
 */
export default function LocalClock({ timeZone = "Asia/Bangkok", className = "" }: { timeZone?: string; className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(new Date());
    setTime(format());
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return (
    <time className={`tabular-nums ${className}`} aria-label={time ? `Local time ${time}` : undefined} suppressHydrationWarning>
      {time ?? "--:--"}
    </time>
  );
}
