/**
 * DsaKode Internationalization (i18n) & Localization System
 * Supports seamless toggling between English (en) and Hinglish / Hindi (hi).
 */
import { ThinkingLadderStep, WasteToolRow, EdgeCaseItem } from './types';
import rawLadder from '../data/thinkingLadder.json';
import rawWasteTools from '../data/wasteTool.json';
import rawEdgeCases from '../data/edgeCases.json';

export type Language = 'en' | 'hi';

export const DEFAULT_LANGUAGE: Language = 'hi';

/**
 * 8-Step Thinking Ladder in English
 */
export const LADDER_STEPS_EN: ThinkingLadderStep[] = [
  {
    step: 1,
    title: "👁️ Step 1: Observe (Understand Problem)",
    sawal: "What is the problem actually asking for? Can you explain it simply in 1 sentence to someone?",
    action: "Look closely at the question: What is given in the input, and in what format is the expected output/answer?",
    trap: "Rushing to write code immediately without reading the full question and constraints."
  },
  {
    step: 2,
    title: "✍️ Step 2: Manual Solve (Trace on Paper)",
    sawal: "If there were no computer and you were given 4 numbers on pen and paper, how would your brain solve it manually?",
    action: "Take a small 4-element concrete example and calculate the answer step-by-step like a human.",
    trap: "Trying to jump into complex formulas or code — think simply and intuitively first."
  },
  {
    step: 3,
    title: "🏷️ Step 3: Name Variables & Loops",
    sawal: "While solving on paper, what action was repeated? And what previous value did you have to remember?",
    action: "The repeated action becomes your 'Loop', and the remembered information becomes your 'Variable'.",
    trap: "Nesting 2-3 random loops without understanding what state variables represent."
  },
  {
    step: 4,
    title: "🔨 Step 4: Brute Force & TLE Check",
    sawal: "What is the most direct, straightforward approach that checks all possibilities? How long will it take?",
    action: "Calculate the time complexity of the basic approach (e.g., O(n²)). For the max input size, will it exceed 10⁸ operations/sec limit?",
    trap: "Going completely blank by trying to guess the most optimal solution on the very first try."
  },
  {
    step: 5,
    title: "🔍 Step 5: Identify Bottleneck (Find Waste)",
    sawal: "In the straightforward approach, what work is being done repeatedly that is slowing down the solution?",
    action: "Spot the waste: Are you linearly rescanning the same elements, or recalculating the same range sum over and over?",
    trap: "Randomly applying a new algorithm without understanding exactly where the old approach was slow."
  },
  {
    step: 6,
    title: "🧰 Step 6: Pick Optimal Tool (Data Structure / Pattern)",
    sawal: "Which data structure or technique is best suited to eliminate that specific waste?",
    action: "Match from the Waste-Tool table: e.g. repeated lookup → Hash Map; range sum → Prefix Sum; monotonic lookup → Monotonic Stack.",
    trap: "Blindly using a complex data structure that has no connection to the problem's actual bottleneck."
  },
  {
    step: 7,
    title: "🧪 Step 7: Dry Run Edge Cases",
    sawal: "Will your new approach work on tricky edge cases? (e.g. empty array, single element, duplicates, negative numbers?)",
    action: "Draw a small state trace table on paper and dry-run 3-4 steps to verify invariants and boundary conditions.",
    trap: "Submitting code without a dry run and panicking upon receiving a Wrong Answer / Runtime Error."
  },
  {
    step: 8,
    title: "💻 Step 8: Code Boundaries & Invariants",
    sawal: "Is your logic crystal clear? Now write clean line-by-line code with boundary guards.",
    action: "Write base case checks first, then main invariant loop, and return the final computed result.",
    trap: "Making off-by-one errors in boundary conditions (e.g. i < n vs left <= right) or indexing out of bounds."
  }
];

export const LADDER_STEPS_HI: ThinkingLadderStep[] = rawLadder as ThinkingLadderStep[];

