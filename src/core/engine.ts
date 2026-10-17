/**
 * DSA Thinking Coach - Core Rules Engine
 * Pure functions: data and logic separated cleanly.
 * Source of truth: Prem's DSA Logic Building Playbook
 */
import {
  ParsedProblem,
  ConstraintAnalysis,
  ParsedExample,
  KeywordRule,
  KeywordHit,
  ComplexityTierInfo,
  TLEReport,
  OutputType,
  OutputHint,
  SizeRelationHint,
  OverflowWarning,
  EdgeCaseWarning,
  CoachAnalysis,
} from './types';
import { analyzeConstraints } from './constraints';

import rawKeywords from '../data/keywords.json';
import rawComplexityTiers from '../data/complexityTiers.json';

const KEYWORD_RULES: KeywordRule[] = rawKeywords as KeywordRule[];
const COMPLEXITY_TIERS: ComplexityTierInfo[] = rawComplexityTiers as ComplexityTierInfo[];

/**
 * Matches problem text (title + description + slug) against the playbook keyword rules.
 * Returns sorted hits by confidence (high > medium > low).
 */
export function matchKeywords(text: string): KeywordHit[] {
  if (!text) return [];
  const normalized = text.toLowerCase();
  const hits: KeywordHit[] = [];
  const seenIds = new Set<string>();

  for (const rule of KEYWORD_RULES) {
    for (const patternStr of rule.patterns) {
      try {
        const regex = new RegExp(patternStr, 'i');
        if (regex.test(normalized)) {
          if (!seenIds.has(rule.id)) {
            seenIds.add(rule.id);
            hits.push({
              id: rule.id,
              technique: rule.technique,
              why: rule.why,
              socraticQuestion: rule.socraticQuestion,
              wasteRow: rule.wasteRow,
              confidence: rule.confidence,
              matchedPattern: patternStr,
            });
          }
          break; // Rule matched, move to next rule
        }
      } catch {
        // Safe regex evaluation
      }
    }
  }

  // Sort: high > medium > low
  const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
  hits.sort((a, b) => (rank[b.confidence] || 0) - (rank[a.confidence] || 0));

  return hits;
}

/**
 * Maps input size to target complexity tier.
 */
export function getComplexityTier(sizeMax: number | null): ComplexityTierInfo {
  if (sizeMax === null || sizeMax === undefined) {
    return {
      max: null,
      bigO: 'Unknown',
      techniques: 'Constraints auto-parse nahi hue',
      socraticHint: 'Constraints me n kitna bada hai? Manually check karo: n=10^5 => O(n log n), n=20 => 2^n.',
      tleExplanation: 'Constraints auto-detect nahi hue. Problem statement ke neeche n ki value manually padho.',
    };
  }

  for (const tier of COMPLEXITY_TIERS) {
    if (tier.max !== null && sizeMax <= tier.max) {
      return tier;
    }
  }

  // If size exceeds all bounded tiers, return the unbounded (last) tier
  return COMPLEXITY_TIERS[COMPLEXITY_TIERS.length - 1];
}

/**
 * Computes approximate operations count for brute-force approaches and determines TLE danger.
 * LeetCode standard limit is ~10^8 operations per second.
 */
export function checkTLE(sizeMax: number | null): TLEReport {
  if (sizeMax === null || sizeMax === undefined) {
    return {
      sizeMax: null,
      n2Ops: null,
      n2TLE: false,
      n2Explanation: 'Constraints unavailable for TLE check.',
    };
  }

  const n2Ops = sizeMax ** 2;
  const n2TLE = n2Ops > 1e8;
  const n2Exp =
    n2Ops > 1e8
      ? `❌ O(n^2) brute force = ~${formatOps(n2Ops)} ops. Guaranteed TLE! (Limit ~10^8 ops/sec). O(n log n) ya O(n) zaroori hai.`
      : `✅ O(n^2) brute force = ~${formatOps(n2Ops)} ops. Chal sakta hai (Limit ~10^8 ops/sec ke andar).`;

  let n3Ops: number | null = null;
  let n3TLE: boolean | undefined = undefined;
  let n3Exp: string | undefined = undefined;

  if (sizeMax <= 500) {
    n3Ops = sizeMax ** 3;
    n3TLE = n3Ops > 1e8;
    n3Exp =
      n3Ops > 1e8
        ? `❌ O(n^3) 3-nested loops = ~${formatOps(n3Ops)} ops. TLE dega!`
        : `✅ O(n^3) 3-nested loops = ~${formatOps(n3Ops)} ops. Chal sakta hai.`;
  }

  return {
    sizeMax,
    n2Ops,
    n2TLE,
    n2Explanation: n2Exp,
    n3Ops,
    n3TLE,
    n3Explanation: n3Exp,
  };
}

function formatOps(x: number): string {
  if (x <= 0) return '0';
  const power = Math.round(Math.log10(x));
  return `10^${power}`;
}

/**
 * Classifies example output type: bool, number, array, 2d, string, other.
 */
