import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Zap, ArrowRight, Gauge } from 'lucide-react';
import { CoachAnalysis } from '../../core/types';
import { Badge } from '../components/Badge';

export interface ComplexityMeterProps {
  analysis: CoachAnalysis;
  sizeMax: number | null;
  className?: string;
}

interface SpectrumItem {
  label: string;
  key: string;
  category: 'too-slow' | 'risky' | 'optimal' | 'fast';
}

const SPECTRUM_TIERS: SpectrumItem[] = [
  { label: 'O(n!)', key: 'factorial', category: 'too-slow' },
  { label: 'O(2ⁿ)', key: 'exponential', category: 'too-slow' },
  { label: 'O(n³)', key: 'cubic', category: 'risky' },
  { label: 'O(n²)', key: 'quadratic', category: 'risky' },
  { label: 'O(n log n)', key: 'nlogn', category: 'optimal' },
  { label: 'O(n)', key: 'linear', category: 'optimal' },
  { label: 'O(log n)', key: 'log', category: 'fast' },
  { label: 'O(1)', key: 'constant', category: 'fast' },
];

export const ComplexityMeter: React.FC<ComplexityMeterProps> = ({
  analysis,
  sizeMax,
  className = '',
}) => {
  const targetBigO = analysis.complexity.bigO;
  const tleReport = analysis.tleChecks;
  const n2Ops = tleReport.n2Ops;
  const isTLE = tleReport.n2TLE;

  // Determine active tier key
  const getActiveKey = (bigO: string): string => {
    const s = bigO.toLowerCase();
    if (s.includes('n!')) return 'factorial';
    if (s.includes('2^n')) return 'exponential';
    if (s.includes('n^3')) return 'cubic';
    if (s.includes('n log n')) return 'nlogn';
    if (s.includes('n^2')) return 'quadratic';
    if (s.includes('o(n)')) return 'linear';
    if (s.includes('log n')) return 'log';
    if (s.includes('o(1)')) return 'constant';
    return 'nlogn';
  };

  const activeKey = getActiveKey(targetBigO);
  const activeIndex = SPECTRUM_TIERS.findIndex((t) => t.key === activeKey);

  // Calculate approximate optimal operations for target
  const getOptimalOps = (n: number | null, key: string): { label: string; ops: number } => {
    if (!n) return { label: 'O(n)', ops: 100000 };
    if (key === 'linear') return { label: 'O(n)', ops: n };
    if (key === 'nlogn') return { label: 'O(n log n)', ops: Math.round(n * Math.log2(n || 2)) };
    if (key === 'log') return { label: 'O(log n)', ops: Math.round(Math.log2(n || 2)) };
    if (key === 'constant') return { label: 'O(1)', ops: 1 };
    return { label: 'O(n)', ops: n };
  };

  const optimal = getOptimalOps(sizeMax, activeKey);

  // Format operations in exponential/compact notation
  const formatOps = (ops: number | null | undefined): string => {
    if (!ops) return 'N/A';
    if (ops >= 1e9) return `~${(ops / 1e9).toFixed(1)} × 10⁹`;
    if (ops >= 1e8) return `~${(ops / 1e8).toFixed(1)} × 10⁸`;
    if (ops >= 1e6) return `~${(ops / 1e6).toFixed(1)} × 10⁶`;
    if (ops >= 1e3) return `~${(ops / 1e3).toFixed(1)}k`;
    return `${ops}`;
  };

  return (
    <div
      className={`p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3.5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Complexity Meter & TLE Gauge
          </span>
        </div>
        <Badge variant={isTLE ? 'hard' : 'easy'} size="sm">
          Target: {targetBigO.split(' ')[0]}
        </Badge>
      </div>

      {/* 1. Horizontal Complexity Spectrum Gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Bohot Slow (TLE)</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">Playbook Target Zone (Sahi Speed)</span>
          <span>Fast (Instant)</span>
        </div>

        {/* The Track with Segments */}
        <div className="grid grid-cols-8 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.06]">
          {SPECTRUM_TIERS.map((tier, idx) => {
            const isTarget = tier.key === activeKey;
            const isTooSlowForThisN =
              sizeMax && sizeMax >= 10000 && idx <= 3; // O(n^2) and worse are TLE for n >= 10^4

            return (
              <div
                key={tier.key}
                title={`${tier.label}${isTarget ? ' (Recommended Target)' : ''}`}
                className={`relative py-2 px-0.5 rounded-lg text-center transition-all ${
                  isTarget
                    ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50 shadow-glow scale-[1.03] z-10'
                    : isTooSlowForThisN
                    ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400/80 border border-rose-300 dark:border-rose-500/20'
                    : 'bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-transparent'
                }`}
              >
                <span className="block font-mono text-xs font-semibold truncate">
                  {tier.label.replace('O(', '').replace(')', '')}
                </span>

                {isTarget && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5 font-mono">
          <span>Input N ≈ {sizeMax ? sizeMax.toLocaleString() : '10^4+'}</span>
          <span className="text-indigo-700 dark:text-indigo-300">
            Target Zone: <strong>{targetBigO}</strong>
          </span>
        </div>
      </div>

      {/* 2. Operations Bar Chart Visual: Brute Force vs Limit vs Target */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Operations per Second (Kaun Kitna Fast Hai):
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Limit: 10⁸ ops/sec</span>
        </div>

        {/* Visual Bar Comparison */}
        <div className="space-y-2.5 text-xs font-mono">
          {/* Bar 1: Brute Force O(n^2) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs">
                Brute Force O(n²):
                <span className={isTLE ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                  {formatOps(n2Ops)} ops
                </span>
              </span>
              <span className={`text-xs font-bold ${isTLE ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isTLE ? '⚠️ TLE HOGA (Bohot Slow)' : '✅ SAFE (Pass Hoga)'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-300/60 dark:border-slate-800/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isTLE
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-glow'
                    : 'bg-emerald-500'
                }`}
                style={{ width: isTLE ? '100%' : `${Math.min(100, Math.max(10, ((n2Ops || 1) / 1e8) * 100))}%` }}
              />
            </div>
          </div>

          {/* Bar 2: LeetCode 1-sec limit reference marker */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>LeetCode Standard 1-Sec Limit:</span>
              <span>10⁸ ops (Max 10 Crore Calculations)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-300/60 dark:border-slate-800/60 relative">
              <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full w-full opacity-60" />
            </div>
          </div>

          {/* Bar 3: Optimal Target O(n) or O(n log n) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs">
              <span className="flex items-center gap-1 font-semibold">
                Optimal {optimal.label}:
                <span className="font-bold">{formatOps(optimal.ops)} ops</span>
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold">Super Fast (&lt; 0.05s)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-300/60 dark:border-slate-800/60">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-sm"
                style={{
                  width: `${Math.min(30, Math.max(5, (optimal.ops / 1e8) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Big O Callout Message */}
        <div
          className={`p-2.5 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
            isTLE
              ? 'bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-900 dark:text-rose-300'
              : 'bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-900 dark:text-emerald-300'
          }`}
        >
          {isTLE ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <strong>O(n²) Brute Force = {formatOps(n2Ops)} ops. </strong>
            {isTLE
              ? `Limit 10⁸ ops/sec se ${(n2Ops && n2Ops > 1e8 ? Math.round(n2Ops / 1e8) : 100)}× zyada hai -> Guaranteed TLE! Isliye ${targetBigO} ka tool zaroori hai.`
              : 'Ye standard 10⁸ limit ke andar hai, par optimal approach sikhna better hai.'}
          </div>
        </div>
      </div>
    </div>
  );
};
