'use client';

import { useState } from 'react';
import { TextScramble } from './textscramble';

interface TextScrambleShimmerProps {
  text: string;
  className?: string;
  scrambleDuration?: number;
  shimmerDuration?: number;
}

export function TextScrambleShimmer({
  text,
  className = "text-4xl font-bold mb-4",
  scrambleDuration = 0.8,
}: TextScrambleShimmerProps) {
  const [isScrambling, setIsScrambling] = useState(true);

  const [shouldScramble] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const handleScrambleComplete = () => {
    setIsScrambling(false);
  };

  return (
    <div className="relative">
      {isScrambling ? (
        <TextScramble
          text={text}
          as="h1"
          className={className}
          duration={scrambleDuration}
          trigger={shouldScramble}
          onScrambleComplete={handleScrambleComplete}
        />
      ) : (
        <h1 className={className}>{text}</h1>
      )}
    </div>
  );
} 