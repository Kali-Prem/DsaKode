import React from 'react';
import { Brain, RotateCcw, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';

export interface InsightsEmptyStateProps {
  onRetry?: () => void;
  message?: string;
  className?: string;
}

export const InsightsEmptyState: React.FC<InsightsEmptyStateProps> = ({
  onRetry,
  message,
  className = '',
}) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-center space-y-3.5 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
        <Brain className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Problem Description Loading...
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          {message ||
            'LeetCode problem description aur constraints parse kiye ja rahe hain. Agar page abhi load ho raha hai, to kuch seconds wait karein.'}
        </p>
      </div>

      {onRetry && (
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onRetry}
            className="text-xs"
          >
            Retry Problem Parser
          </Button>
        </div>
      )}
    </div>
  );
};
