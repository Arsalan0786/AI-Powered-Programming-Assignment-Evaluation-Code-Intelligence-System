import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) => {
  const iconDimensions = {
    sm: { w: 28, h: 28, p: 6 },
    md: { w: 36, h: 36, p: 7 },
    lg: { w: 44, h: 44, p: 9 },
    xl: { w: 56, h: 56, p: 12 },
  }[size];

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Geometric SVG Brand Mark */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-brand-950/60 ring-1 ring-white/10 group-hover:ring-brand-500/40 transition-all duration-300"
        style={{
          width: iconDimensions.w,
          height: iconDimensions.h,
          background: 'radial-gradient(circle at 30% 20%, #1e2238 0%, #0c0e18 100%)',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          <defs>
            <linearGradient id="brandGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="brandGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Hexagonal Shield Frame */}
          <polygon
            points="20,3 34,10 34,26 20,34 6,26 6,10"
            fill="none"
            stroke="url(#brandGrad1)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Left Bracket < */}
          <path
            d="M 17 14 L 11 20 L 17 26"
            stroke="url(#brandGrad2)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Bracket > */}
          <path
            d="M 23 14 L 29 20 L 23 26"
            stroke="url(#brandGrad2)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central AI Intelligence Core Diamond */}
          <polygon
            points="20,15 23.5,20 20,25 16.5,20"
            fill="url(#brandGrad1)"
          />

          {/* Center Pulsing Spark */}
          <circle cx="20" cy="20" r="2.2" fill="#ffffff" />
          <circle cx="20" cy="20" r="5" fill="url(#sparkGlow)" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold tracking-tight text-white font-sans ${textSizes} leading-none`}
            >
              Code<span className="text-brand-400">Intel</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider bg-brand-500/10 text-brand-300 rounded border border-brand-500/20 uppercase">
              AI JUDGE
            </span>
          </div>
          {subtitle ? (
            <span className="text-[11px] text-surface-400 font-medium tracking-normal mt-0.5">
              {subtitle}
            </span>
          ) : (
            <span className="text-[10px] text-surface-400 font-medium tracking-normal mt-0.5">
              Autonomous Code Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

