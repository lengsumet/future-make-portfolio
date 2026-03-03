"use client";

import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Container from './Container';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: <FaGithub />, href: 'https://github.com/sumetbuarod' },
    { icon: <FaLinkedin />, href: 'https://linkedin.com/in/sumetbuarod' },
    { icon: <FaTwitter />, href: '#' },
  ];

  return (
    <motion.footer 
      className="py-6 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <Container className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex space-x-4">
          {socialLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              className="text-gray-400 hover:text-white"
              whileHover={{ scale: 1.2, color: '#9333ea' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {React.cloneElement(link.icon, { size: 24 })}
            </motion.a>
          ))}
        </div>
        <p className="text-gray-500 mt-4 md:mt-0">
          © {new Date().getFullYear()} Sumet Buarod. All rights reserved.
        </p>
      </Container>
    </motion.footer>
  );
};

export default Footer;