import React from 'react';
import { Check } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';

export interface StepperBarProps {
  currentStep: number; // 1 to 8
  completedSteps: number[]; // e.g. [1, 2]
  onSelectStep: (step: number) => void;
  className?: string;
}

const STEP_NAMES = [
  'Observe',
  'Manual',
  'Naam Do',
  'Brute',
  'Waste',
  'Tool',
  'Dry Run',
  'Code',
];

export const StepperBar: React.FC<StepperBarProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
  className = '',
}) => {
  const maxAccessible = Math.max(1, ...completedSteps.map((s) => s + 1), currentStep);

  const handleKeyDown = (e: React.KeyboardEvent, stepNum: number) => {
    if (e.key === 'ArrowRight' && stepNum < 8 && stepNum + 1 <= maxAccessible) {
      e.preventDefault();
      onSelectStep(stepNum + 1);
    } else if (e.key === 'ArrowLeft' && stepNum > 1) {
      e.preventDefault();
      onSelectStep(stepNum - 1);
    }
  };

  return (
    <div
      role="region"
      aria-label="Thinking Ladder Progress"
      className={`w-full space-y-2 select-none ${className}`}
    >
      {/* Top Header: Current Step Title & Counter with aria-live */}
      <div className="flex items-center justify-between text-xs" aria-live="polite">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
            Step {currentStep} of 8
          </span>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {STEP_NAMES[currentStep - 1]}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
          {completedSteps.length}/8 Done
        </span>
      </div>

      {/* Stepper Progress Bar Row with accessible attributes */}
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={8}
        aria-valuetext={`Step ${currentStep} of 8: ${STEP_NAMES[currentStep - 1]}`}
        className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08]"
      >
        {STEP_NAMES.map((name, index) => {
          const stepNum = index + 1;
          const isCurrent = stepNum === currentStep;
          const isCompleted = completedSteps.includes(stepNum);
          const isAccessible = stepNum <= maxAccessible;

          return (
            <Tooltip
              key={stepNum}
              content={`Step ${stepNum}: ${name}${isCompleted ? ' (Completed)' : ''}`}
              position="bottom"
            >
              <button
                type="button"
                disabled={!isAccessible}
                onClick={() => onSelectStep(stepNum)}
                onKeyDown={(e) => handleKeyDown(e, stepNum)}
                aria-label={`Step ${stepNum}: ${name}${isCompleted ? ' (Completed)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`relative flex-1 h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 ${
                  isCurrent
                    ? 'bg-indigo-600 dark:bg-indigo-500 ring-2 ring-indigo-400/40 shadow-glow scale-y-125'
                    : isCompleted
                    ? 'bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400'
                    : isAccessible
                    ? 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-700/60 dark:hover:bg-slate-600 cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800/40 cursor-not-allowed opacity-40'
                }`}
              />
            </Tooltip>
          );
        })}
      </div>

      {/* Micro Step Numbers Navigation (1..8) */}
      <div
        role="group"
        aria-label="Step numbers"
        className="flex items-center justify-between px-0.5 text-xs font-mono"
      >
        {STEP_NAMES.map((name, index) => {
          const stepNum = index + 1;
          const isCurrent = stepNum === currentStep;
          const isCompleted = completedSteps.includes(stepNum);
          const isAccessible = stepNum <= maxAccessible;

          return (
            <button
              key={stepNum}
              type="button"
              disabled={!isAccessible}
              onClick={() => onSelectStep(stepNum)}
              onKeyDown={(e) => handleKeyDown(e, stepNum)}
              aria-label={`Go to step ${stepNum}: ${name}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isCurrent
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-300 dark:border-emerald-500/30'
                  : isAccessible
                  ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800/60'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};
