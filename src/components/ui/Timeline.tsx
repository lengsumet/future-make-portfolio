"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div 
        className="relative border-l-2 border-primary/30 ml-6"
        variants={container}
        initial="hidden"
        animate="show"
    >
      {items.map((item, index) => (
        <motion.div key={index} className="mb-10 ml-10" variants={itemVariant}>
            <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-8 ring-background">
                <svg className="w-4 h-4 text-purple-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
            </span>
          <h3 className="flex items-center mb-1 text-lg font-semibold text-white">
            {item.title}{' '}
            <span className="text-secondary text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">{item.subtitle}</span>
          </h3>
          <time className="block mb-2 text-sm font-normal leading-none text-gray-400">{item.period}</time>
          <p className="mb-4 text-base font-normal text-gray-400">{item.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Timeline;
