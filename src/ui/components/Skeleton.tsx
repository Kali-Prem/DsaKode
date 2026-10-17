import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
}) => {
  const variantStyles = {
    text: 'h-3.5 w-full rounded-md',
    rect: 'w-full rounded-card',
    circle: 'rounded-full',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/60 ${variantStyles} ${className}`}
    />
  );
};
