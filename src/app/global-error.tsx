"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself.
 * It replaces the whole document, so globals.css never loads —
 * the warm-earth palette is inlined literally here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="th">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          backgroundColor: "#2E1C1A",
          color: "#FFF8F0",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        <main role="alert" style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{ margin: "0 0 0.75rem", fontSize: "2rem", lineHeight: 1 }}
            aria-hidden="true"
          >
            ⚠️
          </p>

          <h1
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            ระบบขัดข้อง
          </h1>

          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "rgba(255, 248, 240, 0.72)",
            }}
          >
            A critical error occurred
          </p>

          <p
            style={{
              margin: "0 0 1.5rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "rgba(255, 248, 240, 0.50)",
            }}
          >
            ไม่สามารถโหลดหน้าเว็บได้ กรุณาลองใหม่อีกครั้ง
          </p>

          {error.digest && (
            <p
              style={{
                margin: "0 0 1.5rem",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
                color: "rgba(255, 248, 240, 0.28)",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #C08552, #8C5A3C)",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
            /* global-error replaces the root layout, so globals.css is not
               loaded here - the hover state has to be inline. */
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ลองอีกครั้ง / Try again
          </button>
        </main>
      </body>
    </html>
  );
}
