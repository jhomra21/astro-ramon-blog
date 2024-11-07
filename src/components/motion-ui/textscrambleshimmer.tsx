'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TextScramble } from './textscramble';
import { TextShimmer } from './textshimmer';

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
  shimmerDuration = 2,
}: TextScrambleShimmerProps) {
  const [isScrambling, setIsScrambling] = useState(true);

  const handleScrambleComplete = () => {
    setIsScrambling(false);
  };

  return (
    <div className="relative">
      {isScrambling ? (
        <TextScramble
          text={text}
          className={className}
          duration={scrambleDuration}
          onScrambleComplete={handleScrambleComplete}
        />
      ) : (
        <TextShimmer
          text={text}
          className={cn(className, "bg-clip-text text-transparent")}
          duration={shimmerDuration}
        />
      )}
    </div>
  );
} 