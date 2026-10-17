import React from 'react';
import { Table, ShieldAlert, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { ConstraintAnalysis, OverflowWarning } from '../../core/types';
import { Badge } from '../components/Badge';

export interface ConstraintsCardProps {
  analysis: ConstraintAnalysis;
  overflowWarning: OverflowWarning | null;
  className?: string;
}

export const ConstraintsCard: React.FC<ConstraintsCardProps> = ({
  analysis,
  overflowWarning,
  className = '',
}) => {
  const parsed = analysis.parsed || [];
  const sizeMin = analysis.sizeMin;
  const isZeroAllowed = sizeMin !== null && sizeMin === 0;
  const isNonEmptyGuaranteed = sizeMin !== null && sizeMin >= 1;
  const hasNegatives = analysis.negatives;
  const hasOverflow = overflowWarning && overflowWarning.hasWarning;

  // Format bounds into readable power notation
  const formatBound = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    if (val === 0) return '0';
    if (val >= 1e9) return `10⁹`;
    if (val <= -1e9) return `-10⁹`;
    if (val >= 1e5) return `${(val / 1e5).toFixed(0)} × 10⁵`;
    if (val <= -1e5) return `-${Math.abs(val / 1e5).toFixed(0)} × 10⁵`;
    if (val >= 1e4) return `10⁴`;
    if (val <= -1e4) return `-10⁴`;
    return val.toLocaleString();
  };

  return (
    <div
      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-3 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Table className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Parsed Constraints Table
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {parsed.length} rule{parsed.length === 1 ? '' : 's'} parsed
        </span>
      </div>

      {/* Constraints Table */}
      {parsed.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-950/50">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-100/80 dark:bg-slate-900/80 text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider font-sans">
                <th className="py-2 px-3 font-semibold">Variable</th>
                <th className="py-2 px-3 font-semibold">Bounds [Min .. Max]</th>
                <th className="py-2 px-3 font-semibold hidden sm:table-cell">Raw Constraint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04] text-xs">
              {parsed.map((item, index) => (
                <tr
                  key={`${item.name}-${index}`}
                  className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    [{formatBound(item.lo)} .. {formatBound(item.hi)}]
                  </td>
                  <td className="py-2 px-3 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] hidden sm:table-cell font-sans">
                    {item.raw}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 italic text-center">
          Constraints list auto-parsing... problem details detect ho rahe hain.
        </div>
      )}

      {/* Warning Badges Grid */}
      <div className="space-y-2 pt-1">
        <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block">
          Safety & Boundary Badges:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Negatives Badge */}
          <div
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
              hasNegatives
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
            }`}
          >
            {hasNegatives ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <strong>{hasNegatives ? '⚠️ Negatives Allowed' : '✅ Non-Negative Only'}</strong>
              <div className="text-xs opacity-85 mt-0.5">
                {hasNegatives
                  ? 'Sliding window invalid ho sakti hai. Prefix sum + map socho.'
                  : 'Monotonic properties strictly valid rahengi.'}
              </div>
            </div>
          </div>

          {/* Empty Input Badge */}
          <div
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
              isZeroAllowed
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
            }`}
          >
            {isZeroAllowed ? (
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <strong>{isZeroAllowed ? '⚠️ Empty Input (0) Allowed' : '✅ Non-Empty Guaranteed'}</strong>
              <div className="text-xs opacity-85 mt-0.5">
                {isZeroAllowed
                  ? 'Code ke starting me null / size 0 guard zaroor lagayein.'
                  : `Min size >= ${sizeMin || 1}. Empty input crash ka risk nahi hai.`}
              </div>
            </div>
          </div>

          {/* Integer Overflow Badge */}
          <div
            className={`p-2 rounded-xl border flex items-start gap-2 sm:col-span-2 ${
              hasOverflow
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-300'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300'
            }`}
          >
            {hasOverflow ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <strong>{hasOverflow ? '⚠️ 32-bit Integer Overflow Risk' : '✅ 32-Bit Integer Safe'}</strong>
              <div className="text-xs opacity-85 mt-0.5">
                {hasOverflow
                  ? overflowWarning.message
                  : 'Max product/sum 32-bit signed integer (2.14 × 10⁹) limit ke andar rahega.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
