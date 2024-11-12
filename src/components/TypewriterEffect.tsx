'use client';
import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  text: string;
  delay?: number;
  className?: string;
}

export function TypewriterEffect({ text, delay = 5000, className = '' }: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const type = () => {
      const current = loopNum % text.length;
      
      if (!isDeleting) {
        setDisplayText(text.substring(0, displayText.length + 1));
        
        if (displayText.length === text.length) {
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, delay);
        }
      } else {
        setDisplayText(text.substring(0, displayText.length - 1));
        
        if (displayText.length === 0) {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      }
    };

    timer = setTimeout(type, isDeleting ? 50 : 100);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, text, delay]);

  return (
    <span className={className}>
      {displayText}
      <span className="inline-flex w-3 h-[4px] relative top-[2px] animate-cursor bg-current" />
    </span>
  );
}
