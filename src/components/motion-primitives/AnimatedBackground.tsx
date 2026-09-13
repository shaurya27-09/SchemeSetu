import React from 'react';
import { motion, Transition, useReducedMotion } from 'motion/react';

interface AnimatedBackgroundProps {
  layoutId?: string;
  className?: string;
  transition?: Transition;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  layoutId = 'active-nav-indicator',
  className = 'absolute inset-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/50 dark:border-indigo-800/50',
  transition = { type: 'spring', bounce: 0.15, duration: 0.35 },
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={`pointer-events-none ${className}`} />;
  }

  return (
    <motion.div
      layoutId={layoutId}
      className={`pointer-events-none ${className}`}
      transition={transition}
    />
  );
};
