// Loading Animation Configuration
export const LOADING_CONFIG = {
  // Timing controls
  MINIMUM_LOADING_TIME: 1200, // Minimum time to show loading screen (ms)
  MAXIMUM_LOADING_TIME: 3000, // Maximum timeout for loading (ms)
  NAVIGATION_DELAY: 100, // Delay before starting navigation (ms)
  PAGE_TRANSITION_DELAY: 200, // Delay before showing page content (ms)
  
  // Animation durations
  CONTAINER_FADE_DURATION: 300,
  LOGO_ANIMATION_DURATION: 600,
  LETTER_STAGGER_DELAY: 80,
  SPINNER_FADE_DURATION: 300,
  UNDERLINE_DURATION: 800,
  UNDERLINE_DELAY: 1000,
  SPINNER_DELAY: 800,
  
  // Animation easing
  EASE_OUT: "easeOut",
  EASE_IN: "easeIn",
  LINEAR: "linear",
  EASE_IN_OUT: "easeInOut",
  
  // Spinner settings
  SPINNER_ROTATION_DURATION: 2000,
  SPINNER_SECONDARY_ROTATION_DURATION: 1500,
  GLOW_PULSE_DURATION: 2000,
  
  // Spring physics
  SPRING_STIFFNESS: 100,
  SPRING_DAMPING: 12,
  
  // Initial page load
  ENABLE_INITIAL_LOAD_ANIMATION: true,
  INITIAL_LOAD_DURATION: 1800,
} as const;

// Animation variants factory
export const createLoadingVariants = () => ({
  container: {
    hidden: { 
      opacity: 0,
      scale: 1.05,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: LOADING_CONFIG.CONTAINER_FADE_DURATION / 1000,
        ease: LOADING_CONFIG.EASE_OUT,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: LOADING_CONFIG.EASE_IN,
      },
    },
  },
  
  logo: {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: LOADING_CONFIG.LOGO_ANIMATION_DURATION / 1000,
        ease: LOADING_CONFIG.EASE_OUT,
        staggerChildren: LOADING_CONFIG.LETTER_STAGGER_DELAY / 1000,
        delayChildren: 0.1,
      },
    },
  },
  
  letter: {
    hidden: { 
      opacity: 0, 
      y: 20,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { 
        type: "spring",
        stiffness: LOADING_CONFIG.SPRING_STIFFNESS,
        damping: LOADING_CONFIG.SPRING_DAMPING,
      },
    },
  },
  
  spinner: {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: LOADING_CONFIG.SPINNER_FADE_DURATION / 1000,
        ease: LOADING_CONFIG.EASE_OUT,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      transition: {
        duration: 0.2,
      },
    },
  },
});

export type LoadingConfigType = typeof LOADING_CONFIG;