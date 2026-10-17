import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  count?: string | number;
  size?: 'sm' | 'md';
  variant?: 'default' | 'accent' | 'outline';
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  active = false,
  count,
  size = 'md',
  variant = 'default',
  onClick,
  onRemove,
  className = '',
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all select-none ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-500/40 shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700/60'
      } ${isClickable ? 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-500/60 active:scale-95' : ''} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="truncate max-w-[160px]">{label}</span>
      {count !== undefined && (
        <span className="px-1.5 py-0.2 rounded-full text-xs bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-300">
          {count}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 ml-0.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-slate-100"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
