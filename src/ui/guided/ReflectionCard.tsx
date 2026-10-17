import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Save, Edit3, Lightbulb } from 'lucide-react';
import { ProblemReflection } from '../../core/types';
import { saveProblemReflection, getStorageState } from '../../core/storage';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export interface ReflectionCardProps {
  slug: string;
  defaultPattern?: string;
  onSaved?: (reflection: ProblemReflection) => void;
  className?: string;
}

export const ReflectionCard: React.FC<ReflectionCardProps> = ({
  slug,
  defaultPattern = '',
  onSaved,
  className = '',
}) => {
  const [pattern, setPattern] = useState(defaultPattern);
  const [triggerObservation, setTriggerObservation] = useState('');
  const [wasteAndTool, setWasteAndTool] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing reflection if available
  useEffect(() => {
    getStorageState().then((state) => {
      const rec = state.problemHistory[slug];
      if (rec?.reflection) {
        setPattern(rec.reflection.pattern || defaultPattern);
        setTriggerObservation(rec.reflection.triggerObservation || '');
        setWasteAndTool(rec.reflection.wasteAndTool || '');
        setIsSaved(true);
      }
    });
  }, [slug, defaultPattern]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim() && !triggerObservation.trim() && !wasteAndTool.trim()) return;

    setIsSaving(true);
    const reflection: ProblemReflection = {
      pattern: pattern.trim(),
      triggerObservation: triggerObservation.trim(),
      wasteAndTool: wasteAndTool.trim(),
      savedAt: Date.now(),
    };

    await saveProblemReflection(slug, reflection);
    setIsSaving(false);
    setIsSaved(true);
    if (onSaved) onSaved(reflection);
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-indigo-500/20 dark:border-indigo-500/30 text-left space-y-3.5 shadow-sm dark:shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Playbook 3-Line Problem Reflection
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Interview ke liye dimag me pattern permanently lock karo
            </span>
          </div>
        </div>

        {isSaved && (
          <Badge variant="easy" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
            Saved
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3.5 text-xs">
        {/* Line 1: Core pattern */}
        <div className="space-y-1.5">
          <label
            htmlFor="reflection-pattern"
            className="font-semibold text-xs sm:text-[13px] text-slate-900 dark:text-slate-200 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            1. Is problem ka core pattern kya tha?
          </label>
          <input
            id="reflection-pattern"
            type="text"
            value={pattern}
            onChange={(e) => {
              setPattern(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Jaise: HashMap complement lookup, Two Pointers sorted range, Sliding Window..."
            className="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans placeholder:text-slate-400"
          />
        </div>

        {/* Line 2: Trigger observation */}
        <div className="space-y-1.5">
          <label
            htmlFor="reflection-trigger"
            className="font-semibold text-xs sm:text-[13px] text-slate-900 dark:text-slate-200 flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            2. Kis keyword ya observation se intuition click hua?
          </label>
          <input
            id="reflection-trigger"
            type="text"
            value={triggerObservation}
            onChange={(e) => {
              setTriggerObservation(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Jaise: 'Array unsorted hai par target sum nikalna hai', 'Contiguous range constraint'..."
            className="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans placeholder:text-slate-400"
          />
        </div>

        {/* Line 3: Waste & Tool */}
        <div className="space-y-1.5">
          <label
            htmlFor="reflection-waste"
            className="font-semibold text-xs sm:text-[13px] text-slate-900 dark:text-slate-200 flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            3. Brute force me waste kya tha aur kis tool ne hataya?
          </label>
          <input
            id="reflection-waste"
            type="text"
            value={wasteAndTool}
            onChange={(e) => {
              setWasteAndTool(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Jaise: 'Linear search O(n) ko HashMap O(1) lookup ne replace kiya'..."
            className="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans placeholder:text-slate-400"
          />
        </div>

        {/* Submit row */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isSaved ? '✅ Saved in problem archive' : 'Unsaved reflection'}
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
            disabled={isSaving}
          >
            {isSaved ? 'Update Reflection' : 'Save Reflection'}
          </Button>
        </div>
      </form>
    </div>
  );
};
