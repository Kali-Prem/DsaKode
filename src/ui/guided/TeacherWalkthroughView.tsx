import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Table,
  Lightbulb,
  ShieldAlert,
  ListOrdered,
  Layers,
  Eye,
  Check,
  ChevronRight,
  BookmarkCheck,
  Cpu,
  Compass,
} from 'lucide-react';
import { ParsedProblem, CoachAnalysis } from '../../core/types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { getWasteToolRows } from '../../core/i18n';

export interface TeacherWalkthroughViewProps {
  problem: ParsedProblem;
  analysis: CoachAnalysis;
  language?: 'en' | 'hi';
  className?: string;
}

export const TeacherWalkthroughView: React.FC<TeacherWalkthroughViewProps> = ({
  problem,
  analysis,
  language = 'hi',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<'step' | 'full'>('step');
  const [currentChapter, setCurrentChapter] = useState(0);

  const firstExample = problem.examples.length > 0 ? problem.examples[0] : null;
  const otherExamples = problem.examples.slice(1);
  const sizeMax = problem.analysis.sizeMax;
  const isHi = language === 'hi';
  const targetTier = analysis.complexity;
  const primaryKeyword = analysis.keywordHits[0];
  const matchedWasteRow = primaryKeyword?.wasteRow ?? null;
  const wasteToolRows = getWasteToolRows(language);
  const matchedWaste = matchedWasteRow !== null ? wasteToolRows[matchedWasteRow] : null;

  // Build the 8 Chapters of the Teacher's mental flow
  const chapters = [
    // ---------------- Chapter 1: Pehli Nazar (First Impression & I/O) ----------------
    {
      id: 'io',
      icon: Eye,
      tag: isHi ? 'Pehli Nazar' : 'First Look',
      title: isHi ? '1. Question Dekhte Hi Input & Output Par Dhyan' : '1. First Look: Input & Expected Output',
      subtitle: isHi ? 'Direct code sochna band karo, pehle transform kya karna hai samjho' : 'Stop thinking about code; understand the transform first',
      color: 'indigo',
      render: () => (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/25">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{isHi ? "Teacher Ka Mindset:" : "Teacher's First Mindset:"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {isHi
                ? `Jab maine question dekha, to lambi kahani padhne ke bajaye sabse pehle dekha ki Input me kya mila hai aur Output kis form me chahiye. Hume input data ko output me convert karna hai!`
                : `When I first encountered this problem, instead of getting lost in paragraph details, I looked strictly at what Input is provided and what Output is expected. That defines the exact contract!`}
            </p>
          </div>

          {firstExample ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-indigo-500" />
                  {isHi ? 'Sample Input & Output' : 'Sample I/O Contract'}
                </span>
                <Badge variant="neutral" size="sm">{problem.difficulty || 'Problem'}</Badge>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {isHi ? 'INPUT (Question Ne Hume Diya):' : 'INPUT (Provided by caller):'}
                </span>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] font-mono text-indigo-600 dark:text-indigo-300 text-xs break-all">
                  {firstExample.input || 'None'}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {isHi ? 'EXPECTED OUTPUT (Hume Ye Return Karna Hai):' : 'EXPECTED OUTPUT (We must produce):'}
                </span>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] font-mono text-emerald-600 dark:text-emerald-400 text-xs break-all">
                  {firstExample.output || 'None'}
                </div>
              </div>

              {firstExample.explanation && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-amber-200/90 text-xs">
                  <strong className="text-amber-600 dark:text-amber-300">{isHi ? 'Reasoning: ' : 'Explanation: '}</strong>
                  {firstExample.explanation}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {isHi ? 'Problem ke description se input/output verify karein.' : 'Check problem description for sample input/output.'}
            </p>
          )}

          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-300">
            <strong>{isHi ? 'Target Goal: ' : 'Target Goal: '}</strong>
            {isHi
              ? 'Input se output tak ka connection banana hi humara main goal hai. Direct coding se pehle pen-paper par manually trace karo!'
              : 'Our sole goal is mapping this input state to output state. Always trace manually on paper before writing a line of code!'}
          </div>
        </div>
      ),
    },

    // ---------------- Chapter 2: Test Case & Human Simulation ----------------
    {
      id: 'testcase',
      icon: Table,
      tag: isHi ? 'Test Case Trace' : 'Human Trace',
      title: isHi ? '2. Test Case Ko Pen-Paper Par Khud Solve Kiya' : '2. Human Simulation on Pen & Paper',
      subtitle: isHi ? 'Agar insaan manually solve nahi kar sakta, to computer se kaise karwayega?' : 'If a human cannot solve it manually, code cannot either',
      color: 'amber',
      render: () => (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/25">
            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{isHi ? "Teacher Ki Simulation Strategy:" : "Teacher's Simulation Strategy:"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {isHi
                ? `Maine computer ko bhul kar pehle khud ek insan ki tarah Example 1 ko trace kiya: "${firstExample?.input || 'input'}" se "${firstExample?.output || 'output'}" tak jaane me mera dimag kya steps le raha hai?`
                : `Forgetting code, I manually walked through Example 1: What decisions does a human brain make step-by-step to reach "${firstExample?.output || 'output'}" from "${firstExample?.input || 'input'}"?`}
            </p>
          </div>

          {/* Trace steps */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
              {isHi ? '🧠 Human Thought Process:' : '🧠 Human Thought Process:'}
            </span>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {isHi ? 'Start se start kiya aur pehla element observe kiya.' : 'Started from the beginning and observed initial state.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {isHi ? 'Har agle element ke liye check kiya ki kya condition satisfy ho rahi hai.' : 'Checked transition conditions for subsequent items.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {isHi ? 'Dekha ki humne bina soche kis information ko dimag me store karke rakha!' : 'Noticed what state our human memory subconsciously cached along the way!'}
                </span>
              </div>
            </div>
          </div>

          {otherExamples.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isHi ? `Agle Test Cases (${otherExamples.length} more):` : `Other Test Cases (${otherExamples.length} more):`}
              </span>
              <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {otherExamples.map((ex, i) => (
                  <div key={i} className="truncate">
                    Ex {i + 2}: Input: {ex.input} → Output: {ex.output}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },

    // ---------------- Chapter 3: Constraints & TLE Budget ----------------
    {
      id: 'constraints',
      icon: Clock,
      tag: isHi ? 'Constraints Budget' : 'Constraints Budget',
      title: isHi ? '3. Constraints Se Time & Space Ka Budget Nikala' : '3. Constraints Math: Time & Space Budget',
      subtitle: isHi ? 'N ki value se decide hota hai ki O(N^2) chalega ya TLE marega' : 'Value of N strictly limits which Big-O complexities will pass',
      color: 'rose',
      render: () => {
        const n2TLE = analysis.tleChecks.n2TLE;
        const n2Ops = analysis.tleChecks.n2Ops;
        return (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/25">
              <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>{isHi ? "Teacher Ka Golden Rule of Limits:" : "Teacher's 1-Second CPU Budget:"}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {isHi
                  ? `Coding interviews me 1 second me lagbhag 10^8 (10 crore) operations chal sakte hain. Constraints dekhkar maine turant calculate kiya ki kaun si complexity pass hogi aur kaun si TLE degi!`
                  : `In modern online judges, 1 second allows ~10^8 operations. Constraints dictate mathematically which algorithms survive and which TLE immediately!`}
              </p>
            </div>

            {/* Constraints Analysis Table */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-rose-500" />
                  {isHi ? 'Constraints Post-Mortem' : 'Constraints Post-Mortem'}
                </span>
                <span className="font-mono text-xs text-indigo-500 font-bold">
                  Max N ≈ {sizeMax ? sizeMax.toLocaleString() : 'N/A'}
                </span>
              </div>

              {/* TLE comparison */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border ${
                  n2TLE
                    ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                }`}>
                  <span className="font-bold block text-xs">O(N²) Brute Force:</span>
                  <span className="font-mono text-[11px] block mt-0.5">
                    {n2Ops ? `${n2Ops >= 1e9 ? (n2Ops / 1e9).toFixed(1) + 'x 10^9' : (n2Ops / 1e6).toFixed(0) + ' Million'} ops` : 'Calculating...'}
                  </span>
                  <span className="font-bold text-[11px] block mt-1">
                    {n2TLE ? '❌ TLE (Time Limit Exceeded)' : '⚠️ Borderline / Small N'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block text-xs">{isHi ? 'Hume Kya Chahiye:' : 'Allowed Target:'}</span>
                  <span className="font-mono text-[11px] block mt-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    {targetTier?.bigO || 'O(N) or O(N log N)'}
                  </span>
                  <span className="font-bold text-[11px] block mt-1">
                    ✅ {isHi ? 'Passed in <0.05s' : 'Guaranteed Pass'}
                  </span>
                </div>
              </div>

              {/* Raw parsed constraints */}
              {problem.analysis.parsed.length > 0 && (
                <div className="pt-1 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                    {isHi ? 'Given Limits:' : 'Given Limits:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {problem.analysis.parsed.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300">
                        {c.raw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-300">
              <strong>{isHi ? 'Verdict: ' : 'Verdict: '}</strong>
              {isHi
                ? `Constraints saaf bata rahe hain ki N bada hai to hum nested loops O(N^2) me nahi ja sakte. Hume linear O(N) ya logarithmic O(N log N) logic hi dhundhna hoga!`
                : `Constraints mathematically disqualify naive quadratic solutions. We must aim strictly for O(N) or O(N log N)!`}
            </div>
          </div>
        );
      },
    },

    // ---------------- Chapter 4: Brute Force & Waste ----------------
    {
      id: 'bruteforce',
      icon: Zap,
      tag: isHi ? 'Brute Force Waste' : 'Brute Force Waste',
      title: isHi ? '4. Brute Force Me Faltu Kaam (Waste) Pehchana' : '4. Identifying the Waste in Brute Force',
      subtitle: isHi ? 'Slow solution me kya faltu repeat ho raha hai jo time kha raha hai?' : 'Where exactly is the naive solution wasting CPU cycles?',
      color: 'amber',
      render: () => (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/25">
            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{isHi ? "Teacher Ka Waste Diagnosis:" : "Teacher's Waste Diagnosis:"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {isHi
                ? `Maine socha: Agar sabse dumb brute force likhu, to wo kya karega? Wo har element ke liye pura array dobara scan karega ya baar-baar same calculation repeat karega. Yahi repeatition sabse bada waste hai!`
                : `I asked myself: If I write the dumbest brute force, what does it do? It repeatedly scans or recalculates already visited data. That redundancy is the exact waste costing us our 1-second limit!`}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
              {isHi ? '⚠️ Brute Force Me Time Kahan Barbaad Hota Hai?' : '⚠️ Where is CPU Time Lost?'}
            </span>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <strong className="text-rose-700 dark:text-rose-300 block mb-0.5">
                  {isHi ? '1. Repetitive Linear Search / Scanning:' : '1. Repeated Linear Scanning:'}
                </strong>
                <span>
                  {isHi
                    ? 'Ek hi cheez ko dhoondhne ke liye har step par O(N) loop chalana.'
                    : 'Running an O(N) loop at every step to search for matching elements.'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <strong className="text-amber-700 dark:text-amber-300 block mb-0.5">
                  {isHi ? '2. No Memory / No State Cache:' : '2. No Memory of Past Work:'}
                </strong>
                <span>
                  {isHi
                    ? 'Pichle dekhe hue elements ko bhool jaana, jisse har baar scratch se kaam karna padta hai.'
                    : 'Forgetting what we have already seen, forcing a restart on every query.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ---------------- Chapter 5: Intuition & Tool Selection ----------------
    {
      id: 'tool',
      icon: Lightbulb,
      tag: isHi ? 'Intuition Click' : 'Intuition Click',
      title: isHi ? '5. Intuition Click Hua Aur Right Tool Choose Kiya' : '5. The Aha! Moment & Tool Selection',
      subtitle: isHi ? 'Waste ko hatane ke liye kaun sa Data Structure ya Technique fit aayi?' : 'Which data structure or paradigm eliminates the identified waste?',
      color: 'indigo',
      render: () => (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/25">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{isHi ? "Teacher Ka Tool Selection Thought:" : "Teacher's Tool Selection Thought:"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {isHi
                ? `Ab sawaal ye tha: Brute force ke is waste ko hataye kaise? Jaise hi maine dekha ki hume pichli information O(1) me chahiye, dimag me turant tool click hua!`
                : `Now the pivotal question: How do we eradicate this waste? The moment we recognize the need for instant O(1) state or structured ordering, the optimal tool emerges naturally!`}
            </p>
          </div>

          {/* Matched Tool Card */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-indigo-500/30 shadow-sm space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {isHi ? 'Chosen Technique & Data Structure' : 'Chosen Technique & Data Structure'}
              </span>
              <Badge variant="medium" size="sm">
                {primaryKeyword?.technique || targetTier?.techniques?.split(',')[0] || 'Optimal Tool'}
              </Badge>
            </div>

            {matchedWaste && (
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                  <span className="font-semibold text-rose-700 dark:text-rose-300 block text-[11px]">
                    {isHi ? 'Waste Identified:' : 'Waste Identified:'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{matchedWaste.waste}</span>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 block text-[11px]">
                    {isHi ? 'Tool Matched:' : 'Tool Matched:'}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">{matchedWaste.tool}</span>
                  <span className="text-slate-600 dark:text-slate-400 block mt-0.5 text-[11px]">{matchedWaste.gain}</span>
                </div>
              </div>
            )}

            {primaryKeyword && (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] text-xs space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  {isHi ? 'Intuition Reason (Kyun Choose Kiya):' : 'Why This Tool Fits:'}
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {primaryKeyword.why}
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    },

    // ---------------- Chapter 6: Winning Strategy ----------------
    {
      id: 'algorithm',
      icon: ListOrdered,
      tag: isHi ? 'Execution Plan' : 'Execution Plan',
      title: isHi ? '6. Final Winning Algorithm Ka Step-by-Step Blueprint' : '6. Step-by-Step Algorithm Blueprint',
      subtitle: isHi ? 'Code likhne se pehle algorithm ke 4-5 clear steps' : 'The exact execution steps to implement cleanly in the editor',
      color: 'emerald',
      render: () => (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/25">
            <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{isHi ? "Teacher Ka Code Blueprint:" : "Teacher's Implementation Blueprint:"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {isHi
                ? `Ab jab tool decide ho gaya, to code likhna bas formality hai! Maine algorithm ko 4 clear steps me divide kiya:`
                : `With tool and constraints locked, writing code is straightforward. Here is the concrete 4-step execution algorithm:`}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06]">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block">
                  {isHi ? 'State & Data Structure Initialize Karo' : 'Initialize State & Data Structures'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Map, pointers, dummy node, ya frequency counter banayein.'
                    : 'Set up map, pointers, dummy sentinel node, or counters.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06]">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block">
                  {isHi ? 'Iterate & Observe Invariants' : 'Single Pass Traversal'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Input data par iterate karein aur current element ko process karein.'
                    : 'Iterate cleanly through the input with loop condition.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06]">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block">
                  {isHi ? 'O(1) Check Ya Pointer Update' : 'Instant State Update / Lookup'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Check karein ki kya target complement map me hai, ya pointers swap/advance karein.'
                    : 'Verify complement in map, or adjust pointers in O(1).'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06]">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block">
                  {isHi ? 'Result Return Karo' : 'Return Formatted Answer'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Expected output type ke matching result return karein.'
                    : 'Return final result matching signature type.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ---------------- Chapter 7: Edge Cases & Interview Traps ----------------
    {
      id: 'edgecases',
      icon: ShieldAlert,
      tag: isHi ? 'Edge Cases & Traps' : 'Edge Cases & Traps',
      title: isHi ? '7. Interviewer Kahan Fasa Sakta Hai? (Edge Cases)' : '7. Edge Cases & Interview Traps',
      subtitle: isHi ? 'Code submit karne se pehle boundary conditions check karo' : 'Boundary conditions to verify before submitting',
      color: 'rose',
      render: () => (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/25">
            <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>{isHi ? "Teacher Ka Trap Warning:" : "Teacher's Trap Checklist:"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {isHi
                ? `Interviews me 80% rejections logic ki wajah se nahi, balki unhandled Edge Cases ki wajah se hote hain! Maine code likhne se pehle ye 4 test cases zaroor verify kiye:`
                : `80% of interview rejections happen due to unhandled edge cases, not core logic! Always test these 4 boundary cases first:`}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                  {isHi ? '1. Empty Input Ya 1 Element (N = 0 ya 1):' : '1. Empty or Single Element (N = 0 or 1):'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Kya code null pointer exception dega ya clean early return karega?'
                    : 'Does code crash on null or return cleanly?'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                  {isHi ? '2. Odd vs Even Length:' : '2. Odd vs Even Parity:'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Linked list ya pairs me agar last element akele bache, to pointer null na ho jaye.'
                    : 'Ensure trailing lone elements do not dereference null.'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                  {isHi ? '3. Duplicates & Identical Values:' : '3. Duplicates & Identical Values:'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Kya map me same value do baar aane par overwrite ho rahi hai?'
                    : 'Verify duplicate entries in maps/sets do not overwrite indices.'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-xs">
                  {isHi ? '4. Negative Numbers & Integer Overflow:' : '4. Negative Values & Integer Limits:'}
                </strong>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                  {isHi
                    ? 'Negative values par pointer logic ya sum calculation break to nahi ho raha?'
                    : 'Check whether negative values violate assumptions or cause underflow.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ---------------- Chapter 8: Golden Rule Takeaway ----------------
    {
      id: 'goldenrule',
      icon: BookmarkCheck,
      tag: isHi ? 'Golden Takeaway' : 'Golden Takeaway',
      title: isHi ? '8. Future Interviews Ke Liye Golden Takeaway' : '8. Golden Interview Takeaway',
      subtitle: isHi ? 'Is problem se seekhi hui 1 line jo hamesha dimag me rahegi' : 'The 1-line mental invariant to lock permanently into memory',
      color: 'indigo',
      render: () => (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-500/15 border border-indigo-500/30 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-500/30">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isHi ? 'Teacher Ka Final Mantra' : "Teacher's Final Core Mantra"}
            </h4>
            <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/90 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs leading-relaxed">
              "{primaryKeyword?.technique || targetTier?.techniques?.split(',')[0] || 'Optimal Thinking'}: {
                isHi
                  ? 'Input-Output dekho → Constraints se Big-O budget nikalo → Brute force ka waste tool se hatao → Edge cases verify karo!'
                  : 'Check I/O → Calculate Big-O budget from constraints → Eliminate brute waste with right tool → Verify edge cases!'
              }"
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] text-xs space-y-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              {isHi ? 'Interview Me Explain Karne Ka Formula:' : 'How to Narrate in Front of Interviewer:'}
            </span>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li>{isHi ? 'Pehle brute force batao aur uska Big-O complexity state karo.' : 'State brute force and its Big-O complexity first.'}</li>
              <li>{isHi ? 'Batao ki brute force me waste kahan hai (e.g. repeated scans).' : 'Point out exactly where brute force wastes computations.'}</li>
              <li>{isHi ? 'Optimal tool propose karo jo waste ko khatam kare.' : 'Propose the optimal tool to eliminate this waste.'}</li>
              <li>{isHi ? 'Constraints ke hisab se batao ki ye solution kyu pass hoga.' : 'Explain why this matches the constraints budget.'}</li>
              <li>{isHi ? 'Edge cases handle karke confidence ke sath code likho!' : 'Address edge cases cleanly and code with confidence!'}</li>
            </ol>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Teacher Top Header Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/25 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                {isHi ? 'Teacher Flow: Step-by-Step Breakdown' : 'Teacher Flow: Step-by-Step Breakdown'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {isHi ? 'Shuru se lekar aakhiri tak pura thought process samjho' : 'Complete end-to-end thought process from first look to code'}
              </span>
            </div>
          </div>

          <Badge variant="easy" size="sm" icon={<Sparkles className="w-3 h-3" />}>
            Master Story
          </Badge>
        </div>

        {/* View Mode Toggle: Step-by-Step vs Full Story */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-white/[0.08]">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {isHi ? 'View Mode:' : 'View Mode:'}
          </span>
          <div className="inline-flex items-center rounded-lg bg-slate-200/80 dark:bg-slate-950 p-0.5 border border-slate-300 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('step')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'step'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isHi ? 'Ek-Ek Karke (8 Steps)' : 'Step-by-Step'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('full')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'full'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isHi ? 'Pura Ek Saath (Full Story)' : 'Full Story'}
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: STEP-BY-STEP (Interactive Chapter Flow) */}
      {viewMode === 'step' && (
        <div className="space-y-3">
          {/* Chapter Selector Chips / Mini Stepper */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 dsa-scrollbar">
            {chapters.map((ch, idx) => {
              const isCurrent = idx === currentChapter;
              const IconComp = ch.icon;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setCurrentChapter(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/[0.06]'
                  }`}
                  title={ch.title}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{idx + 1}. {ch.tag}</span>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChapter}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3"
            >
              {/* Chapter Header */}
              <div className="border-b border-slate-200 dark:border-white/[0.06] pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Chapter {currentChapter + 1} of {chapters.length}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {chapters[currentChapter].tag}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {chapters[currentChapter].title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {chapters[currentChapter].subtitle}
                </p>
              </div>

              {/* Chapter Content */}
              <div>{chapters[currentChapter].render()}</div>

              {/* Navigation Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentChapter === 0}
                  onClick={() => setCurrentChapter((prev) => Math.max(0, prev - 1))}
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {isHi ? 'Pichla Step' : 'Previous'}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={currentChapter === chapters.length - 1}
                  onClick={() => setCurrentChapter((prev) => Math.min(chapters.length - 1, prev + 1))}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                  className="text-xs font-bold"
                >
                  {isHi ? 'Agla Step' : 'Next Chapter'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* MODE 2: FULL STORY (All-in-One Continuous Storyline) */}
      {viewMode === 'full' && (
        <div className="space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-500/20">
            {chapters.map((ch, idx) => {
              const IconComp = ch.icon;
              return (
                <div key={ch.id} className="relative space-y-2">
                  {/* Glowing Node on Timeline */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm ring-4 ring-white dark:ring-slate-900">
                    {idx + 1}
                  </div>

                  {/* Chapter Section Card */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {ch.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {ch.subtitle}
                      </span>
                    </div>

                    <div>{ch.render()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
