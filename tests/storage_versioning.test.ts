import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStorageState,
  setStorageState,
  migrateStorageState,
  recordProblemVisit,
  saveProblemReflection,
  markProblemRevised,
  getRevisionDueProblems,
  getTodayProblemsCount,
  getCurrentStreak,
  getLastNProblems,
  exportStorageData,
  importStorageData,
  resetAllStorageData,
  defaultSettings,
} from '../src/core/storage';
import { CURRENT_SCHEMA_VERSION, ProblemRecord } from '../src/core/types';

describe('Storage Schema Versioning & Analytics', () => {
  beforeEach(async () => {
    await resetAllStorageData();
  });

  it('migrates unversioned legacy state cleanly to schemaVersion 1', () => {
    const legacyRaw = {
      isOpen: true,
      dockSide: 'left',
      guidedBySlug: {
        'two-sum': {
          currentStep: 8,
          completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
          notesByStep: { 1: 'observe notes' },
          unlockedHintLevel: {},
          isUnderstoodByStep: {},
          startedAt: 1700000000000,
        },
      },
    };

    const migrated = migrateStorageState(legacyRaw);
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.settings.defaultDockSide).toBe('left');
    expect(migrated.problemHistory['two-sum']).toBeDefined();
    expect(migrated.problemHistory['two-sum'].ladderProgress).toBe(8);
  });

  it('records problem visits and updates history', async () => {
    await recordProblemVisit('koko-eating-bananas', 'Koko Eating Bananas', 'Medium');
    const state = await getStorageState();
    const rec = state.problemHistory['koko-eating-bananas'];

    expect(rec).toBeDefined();
    expect(rec.title).toBe('Koko Eating Bananas');
    expect(rec.difficulty).toBe('Medium');
    expect(rec.lastVisited).toBeGreaterThan(0);
  });

  it('saves 3-line reflection and marks completion', async () => {
    await recordProblemVisit('two-sum', 'Two Sum', 'Easy');
    await saveProblemReflection('two-sum', {
      pattern: 'HashMap complement lookup',
      triggerObservation: 'Target sum and unsorted array',
      wasteAndTool: 'Linear scan O(n) replaced by O(1) hash map',
      savedAt: Date.now(),
    });

    const state = await getStorageState();
    const rec = state.problemHistory['two-sum'];
    expect(rec.completedAt).toBeDefined();
    expect(rec.reflection?.pattern).toBe('HashMap complement lookup');
    expect(rec.reflection?.wasteAndTool).toBe('Linear scan O(n) replaced by O(1) hash map');
  });

  it('identifies spaced revision due after 7 days', async () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const history: Record<string, ProblemRecord> = {
      'two-sum': {
        slug: 'two-sum',
        title: 'Two Sum',
        lastVisited: eightDaysAgo,
        completedAt: eightDaysAgo,
        ladderProgress: 8,
      },
      'recent-problem': {
        slug: 'recent-problem',
        title: 'Recent Problem',
        lastVisited: Date.now(),
        completedAt: Date.now(),
        ladderProgress: 8,
      },
    };

    const due = getRevisionDueProblems(history);
    expect(due.length).toBe(1);
    expect(due[0].slug).toBe('two-sum');

    // Mark revised
    await setStorageState({ problemHistory: history });
    await markProblemRevised('two-sum');
    const updatedState = await getStorageState();
    const updatedDue = getRevisionDueProblems(updatedState.problemHistory);
    expect(updatedDue.length).toBe(0);
  });

  it('calculates today problem count and streak correctly', () => {
    const today = Date.now();
    const history: Record<string, ProblemRecord> = {
      'prob-1': {
        slug: 'prob-1',
        title: 'Problem 1',
        lastVisited: today,
        ladderProgress: 4,
      },
      'prob-2': {
        slug: 'prob-2',
        title: 'Problem 2',
        lastVisited: today,
        completedAt: today,
        ladderProgress: 8,
      },
    };

    expect(getTodayProblemsCount(history)).toBe(2);
    expect(getCurrentStreak(history)).toBe(1);
  });

  it('exports and imports backup JSON data correctly', async () => {
    await recordProblemVisit('subarray-sum-equals-k', 'Subarray Sum Equals K', 'Medium');
    const jsonStr = await exportStorageData();
    expect(jsonStr).toContain('subarray-sum-equals-k');

    // Clear and restore
    await resetAllStorageData();
    const cleared = await getStorageState();
    expect(cleared.problemHistory['subarray-sum-equals-k']).toBeUndefined();

    const importRes = await importStorageData(jsonStr);
    expect(importRes.success).toBe(true);

    const restored = await getStorageState();
    expect(restored.problemHistory['subarray-sum-equals-k']).toBeDefined();
    expect(restored.problemHistory['subarray-sum-equals-k'].title).toBe('Subarray Sum Equals K');
  });
});
