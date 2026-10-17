import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  Clock,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CoachAnalysis } from '../../core/types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export interface SocraticHintDrawerProps {
  step: number;
  unlockedLevel: number; // 0 = locked, 1 = L1, 2 = L2, 3 = L3
  onUnlockLevel: (level: number) => void;
  analysis: CoachAnalysis;
  className?: string;
}

const TIMER_SECONDS = 60;

export const SocraticHintDrawer: React.FC<SocraticHintDrawerProps> = ({
  step,
  unlockedLevel,
  onUnlockLevel,
  analysis,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TIMER_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on unmount or level change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Tick countdown timer
  useEffect(() => {
    if (pendingLevel !== null) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            onUnlockLevel(pendingLevel);
            setPendingLevel(null);
            return TIMER_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsRemaining(TIMER_SECONDS);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pendingLevel, onUnlockLevel]);

  const handleStartUnlock = (targetLevel: number) => {
    setPendingLevel(targetLevel);
    setSecondsRemaining(TIMER_SECONDS);
  };

  const handleFastUnlock = (targetLevel: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPendingLevel(null);
    setSecondsRemaining(TIMER_SECONDS);
    onUnlockLevel(targetLevel);
  };

  const handleCancelTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPendingLevel(null);
    setSecondsRemaining(TIMER_SECONDS);
  };

  // Derive hints from coach analysis
  const primaryHit = analysis.keywordHits.length > 0 ? analysis.keywordHits[0] : null;

  const hintL1_Nudge =
    primaryHit?.socraticQuestion ||
    analysis.outputTypeHint?.socraticQuestion ||
    analysis.complexity.socraticHint ||
    'Problem ke constraints aur input/output relation ko paper pe trace karke socho: brute force me repetitive work kya ho raha hai?';

  const hintL2_Pattern =
    primaryHit?.technique ||
    analysis.complexity.techniques ||
    'Two Pointers / HashMap / Sliding Window';

  const hintL3_Why =
    primaryHit?.why ||
    `Is problem ki constraints (${analysis.complexity.bigO}) ke hisaab se brute-force nested loop slow ho jayega. Optimal data structure ya two-pointers se redundant recalculations hat jaati hain.`;

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-950/40 overflow-hidden transition-all shadow-sm ${className}`}
    >
      {/* Drawer Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Socratic Hints
              </span>
              <Badge variant={unlockedLevel > 0 ? 'accent' : 'default'} size="sm">
                {unlockedLevel === 0 ? 'Locked' : `Level ${unlockedLevel}/3 Unlocked`}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
          <span className="text-xs hidden sm:inline">Zero Code Guarantee</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Drawer Content */}
      {isOpen && (
        <div className="p-3.5 pt-1 space-y-3 border-t border-slate-200 dark:border-white/[0.06] text-xs">
          {/* Zero Code Callout */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs leading-relaxed">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              <strong>Zero Code Guarantee:</strong> Yahan solution ya code <em>kabhi nahi</em> milega. Sirf sochne ki disha dikhayi jayegi.
            </span>
          </div>

          {/* Pending 60s Timer Card */}
          {pendingLevel !== null && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2.5 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                Pehle Khud Socho... ({secondsRemaining}s baaki)
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-1000"
                  style={{ width: `${((TIMER_SECONDS - secondsRemaining) / TIMER_SECONDS) * 100}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                💡 <strong>Playbook Rule:</strong> Dimag ki muscle tabhi banti hai jab 60 seconds bina kisi hint ke pen-paper pe khud sochte ho. Real interview me koi direct hint nahi deta!
              </p>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={handleCancelTimer} className="text-xs">
                  Ruko, main khud sochunga
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFastUnlock(pendingLevel)}
                  className="text-xs text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                >
                  Maine soch liya (Unlock now)
                </Button>
              </div>
            </div>
          )}

          {/* 3 Hint Levels Stack */}
          <div className="space-y-2.5">
            {/* LEVEL 1: NUDGE (SAWAL) */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                unlockedLevel >= 1
                  ? 'bg-indigo-50/70 dark:bg-slate-900/60 border-indigo-200 dark:border-white/[0.08]'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  {unlockedLevel >= 1 ? (
                    <Unlock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  )}
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Level 1: Socratic Nudge (Sawal)
                  </span>
                </div>
                {unlockedLevel < 1 && pendingLevel !== 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartUnlock(1)}
                    className="text-xs py-1 px-2.5 h-7"
                  >
                    Unlock (60s Timer)
                  </Button>
                )}
              </div>

              {unlockedLevel >= 1 ? (
                <div className="text-xs text-indigo-900 dark:text-indigo-300 pt-1 leading-relaxed">
                  {hintL1_Nudge}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  Locked. Pehle 60s khud dimag lagao, phir unlock karo.
                </p>
              )}
            </div>

            {/* LEVEL 2: PATTERN KA NAAM */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                unlockedLevel >= 2
                  ? 'bg-indigo-50/70 dark:bg-slate-900/60 border-indigo-200 dark:border-white/[0.08]'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  {unlockedLevel >= 2 ? (
                    <Unlock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  )}
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Level 2: Candidate Pattern Ka Naam
                  </span>
                </div>
                {unlockedLevel < 2 && unlockedLevel >= 1 && pendingLevel !== 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartUnlock(2)}
                    className="text-xs py-1 px-2.5 h-7"
                  >
                    Unlock Level 2 (60s)
                  </Button>
                )}
              </div>

              {unlockedLevel >= 2 ? (
                <div className="pt-1.5 space-y-1">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
                    {hintL2_Pattern}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Is pattern ko paper pe trace karo aur dekho kaise fit hota hai.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {unlockedLevel < 1 ? 'Pehle Level 1 unlock karo.' : 'Locked. Pehle 60s khud socho.'}
                </p>
              )}
            </div>

            {/* LEVEL 3: PATTERN KA "KYUN" */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                unlockedLevel >= 3
                  ? 'bg-indigo-50/70 dark:bg-slate-900/60 border-indigo-200 dark:border-white/[0.08]'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  {unlockedLevel >= 3 ? (
                    <Unlock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  )}
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Level 3: Intuition (Ye Pattern Kyun Chalta Hai?)
                  </span>
                </div>
                {unlockedLevel < 3 && unlockedLevel >= 2 && pendingLevel !== 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartUnlock(3)}
                    className="text-xs py-1 px-2.5 h-7"
                  >
                    Unlock Level 3 (60s)
                  </Button>
                )}
              </div>

              {unlockedLevel >= 3 ? (
                <div className="text-xs text-slate-700 dark:text-slate-200 pt-1 leading-relaxed">
                  {hintL3_Why}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  {unlockedLevel < 2 ? 'Pehle Level 2 unlock karo.' : 'Locked. Deep intuition unlock karne se pehle 60s socho.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
