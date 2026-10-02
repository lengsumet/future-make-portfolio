"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";

/**
 * Route-level error boundary. Uses the theme's CSS variables and global
 * classes directly rather than shared UI or fx components — if a provider or
 * component is what failed, an error page depending on it would fail too.
 * The spotlight here is a static gradient for the same reason.
 *
 * Renders inside the site shell, so it is a section, not a second <main>.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return (
    <section
      role="alert"
      aria-labelledby="error-title"
      className="relative isolate flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center md:-mt-20 md:min-h-screen md:px-10"
    >
      <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 30% 0%, rgba(224,168,120,0.16), transparent 70%), radial-gradient(45% 40% at 72% 0%, rgba(255,248,240,0.08), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <span
        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-3)] shadow-[0_0_40px_-8px_rgba(224,168,120,0.55)]"
        aria-hidden="true"
      >
        <FaExclamationTriangle size={20} />
      </span>

      <p className="eyebrow mt-8">Runtime error</p>
      <h1 id="error-title" className="display text-silver mt-4 pb-[0.08em] text-[clamp(2.75rem,7vw,5.5rem)]">
        Something went <span className="accent-serif">wrong.</span>
      </h1>
      <p lang="th" className="mt-5 text-lg font-medium text-[var(--text-1)]">
        เกิดข้อผิดพลาด
      </p>
      <p lang="th" className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-2)]">
        ระบบไม่สามารถแสดงหน้านี้ได้ กรุณาลองใหม่อีกครั้ง
      </p>

      {error.digest && (
        <p className="mt-6 inline-flex rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1 font-mono text-xs text-[var(--text-3)]">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2.5 rounded-full bg-[var(--text-1)] px-6 py-3 text-sm font-medium text-[var(--background)] shadow-[0_0_50px_-12px_rgba(255,248,240,0.6)] transition-transform hover:-translate-y-0.5"
        >
          <FaRedo size={12} aria-hidden="true" />
          <span>
            <span lang="th">ลองอีกครั้ง</span> / Try again
          </span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-6 py-3 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]"
        >
          <FaHome size={13} aria-hidden="true" />
          <span>
            <span lang="th">หน้าแรก</span> / Home
          </span>
        </Link>
      </div>
    </section>
  );
}
