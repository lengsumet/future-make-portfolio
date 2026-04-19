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
  ({ className = '', variant = 'primary', size = 'md', style, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ${sizes[size]} ${className}`}
        style={{ ...styles[variant], ...style }}
        whileHover={{ scale: 1.03, opacity: 0.9 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