export function getLadderSteps(lang: Language = 'hi'): ThinkingLadderStep[] {
  return lang === 'en' ? LADDER_STEPS_EN : LADDER_STEPS_HI;
}

/**
 * Waste-to-Tool Matrix in English
 */
export const WASTE_TOOL_ROWS_EN: WasteToolRow[] = [
  {
    rowIndex: 0,
    waste: "Repeated linear scan: 'Have I seen this element / complement before?'",
    tool: "HashMap / HashSet",
    gain: "O(n) -> O(1)",
    socraticQuestion: "Are you scanning the array from start to end repeatedly for every element? If you store previously seen values in a Hash Map, you can look them up in 1 instant step!"
  },
  {
    rowIndex: 1,
    waste: "Recalculating the sum of a range/subarray from scratch every time",
    tool: "Prefix / Suffix Array",
    gain: "O(n) -> O(1)",
    socraticQuestion: "Are you repeatedly adding up subarray elements? If you precompute running prefix sums once, any range sum is just a single subtraction (P[right] - P[left-1])!"
  },
  {
    rowIndex: 2,
    waste: "Checking every pair when the elements can be ordered/sorted",
    tool: "Sort + Two Pointers",
    gain: "O(n^2) -> O(n)",
    socraticQuestion: "If numbers are sorted, placing two pointers at both ends allows you to zero in on the target sum without nested loops by moving inward based on comparison."
  },
  {
    rowIndex: 3,
    waste: "Recomputing the overlapping elements of a sliding contiguous range",
    tool: "Sliding Window",
    gain: "O(n^2) -> O(n)",
    socraticQuestion: "When a contiguous window shifts right, only one new element enters and one old element exits. Instead of recalculating the whole window, can you update it dynamically?"
  },
  {
    rowIndex: 4,
    waste: "Checking answers linearly one-by-one across a monotonic answer range",
    tool: "Binary Search (on Answer)",
    gain: "O(n) -> O(log n)",
    socraticQuestion: "If the feasible answer space is ordered (e.g., speed from 1 to max), and testing a midpoint tells you whether the optimal answer lies left or right, can you eliminate half the space each step?"
  },
  {
    rowIndex: 5,
    waste: "Solving the exact same subproblem recursively multiple times",
    tool: "Dynamic Programming (Memoization / Tabulation)",
    gain: "O(2^n) -> O(n)",
    socraticQuestion: "Is your recursive function being called with identical parameters repeatedly? Can you cache (memoize) the computed result to avoid redundant calculations?"
  },
  {
    rowIndex: 6,
    waste: "Remembering previous pending elements to find the Next Greater / Smaller element",
    tool: "Monotonic Stack",
    gain: "O(n^2) -> O(n)",
    socraticQuestion: "For each element, do you need to find the next greater element or matching boundary? By keeping unresolved elements in a monotonic stack, can you resolve them in a single pass?"
  },
  {
    rowIndex: 7,
    waste: "Scanning the entire collection repeatedly just to find the min or max element",
    tool: "Heap / PriorityQueue (Size K)",
    gain: "O(n) -> O(log k)",
    socraticQuestion: "Do you constantly need the top-K elements or the dynamic min/max? By maintaining a Heap of size K, can you get the extreme element in O(1) and update in O(log K)?"
  },
  {
    rowIndex: 8,
    waste: "Comparing every pair of intervals to check for collisions or overlaps",
    tool: "Sort Intervals by Start/End",
    gain: "O(n^2) -> O(n log n)",
    socraticQuestion: "Intervals randomly scattered make overlap detection slow. If you sort them by start time, each interval only needs to be compared against its immediate predecessor!"
  }
];

export const WASTE_TOOL_ROWS_HI: WasteToolRow[] = rawWasteTools as WasteToolRow[];

export function getWasteToolRows(lang: Language = 'hi'): WasteToolRow[] {
  return lang === 'en' ? WASTE_TOOL_ROWS_EN : WASTE_TOOL_ROWS_HI;
}

/**
 * UI Translations Dictionary
 */
