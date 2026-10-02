"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
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
 * Desktop: a floating glass pill (Aceternity "Floating Navbar") that slides
 * away while you scroll down to read and comes back the moment you scroll
 * up. The active link sits on a soft lit chip that glides between items.
 * Mobile: the same pill at the bottom, within thumb reach, always shown.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    router.prefetch("/admin");
  }, [router]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setVisible(y < 120 || y < previous);
  });

  const isActive = (href: string) => (href === "/" ? pathname === "/" : !!pathname?.startsWith(href));

  return (
    <>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.header
            key="desktop-nav"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-4 z-50 hidden -translate-x-1/2 md:block"
          >
            <div className="relative flex items-center gap-1 rounded-full border border-[var(--border-mid)] bg-[rgba(21,16,14,0.72)] py-1.5 pl-2 pr-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              {/* a lit hairline along the top edge */}
              <span className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent opacity-70" aria-hidden="true" />

              <Link href="/" aria-label="Sumet Buarod, home" className="mr-1 flex h-8 items-center gap-2 rounded-full pl-1.5 pr-3 transition-colors hover:bg-white/[0.05]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-fg)] to-[var(--accent-2)] text-2xs font-bold text-[var(--background)]">
                  SB
                </span>
                <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
                  Sumet
                </span>
              </Link>

              <nav aria-label="Primary" className="flex items-center">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="relative rounded-full px-4 py-1.5 text-sm transition-colors"
                      style={{ color: active ? "var(--text-1)" : "var(--text-3)" }}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full border border-[var(--border-mid)] bg-white/[0.07]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative hover:text-[var(--text-1)]">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <span className="mx-2 h-4 w-px bg-[var(--border-mid)]" aria-hidden="true" />
              <span className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
                BKK <LocalClock className="text-[var(--text-2)]" />
              </span>
              <Link
                href="/admin"
                aria-label="Admin"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]"
                style={{ color: pathname?.startsWith("/admin") ? "var(--accent-3)" : "var(--text-4)" }}
              >
                <FaCog size={12} />
              </Link>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom floating pill ── */}
      <nav
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--border-mid)] bg-[rgba(21,16,14,0.88)] px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl md:hidden"
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
              style={{ color: active ? "#0C0908" : "var(--text-3)" }}
            >
              {active && (
                <motion.span
                  layoutId="nav-mobile-active"
                  className="absolute inset-0 rounded-full bg-[var(--accent-3)]"
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
