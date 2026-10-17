/**
 * Type-safe storage wrapper for Chrome extension (chrome.storage.local)
 * Features schema versioning, automatic migration, problem history tracking,
 * reflections, spaced revision, and JSON export/import.
 */
import {
  CoachStorageState,
  CoachSettings,
  AIConfig,
  ProblemRecord,
  ProblemReflection,
  ProblemDifficulty,
  GuidedWizardState,
  CURRENT_SCHEMA_VERSION,
} from './types';

const STORAGE_KEY = 'dsa_coach_state';

export const defaultSettings: CoachSettings = {
  language: 'hi',
  themeMode: 'auto',
  defaultDockSide: 'right',
  hintTimerSeconds: 60,
  stuckTimerMinutes: 20,
  defaultTab: 'guided',
  panelWidth: 480,
};

export const defaultAIConfig: AIConfig = {
  enabled: false,
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-1.5-flash',
};

export const defaultState: CoachStorageState = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  settings: defaultSettings,
  aiConfig: defaultAIConfig,
  isOpen: false,
  language: 'hi',
  activeSlug: null,
  problemHistory: {},
  checksBySlug: {},
  guidedBySlug: {},
};

// In-memory fallback if neither chrome.storage nor localStorage is accessible
let memoryFallback: Record<string, any> = {};

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
}

/**
 * Migrates old or unversioned storage states to CURRENT_SCHEMA_VERSION.
 */
export function migrateStorageState(raw: any): CoachStorageState {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultState };
  }

  const effectiveLang = raw.language || raw.settings?.language || defaultSettings.language;

  const state: CoachStorageState = {
    ...defaultState,
    ...raw,
    language: effectiveLang,
    settings: {
      ...defaultSettings,
      ...(raw.settings || {}),
      language: effectiveLang,
      themeMode: raw.themeMode || raw.settings?.themeMode || defaultSettings.themeMode,
      defaultDockSide: raw.dockSide || raw.settings?.defaultDockSide || defaultSettings.defaultDockSide,
      panelWidth: raw.panelWidth || raw.settings?.panelWidth || defaultSettings.panelWidth,
    },
    aiConfig: {
      ...defaultAIConfig,
      ...(raw.aiConfig || {}),
    },
    problemHistory: { ...(raw.problemHistory || {}) },
    guidedBySlug: { ...(raw.guidedBySlug || {}) },
    checksBySlug: { ...(raw.checksBySlug || {}) },
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  // Migrate any existing guidedBySlug entries into problemHistory if missing
  if (raw.guidedBySlug) {
    for (const [slug, gState] of Object.entries(raw.guidedBySlug as Record<string, GuidedWizardState>)) {
      if (!state.problemHistory[slug]) {
        state.problemHistory[slug] = {
          slug,
          title: slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          lastVisited: gState.startedAt || Date.now(),
          ladderProgress: gState.completedSteps?.length || 0,
          completedAt: gState.completedSteps?.length >= 8 ? gState.startedAt || Date.now() : undefined,
          guidedState: gState,
        };
      }
    }
  }

  return state;
}

export async function getStorageState(): Promise<CoachStorageState> {
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEY], (res) => {
          if (chrome.runtime.lastError || !res || !res[STORAGE_KEY]) {
            resolve({ ...defaultState });
          } else {
            resolve(migrateStorageState(res[STORAGE_KEY]));
          }
        });
      } catch {
        resolve({ ...defaultState });
      }
    });
  }

  // LocalStorage fallback (e.g. tests or non-extension context)
  if (typeof localStorage !== 'undefined') {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? migrateStorageState(JSON.parse(data)) : { ...defaultState };
    } catch {
      // fallback to memory
    }
  }

  return memoryFallback[STORAGE_KEY] ? migrateStorageState(memoryFallback[STORAGE_KEY]) : { ...defaultState };
}

