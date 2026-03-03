"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { LOADING_CONFIG } from '@/config/loadingConfig';

// Module-level flag: persists across Strict Mode remounts, resets only on full page reload
let _loadingDone = false;

interface LoadingContextType {
  isLoading: boolean;
  loadingProgress: number;
  isInitialLoad: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const shouldAnimate = LOADING_CONFIG.ENABLE_INITIAL_LOAD_ANIMATION && !_loadingDone;
  const [isLoading, setIsLoading] = useState<boolean>(shouldAnimate);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(shouldAnimate);

  // Handle initial page load animation
  useEffect(() => {
    if (!shouldAnimate) return;
    _loadingDone = true;
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsInitialLoad(false);
    }, LOADING_CONFIG.INITIAL_LOAD_DURATION);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setLoadingProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
    }, 400);
  }, []);

  const setProgress = useCallback((progress: number) => {
    setLoadingProgress(Math.min(100, Math.max(0, progress)));
  }, []);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingProgress,
      isInitialLoad,
      startLoading,
      stopLoading,
      setProgress,
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
