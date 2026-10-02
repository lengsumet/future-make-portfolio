"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import Spotlight from "@/components/fx/Spotlight";
import SpotlightCard from "@/components/fx/SpotlightCard";

export default function AdminLoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.status === 429) {
        setError("Too many attempts. Please wait 15 minutes before trying again.");
        setShakeKey((k) => k + 1);
        setLoading(false);
        return;
      }

      if (res.status === 401 || res.status === 400) {
        setError("Incorrect password. Please try again.");
        setShakeKey((k) => k + 1);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError("Login failed. Please try again later.");
        setShakeKey((k) => k + 1);
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Cannot connect to server. Please try again.");
      setShakeKey((k) => k + 1);
      setLoading(false);
    }
  };

  const shake = shakeKey > 0 && !reduce;

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] p-4">
      <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
      <Spotlight className="-z-10" />

      <motion.div
        key={shakeKey}
        className="relative w-full max-w-sm"
        initial={shakeKey === 0 && !reduce ? { opacity: 0, y: 20 } : false}
        animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { opacity: 1, y: 0 }}
        transition={shake ? { duration: 0.45, ease: "easeInOut" } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* a soft caramel glow under the card */}
        <div className="pointer-events-none absolute -inset-x-10 -top-16 h-48 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" aria-hidden="true" />

        {/* a lit hairline along the card's top edge, as on the site nav */}
        <span className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />

        <SpotlightCard className="p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-fg)] to-[var(--accent-2)] text-sm font-bold text-[var(--background)] shadow-[0_0_40px_-8px_rgba(224,168,120,0.6)]">
              SB
            </span>
            <p className="eyebrow mt-6">Back office</p>
            <h1 className="display text-silver mt-3 pb-[0.06em] text-4xl">Sign in</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>
              Sumet Buarod — portfolio admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="password" className="mb-2 block text-xs" style={{ color: "var(--text-2)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                  autoComplete="current-password"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  className={`w-full rounded-xl! border bg-[var(--surface-2)] px-4 py-3 pr-11 text-sm text-[var(--text-1)] transition-colors placeholder:text-[var(--text-4)] focus:border-[var(--accent)] ${
                    error ? "border-red-400/50" : "border-[var(--border-mid)]"
                  }`}
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-pressed={showPw}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full! text-[var(--text-3)] transition-colors hover:text-[var(--text-1)]"
                >
                  {showPw ? <FiEyeOff size={15} aria-hidden="true" /> : <FiEye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  id="login-error"
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-red-300"
                  initial={reduce ? false : { opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiAlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-xs leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full! bg-[var(--text-1)] py-3 text-sm font-medium text-[var(--background)] shadow-[0_0_40px_-12px_rgba(255,248,240,0.5)] transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <motion.span
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-[rgba(12,9,8,0.25)] border-t-[var(--background)]"
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    aria-hidden="true"
                  />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] transition-colors hover:text-[var(--text-1)]"
            >
              <FiArrowLeft size={12} aria-hidden="true" />
              Back to site
            </Link>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
}
