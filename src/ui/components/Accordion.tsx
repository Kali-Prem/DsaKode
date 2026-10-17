import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface AccordionProps {
  title: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  subtitle,
  badge,
  icon,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  children,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) onToggle();
    if (!isControlled) setInternalOpen((prev) => !prev);
  };

  return (
    <div
      className={`rounded-card border transition-colors overflow-hidden ${
        open
          ? 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-white/[0.12] shadow-sm'
          : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-slate-700/70'
      } ${className}`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-3.5 text-left select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {icon && (
            <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-wide">
                {title}
              </span>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="text-slate-500 dark:text-slate-400 shrink-0 p-0.5"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden border-t border-slate-200 dark:border-white/[0.06]"
          >
            <div className="p-3.5 text-sm text-slate-700 dark:text-slate-300">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