export async function setStorageState(
  updater: Partial<CoachStorageState> | ((prev: CoachStorageState) => Partial<CoachStorageState>)
): Promise<CoachStorageState> {
  const current = await getStorageState();
  const updates = typeof updater === 'function' ? updater(current) : updater;
  const next: CoachStorageState = {
    ...current,
    ...updates,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: Date.now(),
  };

  if (hasChromeStorage()) {
    await new Promise<void>((resolve) => {
      try {
        chrome.storage.local.set({ [STORAGE_KEY]: next }, () => {
          resolve();
        });
      } catch {
        resolve();
      }
    });
  } else if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      memoryFallback[STORAGE_KEY] = next;
    }
  } else {
    memoryFallback[STORAGE_KEY] = next;
  }

  return next;
}

// ---------------- Guided Wizard State Helpers ----------------

export function getDefaultGuidedState(): GuidedWizardState {
  return {
    currentStep: 1,
    completedSteps: [],
    notesByStep: {},
    unlockedHintLevel: {},
    isUnderstoodByStep: {},
    startedAt: Date.now(),
  };
}

export async function getProblemGuidedState(slug: string): Promise<GuidedWizardState> {
  if (!slug) return getDefaultGuidedState();
  const state = await getStorageState();
  return (
    state.problemHistory?.[slug]?.guidedState ||
    state.guidedBySlug?.[slug] ||
    getDefaultGuidedState()
  );
}

export async function saveProblemGuidedState(
  slug: string,
  guidedState: GuidedWizardState,
  meta?: { title?: string; difficulty?: ProblemDifficulty }
): Promise<void> {
  if (!slug) return;
  const isComplete = guidedState.completedSteps.length >= 8;

  await setStorageState((prev) => {
    const existingRec = prev.problemHistory[slug] || {
      slug,
      title:
        meta?.title ||
        slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      difficulty: meta?.difficulty || 'Medium',
      lastVisited: Date.now(),
      ladderProgress: 0,
    };

    const updatedRecord: ProblemRecord = {
      ...existingRec,
      lastVisited: Date.now(),
      ladderProgress: guidedState.completedSteps.length,
      guidedState,
      notesByStep: guidedState.notesByStep,
      completedAt: isComplete ? existingRec.completedAt || Date.now() : existingRec.completedAt,
    };

    return {
      guidedBySlug: {
        ...(prev.guidedBySlug || {}),
        [slug]: guidedState,
      },
      problemHistory: {
        ...prev.problemHistory,
        [slug]: updatedRecord,
      },
      ladderProgress: guidedState.completedSteps.length,
    };
  });
}

// ---------------- Problem History & Reflection Helpers ----------------

export async function recordProblemVisit(
  slug: string,
  title?: string,
  difficulty?: ProblemDifficulty
): Promise<void> {
  if (!slug) return;
  await setStorageState((prev) => {
    const existing = prev.problemHistory[slug];
    const updated: ProblemRecord = {
      slug,
      title:
        title ||
        existing?.title ||
        slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      difficulty: difficulty || existing?.difficulty || 'Medium',
      lastVisited: Date.now(),
      ladderProgress: existing?.ladderProgress || 0,
      completedAt: existing?.completedAt,
      lastRevisedAt: existing?.lastRevisedAt,
      guidedState: existing?.guidedState,
      reflection: existing?.reflection,
    };

    return {
      activeSlug: slug,
      problemHistory: {
        ...prev.problemHistory,
        [slug]: updated,
      },
    };
  });
}

export async function saveProblemReflection(
  slug: string,
  reflection: ProblemReflection
): Promise<void> {
  if (!slug) return;
  await setStorageState((prev) => {
    const existing = prev.problemHistory[slug] || {
      slug,
      title: slug,
      lastVisited: Date.now(),
      ladderProgress: 8,
    };

    const updated: ProblemRecord = {
      ...existing,
      completedAt: existing.completedAt || Date.now(),
      ladderProgress: Math.max(existing.ladderProgress, 8),
      reflection,
    };

    return {
      problemHistory: {
        ...prev.problemHistory,
        [slug]: updated,
      },
    };
  });
}

