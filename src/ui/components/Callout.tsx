import React from 'react';
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export type CalloutVariant = 'info' | 'warn' | 'success';

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  variant = 'info',
  title,
  icon,
  children,
  className = '',
}) => {
  const configs = {
    info: {
      container:
        'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-200',
      titleColor: 'text-indigo-950 dark:text-indigo-300',
      defaultIcon: <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />,
    },
    warn: {
      container:
        'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-950 dark:text-amber-200',
      titleColor: 'text-amber-950 dark:text-amber-300',
      defaultIcon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    },
    success: {
      container:
        'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200',
      titleColor: 'text-emerald-950 dark:text-emerald-300',
      defaultIcon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    },
  }[variant];

  return (
    <div
      role="note"
      className={`p-3.5 rounded-card border text-sm leading-relaxed flex items-start gap-3 backdrop-blur-sm ${configs.container} ${className}`}
    >
      {icon ? <span className="shrink-0 mt-0.5">{icon}</span> : configs.defaultIcon}
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className={`font-semibold tracking-wide text-sm ${configs.titleColor}`}>{title}</p>}
        <div className="text-xs opacity-95 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
