'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  text: string;
  className?: string;
  duration?: number;
}

export function TextShimmer({
  text,
  className = "text-4xl font-bold mb-4",
  duration = 1,
}: TextShimmerProps) {
  return (
    <motion.div
      className={cn(
        'relative inline-block bg-clip-text text-transparent',
        className
      )}
      style={{
        backgroundImage: `var(--shimmer-bg)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
      }}
      initial={{ backgroundPosition: '200% center' }}
      animate={{ backgroundPosition: '-200% center' }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {text}
    </motion.div>
  );
}
