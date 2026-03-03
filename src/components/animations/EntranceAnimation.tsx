"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface EntranceAnimationProps {
    name: string;
    title: string;
}

const EntranceAnimation: React.FC<EntranceAnimationProps> = ({ name, title }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 10 },
        },
    };

    const subtitleVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' as const, delay: 1.5 },
        },
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4">
                {name.split('').map((char, index) => (
                    <motion.span key={index} variants={letterVariants} style={{ display: 'inline-block' }}>
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}
            </motion.h1>
            <motion.p
                className="text-lg md:text-2xl text-purple-300"
                variants={subtitleVariants}
            >
                {title}
            </motion.p>
        </motion.div>
    );
};

export default EntranceAnimation;