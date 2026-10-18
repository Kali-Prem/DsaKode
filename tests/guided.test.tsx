import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepperBar } from '../src/ui/guided/StepperBar';
import { StepCard } from '../src/ui/guided/StepCard';
import { StepContextView } from '../src/ui/guided/StepContextView';
import { SocraticHintDrawer } from '../src/ui/guided/SocraticHintDrawer';
import { GuidedWizard } from '../src/ui/guided/GuidedWizard';
import { TeacherWalkthroughView } from '../src/ui/guided/TeacherWalkthroughView';
import { ParsedProblem } from '../src/core/types';
import { analyze } from '../src/core/engine';
import rawLadder from '../src/data/thinkingLadder.json';

const mockLadder = rawLadder as any[];

const mockTwoSumProblem: ParsedProblem = {
  isParsed: true,
  slug: 'two-sum',
  title: 'Two Sum',
  difficulty: 'Easy',
  descriptionText: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
  constraintsLines: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
  ],
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
  ],
  analysis: {
    parsed: [
      { name: 'nums.length', lo: 2, hi: 10000, raw: '2 <= nums.length <= 10^4' },
      { name: 'nums[i]', lo: -1000000000, hi: 1000000000, raw: '-10^9 <= nums[i] <= 10^9' },
    ],
    sizeMax: 10000,
    sizeMin: 2,
    valueRange: { min: -1000000000, max: 1000000000 },
    negatives: true,
    params: { target: { lo: -1000000000, hi: 1000000000 } },
    sizeVariables: ['nums.length'],
  },
};

const mockAnalysis = analyze(mockTwoSumProblem);

