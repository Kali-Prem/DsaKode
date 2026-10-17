import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trophy, RotateCcw, Check, ArrowRight, BookOpen } from 'lucide-react';
import {
  ParsedProblem,
  CoachAnalysis,
  ThinkingLadderStep,
  GuidedWizardState,
} from '../../core/types';
import rawLadder from '../../data/thinkingLadder.json';
import {
  getProblemGuidedState,
  saveProblemGuidedState,
  getDefaultGuidedState,
} from '../../core/storage';
import { StepperBar } from './StepperBar';
import { StepCard } from './StepCard';
import { ReflectionCard } from './ReflectionCard';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

const LADDER_STEPS: ThinkingLadderStep[] = rawLadder as ThinkingLadderStep[];

export interface GuidedWizardProps {
  problem: ParsedProblem;
  analysis: CoachAnalysis;
  onProgressChange?: (completedCount: number) => void;
  className?: string;
}

export const GuidedWizard: React.FC<GuidedWizardProps> = ({
  problem,
  analysis,
  onProgressChange,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [guidedState, setGuidedState] = useState<GuidedWizardState>(getDefaultGuidedState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompletedAll, setIsCompletedAll] = useState<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved state for problem slug
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getProblemGuidedState(problem.slug).then((saved) => {
      if (isMounted) {
        setGuidedState(saved);
        setIsLoading(false);
        if (saved.completedSteps.length >= 8) {
          setIsCompletedAll(true);
        }
        if (onProgressChange) {
          onProgressChange(saved.completedSteps.length);
        }
      }
    });

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [problem.slug]);

  // Persist state helper (debounced for rapid note typing)
  const persistState = useCallback(
    (nextState: GuidedWizardState) => {
      setGuidedState(nextState);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        saveProblemGuidedState(problem.slug, nextState);
        if (onProgressChange) {
          onProgressChange(nextState.completedSteps.length);
        }
      }, 300);
    },
    [problem.slug, onProgressChange]
  );

  const currentStep = guidedState.currentStep || 1;
  const currentLadderStep = LADDER_STEPS.find((s) => s.step === currentStep) || LADDER_STEPS[0];

  // Step navigation
  const handleSelectStep = (step: number) => {
    const nextState: GuidedWizardState = {
      ...guidedState,
      currentStep: step,
    };
    persistState(nextState);
    if (isCompletedAll && step < 8) {
      setIsCompletedAll(false);
    }
  };

  // Next step handler
  const handleNextStep = () => {
    const nextCompleted = Array.from(new Set([...guidedState.completedSteps, currentStep]));

    if (currentStep >= 8) {
      // Completed ladder!
      const nextState: GuidedWizardState = {
        ...guidedState,
        completedSteps: nextCompleted,
      };
      persistState(nextState);
      setIsCompletedAll(true);
      return;
    }

    const nextStep = currentStep + 1;
    const nextState: GuidedWizardState = {
      ...guidedState,
      currentStep: nextStep,
      completedSteps: nextCompleted,
    };
    persistState(nextState);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      handleSelectStep(currentStep - 1);
    }
  };

  const handleNotesChange = (text: string) => {
    const nextState: GuidedWizardState = {
      ...guidedState,
      notesByStep: {
        ...guidedState.notesByStep,
        [currentStep]: text,
      },
    };
    persistState(nextState);
  };

  const handleUnderstoodChange = (understood: boolean) => {
    const nextState: GuidedWizardState = {
      ...guidedState,
      isUnderstoodByStep: {
        ...guidedState.isUnderstoodByStep,
        [currentStep]: understood,
      },
    };
    persistState(nextState);
  };

  const handleUnlockHintLevel = (level: number) => {
    const nextState: GuidedWizardState = {
      ...guidedState,
      unlockedHintLevel: {
        ...guidedState.unlockedHintLevel,
        [currentStep]: level,
      },
    };
    persistState(nextState);
  };

  const handleResetLadder = () => {
    const reset = getDefaultGuidedState();
    persistState(reset);
    setIsCompletedAll(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 space-y-2">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading Thinking Ladder state...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Stepper Progress Bar */}
      <StepperBar
        currentStep={currentStep}
        completedSteps={guidedState.completedSteps}
        onSelectStep={handleSelectStep}
      />

      {/* Celebration Screen when 8/8 finished */}
      {isCompletedAll ? (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <Trophy className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Shabash! Thinking Ladder Completed 🎉
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Tumne problem ko bina direct solution dekhe 8 steps me systematically break kiya hai. Ab LeetCode ke editor me code likhna bohot aasan hoga!
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 pb-1">
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetLadder}
            >
              Reset Ladder
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => handleSelectStep(1)}
            >
              Review Notes
            </Button>
          </div>

          {/* 3-Line Playbook Reflection Form */}
          <div className="pt-2">
            <ReflectionCard
              slug={problem.slug}
              defaultPattern={analysis.keywordHits[0]?.technique || ''}
            />
          </div>
        </motion.div>
      ) : (
        /* Animated Step Transition */
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <StepCard
              ladderStep={currentLadderStep}
              problem={problem}
              analysis={analysis}
              notes={guidedState.notesByStep[currentStep] || ''}
              onNotesChange={handleNotesChange}
              isUnderstood={!!guidedState.isUnderstoodByStep[currentStep]}
              onUnderstoodChange={handleUnderstoodChange}
              unlockedHintLevel={guidedState.unlockedHintLevel[currentStep] || 0}
              onUnlockHintLevel={handleUnlockHintLevel}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              isFirstStep={currentStep === 1}
              isLastStep={currentStep === 8}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
