/**
 * Centralized DOM selectors for LeetCode UI.
 * If LeetCode updates their class names or DOM structure, update this single file.
 */

export const LEETCODE_SELECTORS = {
  // Main description content container
  descriptionContainers: [
    '[data-track-load="description_content"]',
    'div[data-key="description-content"]',
    'div.elfjS',
    'div._1l1NT',
    'div[class*="description__"]',
  ],

  // Question / Problem Title
  titles: [
    'div[data-cy="question-title"]',
    'h4[data-cypress="QuestionTitle"]',
    'a[href^="/problems/"][class*="cursor-text"]',
    'div[class*="text-title-"]',
    'div[class*="text-label-1"][class*="text-lg"]',
    'h1',
  ],

  // Difficulty Badges (Easy, Medium, Hard)
  difficulties: [
    'div[class*="text-difficulty-"]',
    'div[class*="text-olive"]',
    'div[class*="text-yellow"]',
    'div[class*="text-pink"]',
    'span[data-degree]',
    'div[data-difficulty]',
    'span[class*="difficulty"]',
  ],

  // Examples: supports both new layout (.example-block) and old layout (<pre>)
  exampleBlocks: [
    'div.example-block',
    '[data-track-load="description_content"] pre',
    'pre',
  ],

  // Constraints list items
  constraintsListItems: [
    'ul li',
    'ol li',
  ],
};

/**
 * Searches the root (document or container) for the first element matching any of the selectors.
 */
export function queryFirstSelector(
  selectors: string[],
  root: Document | Element = document
): Element | null {
  if (!root || typeof root.querySelector !== 'function') return null;
  for (const selector of selectors) {
    try {
      const el = root.querySelector(selector);
      if (el) return el;
    } catch {
      // Ignore invalid or unsupported selector syntax
    }
  }
  return null;
}

/**
 * Searches the root for all elements matching the given selector list.
 */
export function queryAllSelectors(
  selectors: string[],
  root: Document | Element = document
): Element[] {
  if (!root || typeof root.querySelectorAll !== 'function') return [];
  const results: Element[] = [];
  const seen = new Set<Element>();

  for (const selector of selectors) {
    try {
      const els = root.querySelectorAll(selector);
      els.forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          results.push(el);
        }
      });
    } catch {
      // Ignore
    }
  }
  return results;
}
