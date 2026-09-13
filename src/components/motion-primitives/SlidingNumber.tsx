import React from 'react';
import { AnimatedNumber } from './AnimatedNumber';

interface SlidingNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const SlidingNumber: React.FC<SlidingNumberProps> = (props) => {
  return <AnimatedNumber {...props} />;
};
