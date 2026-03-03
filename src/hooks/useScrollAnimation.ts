"use client";

import { useEffect, useState } from 'react';
import { useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ScrollAnimationOptions {
  triggerOnce?: boolean;
  threshold?: number;
  rootMargin?: string;
  enableScrollUp?: boolean;
  delay?: number;
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const {
    triggerOnce = false, // Changed default to false to allow re-triggering
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    enableScrollUp = true,
    delay = 0
  } = options;

  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
    rootMargin,
  });

  useEffect(() => {
    if (inView) {
      // Delay animation if specified
      const timer = setTimeout(() => {
        controls.start('visible');
        setHasAnimated(true);
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (enableScrollUp && hasAnimated && !triggerOnce) {
      // Re-trigger animation when scrolling back up
      controls.start('hidden');
    }
  }, [controls, inView, enableScrollUp, hasAnimated, triggerOnce, delay]);

  return { controls, ref, inView };
};

// Enhanced animation variants
export const scrollVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  },
};

// Stagger animation for multiple elements
export const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

export const staggerChildVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

// Slide variants for different directions
export const slideVariants = {
  slideInLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  },
  slideInRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  },
  slideInUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  },
  slideInDown: {
    hidden: { opacity: 0, y: -60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  }
};

// Scale and fade variants
export const scaleVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotate: -5
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: { 
      duration: 0.7,
      ease: 'easeOut',
      type: 'spring',
      stiffness: 120,
      damping: 20
    }
  }
};

// Backward compatibility
export const defaultVariants = scrollVariants;

// Helper function to create staggered animation configs
export const createStaggeredConfigs = (count: number, baseDelay = 0) => {
  return Array.from({ length: count }, (_, index) => ({
    delay: baseDelay + (index * 100),
    enableScrollUp: true,
    triggerOnce: false
  }));
};