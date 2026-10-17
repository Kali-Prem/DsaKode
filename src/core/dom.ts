/**
 * DOM extraction and observation utilities for LeetCode
 */
import { LEETCODE_SELECTORS, queryFirstSelector } from './selectors';
import { extractTitle } from './parser';

export { LEETCODE_SELECTORS };

export function getCleanProblemTitle(slug?: string): string {
  if (typeof document === 'undefined') return slug || 'Problem';
  return extractTitle(document, slug);
}

export function isDescriptionLoaded(): boolean {
  if (typeof document === 'undefined') return false;
  const desc = queryFirstSelector(LEETCODE_SELECTORS.descriptionContainers, document);
  return !!desc && (desc.textContent?.trim().length || 0) > 40;
}
