import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const buttonVariants = cva(
  'font-semibold rounded-lg shadow-md transition-all duration-300',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-purple-700 shadow-glow-purple',
        secondary: 'bg-secondary text-white hover:bg-blue-700 shadow-glow-blue',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

import { type HTMLMotionProps } from 'framer-motion';

// Combine motion props and CVA variants
export type ButtonProps = HTMLMotionProps<'button'> & VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <motion.button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };