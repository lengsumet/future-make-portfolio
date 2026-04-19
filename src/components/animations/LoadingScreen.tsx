"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/contexts/LoadingContext';
import { LOADING_CONFIG } from '@/config/loadingConfig';

const DISPLAY_NAME = "Sumet Buarod";
const DISPLAY_TITLE = "Software Engineer";

const LoadingScreen: React.FC = () => {
  const { isLoading } = useLoading();
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "#0a0a0f" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{
            duration: LOADING_CONFIG.CONTAINER_FADE_DURATION / 1000,
            ease: "easeOut" as const,
          }}
        >
          {/* Aurora bg */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20"
              style={{
                background: "radial-gradient(ellipse, #C08552 0%, #8C5A3C 40%, transparent 70%)",
                filter: "blur(80px)",
              }}
            />
          </div>

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Center content */}
          <div className="relative flex flex-col items-center justify-center gap-6">
            {/* Name — letter-by-letter reveal */}
            <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              {DISPLAY_NAME.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  style={{
                    background: "linear-gradient(135deg, #C08552, #8C5A3C, #E0A878)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    display: 'inline-block',
                    ...(char === ' ' ? { marginRight: '0.3em' } : {}),
                  }}
                  initial={{ opacity: 0, y: 24, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: 0.2 + index * (LOADING_CONFIG.LETTER_STAGGER_DELAY / 1000),
                    type: "spring",
                    stiffness: LOADING_CONFIG.SPRING_STIFFNESS,
                    damping: LOADING_CONFIG.SPRING_DAMPING,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Underline */}
            <motion.div
              className="h-px rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #C08552, #8C5A3C, transparent)" }}
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{
                duration: LOADING_CONFIG.UNDERLINE_DURATION / 1000,
                delay: LOADING_CONFIG.UNDERLINE_DELAY / 1000,
                ease: "easeOut" as const,
              }}
            />

            {/* Subtitle */}
            <AnimatePresence>
              {showSub && (
                <motion.p
                  className="text-sm font-medium tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {DISPLAY_TITLE}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
