"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface Skill {
  name: string;
  level: number;
}

interface SkillBarProps {
  skills: Skill[];
}

const SkillBar: React.FC<SkillBarProps> = ({ skills }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, x: -100 },
        show: { opacity: 1, x: 0 }
    };


  return (
    <motion.div 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
    >
      {skills.map((skill, index) => (
        <motion.div key={index} className="w-full" variants={item}>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-purple-200">{skill.name}</span>
            <span className="text-sm font-medium text-purple-200">{skill.level}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <motion.div
              className="bg-gradient-to-r from-secondary to-primary h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 + index * 0.1 }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SkillBar;