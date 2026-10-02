"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface EntranceAnimationProps {
    name: string;
    title: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Name arrives letter by letter out of a blur, then the title. The silver
 * fill sits on each letter, not the heading: a background-clip on a parent
 * cannot paint into transformed children.
 */
const EntranceAnimation: React.FC<EntranceAnimationProps> = ({ name, title }) => {
    const reduce = useReducedMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.3,
            },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0, y: '0.35em', filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: '0em',
            filter: 'blur(0px)',
            transition: { duration: 0.7, ease },
        },
    };

    const subtitleVariants = {
        hidden: { opacity: 0, y: 14 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease, delay: 0.3 + name.length * 0.05 },
        },
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center text-center"
            variants={containerVariants}
            initial={reduce ? false : 'hidden'}
            animate="visible"
        >
            <h1 className="display mb-4 text-5xl md:text-7xl" aria-label={name}>
                {name.split('').map((char, index) => (
                    <motion.span
                        key={index}
                        aria-hidden="true"
                        className="text-silver inline-block pb-[0.08em]"
                        variants={letterVariants}
                    >
                        {char === ' ' ? ' ' : char}
                    </motion.span>
                ))}
            </h1>
            <motion.p
                className="text-lg text-[var(--text-2)] md:text-2xl"
                variants={subtitleVariants}
            >
                {title}
            </motion.p>
        </motion.div>
    );
};

export default EntranceAnimation;
