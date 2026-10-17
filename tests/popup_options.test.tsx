import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Popup } from '../src/popup/Popup';
import { Options } from '../src/options/Options';
import { ReflectionCard } from '../src/ui/guided/ReflectionCard';
import { setStorageState, resetAllStorageData } from '../src/core/storage';

describe('Popup Component Surface', () => {
  beforeEach(async () => {
    await resetAllStorageData();
  });

  it('renders today count, streak, recent problems and LeetCode button', async () => {
    const today = Date.now();
    await setStorageState({
      problemHistory: {
        'two-sum': {
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          lastVisited: today,
          ladderProgress: 8,
          completedAt: today,
        },
      },
    });

    const { findByText, getByText, getAllByText } = render(<Popup />);

    // Header & streak
    expect(await findByText('DsaKode')).toBeDefined();
    expect(getByText(/1 day/i)).toBeDefined();

    // Stats
    expect(getAllByText(/1/).length).toBeGreaterThan(0);
    expect(getByText(/Today's Practice/i)).toBeDefined();

    // Recent problems
    expect(getByText('Two Sum')).toBeDefined();
    expect(getByText('8/8 (100%)')).toBeDefined();

    // LeetCode link
    expect(getByText('Open LeetCode')).toBeDefined();
  });

  it('displays spaced revision alert when problem is 7+ days old', async () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    await setStorageState({
      problemHistory: {
        'two-sum': {
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          lastVisited: eightDaysAgo,
          completedAt: eightDaysAgo,
          ladderProgress: 8,
        },
      },
    });

    const { findByText, getByText } = render(<Popup />);

    expect(await findByText(/Spaced Revision Due/i)).toBeDefined();
    expect(getByText(/Solved 8d ago/i)).toBeDefined();
  });
});

describe('Options Page & Reflection Dashboard Surface', () => {
  beforeEach(async () => {
    await resetAllStorageData();
  });

  it('renders options settings tabs and updates preferences', async () => {
    const { findByText, getByText } = render(<Options />);

    expect(await findByText('Preferences & Controls')).toBeDefined();
    expect(getByText('Theme Mode')).toBeDefined();
    expect(getByText('Default Dock Side')).toBeDefined();
    expect(getByText('Backup, Export & Data Management')).toBeDefined();

    // Update dock side
    const leftBtn = getByText('left Side');
    fireEvent.click(leftBtn);
    await waitFor(() => {
      expect(getByText(/defaultDockSide updated/i)).toBeDefined();
    });
  });

  it('allows searching problems and reflections in archive tab', async () => {
    await setStorageState({
      problemHistory: {
        'two-sum': {
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          lastVisited: Date.now(),
          ladderProgress: 8,
          reflection: {
            pattern: 'HashMap complement',
            triggerObservation: 'Pair with target sum',
            wasteAndTool: 'Linear scan replaced by map',
            savedAt: Date.now(),
          },
        },
      },
    });

    const { findByText, getByText, getByPlaceholderText } = render(<Options />);

    // Switch to reflections tab
    const refTab = await findByText('Reflections Archive & Revision');
    fireEvent.click(refTab);

    // Should display Two Sum and its reflection
    expect(await findByText('Two Sum')).toBeDefined();
    expect(getByText('HashMap complement')).toBeDefined();
    expect(getByText('Pair with target sum')).toBeDefined();

    // Search filter
    const searchInput = getByPlaceholderText(/Search by title/i);
    fireEvent.change(searchInput, { target: { value: 'non-existent' } });
    expect(await findByText('Koi problem match nahi hui.')).toBeDefined();
  });
});

describe('ReflectionCard Component', () => {
  it('renders 3 reflection lines and saves data', async () => {
    const handleSaved = vi.fn();
    const { getByLabelText, getByText } = render(
      <ReflectionCard
        slug="subarray-sum-equals-k"
        defaultPattern="Prefix Sum + HashMap"
        onSaved={handleSaved}
      />
    );

    const patternInput = getByLabelText(/1. Is problem ka core pattern kya tha\?/i);
    const triggerInput = getByLabelText(/2. Kis keyword ya observation se intuition click hua\?/i);
    const wasteInput = getByLabelText(/3. Brute force me waste kya tha aur kis tool ne hataya\?/i);

    fireEvent.change(triggerInput, { target: { value: 'Contiguous subarray with sum k' } });
    fireEvent.change(wasteInput, { target: { value: 'Recalculating prefix sums replaced by map' } });

    const saveBtn = getByText('Save Reflection');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(handleSaved).toHaveBeenCalledWith(
        expect.objectContaining({
          pattern: 'Prefix Sum + HashMap',
          triggerObservation: 'Contiguous subarray with sum k',
          wasteAndTool: 'Recalculating prefix sums replaced by map',
        })
      );
    });
  });
});
