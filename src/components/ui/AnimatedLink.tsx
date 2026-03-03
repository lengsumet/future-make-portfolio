"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';
import { LOADING_CONFIG } from '@/config/loadingConfig';

interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const AnimatedLink: React.FC<AnimatedLinkProps> = ({ 
  href, 
  children, 
  className = '', 
  onClick 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading, stopLoading } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Don't navigate if already on the same page
    if (pathname === href) {
      return;
    }

    // Call custom onClick handler if provided
    if (onClick) {
      onClick();
    }

    // Start loading animation
    startLoading();

    // Small delay to ensure loading screen appears
    setTimeout(() => {
      // Navigate to the new page
      router.push(href);

      // Simulate minimum loading time for visual consistency
      setTimeout(() => {
        stopLoading();
      }, LOADING_CONFIG.MINIMUM_LOADING_TIME);
    }, LOADING_CONFIG.NAVIGATION_DELAY);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default AnimatedLink;