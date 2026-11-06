import React, { useState } from 'react';

interface CortexLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'auto';
  showWordmark?: boolean;
}

export const CortexLogo: React.FC<CortexLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  showWordmark = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // Height constraint preserving proportional aspect ratio (40px to 48px for standard md)
  const heightClass =
    size === 'sm'
      ? 'h-8 max-h-8'
      : size === 'lg'
      ? 'h-12 max-h-12 sm:h-14 sm:max-h-14'
      : size === 'xl'
      ? 'h-16 max-h-16'
      : 'h-11 sm:h-12 max-h-12';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {!imgError ? (
        <img
          src="/cortex_logo_transparent.png"
          alt="Cortex Logo"
          onError={() => setImgError(true)}
          className={`${heightClass} w-auto max-w-[240px] object-contain shrink-0 drop-shadow-xs transition-opacity duration-200`}
        />
      ) : (
        <div className="flex items-center gap-2">
          {/* Fallback graceful vector glyph styled in #452267 */}
          <div
            className={`relative shrink-0 flex items-center justify-center ${
              size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : size === 'xl' ? 'w-14 h-14' : 'w-8 h-8'
            }`}
          >
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-white"
            >
              <path
                d="M44 26C41 21 34 19 28 22C20 25 18 33 21 40C16 43 14 51 18 57C13 63 17 72 23 75C29 78 37 73 40 68C43 73 45 78 45 84"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M32 44C36 44 42 41 43 36"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M26 58C30 58 38 56 40 50"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M56 26C60 21 68 20 73 24C80 29 80 39 76 46C82 51 83 60 79 67C74 74 65 77 60 72C57 76 56 83 56 88"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M66 43C61 44 56 39 56 34"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M71 58C65 59 58 54 58 48"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {showWordmark && (
            <span
              className={`font-black tracking-tight leading-none text-white ${
                size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-xl'
              }`}
              style={{ letterSpacing: '-0.04em' }}
            >
              cortex
            </span>
          )}
        </div>
      )}
    </div>
  );
};
