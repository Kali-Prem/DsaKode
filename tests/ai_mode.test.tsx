import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AskCoachView } from '../src/ui/guided/AskCoachView';
import { SidePanel } from '../src/ui/SidePanel';
import { Options } from '../src/options/Options';
import { DSA_COACH_SYSTEM_PROMPT, formatUserContext } from '../src/background/prompt';
import { setStorageState, resetAllStorageData, saveAIConfig } from '../src/core/storage';
import { ParsedProblem } from '../src/core/types';

const mockProblem: ParsedProblem = {
  title: 'Subarray Sum Equals K',
  slug: 'subarray-sum-equals-k',
  difficulty: 'Medium',
  descriptionText: 'Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.',
  constraintsLines: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
  examples: [
    {
      index: 1,
      input: 'nums = [1,1,1], k = 2',
      output: '2',
      rawText: 'Input: nums = [1,1,1], k = 2\nOutput: 2',
    },
  ],
};

describe('DSA Coach System Prompt & Context Formatting', () => {
  it('enforces strict Hinglish Socratic coaching with zero code guarantee', () => {
    expect(DSA_COACH_SYSTEM_PROMPT).toContain('Hinglish');
    expect(DSA_COACH_SYSTEM_PROMPT).toContain('ZERO CODE GUARANTEE');
    expect(DSA_COACH_SYSTEM_PROMPT).toContain('CODE YA SYNTAX KABHI NAHI DENA');
    expect(DSA_COACH_SYSTEM_PROMPT).toContain('DIRECT FINAL ALGORITHM YA SOLUTION MAT BATAO');
    expect(DSA_COACH_SYSTEM_PROMPT).toContain('Thinking Ladder');
  });

  it('formats context with title, constraints, examples, current step and user notes', () => {
    const formatted = formatUserContext({
      problemTitle: 'Subarray Sum Equals K',
      constraints: ['1 <= nums.length <= 2 * 10^4'],
      examples: [{ input: 'nums = [1,1,1], k = 2', output: '2' }],
      currentStep: 4,
      currentNotes: 'Main brute-force me do loops laga raha hoon O(n^2)',
      userMessage: 'Kya yahan sliding window chalegi?',
    });

    expect(formatted).toContain('Problem Title: "Subarray Sum Equals K"');
    expect(formatted).toContain('1 <= nums.length <= 2 * 10^4');
    expect(formatted).toContain('nums = [1,1,1], k = 2');
    expect(formatted).toContain('Candidate Current Ladder Step: Step 4 of 8');
    expect(formatted).toContain('Main brute-force me do loops laga raha hoon O(n^2)');
    expect(formatted).toContain('"Kya yahan sliding window chalegi?"');
  });
});

describe('AskCoachView UI Component', () => {
  beforeEach(async () => {
    await resetAllStorageData();
  });

  it('renders Setup Card when AI mode is disabled (Default: OFF)', async () => {
    await saveAIConfig({ enabled: false, apiKey: '' });

    render(<AskCoachView problem={mockProblem} />);

    expect(await screen.findByText('Optional Socratic AI Coach')).toBeDefined();
    expect(screen.getByText('Default: OFF')).toBeDefined();
    expect(screen.getByText(/Playbook rules par train kiya gaya AI coach/i)).toBeDefined();
    expect(screen.getByText(/Security & Privacy Assurance:/i)).toBeDefined();
    expect(screen.getByText('Configure API Key in Options')).toBeDefined();
  });

  it('renders Chat interface, Privacy Note and Quick Prompts when AI mode is enabled', async () => {
    await saveAIConfig({
      enabled: true,
      apiKey: 'test-fake-gemini-key',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
    });

    render(<AskCoachView problem={mockProblem} currentStep={2} currentNotes="My notes" />);

    // Privacy note banner
    expect(await screen.findByText(/Privacy Note:/i)).toBeDefined();
    expect(screen.getByText(/Sirf problem title, constraints summary/i)).toBeDefined();

    // Welcome message from Coach
    expect(screen.getByText(/Namaste! Main tumhara Socratic DSA Coach hoon/i)).toBeDefined();

    // Quick prompts
    expect(screen.getByText('Main sliding window soch raha hoon, kya ye chalega?')).toBeDefined();
    expect(screen.getByText('Poocho')).toBeDefined();
  });

  it('submits user input query and adds message to chat', async () => {
    await saveAIConfig({
      enabled: true,
      apiKey: 'test-fake-key',
      provider: 'gemini',
    });

    render(<AskCoachView problem={mockProblem} currentStep={3} />);

    const input = await screen.findByPlaceholderText(/Apni current soch likho/i);
    const submitBtn = screen.getByText('Poocho');

    fireEvent.change(input, { target: { value: 'Main sliding window try karna chahta hoon' } });
    fireEvent.click(submitBtn);

    // User message should appear in chat
    expect(await screen.findByText('Main sliding window try karna chahta hoon')).toBeDefined();
  });
});

describe('SidePanel AI Mode Integration', () => {
  beforeEach(async () => {
    await resetAllStorageData();
  });

  it('includes Ask Coach tab with AI badge and switches to AskCoachView', async () => {
    render(
      <SidePanel
        isOpen={true}
        slug="subarray-sum-equals-k"
        problemTitle="Subarray Sum Equals K"
        difficulty="Medium"
        onClose={vi.fn()}
        problem={mockProblem}
      />
    );

    // Look for Ask Coach tab
    const askCoachTab = screen.getByText('Ask Coach');
    expect(askCoachTab).toBeDefined();

    // Switch to Ask Coach tab
    fireEvent.click(askCoachTab);

    // Should display either Setup Card or AskCoach chat
    expect(await screen.findByText('Optional Socratic AI Coach')).toBeDefined();
  });
});

describe('Options AI Mode Settings', () => {
  beforeEach(async () => {
    await resetAllStorageData();
  });

  it('renders AI Coach settings card, allows toggling AI mode and changing provider', async () => {
    render(<Options />);

    // Check card exists
    expect(await screen.findByText('Optional Socratic AI Coach')).toBeDefined();
    expect(screen.getByText('AI Mode OFF')).toBeDefined();

    // Toggle AI mode ON
    const toggleBtn = screen.getByText('AI Mode OFF');
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByText('AI Mode ON')).toBeDefined();
    });

    // Provider buttons
    const claudeBtn = screen.getByText('Anthropic Claude');
    fireEvent.click(claudeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Anthropic API Key/i)).toBeDefined();
    });

    // API Key input & Show/Hide toggle
    const keyInput = screen.getByPlaceholderText('sk-ant-api03-...') as HTMLInputElement;
    expect(keyInput.type).toBe('password');

    const toggleShowBtn = screen.getByTitle('Show Key');
    fireEvent.click(toggleShowBtn);
    expect(keyInput.type).toBe('text');

    // Test connection button
    const testBtn = screen.getByText('Test Connection');
    fireEvent.change(keyInput, { target: { value: 'sk-ant-valid-dummy-key' } });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText(/Connection test/i)).toBeDefined();
    });
  });
});
