import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface TransitionPanelProps {
  activeIndex: number;
  direction?: number; // 1 = forward/next, -1 = back
  children: React.ReactNode;
  className?: string;
}

export const TransitionPanel: React.FC<TransitionPanelProps> = ({
  activeIndex,
  direction = 1,
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const prevIndexRef = useRef(activeIndex);
  
  // If direction wasn't explicitly provided, compute it from index delta
  const effectiveDirection = direction !== undefined 
    ? direction 
    : activeIndex >= prevIndexRef.current ? 1 : -1;

  useEffect(() => {
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 24 : -24,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
    }),
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" custom={effectiveDirection} initial={false}>
        <motion.div
          key={activeIndex}
          custom={effectiveDirection}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.25,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
