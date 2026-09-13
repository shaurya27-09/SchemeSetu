import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, Variants, Transition } from 'motion/react';

interface InViewProps {
  children: React.ReactNode;
  variants?: Variants;
  transition?: Transition;
  className?: string;
  margin?: string;
  delay?: number;
  once?: boolean;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const InView: React.FC<InViewProps> = ({
  children,
  variants = defaultVariants,
  transition,
  className = '',
  margin = '-20px',
  delay = 0,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: margin as any });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const activeTransition = transition || {
    duration: 0.45,
    delay: delay,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={activeTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};
