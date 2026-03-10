"use client";

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLoading } from '@/contexts/LoadingContext';

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
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}