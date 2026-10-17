/**
 * LeetCode Problem Page Parser.
 * Extracts problem title, slug, difficulty, description text, constraints, and examples.
 * Supports both older (<pre>) and modern (.example-block) LeetCode layouts.
 */
import { ParsedProblem, ParsedExample, ProblemDifficulty } from './types';
import { LEETCODE_SELECTORS, queryFirstSelector, queryAllSelectors } from './selectors';
import { analyzeConstraints } from './constraints';

/**
 * Transforms all <sup> tags into "^text" and <sub> into "_text" in a node clone.
 */
export function cleanSuperscripts(element: Element): void {
  element.querySelectorAll('sup').forEach((sup) => {
    const text = sup.textContent?.trim() || '';
    sup.replaceWith('^' + text);
  });
  element.querySelectorAll('sub').forEach((sub) => {
    const text = sub.textContent?.trim() || '';
    sub.replaceWith('_' + text);
  });
}

/**
 * Extracts cleaned text from an element, converting superscripts (10<sup>5</sup> -> 10^5)
 * and normalizing non-breaking spaces.
 */
export function cleanText(element: Element): string {
  try {
    const clone = element.cloneNode(true) as Element;
    cleanSuperscripts(clone);
    return (clone.textContent || '')
      .replace(/[\u00a0\u200b]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return (element.textContent || '').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Extracts problem slug from URL pathname e.g. "/problems/two-sum/description/" -> "two-sum"
 */
export function extractSlug(pathname: string = typeof window !== 'undefined' ? window.location?.pathname || '' : ''): string {
  const match = pathname.match(/^\/problems\/([^/]+)/);
  if (!match) return '';
  const slug = match[1].trim();
  return slug === 'all' ? '' : slug;
}

/**
 * Extracts problem title from DOM or falls back to document.title / slug.
 */
export function extractTitle(root: Document | Element = typeof document !== 'undefined' ? document : ({} as any), slugFallback?: string): string {
  const titleEl = queryFirstSelector(LEETCODE_SELECTORS.titles, root);
  if (titleEl) {
    const raw = titleEl.textContent?.trim() || '';
    if (raw) return raw;
  }

  if (typeof document !== 'undefined' && document.title) {
    const pageTitle = document.title.replace(/\s*-\s*LeetCode.*/i, '').trim();
    if (pageTitle && !pageTitle.toLowerCase().includes('leetcode')) {
      return pageTitle;
    }
  }

  if (slugFallback) {
    return slugFallback
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return 'LeetCode Problem';
}

/**
 * Extracts difficulty (Easy, Medium, Hard) from the page.
 */
export function extractDifficulty(root: Document | Element = typeof document !== 'undefined' ? document : ({} as any)): ProblemDifficulty {
  const diffEl = queryFirstSelector(LEETCODE_SELECTORS.difficulties, root);
  if (diffEl) {
    const text = diffEl.textContent?.trim() || '';
    if (/^easy$/i.test(text)) return 'Easy';
    if (/^medium$/i.test(text)) return 'Medium';
    if (/^hard$/i.test(text)) return 'Hard';
  }

  // Secondary check across page text or title attributes
  if (root && typeof root.querySelectorAll === 'function') {
    const badges = root.querySelectorAll('span, div, p');
    for (const badge of Array.from(badges)) {
      const text = badge.textContent?.trim() || '';
      if (/^easy$/i.test(text)) return 'Easy';
      if (/^medium$/i.test(text)) return 'Medium';
      if (/^hard$/i.test(text)) return 'Hard';
    }
  }

  return 'Unknown';
}

/**
 * Extracts constraint lines (li items or paragraphs containing <=, >=, ≤, ≥, etc.)
 */
export function extractConstraintLines(root: Element): string[] {
  const listItems = queryAllSelectors(LEETCODE_SELECTORS.constraintsListItems, root);
  const results: string[] = [];

  for (const item of listItems) {
    const text = cleanText(item);
    // Keep lines that have comparison/inequality signs or indicate constraints
    if (/(<=|≤|>=|≥|<|>|==)/.test(text) || /grid\[i\]\[j\]\s*(is|==)/i.test(text)) {
      results.push(text);
    }
  }

  // Fallback: If no <li> found, search inside the Constraints section text
  if (results.length === 0) {
    const fullText = cleanText(root);
    const constrMatch = fullText.match(/Constraints:?\s*([\s\S]*?)(?:Example\s*\d|Explanation|$)/i);
    if (constrMatch) {
      const sectionText = constrMatch[1];
      const lines = sectionText.split(/(?:\r?\n|•|\*|\d+\.\s+)/).map((l) => l.trim());
      for (const line of lines) {
        if (/(<=|≤|>=|≥|<|>|==)/.test(line)) {
          results.push(line);
        }
      }
    }
  }

  return results;
}

/**
 * Extracts examples from problem DOM.
 * Supports:
 * - New layout: <div class="example-block">...</div>
 * - Old layout: <pre>Input: ... Output: ... Explanation: ...</pre>
 * - Raw text fallback
 */
export function extractExamples(root: Element): ParsedExample[] {
  const examples: ParsedExample[] = [];
  const blocks = queryAllSelectors(LEETCODE_SELECTORS.exampleBlocks, root);

  for (const block of blocks) {
    const rawText = cleanText(block);
    if (!rawText.toLowerCase().includes('input:') && !rawText.toLowerCase().includes('output:')) {
      continue;
    }

    // Try structured regex: Input: ... Output: ... (Explanation: ...)?
    const match = rawText.match(
      /Input:\s*([\s\S]*?)\s*Output:\s*([\s\S]*?)(?:\s*Explanation:\s*([\s\S]*))?$/i
    );

    if (match) {
      examples.push({
        input: match[1].trim(),
        output: match[2].trim(),
        explanation: match[3]?.trim(),
        rawText,
      });
    } else {
      // Secondary flexible match
      const inputMatch = rawText.match(/Input:\s*([\s\S]*?)(?=\s*Output:|$)/i);
      const outputMatch = rawText.match(/Output:\s*([\s\S]*?)(?=\s*Explanation:|$)/i);
      const explMatch = rawText.match(/Explanation:\s*([\s\S]*)$/i);

      if (inputMatch && outputMatch) {
        examples.push({
          input: inputMatch[1].trim(),
          output: outputMatch[1].trim(),
          explanation: explMatch ? explMatch[1].trim() : undefined,
          rawText,
        });
      }
    }
  }

  // If no blocks matched via DOM selectors, try regex on full text
  if (examples.length === 0) {
    const fullText = cleanText(root);
    const regex = /Input:\s*([\s\S]*?)\s*Output:\s*([\s\S]*?)(?:\s*Explanation:\s*([\s\S]*?))?(?=(?:Example\s*\d*:|Constraints:|$))/gi;
    let m: RegExpExecArray | null;

    while ((m = regex.exec(fullText)) !== null && examples.length < 5) {
      examples.push({
        input: m[1].trim(),
        output: m[2].trim(),
        explanation: m[3]?.trim(),
      });
    }
  }

  return examples;
}

/**
 * Parses the LeetCode problem description element and generates a comprehensive ParsedProblem object.
 * Guaranteed never to throw or crash if elements are missing.
 */
export function parseProblemPage(
  descriptionRoot?: Element | null,
  slugFallback?: string
): ParsedProblem {
  const slug = (slugFallback || extractSlug()).trim();

  // If no root element provided, attempt to locate via selectors
  const root =
    descriptionRoot ||
    (typeof document !== 'undefined'
      ? queryFirstSelector(LEETCODE_SELECTORS.descriptionContainers, document)
      : null);

  if (!root || !root.textContent || root.textContent.trim().length < 30) {
    return {
      isParsed: false,
      slug,
      title: extractTitle(typeof document !== 'undefined' ? document : undefined, slug),
      difficulty: 'Unknown',
      descriptionText: '',
      constraintsLines: [],
      examples: [],
      analysis: analyzeConstraints([]),
      error: 'Problem description container not loaded or empty.',
    };
  }

  try {
    const title = extractTitle(typeof document !== 'undefined' ? document : root, slug);
    const difficulty = extractDifficulty(typeof document !== 'undefined' ? document : root);
    const descriptionText = cleanText(root);
    const constraintsLines = extractConstraintLines(root);
    const examples = extractExamples(root);
    const analysis = analyzeConstraints(constraintsLines);

    return {
      isParsed: true,
      slug,
      title,
      difficulty,
      descriptionText,
      constraintsLines,
      examples,
      analysis,
    };
  } catch (err: any) {
    return {
      isParsed: false,
      slug,
      title: extractTitle(typeof document !== 'undefined' ? document : undefined, slug),
      difficulty: 'Unknown',
      descriptionText: '',
      constraintsLines: [],
      examples: [],
      analysis: analyzeConstraints([]),
      error: err?.message || 'Unexpected parsing error',
    };
  }
}

/**
 * Robustly waits for the LeetCode description element to appear using MutationObserver (no polling).
 */
export function waitForDescription(timeoutMs = 8000): Promise<Element> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Document is not defined in this environment'));
      return;
    }

    // 1. Check if already present
    const existing = queryFirstSelector(LEETCODE_SELECTORS.descriptionContainers, document);
    if (existing && (existing.textContent?.trim().length || 0) > 40) {
      resolve(existing);
      return;
    }

    let timeoutTimer: number | null = null;

    const observer = new MutationObserver(() => {
      const found = queryFirstSelector(LEETCODE_SELECTORS.descriptionContainers, document);
      if (found && (found.textContent?.trim().length || 0) > 40) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        observer.disconnect();
        resolve(found);
      }
    });

    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    timeoutTimer = window.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Description element did not load within ${timeoutMs}ms`));
    }, timeoutMs);
  });
}
