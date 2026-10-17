import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getLadderSteps, getWasteToolRows, t } from '../src/core/i18n';
import { ReflectionCard } from '../src/ui/guided/ReflectionCard';
import { Options } from '../src/options/Options';
import { Popup } from '../src/popup/Popup';
import { resetAllStorageData, getStorageState } from '../src/core/storage';

describe('i18n and Language Switching Support', () => {
  beforeEach(async () => {
    await resetAllStorageData();
  });

  it('provides complete 8-step ladder in English and Hindi', () => {
    const stepsEn = getLadderSteps('en');
    const stepsHi = getLadderSteps('hi');

    expect(stepsEn).toHaveLength(8);
    expect(stepsHi).toHaveLength(8);

    expect(stepsEn[0].title).toContain('Step 1: Observe');
    expect(stepsEn[0].sawal).toContain('What is the problem actually asking for?');
    expect(stepsHi[0].title).toContain('Observe');
    expect(stepsHi[0].sawal).toContain('Question aakhir mang kya raha hai?');

    expect(stepsEn[7].title).toContain('Step 8: Code Boundaries');
    expect(stepsEn[7].action).toContain('Write base case checks first');
  });

  it('provides Waste-to-Tool Matrix in English and Hindi', () => {
    const wasteEn = getWasteToolRows('en');
    const wasteHi = getWasteToolRows('hi');

    expect(wasteEn.length).toBeGreaterThan(0);
    expect(wasteHi.length).toBeGreaterThan(0);
    expect(wasteEn[0].waste).toContain('Repeated linear scan');
    expect(wasteHi[0].waste).toContain('Baar-baar shuru se dhoondhna');
  });

  it('correctly translates tokens with t helper', () => {
    expect(t('stepCardActionLabel', 'en')).toBe('What To Do:');
    expect(t('stepCardActionLabel', 'hi')).toBe('Kya Karna Hai:');
    expect(t('stepProgress', 'en', { current: 3, pct: 38 })).toBe('Step 3 of 8 • 38% Completed');
    expect(t('stepProgress', 'hi', { current: 3, pct: 38 })).toBe('Step 3 of 8 • 38% Pura Hua');
  });

  it('renders ReflectionCard in English when language="en"', () => {
    const handleSaved = vi.fn();
    const { getByLabelText, getByText } = render(
      <ReflectionCard
        slug="two-sum"
        language="en"
        onSaved={handleSaved}
      />
    );

    expect(getByLabelText(/1. What was the core pattern of this problem\?/i)).toBeDefined();
    expect(getByLabelText(/2. Which keyword or observation triggered intuition\?/i)).toBeDefined();
    expect(getByLabelText(/3. What was the waste in brute force/i)).toBeDefined();
    expect(getByText('Save Reflection')).toBeDefined();
  });

  it('allows toggling language directly from Popup header button', async () => {
    const { findByText, getByTitle } = render(<Popup />);

    // Initially in Hindi mode: button offers switch to English
    const toggleBtn = await findByText('EN');
    expect(toggleBtn).toBeDefined();

    fireEvent.click(toggleBtn);

    // After clicking, button should update to show HI (to toggle back)
    await waitFor(() => {
      expect(getByTitle(/Switch to Hinglish/i)).toBeDefined();
    });

    const state = await getStorageState();
    expect(state.language).toBe('en');
    expect(state.settings.language).toBe('en');
  });

  it('allows changing language from Options page', async () => {
    const { findByText, getByText } = render(<Options />);

    expect(await findByText('Extension Language / भाषा')).toBeDefined();
    const enButton = getByText('English');
    fireEvent.click(enButton);

    await waitFor(async () => {
      const state = await getStorageState();
      expect(state.language).toBe('en');
    });
  });
});
