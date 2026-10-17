import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Cpu,
  Layers,
  Table,
  Zap,
  ArrowRight,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';
import { ParsedProblem, CoachAnalysis, WasteToolRow } from '../../core/types';
import rawWasteTools from '../../data/wasteTool.json';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Chip } from '../components/Chip';

const WASTE_TOOL_ROWS: WasteToolRow[] = rawWasteTools as WasteToolRow[];

export interface StepContextViewProps {
  step: number;
  problem: ParsedProblem;
  analysis: CoachAnalysis;
  className?: string;
}

export const StepContextView: React.FC<StepContextViewProps> = ({
  step,
  problem,
  analysis,
  className = '',
}) => {
  const [selectedWasteRow, setSelectedWasteRow] = useState<number | null>(null);

  // Common references
  const firstExample = problem.examples.length > 0 ? problem.examples[0] : null;
  const sizeMax = problem.analysis.sizeMax;
  const n2Ops = analysis.tleChecks.n2Ops;
  const n2TLE = analysis.tleChecks.n2TLE;
  const targetTier = analysis.complexity;

  // Matched waste rows from keyword hits
  const matchedWasteRows = new Set<number>();
  for (const hit of analysis.keywordHits) {
    if (hit.wasteRow !== null && hit.wasteRow !== undefined) {
      matchedWasteRows.add(hit.wasteRow);
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ---------------- STEP 1: OBSERVE ---------------- */}
      {step === 1 && (
        <div className="space-y-3">
          {/* Example 1 Card */}
          {firstExample ? (
            <div className="rounded-xl p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/[0.06]">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Example 1 (Concrete Sample)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Input / Output Samjho</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block uppercase tracking-wider font-sans font-semibold mb-1">Input (Question ne kya diya)</span>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-white/[0.06] overflow-x-auto text-xs">
                    {firstExample.input || 'None'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block uppercase tracking-wider font-sans font-semibold mb-1">Expected Output (Hume kya answer dena hai)</span>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-white/[0.06] overflow-x-auto text-xs font-semibold">
                    {firstExample.output || 'None'}
                  </div>
                </div>
                {firstExample.explanation && (
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-sans pt-1 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Explanation: </span>
                    {firstExample.explanation}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              Example testcases parsing in progress...
            </div>
          )}

          {/* Output Type Hint */}
          {analysis.outputTypeHint && (
            <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">
                  {analysis.outputTypeHint.title}
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {analysis.outputTypeHint.socraticQuestion}
                </div>
                <div className="text-xs font-mono text-indigo-700 dark:text-indigo-300/90 pt-0.5">
                  Suggested techniques: {analysis.outputTypeHint.candidateTechniques}
                </div>
              </div>
            </div>
          )}

          {/* Size relation hint (if available) */}
          {analysis.sizeRelationHint && (
            <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-semibold text-sm text-purple-900 dark:text-purple-300">
                  Size Relationship: {analysis.sizeRelationHint.relation}
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {analysis.sizeRelationHint.socraticQuestion}
                </div>
              </div>
            </div>
          )}

          {/* Constraint Snapshot */}
          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Input Size Bounds (N):</span>
            <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
              {sizeMax ? `Max N ≈ ${sizeMax.toLocaleString()}` : 'Constraints checking...'}
              {problem.analysis.negatives ? ' | ⚠️ Negatives allowed' : ' | Non-negative'}
            </span>
          </div>
        </div>
      )}

      {/* ---------------- STEP 2: MANUAL SOLVE ---------------- */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs">
                ✍️
              </span>
              Playbook Rule: 4 Numbers Lekar Pen-Paper Pe Karke Dekho
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              Example 1 se bhi chhota ek 4-numbers ka custom case paper pe likho. Khud manually solve karte waqt in 3 aasan baaton par dhyan do:
            </p>
            <div className="space-y-2.5 pt-1 text-[13.5px] text-slate-700 dark:text-slate-200 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-sm">1.</span>
                <span><strong>Pehle Kahan Dekha (Starting Point):</strong> Tumhara dimag shuru me sabse pehle kahan gaya — shuru me (left), aakhiri me (right), ya beech me?</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-sm">2.</span>
                <span><strong>Har Baar Kya Calculate Kiya (Repetitive Thought):</strong> Har number pe aane ke baad tum kya hisaab laga rahe the — difference nikal rahe the, jodd (sum) kar rahe the, ya compare kar rahe the?</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-sm">3.</span>
                <span><strong>Faisla Kaise Liya (Decision Point):</strong> Tumhe kaise pata chala ki yehi sahi answer hai aur ab aage check karne ki zaroorat nahi?</span>
              </div>
            </div>
          </div>

          {/* 6-Nazar Inspection Checklist */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] space-y-2.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Array ko dhyan se dekhne ke 4 zaroori sawal:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200">
                • <strong>Sorted</strong> hai (chote se bada) ya nahi?
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200">
                • <strong>Duplicates</strong> (same number) aa sakte hain?
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200">
                • <strong>Negatives</strong> hain ya sirf 0 aur positive?
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200">
                • <strong>Contiguous</strong> (lagataar tukda) chahiye ya subset?
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 3: NAAM DO ---------------- */}
      {step === 3 && (
        <div className="space-y-3">
          {/* Detected Problem Variables */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Identified Inputs & Variables
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {problem.analysis.sizeVariables.length > 0 ? (
                problem.analysis.sizeVariables.map((v) => (
                  <Chip key={v} size="md" variant="accent" label={`${v} (Size / Length)`} />
                ))
              ) : (
                <Chip size="md" variant="default" label="nums (Array)" />
              )}
              {Object.keys(problem.analysis.params).map((p) => (
                <Chip key={p} size="md" variant="outline" label={`${p} (Target / Parameter)`} />
              ))}
            </div>
          </div>

          {/* Socratic Naming Invariants */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Paper Trace se 3 Cheezon ko Naam do:
            </span>
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 space-y-1">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs">1. Baar-baar hone wala kaam ➔ Loop:</span>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  Kaunse pointers aage badh rahe hain? Ek pointer (i = 0 se n) ya do pointers (left aur right)?
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 space-y-1">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">2. Purani cheez jo yaad rakhni padi ➔ Variable (Memory):</span>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  Dimag me kya store kiya tha? (Kul jodd / Running sum, sabse chota number, ya pehle dekhe hue numbers ka table?)
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 space-y-1">
                <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs">3. Rukne ki shart ➔ Stop Condition:</span>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  Loop kab rukega? (Jab poora array khatam ho jaye, ya answer milte hi break?)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 4: BRUTE FORCE & COMPLEXITY ---------------- */}
      {step === 4 && (
        <div className="space-y-3">
          {/* TLE Calculation Box */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Complexity vs Constraints
              </span>
              <Badge variant={n2TLE ? 'hard' : 'easy'} size="sm">
                {n2TLE ? 'O(n²) -> TLE DANGER' : 'O(n²) Safe'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-slate-400 text-xs block font-sans">Input Size (N)</span>
                <span className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                  {sizeMax ? `N ≈ ${sizeMax.toLocaleString()}` : 'Unknown'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-slate-400 text-xs block font-sans">O(N²) Operations</span>
                <span className={`font-bold text-sm ${n2TLE ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {n2Ops ? `≈ ${n2Ops.toExponential(1)} ops` : 'N/A'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {analysis.tleChecks.n2Explanation}
            </p>
          </div>

          {/* Target Complexity Tier Recommendation */}
          <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">
                Target Complexity Tier: <span className="font-mono">{targetTier.bigO}</span>
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400/90 font-mono">10⁸ ops/sec rule</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {targetTier.socraticHint}
            </p>
            <div className="text-xs text-indigo-700 dark:text-indigo-400 pt-1 font-mono font-medium">
              Techniques fitting this tier: {targetTier.techniques}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 5: WASTE DHOONDO ---------------- */}
      {step === 5 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <SearchIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Brute Force Ka Bottleneck Dhoondo
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Code slow hone ka sirf ek hi reason hota hai: koi aisi calculation jo dobara nahi karni chahiye thi, wo baar-baar ho rahi hai. Dhoondo konsa faltu kaam ho raha hai:
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              {[
                { id: 0, title: 'Baar-baar shuru se dhoondhna (Linear Search)', desc: '"Kya ye number pehle dekha tha?" pata lagane ke liye har baar poora array scan karna. (Tod: HashMap)' },
                { id: 1, title: 'Range sum / Subarray recalculate karna', desc: 'Har pair ke beech ka sum nikalne ke liye har baar sabko firse jodna. (Tod: Prefix Sum)' },
                { id: 2, title: 'Sorted data me bhi andha-dhundh har pair check karna', desc: 'Jab numbers line se lage hain, tab bhi sabko aapas me mila ke dekhna. (Tod: Two Pointers)' },
                { id: 3, title: 'Khiskte hue dabbe (Window) ko dobara jodna', desc: 'Ek number aage badhe to poora dabba firse calculate karna. (Tod: Sliding Window)' },
                { id: 5, title: 'Wahi chhota question baar-baar solve karna (Recursion)', desc: 'Ek hi subproblem ko 10 baar dobara calculate karna bina save kiye. (Tod: DP / Cache)' },
              ].map((waste) => {
                const isMatched = matchedWasteRows.has(waste.id);
                return (
                  <div
                    key={waste.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isMatched
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {waste.title}
                      </span>
                      {isMatched && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                          Matched Keyword
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{waste.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 6: TOOL CHUNO ---------------- */}
      {step === 6 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Waste-to-Tool Prescription Matrix
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">9 Playbook Tools</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Highlight ki gayi row tumhari problem ke keywords se match karti hai. Row par click karke dekho ki ye tool kyu aur kaise kaam karta hai:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto dsa-scrollbar pr-1 pt-1">
              {WASTE_TOOL_ROWS.map((row) => {
                const isMatched = matchedWasteRows.has(row.rowIndex);
                const isSelected = selectedWasteRow === row.rowIndex;

                return (
                  <div
                    key={row.rowIndex}
                    onClick={() => setSelectedWasteRow(isSelected ? null : row.rowIndex)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isMatched
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-500/40 ring-1 ring-indigo-200 dark:ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isMatched && <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                          {row.tool}
                        </span>
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shrink-0 font-semibold">
                        {row.gain}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{row.waste}</p>

                    {/* Expanded details */}
                    {(isSelected || isMatched) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/[0.06] text-xs space-y-1">
                        <div className="font-semibold flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-300">
                          <HelpCircleIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Socratic Prompt:
                        </div>
                        <div className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">
                          {row.socraticQuestion}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 7: DRY RUN TRACE TABLE ---------------- */}
      {step === 7 && (
        <div className="space-y-3">
          {/* Edge Cases Identified */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Active Edge Case Alerts
            </span>

            <div className="space-y-2 pt-1">
              {analysis.edgeCaseWarnings.map((warn) => (
                <div
                  key={warn.id}
                  className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                    warn.severity === 'warning'
                      ? 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {warn.message}
                </div>
              ))}

              {analysis.overflowWarning && analysis.overflowWarning.hasWarning && (
                <div className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-300 text-xs leading-relaxed">
                  <strong>⚠️ Integer Overflow Alert:</strong> {analysis.overflowWarning.message} (Remedy: {analysis.overflowWarning.remedy})
                </div>
              )}
            </div>
          </div>

          {/* Trace Table Schema Template */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
              Paper Trace Table (Haath Se Check Karne Ka Format):
            </span>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs text-center pt-1">
              <div className="p-2 rounded bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                Step / Loop (i)
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold">
                Variables / State
              </div>
              <div className="p-2 rounded bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold">
                Action / Output
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 8: CODE ---------------- */}
      {step === 8 && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Pre-Submission Mental Checklist
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Editor me code likhte waqt in 4 aasan baaton ko verify karo:
            </p>

            <div className="space-y-2 pt-1 text-xs text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Base condition & boundary check (n == 0 ya single element pe crash to nahi hoga?).</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Meaningful variable names (left, right, target, seen — saaf naam rakho).</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Loop index bounds (i &lt; n ya left &lt;= right dhyan se check karo taaki array out of bounds na ho).</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Return value type wahi ho jo question ne manga hai ({analysis.outputTypeHint?.type || 'output'}).</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple inline helper icons for clean render
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HelpCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
