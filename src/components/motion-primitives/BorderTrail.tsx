import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface BorderTrailProps {
  className?: string;
  size?: number;
  duration?: number;
  color?: string;
}

export const BorderTrail: React.FC<BorderTrailProps> = ({
  className = '',
  size = 60,
  duration = 5,
  color = 'from-indigo-500 via-indigo-300 to-transparent',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}>
      <motion.div
        className="absolute inset-[-100%]"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: duration,
        }}
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg 300deg, rgba(99, 102, 241, 0.7) 340deg, rgba(165, 180, 252, 0.9) 360deg)`,
        }}
      />
      {/* Inner mask to keep only 1.5px border visible */}
      <div className="absolute inset-[1.5px] rounded-[inherit] bg-inherit" />
    </div>
  );
};
