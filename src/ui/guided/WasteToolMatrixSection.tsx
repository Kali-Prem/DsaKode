import React, { useState } from 'react';
import { Layers, Sparkles, ChevronDown, ChevronUp, ArrowRight, Zap, HelpCircle } from 'lucide-react';
import { KeywordHit, WasteToolRow } from '../../core/types';
import rawWasteTools from '../../data/wasteTool.json';
import { Badge } from '../components/Badge';

import { getWasteToolRows } from '../../core/i18n';

const WASTE_TOOL_ROWS: WasteToolRow[] = rawWasteTools as WasteToolRow[];

export interface WasteToolMatrixSectionProps {
  keywordHits: KeywordHit[];
  language?: 'en' | 'hi';
  className?: string;
}

export const WasteToolMatrixSection: React.FC<WasteToolMatrixSectionProps> = ({
  keywordHits,
  language = 'hi',
  className = '',
}) => {
  const wasteToolRows = getWasteToolRows(language);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Collect matched waste rows from keywords
  const matchedWasteRows = new Set<number>();
  for (const hit of keywordHits) {
    if (hit.wasteRow !== null && hit.wasteRow !== undefined) {
      matchedWasteRows.add(hit.wasteRow);
    }
  }

  const toggleRow = (idx: number) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  return (
    <div
      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-3 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Waste ➔ Tool Prescription Matrix
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          9 Playbook Pairs
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Brute force bottleneck identify karo aur matching tool select karo. Highlighted rows tumhare keywords se match karti hain:
      </p>

      {/* 9-Row Compact List */}
      <div className="space-y-2 max-h-80 overflow-y-auto dsa-scrollbar pr-1">
        {wasteToolRows.map((row) => {
          const isMatched = matchedWasteRows.has(row.rowIndex);
          const isExpanded = expandedRow === row.rowIndex;

          return (
            <div
              key={row.rowIndex}
              onClick={() => toggleRow(row.rowIndex)}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                isMatched
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-500/50 ring-1 ring-indigo-400/40 shadow-glow'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Row Summary */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                    #{row.rowIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center gap-1.5 truncate">
                      {isMatched && <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      {row.tool}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isMatched && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      Matched
                    </span>
                  )}
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                    {row.gain}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Waste description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Waste: </span>
                {row.waste}
              </p>

              {/* Expanded Socratic Question */}
              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    Socratic Prompt (Dimag Kholne Wala Sawal):
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed">
                    {row.socraticQuestion}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
