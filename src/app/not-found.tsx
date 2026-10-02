import Link from "next/link";
import { FaArrowRight, FaHome } from "react-icons/fa";
import Spotlight from "@/components/fx/Spotlight";

/**
 * 404 as a lit, centred composition: spotlights over the fading dot grid,
 * a huge silver numeral, one accent-serif phrase, a cream pill home and a
 * ghost pill to the shop. Renders inside the site shell, so it is a section,
 * not a second <main>.
 */
export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="relative isolate flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center md:-mt-20 md:min-h-screen md:px-10"
    >
      <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
      <Spotlight className="-z-10" />
      <div
        className="absolute left-1/2 top-[38%] -z-10 h-72 w-[min(44rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.14] blur-3xl"
        aria-hidden="true"
      />

      <p className="eyebrow">Error 404</p>
      <p
        className="display text-silver mt-2 select-none pb-[0.04em] text-[clamp(7rem,26vw,17rem)] leading-[0.9]"
        aria-hidden="true"
      >
        404
      </p>

      <h1 id="not-found-title" className="display mt-2 text-[clamp(2rem,4.5vw,3.5rem)] text-[var(--text-1)]">
        Page <span className="accent-serif">not found.</span>
      </h1>
      <p lang="th" className="mt-5 text-lg font-medium text-[var(--text-1)]">
        ไม่พบหน้าที่ค้นหา
      </p>
      <p lang="th" className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-2)]">
        หน้าที่คุณเรียกดูอาจถูกย้าย ถูกลบ หรือที่อยู่ที่พิมพ์อาจไม่ถูกต้อง
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full bg-[var(--text-1)] px-6 py-3 text-sm font-medium text-[var(--background)] shadow-[0_0_50px_-12px_rgba(255,248,240,0.6)] transition-transform hover:-translate-y-0.5"
        >
          <FaHome size={13} aria-hidden="true" />
          <span>
            <span lang="th">กลับหน้าแรก</span> / Back to home
          </span>
        </Link>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-6 py-3 text-sm font-medium text-[var(--text-2)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]"
        >
          Browse the shop
          <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
