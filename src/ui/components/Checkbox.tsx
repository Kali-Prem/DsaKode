import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  const inputId = id || (typeof label === 'string' ? `cb-${label.slice(0, 15).replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`group flex items-start gap-2.5 select-none transition-opacity ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 ${
            checked
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900/80 border-slate-300 dark:border-white/[0.15] group-hover:border-indigo-400'
          } peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/40`}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {(label || description) && (
        <div className="min-w-0 flex-1 leading-snug">
          {label && (
            <span
              className={`text-sm font-medium transition-colors ${
                checked
                  ? 'text-slate-400 dark:text-slate-500 line-through'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  );
};
