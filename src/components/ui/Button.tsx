"use client";

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

/**
 * Pill button in the site's vocabulary.
 *   primary   — cream pill on the dark ground, the one main action
 *   secondary — ghost pill with a hairline, for the action beside it
 *   ghost     — no outline until hovered, for tertiary actions
 *   accent    — caramel pill, for the rare action that should glow
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--text-1)] text-[var(--background)] border border-transparent shadow-[0_0_40px_-12px_rgba(255,248,240,0.45)] hover:opacity-90',
  secondary:
    'bg-white/[0.03] text-[var(--text-1)] border border-[var(--border-mid)] hover:bg-white/[0.06] hover:border-[var(--border-strong-visible)]',
  ghost:
    'bg-transparent text-[var(--text-2)] border border-transparent hover:bg-white/[0.05] hover:text-[var(--text-1)]',
  accent:
    'bg-[var(--accent)] text-[var(--background)] border border-transparent shadow-[0_0_40px_-10px_rgba(224,168,120,0.6)] hover:bg-[var(--accent-3)]',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    const reduce = useReducedMotion();
    // A disabled button that still reacts to the pointer reads as clickable.
    const interaction = disabled || reduce ? {} : { whileTap: { scale: 0.98 } };

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-full! font-medium transition-[background-color,border-color,color,opacity] duration-200 ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed opacity-45 hover:opacity-45' : ''} ${className}`}
        {...interaction}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
