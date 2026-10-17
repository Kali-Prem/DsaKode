import { describe, it, expect, beforeEach } from 'vitest';
import { getStorageState, setStorageState } from '../src/core/storage';

describe('storage module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default state when storage is empty', async () => {
    const state = await getStorageState();
    expect(state).toMatchObject({
      isOpen: false,
      activeSlug: null,
      schemaVersion: 1,
    });
  });

  it('persists and retrieves updated state', async () => {
    await setStorageState({ isOpen: true, activeSlug: 'two-sum' });
    const state = await getStorageState();
    expect(state.isOpen).toBe(true);
    expect(state.activeSlug).toBe('two-sum');
  });

  it('supports updater function', async () => {
    await setStorageState({ isOpen: false });
    await setStorageState((prev) => ({ isOpen: !prev.isOpen }));
    const state = await getStorageState();
    expect(state.isOpen).toBe(true);
  });
});