describe('Guided Mode - StepperBar', () => {
  it('renders 8 steps and marks completed steps with checkmark', () => {
    const onSelect = vi.fn();
    const { getByLabelText, getByText } = render(
      <StepperBar
        currentStep={2}
        completedSteps={[1]}
        onSelectStep={onSelect}
      />
    );

    expect(getByText('Step 2 of 8')).toBeDefined();
    expect(getByText('Manual')).toBeDefined();
    expect(getByText('1/8 Done')).toBeDefined();

    // Step 1 is completed and accessible
    const step1Btn = getByLabelText('Go to step 1: Observe');
    fireEvent.click(step1Btn);
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

describe('Guided Mode - StepContextView', () => {
  it('renders Step 1 with Example 1 input/output and output type hint', () => {
    const { getByText } = render(
      <StepContextView
        step={1}
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
      />
    );

    expect(getByText('Example 1 (Concrete Sample)')).toBeDefined();
    expect(getByText('nums = [2,7,11,15], target = 9')).toBeDefined();
    expect(getByText('[0,1]')).toBeDefined();
    expect(getByText(/Pair \/ Indices/i)).toBeDefined();
  });

  it('renders Step 4 with O(n^2) operations and TLE calculation', () => {
    const { getByText } = render(
      <StepContextView
        step={4}
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
      />
    );

    expect(getByText(/Complexity vs Constraints/i)).toBeDefined();
    expect(getByText(/Input Size \(N\)/i)).toBeDefined();
    expect(getByText(/Target Complexity Tier:/i)).toBeDefined();
  });

  it('renders Step 6 with Waste-Tool matrix and highlights matching row', () => {
    const { getByText, getAllByText } = render(
      <StepContextView
        step={6}
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
      />
    );

    expect(getByText(/Waste-to-Tool Prescription Matrix/i)).toBeDefined();
    expect(getByText('HashMap / HashSet')).toBeDefined();
    expect(getAllByText(/O\(n\) -> O\(1\)/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Step 7 with active edge case alerts and overflow check', () => {
    const { getByText } = render(
      <StepContextView
        step={7}
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
      />
    );

    expect(getByText(/Active Edge Case Alerts/i)).toBeDefined();
    expect(getByText(/Negative values allowed hain/i)).toBeDefined();
  });
});

describe('Guided Mode - StepCard Validation & Notes', () => {
  it('allows Next Step button to work whether notes are written or not', () => {
    const handleNext = vi.fn();
    const handleNotes = vi.fn();
    const handleUnderstood = vi.fn();

    const { getByRole, rerender } = render(
      <StepCard
        ladderStep={mockLadder[0]}
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
        notes=""
        onNotesChange={handleNotes}
        isUnderstood={false}
        onUnderstoodChange={handleUnderstood}
        unlockedHintLevel={0}
        onUnlockHintLevel={vi.fn()}
        onNextStep={handleNext}
        onPrevStep={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    // Empty notes & not checked -> still enabled and clickable!
    const nextBtn = getByRole('button', { name: /Next Step/i }) as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);

    // With notes -> also enabled and clickable!
    rerender(
      <StepCard
        ladderStep={mockLadder[0]}
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
        notes="Array contains numbers"
        onNotesChange={handleNotes}
        isUnderstood={false}
        onUnderstoodChange={handleUnderstood}
        unlockedHintLevel={0}
        onUnlockHintLevel={vi.fn()}
        onNextStep={handleNext}
        onPrevStep={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );
    expect(nextBtn.disabled).toBe(false);
    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(2);
  });

  it('triggers notes change on textarea input', () => {
    const handleNotes = vi.fn();
    const { getByLabelText } = render(
      <StepCard
        ladderStep={mockLadder[0]}
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
        notes=""
        onNotesChange={handleNotes}
        isUnderstood={false}
        onUnderstoodChange={vi.fn()}
        unlockedHintLevel={0}
        onUnlockHintLevel={vi.fn()}
        onNextStep={vi.fn()}
        onPrevStep={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
      />
    );

    const textarea = getByLabelText(/Tumhare Words me Jawab/i);
    fireEvent.change(textarea, { target: { value: 'My custom trace' } });
    expect(handleNotes).toHaveBeenCalledWith('My custom trace');
  });
});

describe('Guided Mode - SocraticHintDrawer', () => {
  it('displays Zero Code Guarantee and hints without leaking solution code', () => {
    const handleUnlock = vi.fn();
    const { getByText, queryByText } = render(
      <SocraticHintDrawer
        step={1}
        unlockedLevel={1}
        onUnlockLevel={handleUnlock}
        analysis={mockAnalysis}
      />
    );

    // Open drawer
    const toggleBtn = getByText('Socratic Hints');
    fireEvent.click(toggleBtn);

    // Shows guarantee
    expect(getByText(/Zero Code Guarantee:/i)).toBeDefined();
    expect(getByText(/Level 1: Socratic Nudge/i)).toBeDefined();

    // Verify it doesn't leak code syntax
    expect(queryByText(/function\s+/i)).toBeNull();
    expect(queryByText(/class\s+Solution/i)).toBeNull();
  });

  it('allows fast-unlock for timer', async () => {
    const handleUnlock = vi.fn();
    const { getByText } = render(
      <SocraticHintDrawer
        step={1}
        unlockedLevel={0}
        onUnlockLevel={handleUnlock}
        analysis={mockAnalysis}
      />
    );

    // Open drawer
    const toggleBtn = getByText('Socratic Hints');
    fireEvent.click(toggleBtn);

    // Click unlock level 1
    const unlockBtn = getByText('Unlock (60s Timer)');
    fireEvent.click(unlockBtn);

    // Timer card appears
    expect(getByText(/Pehle Khud Socho.../i)).toBeDefined();

    // Fast unlock
    const fastUnlockBtn = getByText(/Maine soch liya/i);
    fireEvent.click(fastUnlockBtn);
    expect(handleUnlock).toHaveBeenCalledWith(1);
  });
});

describe('Guided Mode - GuidedWizard Full Workflow', () => {
  it('renders step 1 by default and advances when Next Step clicked', async () => {
    const { getByText, getByRole, findByText } = render(
      <GuidedWizard
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
      />
    );

    // Wait for initial storage load
    const step1Title = await findByText('Step 1 of 8');
    expect(step1Title).toBeDefined();

    // Check "samajh gaya" to enable next step
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click next step
    const nextBtn = getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    // Should now be on Step 2
    await waitFor(() => {
      expect(getByText('Step 2 of 8')).toBeDefined();
      expect(getByText('Manual')).toBeDefined();
    });
  });
});

describe('TeacherWalkthroughView Component', () => {
  it('renders Chapter 1 by default and supports stepping to next chapters', async () => {
    const { getByText, findByText } = render(
      <TeacherWalkthroughView
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
        language="hi"
      />
    );

    // Header and Chapter 1 visible
    expect(getByText(/Teacher Flow: Step-by-Step Breakdown/i)).toBeDefined();
    expect(getByText(/1. Question Dekhte Hi Input & Output Par Dhyan/i)).toBeDefined();
    expect(getByText(/nums = \[2,7,11,15\], target = 9/i)).toBeDefined();

    // Advance to Chapter 2
    const nextBtn = getByText('Agla Step');
    fireEvent.click(nextBtn);
    const ch2Title = await findByText(/2. Test Case Ko Pen-Paper Par Khud Solve Kiya/i);
    expect(ch2Title).toBeDefined();

    // Toggle to Full Story view
    const fullStoryBtn = getByText(/Pura Ek Saath/i);
    fireEvent.click(fullStoryBtn);
    await waitFor(() => {
      expect(getByText(/3. Constraints Se Time & Space Ka Budget Nikala/i)).toBeDefined();
      expect(getByText(/4. Brute Force Me Faltu Kaam/i)).toBeDefined();
      expect(getByText(/7. Interviewer Kahan Fasa Sakta Hai/i)).toBeDefined();
    });
  });
});
