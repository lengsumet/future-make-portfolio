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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{
            duration: LOADING_CONFIG.CONTAINER_FADE_DURATION / 1000,
            ease: "easeOut" as const,
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-900/10" />

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>

          {/* Center content */}
          <div className="relative flex flex-col items-center justify-center gap-6">
            {/* Name — letter-by-letter reveal */}
            <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              {DISPLAY_NAME.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block bg-gradient-to-r from-primary via-purple-300 to-secondary bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 24, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    delay: 0.2 + index * (LOADING_CONFIG.LETTER_STAGGER_DELAY / 1000),
                    type: "spring",
                    stiffness: LOADING_CONFIG.SPRING_STIFFNESS,
                    damping: LOADING_CONFIG.SPRING_DAMPING,
                  }}
                  style={{
                    display: 'inline-block',
                    ...(char === ' ' ? { marginRight: '0.3em' } : {}),
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Underline */}
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
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
                  className="text-gray-400 text-sm font-medium tracking-widest uppercase"
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

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
