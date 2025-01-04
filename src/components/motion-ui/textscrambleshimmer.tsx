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
        <div className={className}>{text}</div>
      )}
    </div>
  );
} 