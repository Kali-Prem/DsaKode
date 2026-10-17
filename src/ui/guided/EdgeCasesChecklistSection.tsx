import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, SkipForward, Check } from 'lucide-react';
import { ConstraintAnalysis, OverflowWarning } from '../../core/types';
import { Badge } from '../components/Badge';
import { Checkbox } from '../components/Checkbox';

export interface EdgeCasesChecklistSectionProps {
  analysis: ConstraintAnalysis;
  overflowWarning: OverflowWarning | null;
  problemText: string;
  className?: string;
}

interface TailoredEdgeCase {
  id: string;
  title: string;
  desc: string;
  isSkipped: boolean;
  skipReason?: string;
  severity: 'critical' | 'warning' | 'info';
}

export const EdgeCasesChecklistSection: React.FC<EdgeCasesChecklistSectionProps> = ({
  analysis,
  overflowWarning,
  problemText,
  className = '',
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sizeMin = analysis.sizeMin;
  const hasNegatives = analysis.negatives;
  const hasOverflow = overflowWarning && overflowWarning.hasWarning;
  const isDuplicateMentioned = /duplicate/i.test(problemText);

  // Build tailored edge cases
  const edgeCases: TailoredEdgeCase[] = [
    // 1. Empty input
    {
      id: 'empty-input',
      title: 'Empty Array / Input Size 0',
      desc: 'Code ke starting me null / empty input check lagana.',
      isSkipped: sizeMin !== null && sizeMin >= 1,
      skipReason: `Constraints guarantee: Min size >= ${sizeMin || 1}. Empty input nahi aayega!`,
      severity: 'warning',
    },
    // 2. Single element
    {
      id: 'single-element',
      title: 'Single Element (n = 1)',
      desc: 'Kya loop n = 1 pe sahi chalta hai ya second element expect karta hai?',
      isSkipped: sizeMin !== null && sizeMin >= 2,
      skipReason: `Constraints guarantee: Min size >= ${sizeMin || 2} hai (at least 2 elements).`,
      severity: 'info',
    },
    // 3. Negative values
    {
      id: 'negative-values',
      title: 'Negative Numbers & Zero',
      desc: 'Negative numbers se monotonic window toot sakti hai. Prefix sum + map zaroori ho sakta hai.',
      isSkipped: !hasNegatives,
      skipReason: 'Strictly non-negative (>= 0) constraints. Negative handling skip karein.',
      severity: 'warning',
    },
    // 4. Integer Overflow
    {
      id: 'integer-overflow',
      title: '32-Bit Signed Integer Overflow (> 2 × 10⁹)',
      desc: overflowWarning?.message || 'Cumulative sum 2 × 10⁹ cross kar sakta hai. 64-bit int use karein.',
      isSkipped: !hasOverflow,
      skipReason: 'Intermediate product/sum 32-bit int limit ke andar safe hai.',
      severity: 'critical',
    },
    // 5. Duplicate elements
    {
      id: 'duplicates',
      title: 'Duplicate Elements Handling',
      desc: isDuplicateMentioned
        ? 'Problem me duplicates ka zikr hai. Duplicate skip logic dhyan se check karein.'
        : 'Duplicate values aane par pointers ko skip karna hai ya consider karna hai?',
      isSkipped: false,
      severity: 'info',
    },
  ];

  const activeCases = edgeCases.filter((c) => !c.isSkipped);
  const skippedCases = edgeCases.filter((c) => c.isSkipped);
  const verifiedCount = activeCases.filter((c) => checkedIds[c.id]).length;

  return (
    <div
      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-3 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Tailored Edge Cases Checklist
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {verifiedCount}/{activeCases.length} verified
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Constraints se filter kiye gaye edge cases. Jo problem me possible hi nahi hain unhe Playbook "Skip" suggest karta hai:
      </p>

      {/* Active Edge Cases */}
      <div className="space-y-2">
        {activeCases.map((c) => {
          const isChecked = !!checkedIds[c.id];

          return (
            <div
              key={c.id}
              onClick={() => toggleCheck(c.id)}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                isChecked
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : c.severity === 'critical'
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(c.id)}
                  aria-label={c.title}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 focus:outline-none"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`font-semibold text-xs sm:text-[13px] ${
                        isChecked
                          ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-85'
                          : c.severity === 'critical'
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {c.title}
                    </span>
                    <span
                      className={`text-xs uppercase px-2 py-0.5 rounded font-mono font-medium ${
                        c.severity === 'critical'
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skipped / Irrelevant Edge Cases (Auto Filtered) */}
      {skippedCases.length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
          <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <SkipForward className="w-3.5 h-3.5 text-slate-400" />
            Filtered Out by Constraints (Safe to Skip):
          </span>

          <div className="space-y-1.5">
            {skippedCases.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 text-xs flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400"
              >
                <div className="truncate min-w-0">
                  <span className="line-through">{c.title}</span>
                  <span className="block text-xs text-emerald-600 dark:text-emerald-400/90 font-mono mt-0.5">
                    {c.skipReason}
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400/90 shrink-0 font-semibold">
                  SKIP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
