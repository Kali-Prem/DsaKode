import React from 'react';
import { Table, ArrowRight, Sparkles, Box, CheckCircle2 } from 'lucide-react';
import { ParsedExample, SizeRelationHint, OutputHint } from '../../core/types';
import { Badge } from '../components/Badge';

export interface TestCaseVisualCardProps {
  example: ParsedExample | null;
  sizeRelation: SizeRelationHint | null;
  outputHint: OutputHint | null;
  className?: string;
}

export const TestCaseVisualCard: React.FC<TestCaseVisualCardProps> = ({
  example,
  sizeRelation,
  outputHint,
  className = '',
}) => {
  if (!example) {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400 italic text-center ${className}`}
      >
        No example testcases detected for this problem yet.
      </div>
    );
  }

  // Determine input/output visual labels
  const relationText = sizeRelation?.relation || 'n -> 1 / Array';

  const getInputPill = (): { label: string; desc: string } => {
    return { label: 'Input: n elements', desc: 'Full array / stream' };
  };

  const getOutputPill = (): { label: string; desc: string } => {
    if (relationText.includes('n -> 2')) {
      return { label: 'Output: 2 indices/pair', desc: 'Specific target pair' };
    }
    if (relationText.includes('n -> 1')) {
      return { label: 'Output: 1 scalar / bool', desc: 'Aggregated answer' };
    }
    if (relationText.includes('n -> n')) {
      return { label: 'Output: n elements', desc: 'Transformed array' };
    }
    if (relationText.includes('2^n')) {
      return { label: 'Output: 2ⁿ subsets', desc: 'Combinatorial explosion' };
    }
    return { label: 'Output: result', desc: 'Target answer' };
  };

  const inPill = getInputPill();
  const outPill = getOutputPill();

  return (
    <div
      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Box className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Example 1 & Size Transition Visual
          </span>
        </div>
        <Badge variant="accent" size="sm">
          {relationText.split('(')[0].trim()}
        </Badge>
      </div>

      {/* Input / Output Size Transition Flow Diagram */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.06] space-y-2">
        <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block">
          Size Transition Visual (Input ➔ Output):
        </span>

        <div className="flex items-center justify-between gap-2 text-xs font-mono">
          {/* Input Box */}
          <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06] text-center shadow-xs">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 block text-xs">
              {inPill.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans block mt-0.5">{inPill.desc}</span>
          </div>

          {/* Transition Arrow */}
          <div className="flex flex-col items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 px-1">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">reduce / filter</span>
          </div>

          {/* Output Box */}
          <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06] text-center shadow-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block text-xs">
              {outPill.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans block mt-0.5">{outPill.desc}</span>
          </div>
        </div>

        {/* Socratic deduction from size relation */}
        {sizeRelation && (
          <div className="pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            💡 <strong>Socratic Insight: </strong>
            {sizeRelation.socraticQuestion}
          </div>
        )}
      </div>

      {/* Example 1 Concrete Test Case Box */}
      <div className="space-y-2.5 text-xs font-mono">
        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs block uppercase tracking-wider font-sans font-semibold">
            Input Sample:
          </span>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-white/[0.06] overflow-x-auto text-xs mt-1">
            {example.input}
          </div>
        </div>

        <div>
          <span className="text-slate-500 dark:text-slate-400 text-xs block uppercase tracking-wider font-sans font-semibold">
            Expected Output:
          </span>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-white/[0.06] overflow-x-auto text-xs mt-1 font-semibold">
            {example.output}
          </div>
        </div>

        {example.explanation && (
          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans pt-0.5 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-300">Explanation: </span>
            {example.explanation}
          </div>
        )}
      </div>
    </div>
  );
};