export function classifyOutput(outputStr: string): OutputType {
  const clean = outputStr.trim();
  if (/^\[\s*\[/.test(clean)) return '2d';
  if (/^\[/.test(clean)) return 'array';
  if (/^(true|false)$/i.test(clean)) return 'bool';
  if (/^-?\d+(\.\d+)?$/.test(clean)) return 'number';
  if (/^["'].*["']$/.test(clean) || /^"[^"]*"$/.test(clean)) return 'string';
  return 'other';
}

/**
 * Provides Socratic guidance and candidate techniques based on problem output format.
 */
export function getOutputTypeHint(outputStr: string | null | undefined): OutputHint | null {
  if (!outputStr) return null;
  const type = classifyOutput(outputStr);

  switch (type) {
    case 'bool':
      return {
        type: 'bool',
        title: 'Sirf true ya false return karna hai (Existence / Validation)',
        socraticQuestion:
          'Kya ye validation problem hai ya path existence? Target milte hi early exit (return true) kaise karoge?',
        candidateTechniques: 'HashSet lookup, Two Pointers validation, Graph DFS/BFS path finding, DP boolean table',
      };
    case 'number':
      return {
        type: 'number',
        title: 'Ek single number return karna hai (Count / Min / Max / Index / Target)',
        socraticQuestion:
          'Counting problem hai (DP / Combinatorics) ya optimization (Min / Max)? Kya answer monotonically badhta hai jisse Binary Search on Answer lag sake?',
        candidateTechniques: 'Dynamic Programming, Greedy, Binary Search on Answer, Accumulator',
      };
    case 'array':
      return {
        type: 'array',
        title: '1D Array return karna hai',
        socraticQuestion:
          'Har index ka individual answer chahiye (n -> n) ya specific elements/indices jaise pair (n -> 2)?',
        candidateTechniques: 'Prefix/Suffix arrays, Monotonic Stack, Two Pointers pair, Sort + Index',
      };
    case '2d':
      return {
        type: '2d',
        title: '2D List return karni hai (Subsets / Groups / Intervals)',
        socraticQuestion:
          'Saari possible combinations generate karni hain (Backtracking) ya intervals merge karne hain (Sort + Greedy)?',
        candidateTechniques: 'Backtracking (Subsets/Permutations), Intervals Sort + Merge, HashMap Grouping',
      };
    case 'string':
      return {
        type: 'string',
        title: 'String return karna hai',
        socraticQuestion:
          'Characters ko rearrange karna hai ya longest valid substring dhoondhni hai? StringBuilder se memory optimize kaise karoge?',
        candidateTechniques: 'Two Pointers, Sliding Window, Stack, StringBuilder',
      };
    case 'other':
    default:
      return {
        type: 'other',
        title: 'Custom ya Complex Output',
        socraticQuestion:
          'Problem statement ka "Return ..." wala sentence dobara padho: Output format exactly kya expect kiya ja raha hai?',
        candidateTechniques: 'Custom Node / Class / Data Structure',
      };
  }
}

/**
 * Parses length of array from string e.g. "[2, 7, 11, 15]" -> 4
 */
export function parseArrayLength(s: string): number | null {
  const match = s.match(/\[([^\[\]]*)\]/);
  if (!match) return null;
  const content = match[1].trim();
  if (!content) return 0;
  return content.split(',').length;
}

/**
 * Analyzes size transition from Input Example to Output Example (n -> n, n -> 2, n -> 1, n -> 2^n).
 */
export function getSizeRelationHint(examples: ParsedExample[]): SizeRelationHint | null {
  if (!examples || examples.length === 0) return null;
  const ex = examples[0];
  const inLen = parseArrayLength(ex.input);
  const outType = classifyOutput(ex.output);

  if (outType === 'number' || outType === 'bool') {
    return {
      relation: 'n -> 1 (Aggregate / Reduction)',
      socraticQuestion:
        'Input me n elements hain par output me sirf 1 number/boolean hai. Poore array ko single answer me consolidate karne ke liye loop me kaunsa running accumulator ya DP variable maintain karoge?',
      candidateTools: 'Prefix Sum, Sliding Window, DP, Greedy, Kadane',
    };
  }

  if (outType === 'array') {
    const outLen = parseArrayLength(ex.output);
    if (outLen === 2) {
      return {
        relation: 'n -> 2 (Pair / Indices)',
        socraticQuestion:
          'Input array me n elements the par output me sirf 2 indices/pair maange hain. Saare pairs check karne (O(n^2)) ke bajaye kya complement lookup O(1) me ho sakti hai?',
        candidateTools: 'HashMap (Two Sum pattern) ya Sort + Two Pointers',
      };
    }
    if (inLen !== null && outLen !== null && inLen === outLen) {
      return {
        relation: 'n -> n (Har element ka individual answer)',
        socraticQuestion:
          'Har index pe uske left ya right elements ka effect chahiye? Kya Monotonic Stack (next greater) ya Prefix/Suffix arrays se O(n) me calculate ho sakta hai?',
        candidateTools: 'Prefix/Suffix Arrays, Monotonic Stack, In-place transformation',
      };
    }
  }

  if (outType === '2d') {
    return {
      relation: 'n -> 2^n / n! (Combinatorial Explosion)',
      socraticQuestion:
        'Input se exponentially zyada output combinations generate ho rahi hain. Decision tree bana kar Backtracking (choose -> explore -> undo) se duplicate-free collection kaise karoge?',
      candidateTools: 'Backtracking (Subsets / Permutations), Recursion',
    };
  }

  return null;
}

/**
 * Checks for 32-bit signed integer overflow risks (> 2 * 10^9).
 */
export function checkIntegerOverflow(analysis: ConstraintAnalysis): OverflowWarning | null {
  const maxVal = analysis.valueRange.max;
  const sizeMax = analysis.sizeMax;

  if (maxVal !== null && maxVal >= 1e9) {
    return {
      hasWarning: true,
      message: '💥 Values ~10^9 tak hain. Sum ya product 32-bit signed integer limit (2^31 - 1 ≈ 2.14 * 10^9) paar kar sakti hai!',
      remedy: 'Sum / product variable ke liye 64-bit integer ("long" in Java/C++, "BigInt" in JS/TS) use karo.',
    };
  }

  if (sizeMax !== null && maxVal !== null && sizeMax * maxVal >= 2.14e9) {
    return {
      hasWarning: true,
      message: `💥 n (${sizeMax.toLocaleString()}) × max_val (${maxVal.toLocaleString()}) = ${(sizeMax * maxVal).toExponential(2)} > 2 * 10^9. Total sum int limit exceed karega!`,
      remedy: 'Accumulator variable ke liye "long" / "BigInt" zaroori hai.',
    };
  }

  return null;
}

/**
 * Generates Socratic edge case warnings based on problem text and constraints.
 */
export function generateEdgeCaseWarnings(
  analysis: ConstraintAnalysis,
  fullText: string
): EdgeCaseWarning[] {
  const warnings: EdgeCaseWarning[] = [];
  const text = fullText.toLowerCase();

  // 1. Negatives allowed
  if (analysis.negatives) {
    warnings.push({
      id: 'warn-negatives',
      severity: 'warning',
      message: '⚠️ Negative values allowed hain -> Sliding Window toot sakti hai (monotonicity lost). Prefix Sum + HashMap socho!',
    });
  }

  // 2. Empty input / size 0
  if (analysis.sizeMin !== null && analysis.sizeMin === 0) {
    warnings.push({
      id: 'warn-empty-allowed',
      severity: 'warning',
      message: '⚠️ Size 0 ho sakta hai -> Empty input / null check code ke starting me handle karo!',
    });
  } else if (analysis.sizeMin !== null && analysis.sizeMin >= 1) {
    warnings.push({
      id: 'info-nonempty',
      severity: 'info',
      message: `✅ Min size ${analysis.sizeMin} hai -> Empty input nahi aayega, direct array access safe hai.`,
    });
  }

  // 3. Sorted mention
  if (/\bsorted\b/.test(text)) {
    warnings.push({
      id: 'info-sorted',
      severity: 'info',
      message: '✅ "sorted" mention hai -> Two Pointers / Binary Search ke chance zyada hain.',
    });
  } else {
    warnings.push({
      id: 'info-unsorted',
      severity: 'info',
      message: 'ℹ️ Sorted ka zikr nahi hai -> Sort karna allowed/useful ho sakta hai? (O(n log n)).',
    });
  }

  // 4. Duplicates mention
  if (/duplicate/i.test(text)) {
    warnings.push({
      id: 'info-duplicates',
      severity: 'info',
      message: 'ℹ️ Duplicates ka zikr hai -> duplicate elements ke output behaviour aur skipping logic dhyan se check karo.',
    });
  }

  return warnings;
}

/**
 * Main pure analysis engine.
 * Takes a ParsedProblem and produces full Socratic coaching analysis without spoiling solutions.
 */
export function analyze(problem: ParsedProblem): CoachAnalysis {
  const fullText = `${problem.title} ${problem.slug.replace(/-/g, ' ')} ${problem.descriptionText}`;
  const analysis = problem.analysis || analyzeConstraints(problem.constraintsLines || []);

  const complexity = getComplexityTier(analysis.sizeMax);
  const tleChecks = checkTLE(analysis.sizeMax);
  const keywordHits = matchKeywords(fullText);

  const firstEx = problem.examples.length > 0 ? problem.examples[0] : null;
  const outputTypeHint = firstEx ? getOutputTypeHint(firstEx.output) : null;
  const sizeRelationHint = getSizeRelationHint(problem.examples);

  const edgeCaseWarnings = generateEdgeCaseWarnings(analysis, fullText);
  const overflowWarning = checkIntegerOverflow(analysis);

  return {
    complexity,
    tleChecks,
    keywordHits,
    outputTypeHint,
    sizeRelationHint,
    edgeCaseWarnings,
    overflowWarning,
  };
}
