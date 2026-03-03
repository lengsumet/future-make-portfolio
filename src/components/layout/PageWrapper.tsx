"use client";

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from '@/contexts/LoadingContext';
import { useEffect } from 'react';

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoading } = useLoading();

  // Hide page content when loading
  if (isLoading) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
          delay: 0.2 // Small delay to ensure loading screen has time to complete
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}