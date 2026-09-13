import React, { useEffect, useState } from 'react';
import { useSpring, useTransform, motion, useReducedMotion } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatIndian?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
  formatIndian = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [spring, shouldReduceMotion, value]);

  const formatted = shouldReduceMotion
    ? formatNumber(value, decimals, formatIndian)
    : formatNumber(displayValue, decimals, formatIndian);

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

function formatNumber(val: number, decimals: number, formatIndian: boolean): string {
  const rounded = Number(val.toFixed(decimals));
  if (!formatIndian) {
    return rounded.toLocaleString();
  }
  // Standard Indian grouping: e.g. 15,00,000 or 1,500
  try {
    return rounded.toLocaleString('en-IN', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  } catch {
    return rounded.toString();
  }
}
