import React, { useState } from 'react';

interface PatientAvatarProps {
  avatar?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  avatar,
  name,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  // If avatar URL exists and hasn't errored
  if (avatar && avatar.trim() && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-2xl object-cover border border-[#452267]/15 shrink-0 shadow-2xs ${className}`}
      />
    );
  }

  // Graceful neutral minimalist vector silhouette (bonequinho neutro minimalista)
  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl bg-[#FAF6F0] dark:bg-[#452267] border border-[#452267]/15 dark:border-[#ded6f4]/20 flex items-center justify-center text-[#452267] dark:text-[#ded6f4] shrink-0 shadow-2xs select-none ${className}`}
      title={name}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconSizes[size]}
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
};
