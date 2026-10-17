import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComplexityMeter } from '../src/ui/guided/ComplexityMeter';
import { ConstraintsCard } from '../src/ui/guided/ConstraintsCard';
import { KeywordChipsSection } from '../src/ui/guided/KeywordChipsSection';
import { WasteToolMatrixSection } from '../src/ui/guided/WasteToolMatrixSection';
import { TestCaseVisualCard } from '../src/ui/guided/TestCaseVisualCard';
import { EdgeCasesChecklistSection } from '../src/ui/guided/EdgeCasesChecklistSection';
import { InsightsView } from '../src/ui/guided/InsightsView';
import { InsightsSkeleton } from '../src/ui/guided/InsightsSkeleton';
import { InsightsEmptyState } from '../src/ui/guided/InsightsEmptyState';
import { ParsedProblem } from '../src/core/types';
import { analyze } from '../src/core/engine';

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
      { name: 'target', lo: -1000000000, hi: 1000000000, raw: '-10^9 <= target <= 10^9' },
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

describe('Insights Tab - ComplexityMeter', () => {
  it('renders horizontal spectrum gauge and operations bar chart visual', () => {
    const { getByText, getAllByText } = render(
      <ComplexityMeter analysis={mockAnalysis} sizeMax={10000} />
    );

    expect(getByText('Complexity Meter & TLE Gauge')).toBeDefined();
    expect(getByText(/Playbook Target Zone/i)).toBeDefined();
    expect(getByText('LeetCode Standard 1-Sec Limit:')).toBeDefined();
    expect(getByText(/Brute Force O\(n²\):/i)).toBeDefined();
  });
});

describe('Insights Tab - ConstraintsCard', () => {
  it('renders parsed constraints monospace table and warning badges', () => {
    const { getByText } = render(
      <ConstraintsCard
        analysis={mockTwoSumProblem.analysis}
        overflowWarning={mockAnalysis.overflowWarning}
      />
    );

    expect(getByText('Parsed Constraints Table')).toBeDefined();
    expect(getByText('nums.length')).toBeDefined();
    expect(getByText(/⚠️ Negatives Allowed/i)).toBeDefined();
    expect(getByText(/✅ Non-Empty Guaranteed/i)).toBeDefined();
  });
});

describe('Insights Tab - KeywordChipsSection', () => {
  it('renders chips and toggles spoiler-gated Socratic intuition', () => {
    const { getByText, queryByText } = render(
      <KeywordChipsSection keywordHits={mockAnalysis.keywordHits} />
    );

    expect(getByText('Detected Algorithmic Signals')).toBeDefined();

    // Click technique chip
    const chip = getByText('HashMap / HashSet');
    fireEvent.click(chip);

    // Shows spoiler protection
    expect(getByText(/Spoiler Protection:/i)).toBeDefined();

    // Reveal Socratic intuition
    const revealBtn = getByText(/Reveal Socratic Sawal & Intuition/i);
    fireEvent.click(revealBtn);

    // Shows intuition and socratic question
    expect(getByText(/Intuition \(Ye Pattern Kyun Fit Hota Hai\?\):/i)).toBeDefined();
    expect(getByText(/Socratic Sawal \(Dimag Lagao\):/i)).toBeDefined();

    // Zero code guarantee maintained
    expect(queryByText(/function\s+/i)).toBeNull();
    expect(queryByText(/class\s+Solution/i)).toBeNull();
  });
});

describe('Insights Tab - WasteToolMatrixSection', () => {
  it('renders 9 rows and highlights matching keyword rows', () => {
    const { getByText, getAllByText } = render(
      <WasteToolMatrixSection keywordHits={mockAnalysis.keywordHits} />
    );

    expect(getByText('Waste ➔ Tool Prescription Matrix')).toBeDefined();
    expect(getByText('9 Playbook Pairs')).toBeDefined();

    // HashMap row should be marked as Matched
    const matchedBadges = getAllByText('Matched');
    expect(matchedBadges.length).toBeGreaterThanOrEqual(1);

    // Click row to expand Socratic prompt
    const hashMapRow = getByText('HashMap / HashSet');
    fireEvent.click(hashMapRow);
    expect(getByText(/Socratic Prompt \(Dimag Kholne Wala Sawal\):/i)).toBeDefined();
  });
});

describe('Insights Tab - TestCaseVisualCard', () => {
  it('renders Example 1 and size transition visual diagram', () => {
    const { getByText } = render(
      <TestCaseVisualCard
        example={mockTwoSumProblem.examples[0]}
        sizeRelation={mockAnalysis.sizeRelationHint}
        outputHint={mockAnalysis.outputTypeHint}
      />
    );

    expect(getByText('Example 1 & Size Transition Visual')).toBeDefined();
    expect(getByText('Input: n elements')).toBeDefined();
    expect(getByText('Output: 2 indices/pair')).toBeDefined();
    expect(getByText(/Socratic Insight:/i)).toBeDefined();
  });
});

describe('Insights Tab - EdgeCasesChecklistSection', () => {
  it('filters out irrelevant cases and provides skip suggestion', () => {
    const { getByText } = render(
      <EdgeCasesChecklistSection
        analysis={mockTwoSumProblem.analysis}
        overflowWarning={mockAnalysis.overflowWarning}
        problemText={mockTwoSumProblem.descriptionText}
      />
    );

    expect(getByText('Tailored Edge Cases Checklist')).toBeDefined();

    // Min size is 2 -> empty input and single element are filtered into SKIP
    expect(getByText(/Filtered Out by Constraints \(Safe to Skip\):/i)).toBeDefined();
    expect(getByText(/Min size >= 2. Empty input nahi aayega!/i)).toBeDefined();
  });
});

describe('Insights Tab - InsightsView Full Assembly & States', () => {
  it('renders full insights view with all 6 sections', () => {
    const { getByText } = render(
      <InsightsView
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
      />
    );

    expect(getByText('Complexity Meter & TLE Gauge')).toBeDefined();
    expect(getByText('Parsed Constraints Table')).toBeDefined();
    expect(getByText('Detected Algorithmic Signals')).toBeDefined();
    expect(getByText('Waste ➔ Tool Prescription Matrix')).toBeDefined();
    expect(getByText('Example 1 & Size Transition Visual')).toBeDefined();
    expect(getByText('Tailored Edge Cases Checklist')).toBeDefined();
  });

  it('renders skeleton state when isLoading is true', () => {
    const { container } = render(
      <InsightsView
        problem={mockTwoSumProblem}
        analysis={mockAnalysis}
        isLoading={true}
      />
    );

    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });

  it('renders friendly empty state with retry button when unparsed', () => {
    const onRetry = vi.fn();
    const unparsedProblem: ParsedProblem = {
      isParsed: false,
      slug: '',
      title: '',
      difficulty: 'Unknown',
      descriptionText: '',
      constraintsLines: [],
      examples: [],
      analysis: {
        parsed: [],
        sizeMax: null,
        sizeMin: null,
        valueRange: { min: null, max: null },
        negatives: false,
        params: {},
        sizeVariables: [],
      },
    };

    const { getByText } = render(
      <InsightsView
        problem={unparsedProblem}
        analysis={mockAnalysis}
        onRetry={onRetry}
      />
    );

    expect(getByText('Problem Description Loading...')).toBeDefined();
    const retryBtn = getByText('Retry Problem Parser');
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
