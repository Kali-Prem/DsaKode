/**
 * DSA Thinking Coach - Rules and Matrix data scaffold
 * Reference: Kali-Prem/dsa-logic-building-playbook
 */

export interface ComplexityTier {
  max: number;
  bigO: string;
  techniques: string;
}

export interface KeywordRule {
  pattern: RegExp;
  tool: string;
  why: string;
  question: string;
  matrixRowIndex?: number | null;
  isWeak?: boolean;
}

export interface WasteToolMapping {
  waste: string;
  tool: string;
  complexityGain: string;
}

export const COMPLEXITY_TIERS: ComplexityTier[] = [
  { max: 12, bigO: 'O(n!)', techniques: 'Permutations, Backtracking (search all paths)' },
  { max: 25, bigO: 'O(2^n)', techniques: 'Subsets, Bitmask DP, Backtracking' },
  { max: 500, bigO: 'O(n^3)', techniques: '3 nested loops, Floyd-Warshall, 3D DP' },
  { max: 5000, bigO: 'O(n^2)', techniques: '2 nested loops, 2D DP' },
  { max: 20000, bigO: 'O(n^2) borderline (~10^8 ops)', techniques: '2D DP (tight), or optimize to O(n log n) / O(n)' },
  { max: 300000, bigO: 'O(n log n) or O(n)', techniques: 'Sorting, Heap, Binary Search, Hashing, Two Pointers, Sliding Window' },
  { max: 10000000, bigO: 'O(n)', techniques: 'Single pass: Hashing, Two Pointers, Sliding Window, Prefix Sum' },
  { max: Infinity, bigO: 'O(log n) or O(1)', techniques: 'Binary Search, Math, Bit Manipulation' },
];

export const WASTE_TOOL_MATRIX: WasteToolMapping[] = [
  {
    waste: 'Baar-baar linear search: "ye element pehle dekha tha?"',
    tool: 'HashMap / HashSet',
    complexityGain: 'O(n) -> O(1)',
  },
  {
    waste: 'Har query pe range sum/product recalculate karna',
    tool: 'Prefix / Suffix array',
    complexityGain: 'O(n) -> O(1)',
  },
  {
    waste: 'Har pair check karna jab array sorted hai ya sort ho sakta hai',
    tool: 'Sort + Two Pointers',
    complexityGain: 'O(n^2) -> O(n)',
  },
  {
    waste: 'Subarray/window ka common part har step recalculate karna',
    tool: 'Sliding Window',
    complexityGain: 'O(n^2) -> O(n)',
  },
  {
    waste: 'Monotonic answer range me ek-ek step linear search karna',
    tool: 'Binary Search (on answer space)',
    complexityGain: 'O(n) -> O(log n)',
  },
  {
    waste: 'Same subproblem recursion tree me baar-baar repeat hona',
    tool: 'Dynamic Programming (Memoization / Tabulation)',
    complexityGain: 'O(2^n) -> O(n)',
  },
  {
    waste: 'Pichhle elements ka order yaad rakhna (LIFO resolution)',
    tool: 'Monotonic Stack',
    complexityGain: 'O(n^2) -> O(n)',
  },
  {
    waste: 'Har step pe dynamic min/max element dhoondna',
    tool: 'Heap / PriorityQueue (size K)',
    complexityGain: 'O(n) -> O(log n)',
  },
  {
    waste: 'Unordered intervals me overlap check karna',
    tool: 'Sort by start time + Greedy sweep',
    complexityGain: 'O(n^2) -> O(n log n)',
  },
];
