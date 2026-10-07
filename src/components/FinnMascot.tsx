import React from 'react';
import { FINN_AVATAR } from '../constants/mascot';

interface FinnMascotProps {
  mood?: 'happy' | 'waving' | 'thinking' | 'celebrating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bubbleText?: string;
  className?: string;
}

export const FinnMascot: React.FC<FinnMascotProps> = ({
  mood = 'happy',
  size = 'md',
  bubbleText,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-24 h-24 rounded-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative group shrink-0">
        <img
          src={FINN_AVATAR}
          alt="FINN Mascot"
          className={`${sizeClasses[size]} object-cover border-2 border-teal-400 shadow-md shadow-teal-200/50 group-hover:scale-105 transition-transform`}
        />
        {mood === 'celebrating' && (
          <span className="absolute -top-1.5 -right-1.5 text-sm animate-bounce">🎉</span>
        )}
        {mood === 'thinking' && (
          <span className="absolute -top-1.5 -right-1.5 text-xs bg-amber-400 text-teal-950 font-black px-1 rounded-full border border-white">
            AI
          </span>
        )}
      </div>
      {bubbleText && (
        <div className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-2 rounded-2xl shadow-xs border border-teal-100 max-w-xs relative before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-white">
          {bubbleText}
        </div>
      )}
    </div>
  );
};
