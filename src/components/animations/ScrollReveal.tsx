"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'default' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'scale';
  delay?: number;
  className?: string;
  triggerOnce?: boolean;
  enableScrollUp?: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

const HIDDEN = {
  default: { opacity: 0, y: 40 },
  slideLeft: { opacity: 0, x: -48 },
  slideRight: { opacity: 0, x: 48 },
  slideUp: { opacity: 0, y: 48 },
  slideDown: { opacity: 0, y: -48 },
  scale: { opacity: 0, scale: 0.94 },
} as const;

const VISIBLE = {
  default: { opacity: 1, y: 0 },
  slideLeft: { opacity: 1, x: 0 },
  slideRight: { opacity: 1, x: 0 },
  slideUp: { opacity: 1, y: 0 },
  slideDown: { opacity: 1, y: 0 },
  scale: { opacity: 1, scale: 1 },
} as const;

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'default',
  delay = 0,
  className = '',
  triggerOnce = false,
  enableScrollUp = true,
}) => {
  const reduce = useReducedMotion();
  const { controls, ref } = useScrollAnimation({
    delay,
    triggerOnce,
    enableScrollUp,
    threshold: 0.1,
  });

  // Reduced motion: the content is simply there.
  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: HIDDEN[variant],
        visible: { ...VISIBLE[variant], transition: { duration: 0.8, ease } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
