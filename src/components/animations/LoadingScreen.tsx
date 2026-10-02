"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLoading } from '@/contexts/LoadingContext';
import { LOADING_CONFIG } from '@/config/loadingConfig';

const DISPLAY_NAME = "Sumet Buarod";
const DISPLAY_TITLE = "Software Engineer";
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Minimal loader in the site's language: near-black ground, fading dot grid,
 * a caramel "SB" mark, the name in the silver fill, a thin caramel progress
 * line and a shiny "Loading". When it shows and hides is owned entirely by
 * LoadingContext; this component only draws.
 */
const LoadingScreen: React.FC = () => {
  const { isLoading } = useLoading();
  const reduce = useReducedMotion();
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSub(true), LOADING_CONFIG.SPINNER_DELAY);
      return () => clearTimeout(timer);
    } else {
      setShowSub(false);
    }
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-[var(--background)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{
            duration: LOADING_CONFIG.CONTAINER_FADE_DURATION / 1000,
            ease,
          }}
        >
          <div className="dot-grid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute left-1/2 top-[30%] h-72 w-[min(36rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.12] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-center">
            {/* Mark */}
            <motion.div
              aria-hidden="true"
              className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[var(--accent-fg)] via-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_60px_-8px_rgba(224,168,120,0.65)]"
              initial={reduce ? false : { opacity: 0, scale: 0.85, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
            >
              <span className="display text-2xl text-[var(--background)]">SB</span>
              <span className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/25" />
            </motion.div>

            {/* Name */}
            <motion.p
              className="display text-silver mt-7 pb-[0.08em] text-2xl md:text-3xl"
              initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease, delay: 0.25 }}
            >
              {DISPLAY_NAME}
            </motion.p>

            {/* Progress line */}
            <div className="mt-6 h-px w-48 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
              <motion.div
                className="h-full w-full origin-left bg-gradient-to-r from-[var(--accent-2)] via-[var(--accent-3)] to-[var(--text-1)]"
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: (LOADING_CONFIG.INITIAL_LOAD_DURATION - 300) / 1000,
                  ease,
                  delay: 0.15,
                }}
              />
            </div>

            <span className="shiny mt-4 font-mono text-2xs uppercase tracking-[0.18em]">Loading</span>

            {/* Subtitle */}
            <div className="mt-1.5 h-4">
              <AnimatePresence>
                {showSub && (
                  <motion.p
                    className="font-mono text-2xs uppercase tracking-[0.18em] text-[var(--text-4)]"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    {DISPLAY_TITLE}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
