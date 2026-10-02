import { FaArrowRight } from "react-icons/fa";
import { siteConfig } from "@/config/siteConfig";
import Spotlight from "@/components/fx/Spotlight";

/**
 * Closing call to action on a lit card: dot grid, spotlights, and a glow
 * line along the top edge, the way Aceternity's CTA blocks finish a page.
 */
export default function ContactBand() {
  return (
    <section className="px-5 md:px-10" aria-labelledby="contact-title">
      <div className="relative isolate mx-auto max-w-[1200px] overflow-hidden rounded-[28px] border border-[var(--border-mid)] bg-[var(--surface)] px-6 py-20 text-center md:py-28">
        <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
        <Spotlight className="-z-10" />
        <div className="absolute inset-x-[15%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />
        <div className="absolute left-1/2 top-0 -z-10 h-32 w-2/3 -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" aria-hidden="true" />

        <p className="eyebrow">Work together</p>
        <h2 id="contact-title" className="display text-silver mx-auto mt-5 max-w-3xl text-[clamp(2.5rem,6vw,5rem)]">
          Have a system that <span className="accent-serif">needs building?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base" style={{ color: "var(--text-2)" }}>
          Tell me what your operation runs on today. I&apos;ll reply within a day.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href={siteConfig.social.email}
            className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--text-1)] px-6 py-3 text-sm font-medium text-[var(--background)] shadow-[0_0_50px_-12px_rgba(255,248,240,0.6)] transition-transform hover:-translate-y-0.5"
          >
            Start a conversation
            <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a href={siteConfig.social.email} className="font-mono text-sm text-[var(--text-3)] underline decoration-[var(--border-mid)] underline-offset-4 transition-colors hover:text-[var(--text-1)]">
            {siteConfig.owner.email}
          </a>
        </div>
      </div>
    </section>
  );
}
