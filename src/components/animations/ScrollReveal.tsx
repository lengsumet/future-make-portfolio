"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'default' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'scale';
  delay?: number;
  className?: string;
  triggerOnce?: boolean;
  enableScrollUp?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'default',
  delay = 0,
  className = '',
  triggerOnce = false,
  enableScrollUp = true,
}) => {
  const { controls, ref } = useScrollAnimation({
    delay,
    triggerOnce,
    enableScrollUp,
    threshold: 0.1,
  });

  const getInitialState = () => {
    switch (variant) {
      case 'slideLeft':
        return { opacity: 0, x: -60 };
      case 'slideRight':
        return { opacity: 0, x: 60 };
      case 'slideUp':
        return { opacity: 0, y: 60 };
      case 'slideDown':
        return { opacity: 0, y: -60 };
      case 'scale':
        return { opacity: 0, scale: 0.8 };
      default:
        return { opacity: 0, y: 50 };
    }
  };

  const getVisibleState = () => {
    switch (variant) {
      case 'slideLeft':
      case 'slideRight':
        return { opacity: 1, x: 0 };
      case 'slideUp':
      case 'slideDown':
        return { opacity: 1, y: 0 };
      case 'scale':
        return { opacity: 1, scale: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialState()}
      animate={controls}
      variants={{
        hidden: getInitialState(),
        visible: {
          ...getVisibleState(),
          transition: {
            duration: 0.8,
            ease: "easeOut",
            type: variant === 'scale' ? "spring" : "tween",
            stiffness: variant === 'scale' ? 120 : undefined,
            damping: variant === 'scale' ? 20 : undefined,
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;