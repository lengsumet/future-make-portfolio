"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, image, tags, onClick }) => {
  return (
    <motion.div
      className="bg-gray-800/50 rounded-lg overflow-hidden cursor-pointer shadow-lg"
      whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)" }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
    >
      <div className="relative h-48">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
