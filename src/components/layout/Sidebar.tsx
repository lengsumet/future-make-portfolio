"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  isNavigating,
}: {
  href: string;
  icon: React.ElementType;
  name: string;
  isActive: boolean;
  onClick?: () => void;
  isNavigating?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={name}
      className="group relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: isActive ? "rgb(16 185 129 / 0.75)" : "transparent",
        boxShadow: isActive ? "0 0 14px rgb(16 185 129 / 0.35)" : "none",
        opacity: isNavigating ? 0.6 : 1,
        transform: isNavigating ? "scale(0.95)" : "scale(1)",
      }}
    >
      {/* Icon - always visible, no replacement */}
      <div className="transition-transform duration-150 ease-out group-hover:scale-125">
        <Icon
          size={14}
          className={`transition-colors duration-150 ${
            isActive ? "text-white" : "text-gray-600 group-hover:text-emerald-200"
          }`}
        />
      </div>
      
      {/* Loading indicator - subtle pulse overlay */}
      {isNavigating && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-emerald-400"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.9, 1.05, 0.9],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900/95 border border-gray-700/40 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap z-50 shadow-xl">
        {name}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  const handleNavigation = (href: string, closeMobile = false) => {
    if (pathname === href) return;
    
    setNavigatingTo(href);
    if (closeMobile) setMobileOpen(false);
    
    // Only show loading if navigation takes > 100ms (avoid flash)
    const loadingTimer = setTimeout(() => {
      setShowLoading(true);
    }, 100);
    
    startTransition(() => {
      router.push(href);
      // Reset after navigation completes
      clearTimeout(loadingTimer);
      setShowLoading(false);
      setNavigatingTo(null);
    });
  };

  // Prefetch all routes on mount for instant navigation
  React.useEffect(() => {
    [...navItems, ...adminItems].forEach(item => {
      router.prefetch(item.href);
    });
  }, [router]);

  return (
    <>
      {/* ── Floating Sidebar ── */}
      <aside className="hidden md:flex flex-col items-center fixed left-3 top-1/2 -translate-y-1/2 z-30 rounded-2xl bg-gray-950/75 border border-white/5 backdrop-blur-xl shadow-xl shadow-black/50 py-4 w-12">
        {/* Logo */}
        <Link
          href="/"
          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center mb-5 flex-shrink-0"
        >
          <span className="text-[10px] font-bold text-white">SB</span>
        </Link>

        {/* Top loading bar - global navigation indicator */}
        {showLoading && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-2xl"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}

        {/* Nav */}
        <nav className="flex flex-col items-center gap-0.5 flex-1 w-full px-1.5">
          {navItems.map((item) => (
            <div key={item.href} onClick={() => handleNavigation(item.href)} className="cursor-pointer">
              <NavIcon 
                {...item} 
                isActive={pathname === item.href}
                isNavigating={navigatingTo === item.href}
              />
            </div>
          ))}
        </nav>

        {/* Divider + admin */}
        <div className="w-5 h-px bg-white/8 my-2" />
        <div className="flex flex-col items-center w-full px-1.5">
          {adminItems.map((item) => (
            <div key={item.href} onClick={() => handleNavigation(item.href)} className="cursor-pointer">
              <NavIcon 
                {...item} 
                isActive={!!pathname?.startsWith("/admin")}
                isNavigating={navigatingTo === item.href}
              />
            </div>
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
                const isLoading = navigatingTo === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href, true)}
                    disabled={isLoading}
                    className={`relative flex items-center gap-4 text-base transition-all text-left ${
                      isActive
                        ? "text-emerald-400"
                        : "text-gray-400 hover:text-white"
                    } ${isLoading ? "opacity-60 scale-95" : ""}`}
                  >
                    <Icon size={16} />
                    <span className="font-medium">{item.name}</span>
                    
                    {/* Loading indicator - subtle dot animation */}
                    {isLoading && (
                      <motion.span
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
