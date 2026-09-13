import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface GlowEffectProps {
  className?: string;
  intensity?: 'subtle' | 'medium';
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  className = '',
  intensity = 'subtle',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  const opacityClass = intensity === 'subtle' ? 'opacity-30 dark:opacity-20' : 'opacity-50 dark:opacity-30';

  return (
    <div
      className={`pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 blur-sm ${opacityClass} transition-opacity duration-500 ${className}`}
      aria-hidden="true"
    />
  );
};
