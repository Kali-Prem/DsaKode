/**
 * Core type definitions for DSA Thinking Coach
 */

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Unknown';

export interface ParsedExample {
  input: string;
  output: string;
  explanation?: string;
  rawText?: string;
}

export interface ParsedConstraint {
  name: string;
  lo: number | null;
  hi: number | null;
  raw: string;
}

export interface ConstraintAnalysis {
  parsed: ParsedConstraint[];
  sizeMax: number | null;
  sizeMin: number | null;
  valueRange: {
    min: number | null;
    max: number | null;
  };
  negatives: boolean;
  params: Record<string, { lo: number | null; hi: number | null }>;
  sizeVariables: string[];
}

export interface ParsedProblem {
  isParsed: boolean;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  descriptionText: string;
  constraintsLines: string[];
  examples: ParsedExample[];
  analysis: ConstraintAnalysis;
  error?: string;
}

// ---------------- Engine & Playbook Types ----------------

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface KeywordRule {
  id: string;
  patterns: string[];
  technique: string;
  why: string;
  socraticQuestion: string;
  wasteRow: number | null;
  confidence: ConfidenceLevel;
}

export interface KeywordHit {
  id: string;
  technique: string;
  why: string;
  socraticQuestion: string;
  wasteRow: number | null;
  confidence: ConfidenceLevel;
  matchedPattern: string;
}

export interface ComplexityTierInfo {
  max: number | null;
  bigO: string;
  techniques: string;
  socraticHint: string;
  tleExplanation: string;
}

export interface TLEReport {
  sizeMax: number | null;
  n2Ops: number | null;
  n2TLE: boolean;
  n2Explanation: string;
  n3Ops?: number | null;
  n3TLE?: boolean;
  n3Explanation?: string;
}

export type OutputType = 'bool' | 'number' | 'array' | '2d' | 'string' | 'other';

export interface OutputHint {
  type: OutputType;
  title: string;
  socraticQuestion: string;
  candidateTechniques: string;
}

export interface SizeRelationHint {
  relation: string;
  socraticQuestion: string;
  candidateTools: string;
}

export interface OverflowWarning {
  hasWarning: boolean;
  message: string;
  remedy: string;
}

export interface EdgeCaseWarning {
  id: string;
  message: string;
  severity: 'warning' | 'info' | 'critical';
}

export interface WasteToolRow {
  rowIndex: number;
  waste: string;
  tool: string;
  gain: string;
  socraticQuestion: string;
}

export interface ThinkingLadderStep {
  step: number;
  title: string;
  sawal: string;
  action: string;
  trap: string;
}

export interface EdgeCaseItem {
  id: string;
  label: string;
  sawal: string;
  action: string;
  trap: string;
}

export interface CoachAnalysis {
  complexity: ComplexityTierInfo;
  tleChecks: TLEReport;
  keywordHits: KeywordHit[];
  outputTypeHint: OutputHint | null;
  sizeRelationHint: SizeRelationHint | null;
  edgeCaseWarnings: EdgeCaseWarning[];
  overflowWarning: OverflowWarning | null;
}

// ---------------- Extension State Types ----------------

export interface GuidedWizardState {
  currentStep: number; // 1 to 8
  completedSteps: number[];
  notesByStep: Record<number, string>;
  unlockedHintLevel: Record<number, number>; // 0 = locked, 1 = nudge, 2 = pattern name, 3 = reasoning
  isUnderstoodByStep: Record<number, boolean>;
  startedAt: number;
}

export interface ProblemReflection {
  pattern: string; // Core pattern kya tha
  triggerObservation: string; // Kis keyword/observation se click hua
  wasteAndTool: string; // Brute force me waste kya tha aur kis tool ne hataya
  savedAt: number;
}

export interface ProblemRecord {
  slug: string;
  title: string;
  difficulty?: ProblemDifficulty;
  lastVisited: number;
  completedAt?: number;
  lastRevisedAt?: number;
  ladderProgress: number; // 0 to 8
  notesByStep?: Record<number, string>;
  guidedState?: GuidedWizardState;
  reflection?: ProblemReflection;
}

export interface CoachSettings {
  themeMode: 'auto' | 'dark' | 'light';
  defaultDockSide: 'left' | 'right';
  hintTimerSeconds: number; // default: 60
  stuckTimerMinutes: number; // default: 20
  defaultTab: 'guided' | 'insights'; // default: 'guided'
  panelWidth: number;
}

export type AIProvider = 'gemini' | 'claude';

export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface AskCoachContext {
  problemTitle: string;
  constraints: string[];
  examples: Array<{ input: string; output: string }>;
  currentStep: number;
  currentNotes?: string;
  userMessage: string;
}

export interface CoachChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
}

export const CURRENT_SCHEMA_VERSION = 1;

export interface CoachStorageState {
  schemaVersion: number;
  settings: CoachSettings;
  aiConfig: AIConfig;
  isOpen: boolean;
  isMinimized?: boolean;
  dockSide?: 'left' | 'right';
  panelWidth?: number;
  panelTop?: number;
  themeMode?: 'auto' | 'dark' | 'light';
  ladderProgress?: number;
  activeSlug: string | null;
  problemHistory: Record<string, ProblemRecord>;
  checksBySlug?: Record<string, Record<string, boolean>>;
  guidedBySlug?: Record<string, GuidedWizardState>;
  lastUpdated?: number;
}

export type SlugChangeHandler = (newSlug: string, oldSlug: string | null) => void;

export interface NavigationWatcher {
  getCurrentSlug: () => string | null;
  destroy: () => void;
}
