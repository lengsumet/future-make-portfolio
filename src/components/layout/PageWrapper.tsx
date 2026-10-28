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
  const { isInitialLoad } = useLoading();

  // The page is always rendered, so the server sends its content (search
  // engines, link previews); the loading screen is an opaque layer on top.
  // On the first load that layer is the transition, so no fade of our own.
  return (
    <motion.div
      key={pathname}
      initial={isInitialLoad ? false : { opacity: 0, y: 10 }}
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