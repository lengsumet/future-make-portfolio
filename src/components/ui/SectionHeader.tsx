"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation, defaultVariants } from '@/hooks/useScrollAnimation';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
    const { controls, ref } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      className="text-center mb-12"
      variants={defaultVariants}
      initial="hidden"
      animate={controls}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-lg text-gray-400 mt-2">{subtitle}</p>}
    </motion.div>
  );
};

export default SectionHeader;