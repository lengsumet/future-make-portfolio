"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaHome, FaUser, FaShoppingBag, FaCog,
} from "react-icons/fa";

const navItems = [
  { name: "Home",     href: "/",         icon: FaHome },
  { name: "About",    href: "/about",    icon: FaUser },
  { name: "Shop",     href: "/shop",     icon: FaShoppingBag },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const handleNav = (href: string) => {
    if (pathname === href) return;
    setNavigatingTo(href);
    startTransition(() => {
      router.push(href);
      setNavigatingTo(null);
    });
  };

  React.useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
    router.prefetch("/admin");
  }, [router]);

  const isAdminActive = !!pathname?.startsWith("/admin");

  return (
    <>
      {/* ── Desktop: top floating pill ── */}
      <header
        className="hidden md:flex fixed top-5 left-1/2 -translate-x-1/2 z-50 items-center gap-1 px-2.5 py-2 rounded-2xl"
        style={{
          background: "rgba(11,11,18,0.85)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Logo badge */}
        <Link
          href="/"
          className="w-7 h-7 rounded-lg flex items-center justify-center mr-1 flex-shrink-0 hover:opacity-80 transition-opacity duration-150"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <span className="text-2xs font-bold text-foreground tracking-wide">SB</span>
        </Link>

        {/* Divider */}
        <div className="w-px h-4 mx-1.5" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Nav items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isLoading = navigatingTo === item.href;

          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className="nav-pill relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors duration-150"
              style={{
                color: isActive ? "#fff" : "var(--nav-idle-fg)",
                backgroundColor: isActive ? "transparent" : "var(--nav-idle-bg)",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "rgba(99,102,241,0.22)",
                    border: "1px solid rgba(99,102,241,0.38)",
                    boxShadow: "0 0 12px rgba(99,102,241,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={12} className="relative z-10 flex-shrink-0" />
              <span className="relative z-10">{item.name}</span>

              {/* Loading pulse ring */}
              {isLoading && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: "1px solid rgba(99,102,241,0.6)" }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-4 mx-1.5" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Admin */}
        <button
          onClick={() => handleNav("/admin")}
          title="Admin"
          className="nav-cog relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors duration-150"
          style={{
            color: isAdminActive ? "#a5b4fc" : "var(--nav-idle-fg)",
            backgroundColor: isAdminActive ? "rgba(99,102,241,0.2)" : "var(--nav-idle-bg)",
          }}
        >
          <FaCog size={13} />
        </button>
      </header>

      {/* ── Mobile: bottom floating pill ── */}
      <nav
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-2 rounded-2xl"
        style={{
          background: "rgba(11,11,18,0.92)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        }}
        aria-label="Primary navigation"
      >
        {[...navItems, { name: "Admin", href: "/admin", icon: FaCog }].map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/admin" && pathname?.startsWith("/admin"));

          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              aria-label={item.name}
              className="nav-pill nav-pill-mobile relative flex items-center justify-center w-11 h-10 rounded-xl transition-colors duration-150"
              style={{
                color: isActive ? "#fff" : "var(--nav-idle-fg)",
                backgroundColor: isActive ? "transparent" : "var(--nav-idle-bg)",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-mobile-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "rgba(99,102,241,0.28)",
                    border: "1px solid rgba(99,102,241,0.4)",
                    boxShadow: "0 0 10px rgba(99,102,241,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={15} className="relative z-10" />
            </button>
          );
        })}
      </nav>
    </>
  );
}
