"use client";

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

interface CardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  onClick: () => void;
}

/** A clickable project card on the shared surface: lifts a little and lights its hairline on hover. */
const Card: React.FC<CardProps> = ({ title, description, image, tags, onClick }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={title}
      className="group cursor-pointer overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--border-mid)] hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.8)]"
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative h-48 overflow-hidden border-b border-[var(--border)]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-1)' }}>{title}</h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>{description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-2.5 py-0.5 font-mono text-2xs"
              style={{ color: 'var(--text-2)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
