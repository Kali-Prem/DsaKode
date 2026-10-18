import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  layoutId = 'dsa-tab-indicator',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onChange(tabs[prevIndex].id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Navigation Tabs"
      className={`flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/[0.08] gap-0.5 ${className}`}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            title={tab.label}
            className={`relative flex items-center justify-center gap-1 px-1.5 sm:px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors select-none z-10 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isActive
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
                className="absolute inset-0 bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200/90 dark:border-white/[0.1] z-[-1]"
              />
            )}
            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span className="truncate whitespace-nowrap">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
