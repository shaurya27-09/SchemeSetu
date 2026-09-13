import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface TextEffectProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  as = 'h1'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const Tag = motion[as];

  if (shouldReduceMotion) {
    const Component = as;
    return <Component className={className}>{children}</Component>;
  }

  // Check if string contains Devanagari / Hindi characters
  const isHindi = /[\u0900-\u097F]/.test(children);

  // Split by words to preserve Devanagari ligatures and render cleanly
  const words = children.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isHindi ? 0.04 : 0.03,
        delayChildren: delay,
      }
    }
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px)',
      y: 8,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        duration: duration,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  return (
    <Tag
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'inline-block', maxWidth: '100%' }}
    >
      {words.map((word, idx) => (
        <React.Fragment key={idx}>
          <motion.span
            variants={wordVariants}
            className="inline-block whitespace-normal"
          >
            {word}
          </motion.span>
          {idx < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  );
};
