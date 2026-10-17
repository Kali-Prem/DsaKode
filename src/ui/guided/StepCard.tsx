import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Zap,
  Edit3,
} from 'lucide-react';
import {
  ThinkingLadderStep,
  ParsedProblem,
  CoachAnalysis,
} from '../../core/types';
import { StepContextView } from './StepContextView';
import { SocraticHintDrawer } from './SocraticHintDrawer';
import { Button } from '../components/Button';
import { Callout } from '../components/Callout';
import { Checkbox } from '../components/Checkbox';

export interface StepCardProps {
  ladderStep: ThinkingLadderStep;
  problem: ParsedProblem;
  analysis: CoachAnalysis;
  language?: 'en' | 'hi';
  notes: string;
  onNotesChange: (notes: string) => void;
  isUnderstood: boolean;
  onUnderstoodChange: (understood: boolean) => void;
  unlockedHintLevel: number;
  onUnlockHintLevel: (level: number) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({
  ladderStep,
  problem,
  analysis,
  language = 'hi',
  notes,
  onNotesChange,
  isUnderstood,
  onUnderstoodChange,
  unlockedHintLevel,
  onUnlockHintLevel,
  onNextStep,
  onPrevStep,
  isFirstStep,
  isLastStep,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Big Socratic Question Header */}
      <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Step {ladderStep.step} / 8
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {ladderStep.title}
          </span>
        </div>

        {/* Big Sawal */}
        <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-slate-100 leading-snug pt-1">
          {ladderStep.sawal}
        </h3>
      </div>

      {/* Action Prompt */}
      <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-2.5 text-xs">
        <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-slate-700 dark:text-slate-200 flex-1">
          <strong className="text-indigo-700 dark:text-indigo-400 font-bold block text-xs uppercase tracking-wider">
            {language === 'en' ? 'What To Do:' : 'Kya Karna Hai:'}
          </strong>
          <span className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 block">
            {ladderStep.action}
          </span>
        </div>
      </div>

      {/* Trap Warning Callout */}
      <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-300">
        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-xs">
          <strong className="font-bold text-rose-700 dark:text-rose-300">Classic Trap: </strong>
          {ladderStep.trap}
        </div>
      </div>

      {/* Auto-filled Problem-Specific Context */}
      <StepContextView step={ladderStep.step} problem={problem} analysis={analysis} language={language} />

      {/* Notes Textarea (User writes response in own words) */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor={`guided-notes-step-${ladderStep.step}`}
            className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs"
          >
            <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {language === 'en' ? 'Notes / Thoughts in Your Own Words (Optional)' : 'Tumhare Words me Jawab / Notes (Optional)'}
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {notes?.length || 0} chars
          </span>
        </div>

        <textarea
          id={`guided-notes-step-${ladderStep.step}`}
          rows={3}
          value={notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={
            language === 'en'
              ? "Write in your own words (e.g.: 'Array is unsorted but we need a target sum, so brute force would be nested loops...')"
              : "Apne words me likho (jaise: 'Array unsorted hai par target sum nikalna hai, to brute force nested loop hoga...')"
          }
          className="w-full text-sm p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed resize-none transition-colors"
        />

        {/* Checkbox: Samajh Gaya */}
        <div className="pt-1 flex items-center justify-between">
          <Checkbox
            id={`step-understood-${ladderStep.step}`}
            checked={isUnderstood}
            onChange={(checked) => onUnderstoodChange(checked)}
            label={language === 'en' ? 'I have understood / completed this step' : 'Maine ye step samajh liya / complete kar liya'}
          />
        </div>
      </div>

      {/* Socratic Hint Drawer */}
      <SocraticHintDrawer
        step={ladderStep.step}
        unlockedLevel={unlockedHintLevel}
        onUnlockLevel={onUnlockHintLevel}
        analysis={analysis}
        language={language}
      />

      {/* Navigation Buttons Row */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={isFirstStep}
          onClick={onPrevStep}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-xs"
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onNextStep}
            icon={isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="text-xs sm:text-sm font-semibold px-4"
          >
            {isLastStep ? 'Complete Thinking Ladder 🎉' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};