export const TRANSLATIONS = {
  en: {
    // Header & Navigation
    appTitle: "DsaKode",
    appSubtitle: "Think Logic. Crack Code.",
    tabGuided: "Ladder",
    tabInsights: "Insights",
    tabAskCoach: "Ask Coach",
    stepProgress: "Step {current} of 8 • {pct}% Completed",
    stepProgressDone: "Completed 🎉",
    btnResetLadder: "Reset",
    btnReviewNotes: "Review Notes",
    tooltipTheme: "Toggle Theme (Light / Dark)",
    tooltipDock: "Dock to {side} side",
    tooltipLang: "Switch to Hinglish",
    tooltipMinimize: "Minimize Panel",
    tooltipClose: "Close Coach (Esc)",
    
    // Stepper
    stepperStep: "Step {step} of 8",
    stepperDone: "{count}/8 Done",
    stepperTitles: [
      "Observe",
      "Manual",
      "Naam Do",
      "Brute Force",
      "Find Waste",
      "Pick Tool",
      "Dry Run",
      "Code"
    ],
    
    // Step Card
    stepCardStepPrefix: "Step {step} / 8",
    stepCardActionLabel: "What To Do:",
    stepCardTrapLabel: "Classic Trap:",
    stepCardNotesLabel: "Your Answer / Notes in Your Own Words (Optional)",
    stepCardNotesPlaceholder: "Write your thoughts (e.g.: 'Array is unsorted but we need a target sum, so brute force would be nested loops...')",
    stepCardUnderstoodCheckbox: "I have understood / completed this step",
    btnPrev: "Previous",
    btnNext: "Next Step",
    btnFinish: "Complete Thinking Ladder 🎉",
    
    // Celebration
    celebrationTitle: "Bravo! Thinking Ladder Completed 🎉",
    celebrationDesc: "You systematically deconstructed this problem in 8 steps without looking at direct code. Coding in LeetCode's editor will now be crystal clear!",
    
    // Hint Drawer
    hintDrawerTitle: "3-Level Spoiler-Free Hints",
    hintDrawerSubtitle: "Unlock Progressive Hints without code spoilers",
    hintLevel1Name: "Level 1: Nudge (Socratic Question)",
    hintLevel2Name: "Level 2: Algorithmic Technique",
    hintLevel3Name: "Level 3: Why It Works (Logic)",
    hintUnlockTimer: "Unlocks in {seconds}s",
    hintUnlockNow: "Reveal Hint",
    hintUnlockedBadge: "Unlocked",
    hintNotice: "Take 60 seconds to trace on your own before revealing the hint.",
    
    // Step Context
    ctxExampleTitle: "Example 1 (Concrete Sample)",
    ctxExampleSub: "Analyze Input / Output",
    ctxInputLabel: "Input (Provided by Question)",
    ctxOutputLabel: "Expected Output (Answer to Produce)",
    ctxExplanationLabel: "Explanation:",
    ctxNoExamples: "Example testcases parsing in progress...",
    ctxOutputTypeTitle: "Detected Output Nature:",
    ctxComplexityVsConstraints: "Complexity vs Constraints",
    ctxInputSize: "Input Size (N)",
    ctxTargetComplexity: "Target Complexity Tier:",
    ctxBruteForceOps: "Brute Force O(N²) Operations:",
    ctxOpsLimit: "LeetCode CPU Benchmark: ~10⁸ ops/sec",
    ctxTleWarning: "Critical TLE Alert! Operations cross 10⁸ threshold",
    ctxSafeComplexity: "Safe complexity within 1s execution limit",
    ctxWasteTitle: "Identify Redundant Operations (Waste):",
    ctxWasteMatrixTitle: "Waste-to-Tool Prescription Matrix",
    ctxEdgeAlertsTitle: "Active Edge Case Alerts:",
    ctxNegativeAlert: "Negative values allowed: Use Prefix Sum + Hash Map, Sliding Window may fail",
    ctxOverflowAlert: "64-bit integer overflow risk: Use 64-bit integer (long / BigInt)",
    ctxBoundaryTitle: "Code Boundaries & Guards Checklist:",
    
    // Reflection
    reflectionTitle: "3-Line Playbook Reflection",
    reflectionSubtitle: "Lock in your intuition before moving to the next problem",
    reflectionQ1: "1. What was the core pattern of this problem?",
    reflectionQ1Placeholder: "e.g., Prefix Sum + Hash Map, Two Pointers inward, Monotonic Stack...",
    reflectionQ2: "2. Which keyword or observation triggered your intuition?",
    reflectionQ2Placeholder: "e.g., 'Contiguous subarray sum with negatives allowed', 'sorted array'...",
    reflectionQ3: "3. What was the waste in brute force, and which tool eliminated it?",
    reflectionQ3Placeholder: "e.g., 'Linear scan took O(N) repeatedly; HashMap stored complements for O(1) lookup.'",
    btnSaveReflection: "Save 3-Line Reflection",
    reflectionSavedToast: "Reflection saved successfully! Added to your spaced revision archive.",
    
    // Insights View
    insightsComplexityTitle: "Target Complexity Meter",
    insightsConstraintsTitle: "Constraints & Edge Traps",
    insightsKeywordsTitle: "Detected Algorithmic Patterns",
    insightsMatrixTitle: "Waste $\\to$ Tool Prescription Matrix",
    insightsEdgeCasesTitle: "Edge Cases Checklist",
    insightsEmptyTitle: "Navigate to a LeetCode problem",
    insightsEmptyDesc: "Open any problem on leetcode.com/problems/* to view automated intuition insights.",
    
    // Ask Coach (AI)
    aiCoachTitle: "Socratic AI Coach",
    aiCoachSubtitle: "Micro-step guidance • Zero Code Guarantee",
    aiDisabledTitle: "AI Coach is currently OFF",
    aiDisabledDesc: "Enable AI Coach in settings with your Gemini or Claude API key (stored securely in your local browser storage).",
    btnOpenOptions: "Open Extension Settings",
    aiInputPlaceholder: "Ask Coach a question or for a nudge...",
    btnSend: "Send",
    aiPresetPrompt1: "What is the brute-force waste in this problem?",
    aiPresetPrompt2: "Give me a gentle nudge for Step 2",
    aiPresetPrompt3: "Why does sliding window fail with negative numbers?",
    aiZeroCodeBanner: "🛡️ Zero Code Guarantee: Coach will guide with questions, never giving direct code.",
    
    // Popup
    popupTitle: "DsaKode",
    popupSubtitle: "Think Logic. Crack Code.",
    popupStreak: "Active Streak",
    popupToday: "Today's Practice",
    popupRecent: "Recent Problems",
    popupRevisionDue: "Revision Due (7+ days)",
    btnReviseNow: "Revise Now",
    btnMarkRevised: "Mark Revised",
    btnOpenLeetCode: "Open LeetCode",
    
    // Options
    optSettingsTab: "Settings & Preferences",
    optReflectionsTab: "Reflections Archive & Revision",
    optThemeLabel: "Theme Mode",
    optDockLabel: "Default Dock Side",
    optLangLabel: "Extension Language",
    optLangDesc: "Choose your preferred language for Socratic guidance and explanations.",
    optLangEn: "English",
    optLangHi: "Hinglish",
    optBackupTitle: "Backup, Export & Data Management",
    optExportBtn: "Export Backup (JSON)",
    optImportBtn: "Import Backup",
    optResetBtn: "Reset All Data",
    optNoProblemsFound: "No matching problems found."
  },
  hi: {
    // Header & Navigation
    appTitle: "DsaKode",
    appSubtitle: "Think Logic. Crack Code.",
    tabGuided: "Guided Ladder",
    tabInsights: "Insights",
    tabAskCoach: "Ask Coach",
    stepProgress: "Step {current} of 8 • {pct}% Pura Hua",
    stepProgressDone: "Pura Ho Gaya 🎉",
    btnResetLadder: "Reset Karo",
    btnReviewNotes: "Review Notes",
    tooltipTheme: "Theme Badlo (Light / Dark)",
    tooltipDock: "{side} side me dock karo",
    tooltipLang: "Switch to English",
    tooltipMinimize: "Minimize Panel",
    tooltipClose: "Close Coach (Esc)",
    
    // Stepper
    stepperStep: "Step {step} of 8",
    stepperDone: "{count}/8 Done",
    stepperTitles: [
      "Observe",
      "Manual",
      "Naam Do",
      "Brute Force",
      "Find Waste",
      "Pick Tool",
      "Dry Run",
      "Code"
    ],
    
    // Step Card
    stepCardStepPrefix: "Step {step} / 8",
    stepCardActionLabel: "Kya Karna Hai:",
    stepCardTrapLabel: "Classic Trap:",
    stepCardNotesLabel: "Tumhare Words me Jawab / Notes (Optional)",
    stepCardNotesPlaceholder: "Apne words me likho (jaise: 'Array unsorted hai par target sum nikalna hai, to brute force nested loop hoga...')",
    stepCardUnderstoodCheckbox: "Maine ye step samajh liya / complete kar liya",
    btnPrev: "Previous",
    btnNext: "Next Step",
    btnFinish: "Complete Thinking Ladder 🎉",
    
    // Celebration
    celebrationTitle: "Shabash! Thinking Ladder Completed 🎉",
    celebrationDesc: "Tumne problem ko bina direct solution dekhe 8 steps me systematically break kiya hai. Ab LeetCode ke editor me code likhna bohot aasan hoga!",
    
    // Hint Drawer
    hintDrawerTitle: "3-Level Spoiler-Free Hints",
    hintDrawerSubtitle: "Bina code dekhe step-by-step hint unlock karo",
    hintLevel1Name: "Level 1: Nudge (Sawal)",
    hintLevel2Name: "Level 2: Technique Ka Naam",
    hintLevel3Name: "Level 3: Logic & Kyon Kaam Karta Hai",
    hintUnlockTimer: "{seconds}s me unlock hoga",
    hintUnlockNow: "Hint Dekho",
    hintUnlockedBadge: "Unlocked",
    hintNotice: "Hint dekhne se pehle 60 seconds khud dimag lagao.",
    
    // Step Context
    ctxExampleTitle: "Example 1 (Concrete Sample)",
    ctxExampleSub: "Input / Output Samjho",
    ctxInputLabel: "Input (Question ne kya diya)",
    ctxOutputLabel: "Expected Output (Hume kya answer dena hai)",
    ctxExplanationLabel: "Explanation:",
    ctxNoExamples: "Example testcases parsing in progress...",
    ctxOutputTypeTitle: "Detected Output Nature:",
    ctxComplexityVsConstraints: "Complexity vs Constraints",
    ctxInputSize: "Input Size (N)",
    ctxTargetComplexity: "Target Complexity Tier:",
    ctxBruteForceOps: "Brute Force O(N²) Operations:",
    ctxOpsLimit: "LeetCode CPU Benchmark: ~10⁸ ops/sec",
    ctxTleWarning: "Critical TLE Warning! Operations 10⁸ limit cross kar rahe hain",
    ctxSafeComplexity: "Safe complexity: 1 second limit ke andar chal jayega",
    ctxWasteTitle: "Faltu Kaam Pehchano (Waste Bottleneck):",
    ctxWasteMatrixTitle: "Waste-to-Tool Prescription Matrix",
    ctxEdgeAlertsTitle: "Active Edge Case Alerts:",
    ctxNegativeAlert: "Negative values allowed hain: Prefix Sum + Hash Map use karo, Sliding Window fail ho sakta hai",
    ctxOverflowAlert: "Integer overflow alert: 64-bit integer (`long` / `BigInt`) use karo",
    ctxBoundaryTitle: "Code Boundaries & Guards Checklist:",
    
    // Reflection
    reflectionTitle: "3-Line Playbook Reflection",
    reflectionSubtitle: "Agla problem shuru karne se pehle ye 3 lines likho",
    reflectionQ1: "1. Is problem ka core pattern kya tha?",
    reflectionQ1Placeholder: "jaise: Prefix Sum + HashMap, Inward Two Pointers, Monotonic Stack...",
    reflectionQ2: "2. Kis keyword ya observation se intuition click hua?",
    reflectionQ2Placeholder: "jaise: 'Contiguous subarray jisme negatives bhi hain', 'Sorted array'...",
    reflectionQ3: "3. Brute force me waste kya tha aur kis tool ne hataya?",
    reflectionQ3Placeholder: "jaise: 'Linear scan O(n) waste tha, HashMap ne O(1) bana diya...'",
    btnSaveReflection: "Save 3-Line Reflection",
    reflectionSavedToast: "Reflection save ho gayi! Spaced revision archive me jud gaya.",
    
    // Insights View
    insightsComplexityTitle: "Target Complexity Meter",
    insightsConstraintsTitle: "Constraints & Edge Traps",
    insightsKeywordsTitle: "Detected Algorithmic Patterns",
    insightsMatrixTitle: "Waste $\\to$ Tool Prescription Matrix",
    insightsEdgeCasesTitle: "Edge Cases Checklist",
    insightsEmptyTitle: "Kisi LeetCode problem par navigate karein",
    insightsEmptyDesc: "leetcode.com/problems/* par koi problem kholein taaki automated intuition insights load ho sakein.",
    
    // Ask Coach (AI)
    aiCoachTitle: "Socratic AI Coach",
    aiCoachSubtitle: "Micro-step guidance • Zero Code Guarantee",
    aiDisabledTitle: "AI Coach abhi band hai (Default OFF)",
    aiDisabledDesc: "Settings me jakar apni Google Gemini ya Claude API key daalein. Key sirf aapke browser me locally save hoti hai.",
    btnOpenOptions: "Settings Kholo",
    aiInputPlaceholder: "Coach se sawaal poochho ya agla micro-step maango...",
    btnSend: "Bhejo",
    aiPresetPrompt1: "Is problem me brute force waste kya hai?",
    aiPresetPrompt2: "Step 2 ke liye chhota hint do",
    aiPresetPrompt3: "Negative numbers me sliding window kyu fail hota hai?",
    aiZeroCodeBanner: "🛡️ Zero Code Guarantee: Coach sawal se guide karega, seedha code kabhi nahi dega.",
    
    // Popup
    popupTitle: "DsaKode",
    popupSubtitle: "Think Logic. Crack Code.",
    popupStreak: "Active Streak",
    popupToday: "Today's Practice",
    popupRecent: "Recent Problems",
    popupRevisionDue: "Revise Karo (7+ days)",
    btnReviseNow: "Revise Karo",
    btnMarkRevised: "Mark Revised",
    btnOpenLeetCode: "Open LeetCode",
    
    // Options
    optSettingsTab: "Settings & Preferences",
    optReflectionsTab: "Reflections Archive & Revision",
    optThemeLabel: "Theme Mode",
    optDockLabel: "Default Dock Side",
    optLangLabel: "Extension Language",
    optLangDesc: "Socratic coaching aur explanations ke liye apni pasandeeda bhasha chunein.",
    optLangEn: "English",
    optLangHi: "Hinglish",
    optBackupTitle: "Backup, Export & Data Management",
    optExportBtn: "Export Backup (JSON)",
    optImportBtn: "Import Backup",
    optResetBtn: "Reset All Data",
    optNoProblemsFound: "Koi problem match nahi hui."
  }
};

/**
 * Translates a given key with optional template parameters.
 */
export function t(
  key: keyof typeof TRANSLATIONS.en,
  lang: Language = 'hi',
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.hi;
  let text = (dict as any)[key] || (TRANSLATIONS.hi as any)[key] || String(key);

  if (params && typeof text === 'string') {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}
