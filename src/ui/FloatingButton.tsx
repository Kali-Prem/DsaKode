import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Tooltip } from './components/Tooltip';

export interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  progressStep?: number; // e.g. 0 to 8
  totalSteps?: number;
  dockSide?: 'left' | 'right';
  language?: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
  className?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  isOpen,
  onClick,
  progressStep = 2,
  totalSteps = 8,
  dockSide = 'right',
  language = 'hi',
  onLanguageChange,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(Math.max(progressStep / totalSteps, 0), 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -300, bottom: 200 }}
      dragElastic={0.08}
      dragMomentum={false}
      initial={false}
      animate={{ scale: 1 }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      className={`fixed z-[999999] select-none ${
        dockSide === 'left' ? 'left-6 bottom-6' : 'right-6 bottom-6'
      } ${className}`}
    >
      <Tooltip
        content={
          <div className="flex flex-col gap-0.5 text-center">
            <span className="font-semibold text-xs">DsaKode</span>
            <span className="text-xs text-slate-400">
              {isOpen ? 'Click to close (Alt+C)' : `Progress: ${progressStep}/${totalSteps} steps (Alt+C)`}
            </span>
          </div>
        }
        position="left"
      >
        <button
          id="dsa-coach-toggle-btn"
          type="button"
          onClick={onClick}
          aria-label={isOpen ? 'Close DsaKode' : 'Open DsaKode'}
          className={`relative group flex items-center justify-center w-12 h-12 rounded-full cursor-grab active:cursor-grabbing shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            isOpen
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-400 dark:border-indigo-500/50 shadow-glow'
              : 'bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.1] hover:border-indigo-400 dark:hover:border-indigo-500/50 backdrop-blur-md'
          }`}
        >
          {/* Progress Ring SVG */}
          <svg
            className="absolute inset-0 w-12 h-12 -rotate-90 pointer-events-none"
            viewBox="0 0 52 52"
          >
            {/* Background Track */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="2.5"
              fill="transparent"
            />
            {/* Active Progress Stroke */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              className="stroke-indigo-500 transition-all duration-300"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Icon */}
          <Brain
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-700 dark:text-slate-300 group-hover:scale-110'
            }`}
          />

          {/* Mini Step Counter Badge */}
          {progressStep > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold font-mono bg-indigo-600 text-white shadow-sm border border-white dark:border-slate-900">
              {progressStep}
            </span>
          )}

          {/* Mini Language Indicator / Toggle Badge */}
          {!isOpen && onLanguageChange && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onLanguageChange(language === 'en' ? 'hi' : 'en');
              }}
              title={language === 'en' ? 'Click to switch to Hinglish' : 'Click to switch to English'}
              className="absolute -bottom-1 -left-1 flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-black font-mono tracking-wider bg-slate-900 text-indigo-300 dark:bg-slate-800 dark:text-indigo-300 shadow border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
            >
              {language === 'en' ? 'EN' : 'HI'}
            </span>
          )}
        </button>
      </Tooltip>
    </motion.div>
  );
};
