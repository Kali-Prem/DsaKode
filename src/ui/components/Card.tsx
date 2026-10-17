import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-2.5',
    md: 'p-4',
    lg: 'p-5',
  }[padding];

  const variantStyles = {
    default:
      'bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-md',
    subtle:
      'bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/[0.05]',
    interactive:
      'bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-400/50 dark:hover:border-indigo-400/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]',
    bordered:
      'bg-transparent border border-slate-300 dark:border-white/[0.1]',
  }[variant];

  return (
    <div
      className={`rounded-card transition-colors text-slate-900 dark:text-slate-100 ${variantStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
