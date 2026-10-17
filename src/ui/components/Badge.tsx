import React from 'react';

export type BadgeVariant = 'default' | 'easy' | 'medium' | 'hard' | 'brand' | 'outline' | 'accent' | 'warn' | 'success';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  icon,
  className = '',
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
  }[size];

  const variantStyles: Record<BadgeVariant, string> = {
    default:
      'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60',
    easy:
      'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
    medium:
      'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
    hard:
      'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
    brand:
      'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
    accent:
      'bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
    warn:
      'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
    success:
      'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
    outline:
      'bg-transparent text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/60',
  };

  return (
    <span
      className={`inline-flex items-center font-medium font-sans rounded-full whitespace-nowrap transition-colors ${sizeStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
