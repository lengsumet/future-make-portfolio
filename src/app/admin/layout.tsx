"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartBar, FaBoxOpen, FaShoppingCart, FaChartLine,
  FaBars, FaTimes, FaSignOutAlt, FaHome,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const adminNav = [
  { name: "Dashboard", href: "/admin",            icon: FaChartBar },
  { name: "Products",  href: "/admin/products",   icon: FaBoxOpen },
  { name: "Orders",    href: "/admin/orders",      icon: FaShoppingCart },
  { name: "Analytics", href: "/admin/analytics",   icon: FaChartLine },
];

function NavIcon({
  href,
  icon: Icon,
  name,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  name: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={name}
      className="group relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200"
      style={{
        backgroundColor: isActive ? "rgb(147 51 234 / 0.75)" : "transparent",
        boxShadow: isActive ? "0 0 14px rgb(147 51 234 / 0.35)" : "none",
      }}
    >
      <div className="transition-transform duration-150 ease-out group-hover:scale-125">
        <Icon
          size={14}
          className={`transition-colors duration-150 ${
            isActive ? "text-white" : "text-gray-600 group-hover:text-gray-100"
          }`}
        />
      </div>
      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900/95 border border-gray-700/40 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap z-50 shadow-xl">
        {name}
      </span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/admin", { method: "DELETE" });
    router.push("/admin/login");
  };

  const currentPage = adminNav.find((n) => n.href === pathname)?.name ?? "Admin";

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Floating Admin Sidebar ── */}
      <aside className="hidden md:flex flex-col items-center fixed left-3 top-1/2 -translate-y-1/2 z-30 rounded-2xl bg-gray-950/75 border border-white/5 backdrop-blur-xl shadow-xl shadow-black/50 py-4 w-12">
        {/* Admin badge */}
        <Link
          href="/admin"
          className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors flex items-center justify-center mb-5 flex-shrink-0"
        >
          <span className="text-[9px] font-bold text-white">ADM</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-1.5">
          {adminNav.map((item) => (
            <NavIcon key={item.href} {...item} isActive={pathname === item.href} />
          ))}
        </nav>

        {/* Divider + bottom actions */}
        <div className="w-5 h-px bg-white/8 my-2" />
        <div className="flex flex-col items-center gap-0.5 w-full px-1.5">
          <Link
            href="/"
            className="group relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-gray-200 transition-colors"
          >
            <FaHome size={14} />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900/95 border border-gray-700/50 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
              View Site
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="group relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-red-400 transition-colors"
          >
            <FaSignOutAlt size={14} />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900/95 border border-gray-700/50 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-gray-950/97 backdrop-blur-xl z-40 flex flex-col px-8 py-12"
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: "0%" }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="mb-10">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Admin Panel</p>
              <h2 className="text-lg font-semibold text-white">Sumet Buarod</h2>
            </div>
            <nav className="flex flex-col gap-5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 text-base font-medium transition-colors ${
                      pathname === item.href ? "text-purple-400" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto flex flex-col gap-4 border-t border-gray-800 pt-6">
              <Link href="/" className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors">
                <FaHome size={16} /> View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 text-gray-400 hover:text-red-400 transition-colors"
              >
                <FaSignOutAlt size={16} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900/90 border border-gray-700/60 text-gray-300 backdrop-blur"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FaTimes size={13} /> : <FaBars size={13} />}
      </button>

      {/* ── Main Content ── */}
      <div className="flex-1 md:ml-16 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur border-b border-gray-800/40 px-6 py-3.5 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">{currentPage}</span>
          <span className="ml-auto text-xs text-gray-600">Admin</span>
        </header>

        <main className="flex-1 p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
