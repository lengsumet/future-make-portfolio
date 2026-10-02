"use client";

import React from "react";
import { FaGithub, FaLinkedin, FaArrowUp } from "react-icons/fa";
import { siteConfig } from "@/config/siteConfig";
import LocalClock from "@/components/home/LocalClock";

/**
 * Footer: a mono row of the practical details, and the name set across the
 * full width at the bottom, cut by the edge of the page — the closing move
 * of many godly-featured portfolios.
 */
const Footer: React.FC = () => {
  const links = [
    { label: "GitHub", href: siteConfig.social.github, icon: FaGithub },
    { label: "LinkedIn", href: siteConfig.social.linkedin, icon: FaLinkedin },
  ];

  return (
    <footer className="mt-24 overflow-hidden px-5 md:px-10 pb-24 md:pb-0">
      <div className="mx-auto max-w-[1400px] border-t pt-8" style={{ borderColor: "var(--border-mid)" }}>
        <div className="grid gap-6 font-mono text-xs md:grid-cols-4" style={{ color: "var(--text-3)" }}>
          <p>© {new Date().getFullYear()} {siteConfig.owner.name}</p>
          <p>
            {siteConfig.owner.location.replace(/\s+\d{5}$/, "")}, TH — <LocalClock className="text-[var(--text-2)]" />
          </p>
          <div className="flex items-center gap-4">
            {links.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--text-1)]">
                <Icon size={13} aria-hidden="true" />
                {label}
              </a>
            ))}
            <a href={siteConfig.social.email} className="transition-colors hover:text-[var(--text-1)]">
              Email
            </a>
          </div>
          <a href="#top" className="inline-flex items-center gap-1.5 md:justify-self-end transition-colors hover:text-[var(--text-1)]">
            Back to top <FaArrowUp size={10} aria-hidden="true" />
          </a>
        </div>

        <p
          className="display mt-12 select-none whitespace-nowrap text-[clamp(4rem,17.5vw,17rem)] leading-[0.78] -mb-[0.12em]"
          style={{
            background: "linear-gradient(180deg, rgba(255,248,240,0.9) 0%, rgba(255,248,240,0.08) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
          aria-hidden="true"
        >
          {siteConfig.owner.name}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
