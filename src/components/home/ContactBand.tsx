import { FaArrowRight } from "react-icons/fa";
import { siteConfig } from "@/config/siteConfig";

/**
 * A light band near the end of a long dark page — the contrast break several
 * godly-featured sites use — carrying the one thing a visitor should do next.
 */
export default function ContactBand() {
  return (
    <section className="px-5 md:px-10" aria-labelledby="contact-title">
      <div
        className="mx-auto max-w-[1400px] rounded-[28px] px-6 py-16 md:px-14 md:py-24"
        style={{ background: "var(--cream-band)", color: "var(--cream-ink)" }}
      >
        <p className="font-mono text-2xs uppercase tracking-[0.12em]" style={{ color: "var(--cream-ink-2)" }}>
          (04) Work together
        </p>
        <h2 id="contact-title" className="display mt-6 max-w-4xl text-[clamp(2.75rem,7vw,6.5rem)]">
          Have a system that <em className="italic" style={{ color: "#8C5A3C" }}>needs building?</em>
        </h2>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={siteConfig.social.email}
            className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--cream-ink)", color: "var(--cream-band)" }}
          >
            Start a conversation
            <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a
            href={siteConfig.social.email}
            className="font-mono text-sm underline decoration-[rgba(46,28,26,0.3)] underline-offset-4 hover:decoration-current"
          >
            {siteConfig.owner.email}
          </a>
        </div>
      </div>
    </section>
  );
}
