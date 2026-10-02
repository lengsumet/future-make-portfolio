"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaChartBar, FaBoxOpen, FaShoppingCart, FaChartLine, FaSignOutAlt, FaArrowLeft, FaComments } from "react-icons/fa";
import { motion } from "framer-motion";

const adminNav = [
  { name: "Dashboard", href: "/admin",            icon: FaChartBar },
  { name: "Products",  href: "/admin/products",   icon: FaBoxOpen },
  { name: "Orders",    href: "/admin/orders",      icon: FaShoppingCart },
  { name: "Inbox",     href: "/admin/inbox",       icon: FaComments },
  { name: "Analytics", href: "/admin/analytics",   icon: FaChartLine },
];

/**
 * Admin shell: one sticky bar in the site-nav vocabulary — the SB mark, a
 * pill of sections with a lit chip that glides to the current one, and the
 * two ways out. Labels fold to icons on narrow screens, so the same bar
 * works on a phone without a separate menu.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";
  const [unread, setUnread] = useState(0);

  // Unread chat messages for the Inbox badge; refreshed while the admin is open.
  useEffect(() => {
    if (isLoginPage) return;
    let alive = true;
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/admin/chat?status=open", { cache: "no-store", headers: { "x-no-progress": "1" } });
        if (res.ok && alive) setUnread((await res.json()).unread ?? 0);
      } catch {
        /* the badge can wait for the next tick */
      }
    };
    void load();
    const id = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [isLoginPage, pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/admin", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(12,9,8,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-3 md:gap-4 md:px-10">
          <Link
            href="/admin"
            aria-label="Admin dashboard"
            className="flex shrink-0 items-center gap-2.5 rounded-full! pr-2 transition-opacity hover:opacity-85"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-fg)] to-[var(--accent-2)] text-2xs font-bold text-[var(--background)]">
              SB
            </span>
            <span className="eyebrow hidden lg:inline">Back office</span>
          </Link>

          <nav
            aria-label="Admin"
            className="relative mx-auto flex items-center gap-0.5 rounded-full border border-[var(--border-mid)] bg-[rgba(21,16,14,0.72)] p-1"
          >
            <span className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent opacity-60" aria-hidden="true" />
            {adminNav.map((item) => {
              const active = item.href === "/admin" ? pathname === item.href : !!pathname?.startsWith(item.href);
              const badge = item.href === "/admin/inbox" && unread > 0 ? unread : 0;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={badge ? `${item.name}, ${badge} unread` : item.name}
                  className="relative flex h-9 items-center gap-2 rounded-full! px-3 text-sm transition-colors hover:text-[var(--text-1)] sm:px-4"
                  style={{ color: active ? "var(--text-1)" : "var(--text-3)" }}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-full border border-[var(--border-mid)] bg-white/[0.07]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon size={12} className="relative" aria-hidden="true" />
                  <span className="relative hidden sm:inline">{item.name}</span>
                  {badge > 0 && (
                    <span className="relative flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-3)] px-1 text-2xs font-bold text-[var(--background)]" aria-hidden="true">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/"
              aria-label="View site"
              className="flex h-9 items-center gap-2 rounded-full! px-3 text-sm text-[var(--text-3)] transition-colors hover:bg-white/[0.05] hover:text-[var(--text-1)]"
            >
              <FaArrowLeft size={11} aria-hidden="true" />
              <span className="hidden lg:inline">View site</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-9 items-center gap-2 rounded-full! border border-[var(--border-mid)] px-3 text-sm text-[var(--text-2)] transition-colors hover:border-red-400/40 hover:text-red-300"
            >
              <FaSignOutAlt size={11} aria-hidden="true" />
              <span className="hidden lg:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-10 md:px-10 md:pt-14">{children}</main>
    </div>
  );
}
