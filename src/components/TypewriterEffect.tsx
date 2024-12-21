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
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Calculate the width based on the text length
  const textWidth = `${text.length}ch`;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const type = () => {
      if (!isDeleting) {
        setIsVisible(true);
        setDisplayText(text.substring(0, displayText.length + 1));
        
        if (displayText.length === text.length) {
          timer = setTimeout(() => {
            setIsHighlighted(true);
            setTimeout(() => {
              setIsHighlighted(false);
              setIsVisible(false);
              setTimeout(() => {
                setDisplayText('');
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
              }, 300);
            }, 1000);
          }, delay);
        }
      } else {
        timer = setTimeout(type, 100);
      }
    };

    timer = setTimeout(type, 100);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, text, delay]);

  return (
    <span className={`${className} relative inline-flex`} style={{ minWidth: textWidth }}>
      <span 
        className={`
          transition-colors duration-300
          ${isHighlighted ? 'bg-black text-white dark:bg-white dark:text-black' : ''}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {displayText}
      </span>
      <span 
        className="animate-cursor" 
        style={{ 
          marginLeft: '2px'
        }} 
      >
        _
      </span>
    </span>
  );
}