export async function markProblemRevised(slug: string): Promise<void> {
  if (!slug) return;
  await setStorageState((prev) => {
    const existing = prev.problemHistory[slug];
    if (!existing) return {};

    return {
      problemHistory: {
        ...prev.problemHistory,
        [slug]: {
          ...existing,
          lastRevisedAt: Date.now(),
        },
      },
    };
  });
}

// ---------------- Spaced Revision & Analytics Helpers ----------------

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns problems solved >= 7 days ago that need spaced revision.
 */
export function getRevisionDueProblems(history: Record<string, ProblemRecord> = {}): ProblemRecord[] {
  const now = Date.now();
  return Object.values(history)
    .filter((p) => {
      if (!p.completedAt) return false;
      const refTime = p.lastRevisedAt || p.completedAt;
      return now - refTime >= SEVEN_DAYS_MS;
    })
    .sort((a, b) => (a.lastRevisedAt || a.completedAt || 0) - (b.lastRevisedAt || b.completedAt || 0));
}

/**
 * Counts how many problems were visited or practiced today.
 */
export function getTodayProblemsCount(history: Record<string, ProblemRecord> = {}): number {
  const todayStr = new Date().toDateString();
  return Object.values(history).filter((p) => {
    const visitedDate = new Date(p.lastVisited).toDateString();
    const completedDate = p.completedAt ? new Date(p.completedAt).toDateString() : null;
    return visitedDate === todayStr || completedDate === todayStr;
  }).length;
}

/**
 * Calculates current streak in consecutive active days.
 */
export function getCurrentStreak(history: Record<string, ProblemRecord> = {}): number {
  const activeDates = new Set<string>();
  for (const p of Object.values(history)) {
    if (p.lastVisited) {
      activeDates.add(new Date(p.lastVisited).toISOString().slice(0, 10));
    }
    if (p.completedAt) {
      activeDates.add(new Date(p.completedAt).toISOString().slice(0, 10));
    }
  }

  if (activeDates.size === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // If no activity today or yesterday, streak is broken
  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let checkDate = activeDates.has(todayStr) ? today : yesterday;

  while (true) {
    const dStr = checkDate.toISOString().slice(0, 10);
    if (activeDates.has(dStr)) {
      streak += 1;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Returns last N visited problems.
 */
export function getLastNProblems(history: Record<string, ProblemRecord> = {}, limit = 5): ProblemRecord[] {
  return Object.values(history)
    .sort((a, b) => b.lastVisited - a.lastVisited)
    .slice(0, limit);
}

// ---------------- Import, Export & Reset Helpers ----------------

export async function exportStorageData(): Promise<string> {
  const state = await getStorageState();
  return JSON.stringify(state, null, 2);
}

export async function importStorageData(jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }
    const migrated = migrateStorageState(parsed);
    await setStorageState(() => migrated);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse JSON file' };
  }
}

export async function resetAllStorageData(): Promise<CoachStorageState> {
  const reset = { ...defaultState, schemaVersion: CURRENT_SCHEMA_VERSION, lastUpdated: Date.now() };
  if (hasChromeStorage()) {
    await new Promise<void>((resolve) => {
      try {
        chrome.storage.local.set({ [STORAGE_KEY]: reset }, () => resolve());
      } catch {
        resolve();
      }
    });
  } else if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    } catch {
      memoryFallback[STORAGE_KEY] = reset;
    }
  } else {
    memoryFallback[STORAGE_KEY] = reset;
  }
  return reset;
}

// ---------------- AI Configuration Helpers ----------------

export async function getAIConfig(): Promise<AIConfig> {
  const state = await getStorageState();
  return state.aiConfig || defaultAIConfig;
}

export async function saveAIConfig(updater: Partial<AIConfig>): Promise<AIConfig> {
  const next = await setStorageState((prev) => ({
    aiConfig: {
      ...(prev.aiConfig || defaultAIConfig),
      ...updater,
    },
  }));
  return next.aiConfig;
}
