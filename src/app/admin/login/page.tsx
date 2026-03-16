"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      if (!res.ok) {
        setError("Incorrect password");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--background, #0a0a0f)" }}
    >
      {/* Aurora bg */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, #6366f1 0%, #8b5cf6 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <FiLock size={22} style={{ color: "#818cf8" }} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "#fff" }}
            >
              Admin Panel
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              Sumet Buarod Portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Password field */}
            <div>
              <label
                className="block text-xs mb-2 tracking-wide"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color: "#fff",
                  }}
                  placeholder="Enter admin password"
                  autoFocus
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={e => (e.currentTarget.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                >
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-xs text-center"
                  style={{ color: "#f87171" }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity duration-150 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                boxShadow: "0 0 24px rgba(99,102,241,0.3)",
              }}
              whileHover={{ opacity: 0.88 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block" }}
                  />
                  Logging in...
                </span>
              ) : "Login"}
            </motion.button>
          </form>

          <p
            className="text-center text-xs mt-6"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            Default: admin123 · change via ADMIN_PASSWORD env var
          </p>
        </div>
      </motion.div>
    </div>
  );
}
