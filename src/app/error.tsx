"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";

/**
 * Route-level error boundary. Uses the theme's CSS variables directly rather
 * than shared UI components — if a provider or component is what failed, an
 * error page depending on it would fail too.
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
    <main
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center"
      style={{ background: "var(--background)", color: "var(--text-1)" }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
        }}
        aria-hidden="true"
      >
        <FaExclamationTriangle size={22} style={{ color: "var(--accent-3)" }} />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-1)" }}>
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
          Something went wrong
        </p>
        <p
          className="mx-auto max-w-md text-sm leading-relaxed"
          style={{ color: "var(--text-3)" }}
        >
          ระบบไม่สามารถแสดงหน้านี้ได้ กรุณาลองใหม่อีกครั้ง
        </p>
      </div>

      {error.digest && (
        <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, var(--grad-2), var(--grad-3))",
            color: "#fff",
            boxShadow: "0 0 24px var(--accent-glow)",
          }}
        >
          <FaRedo size={14} aria-hidden="true" />
          ลองอีกครั้ง / Try again
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
          style={{
            background: "var(--surface)",
            color: "var(--text-2)",
            border: "1px solid var(--border-mid)",
          }}
        >
          <FaHome size={14} aria-hidden="true" />
          หน้าแรก / Home
        </Link>
      </div>
    </main>
  );
}
