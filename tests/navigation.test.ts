import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractProblemSlug, initNavigationWatcher } from '../src/content/navigation';

describe('navigation watcher', () => {
  describe('extractProblemSlug', () => {
    it('extracts slug from standard LeetCode problem paths', () => {
      expect(extractProblemSlug('/problems/two-sum')).toBe('two-sum');
      expect(extractProblemSlug('/problems/two-sum/')).toBe('two-sum');
      expect(extractProblemSlug('/problems/two-sum/description/')).toBe('two-sum');
      expect(extractProblemSlug('/problems/two-sum/solutions/')).toBe('two-sum');
      expect(extractProblemSlug('/problems/trapping-rain-water/submissions/')).toBe('trapping-rain-water');
    });

    it('returns null for non-problem pages', () => {
      expect(extractProblemSlug('/')).toBeNull();
      expect(extractProblemSlug('/problemset/all/')).toBeNull();
      expect(extractProblemSlug('/problems/')).toBeNull();
      expect(extractProblemSlug('/problems/all')).toBeNull();
      expect(extractProblemSlug('/contest/weekly-contest-300')).toBeNull();
    });
  });

  describe('initNavigationWatcher', () => {
    beforeEach(() => {
      // Mock window.location
      window.history.pushState({}, '', '/problems/two-sum/');
    });

    it('detects pushState transitions between problems', () => {
      const onSlugChange = vi.fn();
      const watcher = initNavigationWatcher(onSlugChange);

      expect(watcher.getCurrentSlug()).toBe('two-sum');

      // Navigate to a new problem
      window.history.pushState({}, '', '/problems/add-two-numbers/');

      expect(onSlugChange).toHaveBeenCalledWith('add-two-numbers', 'two-sum');
      expect(watcher.getCurrentSlug()).toBe('add-two-numbers');

      watcher.destroy();
    });

    it('restores history methods upon destroy', () => {
      const originalPush = window.history.pushState;
      const watcher = initNavigationWatcher(() => {});
      expect(window.history.pushState).not.toBe(originalPush);

      watcher.destroy();
      expect(window.history.pushState).toBe(originalPush);
    });
  });
});
