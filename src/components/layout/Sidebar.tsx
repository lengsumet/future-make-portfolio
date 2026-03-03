"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome, FaUser, FaStar, FaShoppingBag,
  FaCog, FaBars, FaTimes,
} from "react-icons/fa";

const navItems = [
  { name: "Home",     href: "/",         icon: FaHome },
  { name: "About",    href: "/about",     icon: FaUser },
  { name: "Showcase", href: "/showcase",  icon: FaStar },
  { name: "Shop",     href: "/shop",      icon: FaShoppingBag },
];

const adminItems = [
  { name: "Admin", href: "/admin", icon: FaCog },
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
      {/* Icon — scales on hover independently of tooltip */}
      <div className="transition-transform duration-150 ease-out group-hover:scale-125">
        <Icon
          size={14}
          className={`transition-colors duration-150 ${
            isActive ? "text-white" : "text-gray-600 group-hover:text-gray-100"
          }`}
        />
      </div>
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900/95 border border-gray-700/40 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap z-50 shadow-xl">
        {name}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Floating Sidebar ── */}
      <aside className="hidden md:flex flex-col items-center fixed left-3 top-1/2 -translate-y-1/2 z-30 rounded-2xl bg-gray-950/75 border border-white/5 backdrop-blur-xl shadow-xl shadow-black/50 py-4 w-12">
        {/* Logo */}
        <Link
          href="/"
          className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors flex items-center justify-center mb-5 flex-shrink-0"
        >
          <span className="text-[10px] font-bold text-white">SB</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-1.5">
          {navItems.map((item) => (
            <NavIcon key={item.href} {...item} isActive={pathname === item.href} />
          ))}
        </nav>

        {/* Divider + admin */}
        <div className="w-5 h-px bg-white/8 my-2" />
        <div className="flex flex-col items-center w-full px-1.5">
          {adminItems.map((item) => (
            <NavIcon key={item.href} {...item} isActive={!!pathname?.startsWith("/admin")} />
          ))}
        </div>
      </aside>

      {/* ── Mobile Hamburger ── */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900/90 border border-gray-700/60 text-gray-300 backdrop-blur"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FaTimes size={13} /> : <FaBars size={13} />}
      </button>

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
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Navigation</p>
              <h2 className="text-lg font-semibold text-white">Sumet Buarod</h2>
            </div>

            <nav className="flex flex-col gap-5">
              {[...navItems, ...adminItems].map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href === "/admin" && pathname?.startsWith("/admin"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 text-base transition-colors ${
                      isActive
                        ? "text-purple-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
