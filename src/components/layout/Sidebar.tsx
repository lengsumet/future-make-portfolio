"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaHome, FaUser, FaShoppingBag, FaCog } from "react-icons/fa";
import LocalClock from "@/components/home/LocalClock";

const navItems = [
  { name: "Home", href: "/", icon: FaHome },
  { name: "About", href: "/about", icon: FaUser },
  { name: "Shop", href: "/shop", icon: FaShoppingBag },
];

/**
 * Site navigation.
 *
 * Desktop: a thin full-width bar in the editorial style the godly-featured
 * sites share — wordmark left, numbered mono links, the owner's local time
 * right. Transparent at the top of the page, it takes a blurred espresso
 * ground once the page scrolls so it stays legible over content.
 * Mobile: a floating pill at the bottom, within thumb reach.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    router.prefetch("/admin");
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <>
      {/* ── Desktop: editorial top bar ── */}
      <header
        className="hidden md:block fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300"
        style={{
          background: scrolled ? "rgba(46, 28, 26, 0.78)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-10">
          <Link href="/" className="display text-2xl tracking-[-0.02em] transition-opacity hover:opacity-80" style={{ color: "var(--text-1)" }}>
            Sumet Buarod
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1">
            {navItems.map((item, i) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors"
                  style={{ color: active ? "var(--text-1)" : "var(--text-3)" }}
                >
                  <span style={{ color: active ? "var(--accent-3)" : "var(--text-4)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="transition-colors group-hover:text-[var(--text-1)]">{item.name}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3.5 -bottom-0.5 h-px"
                      style={{ background: "var(--accent)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 font-mono text-xs" style={{ color: "var(--text-3)" }}>
            <span className="hidden lg:inline uppercase tracking-[0.1em]">Chum Phae, TH</span>
            <LocalClock className="text-[var(--text-2)]" />
            <Link
              href="/admin"
              aria-label="Admin"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/5 hover:text-[var(--text-1)]"
              style={{ color: pathname?.startsWith("/admin") ? "var(--accent-3)" : "var(--text-4)" }}
            >
              <FaCog size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile: bottom floating pill ── */}
      <nav
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-2 rounded-full"
        style={{
          background: "rgba(46, 28, 26, 0.9)",
          border: "1px solid var(--border-mid)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
        aria-label="Primary navigation"
      >
        {[...navItems, { name: "Admin", href: "/admin", icon: FaCog }].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.name}
              aria-current={active ? "page" : undefined}
              className="relative flex h-10 w-11 items-center justify-center rounded-full transition-colors"
              style={{ color: active ? "var(--background)" : "var(--text-3)" }}
            >
              {active && (
                <motion.span
                  layoutId="nav-mobile-active"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--accent-3)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={15} className="relative z-10" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
