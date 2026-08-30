import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant;
  size?: Size;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #C08552, #8C5A3C)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 0 24px rgba(192, 133, 82,0.3)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid transparent',
  },
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', style, disabled, ...props }, ref) => {
    // A disabled button that still lifts under the cursor reads as clickable.
    const interaction = disabled
      ? {}
      : { whileHover: { scale: 1.03, opacity: 0.9 }, whileTap: { scale: 0.97 } };

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ${sizes[size]} ${disabled ? 'cursor-not-allowed opacity-45' : ''} ${className}`}
        style={{ ...styles[variant], ...style }}
        {...interaction}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
