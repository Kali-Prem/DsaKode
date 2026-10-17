import { describe, it, expect, beforeEach } from 'vitest';
import { getCleanProblemTitle, isDescriptionLoaded } from '../src/core/dom';

describe('dom module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.title = 'LeetCode';
  });

  it('formats slug into a clean title as fallback', () => {
    expect(getCleanProblemTitle('two-sum')).toBe('Two Sum');
    expect(getCleanProblemTitle('longest-substring-without-repeating-characters')).toBe(
      'Longest Substring Without Repeating Characters'
    );
  });

  it('extracts title from DOM element when available', () => {
    const titleEl = document.createElement('div');
    titleEl.setAttribute('data-cy', 'question-title');
    titleEl.textContent = '1. Two Sum';
    document.body.appendChild(titleEl);

    expect(getCleanProblemTitle('two-sum')).toBe('1. Two Sum');
  });

  it('detects when problem description is loaded', () => {
    expect(isDescriptionLoaded()).toBe(false);

    const descEl = document.createElement('div');
    descEl.setAttribute('data-track-load', 'description_content');
    descEl.textContent = 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.';
    document.body.appendChild(descEl);

    expect(isDescriptionLoaded()).toBe(true);
  });
});
