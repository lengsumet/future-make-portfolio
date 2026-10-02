"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself.
 * It replaces the whole document, so globals.css and next/font never load.
 * The tokens and the few classes this page needs are restated in one
 * <style> block below — mirroring globals.css — so hover and focus live in
 * CSS rather than in inline event handlers.
 */
const CSS = `
:root {
  --background: #0C0908;
  --border: rgba(255, 248, 240, 0.08);
  --text-1: #FFF8F0;
  --text-2: rgba(255, 248, 240, 0.72);
  --text-3: rgba(255, 248, 240, 0.50);
  --accent: #C08552;
  --accent-3: #E0A878;
  --accent-bg: rgba(192, 133, 82, 0.10);
  --accent-border: rgba(192, 133, 82, 0.28);
  --mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  background: var(--background);
  color: var(--text-1);
  font-family: system-ui, -apple-system, "Segoe UI", "Noto Sans Thai", sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.ge-grid, .ge-light { position: fixed; inset: 0; pointer-events: none; }
.ge-grid {
  background-image: radial-gradient(rgba(255, 248, 240, 0.12) 1px, transparent 1px);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
}
.ge-light {
  background:
    radial-gradient(55% 45% at 30% 0%, rgba(224, 168, 120, 0.16), transparent 70%),
    radial-gradient(45% 40% at 72% 0%, rgba(255, 248, 240, 0.08), transparent 70%);
}
.ge-main { position: relative; max-width: 34rem; text-align: center; }
.ge-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 3.5rem; height: 3.5rem; border-radius: 1rem;
  border: 1px solid var(--accent-border); background: var(--accent-bg); color: var(--accent-3);
  box-shadow: 0 0 40px -8px rgba(224, 168, 120, 0.55);
}
.ge-eyebrow {
  margin: 2rem 0 0; font-family: var(--mono); font-size: 0.6875rem; line-height: 1rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-3);
}
.ge-title {
  margin: 1rem 0 0; padding-bottom: 0.08em;
  font-size: clamp(2.5rem, 7vw, 4.75rem); font-weight: 600; letter-spacing: -0.045em; line-height: 1;
  background: linear-gradient(180deg, #FFF8F0 20%, rgba(255, 248, 240, 0.55) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.ge-accent {
  font-family: "Instrument Serif", "Playfair Display", Georgia, serif;
  font-style: italic; font-weight: 400; letter-spacing: -0.01em; padding-right: 0.06em;
  background: linear-gradient(100deg, #F2C9A0 0%, #E0A878 40%, #C08552 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.ge-th { margin: 1.25rem 0 0; font-size: 1.125rem; font-weight: 500; }
.ge-body { margin: 0.5rem 0 0; font-size: 0.875rem; line-height: 1.6; color: var(--text-2); }
.ge-digest {
  display: inline-block; margin: 1.5rem 0 0; padding: 0.25rem 0.75rem;
  border: 1px solid var(--border); border-radius: 9999px;
  font-family: var(--mono); font-size: 0.75rem; color: var(--text-3);
}
.ge-actions { margin-top: 2.25rem; }
.ge-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.5rem; border: none; border-radius: 9999px;
  background: var(--text-1); color: var(--background);
  font-family: inherit; font-size: 0.875rem; font-weight: 500; line-height: 1.25rem;
  cursor: pointer;
  box-shadow: 0 0 50px -12px rgba(255, 248, 240, 0.6);
  transition: transform 0.15s ease;
}
.ge-btn:hover { transform: translateY(-1px); }
.ge-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .ge-btn { transition: none; }
  .ge-btn:hover { transform: none; }
}
`;

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
      <body>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ge-grid" aria-hidden="true" />
        <div className="ge-light" aria-hidden="true" />

        <main role="alert" className="ge-main">
          <span className="ge-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </span>

          <p className="ge-eyebrow" lang="en">Critical error</p>
          <h1 className="ge-title" lang="en">
            A critical error <span className="ge-accent">occurred.</span>
          </h1>
          <p className="ge-th">ระบบขัดข้อง</p>
          <p className="ge-body">ไม่สามารถโหลดหน้าเว็บได้ กรุณาลองใหม่อีกครั้ง</p>

          {error.digest && <p className="ge-digest">Error ID: {error.digest}</p>}

          <div className="ge-actions">
            <button type="button" onClick={reset} className="ge-btn">
              ลองอีกครั้ง / <span lang="en">Try again</span>
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
