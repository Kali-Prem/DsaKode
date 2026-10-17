import { describe, it, expect, beforeEach } from 'vitest';
import {
  cleanText,
  cleanSuperscripts,
  extractExamples,
  extractConstraintLines,
  extractDifficulty,
  extractTitle,
  parseProblemPage,
  waitForDescription,
} from '../src/core/parser';

describe('problem page parser', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('cleanSuperscripts and cleanText', () => {
    it('replaces <sup> tags with caret notation (10<sup>5</sup> -> 10^5)', () => {
      const container = document.createElement('div');
      container.innerHTML = '1 &lt;= nums.length &lt;= 10<sup>5</sup> and -10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup>';
      
      cleanSuperscripts(container);
      expect(container.textContent).toBe('1 <= nums.length <= 10^5 and -10^9 <= nums[i] <= 10^9');
    });

    it('cleanText collapses whitespace and handles non-breaking spaces', () => {
      const container = document.createElement('div');
      container.innerHTML = '  Hello&nbsp;&nbsp;&nbsp;world! 10<sup>4</sup>  ';
      expect(cleanText(container)).toBe('Hello world! 10^4');
    });
  });

  describe('example parsing (both layouts supported)', () => {
    it('parses older LeetCode layout using <pre> tags', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <p>Example 1:</p>
        <pre>
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
        </pre>
      `;

      const examples = extractExamples(container);
      expect(examples).toHaveLength(1);
      expect(examples[0].input).toBe('nums = [2,7,11,15], target = 9');
      expect(examples[0].output).toBe('[0,1]');
      expect(examples[0].explanation).toBe('Because nums[0] + nums[1] == 9, we return [0, 1].');
    });

    it('parses modern LeetCode layout using <div class="example-block">', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="example-block">
          <p><span>Input:</span> <span class="example-io">nums = [1,1,1], k = 2</span></p>
          <p><span>Output:</span> <span class="example-io">2</span></p>
        </div>
      `;

      const examples = extractExamples(container);
      expect(examples).toHaveLength(1);
      expect(examples[0].input).toBe('nums = [1,1,1], k = 2');
      expect(examples[0].output).toBe('2');
      expect(examples[0].explanation).toBeUndefined();
    });
  });

  describe('5 Problem End-to-End DOM Parsing', () => {
    it('1. Two Sum (Easy, old layout, constraints with 10^4 and 10^9)', () => {
      document.body.innerHTML = `
        <div data-cy="question-title">1. Two Sum</div>
        <div class="text-difficulty-easy">Easy</div>
        <div data-track-load="description_content">
          <p>Given an array of integers nums and an integer target, return indices of the two numbers.</p>
          <p><strong class="example">Example 1:</strong></p>
          <pre>
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
          </pre>
          <p><strong>Constraints:</strong></p>
          <ul>
            <li>2 &lt;= nums.length &lt;= 10<sup>4</sup></li>
            <li>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></li>
            <li>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></li>
            <li>Only one valid answer exists.</li>
          </ul>
        </div>
      `;

      const parsed = parseProblemPage(undefined, 'two-sum');
      expect(parsed.isParsed).toBe(true);
      expect(parsed.title).toBe('1. Two Sum');
      expect(parsed.slug).toBe('two-sum');
      expect(parsed.difficulty).toBe('Easy');
      expect(parsed.examples).toHaveLength(1);
      expect(parsed.examples[0].input).toBe('nums = [2,7,11,15], target = 9');
      expect(parsed.analysis.sizeMax).toBe(10000);
      expect(parsed.analysis.sizeMin).toBe(2);
      expect(parsed.analysis.negatives).toBe(true);
      expect(parsed.analysis.params.target).toEqual({ lo: -1000000000, hi: 1000000000 });
    });

    it('2. Subarray Sum Equals K (Medium, new layout, 2 * 10^4 constraint)', () => {
      document.body.innerHTML = `
        <div data-cy="question-title">560. Subarray Sum Equals K</div>
        <div class="text-yellow">Medium</div>
        <div data-track-load="description_content">
          <p>Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.</p>
          <div class="example-block">
            <p><strong>Input:</strong> nums = [1,1,1], k = 2</p>
            <p><strong>Output:</strong> 2</p>
          </div>
          <p><strong>Constraints:</strong></p>
          <ul>
            <li>1 &lt;= nums.length &lt;= 2 * 10<sup>4</sup></li>
            <li>-1000 &lt;= nums[i] &lt;= 1000</li>
            <li>-10<sup>7</sup> &lt;= k &lt;= 10<sup>7</sup></li>
          </ul>
        </div>
      `;

      const parsed = parseProblemPage(undefined, 'subarray-sum-equals-k');
      expect(parsed.isParsed).toBe(true);
      expect(parsed.title).toBe('560. Subarray Sum Equals K');
      expect(parsed.difficulty).toBe('Medium');
      expect(parsed.examples[0].output).toBe('2');
      expect(parsed.analysis.sizeMax).toBe(20000);
      expect(parsed.analysis.negatives).toBe(true);
      expect(parsed.analysis.params.k).toEqual({ lo: -10000000, hi: 10000000 });
    });

    it('3. Koko Eating Bananas (Medium, piles and h constraints)', () => {
      document.body.innerHTML = `
        <div data-cy="question-title">875. Koko Eating Bananas</div>
        <div class="text-yellow">Medium</div>
        <div data-track-load="description_content">
          <p>Koko loves to eat bananas. There are n piles of bananas...</p>
          <pre>
<strong>Input:</strong> piles = [3,6,7,11], h = 8
<strong>Output:</strong> 4
          </pre>
          <p><strong>Constraints:</strong></p>
          <ul>
            <li>1 &lt;= piles.length &lt;= 10<sup>4</sup></li>
            <li>piles.length &lt;= h &lt;= 10<sup>9</sup></li>
            <li>1 &lt;= piles[i] &lt;= 10<sup>9</sup></li>
          </ul>
        </div>
      `;

      const parsed = parseProblemPage(undefined, 'koko-eating-bananas');
      expect(parsed.isParsed).toBe(true);
      expect(parsed.difficulty).toBe('Medium');
      expect(parsed.analysis.sizeMax).toBe(10000);
      expect(parsed.analysis.valueRange.min).toBe(1);
      expect(parsed.analysis.negatives).toBe(false);
      expect(parsed.analysis.params.h?.hi).toBe(1000000000);
    });

    it('4. Number of Islands (Medium, 2D grid, m, n <= 300)', () => {
      document.body.innerHTML = `
        <div data-cy="question-title">200. Number of Islands</div>
        <div class="text-yellow">Medium</div>
        <div data-track-load="description_content">
          <p>Given an m x n 2D binary grid grid which represents a map of '1's and '0's...</p>
          <pre>
<strong>Input:</strong> grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]
<strong>Output:</strong> 1
          </pre>
          <p><strong>Constraints:</strong></p>
          <ul>
            <li>m == grid.length</li>
            <li>n == grid[i].length</li>
            <li>1 &lt;= m, n &lt;= 300</li>
            <li>grid[i][j] is '0' or '1'.</li>
          </ul>
        </div>
      `;

      const parsed = parseProblemPage(undefined, 'number-of-islands');
      expect(parsed.isParsed).toBe(true);
      expect(parsed.analysis.sizeMax).toBe(300);
      expect(parsed.analysis.sizeVariables).toContain('m');
      expect(parsed.analysis.sizeVariables).toContain('n');
      expect(parsed.analysis.valueRange.min).toBe(0);
      expect(parsed.analysis.valueRange.max).toBe(1);
      expect(parsed.analysis.negatives).toBe(false);
    });

    it('5. Merge Intervals (Medium, intervals.length <= 10^4)', () => {
      document.body.innerHTML = `
        <div data-cy="question-title">56. Merge Intervals</div>
        <div class="text-yellow">Medium</div>
        <div data-track-load="description_content">
          <p>Given an array of intervals where intervals[i] = [starti, endi]...</p>
          <pre>
<strong>Input:</strong> intervals = [[1,3],[2,6],[8,10],[15,18]]
<strong>Output:</strong> [[1,6],[8,10],[15,18]]
<strong>Explanation:</strong> Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
          </pre>
          <p><strong>Constraints:</strong></p>
          <ul>
            <li>1 &lt;= intervals.length &lt;= 10<sup>4</sup></li>
            <li>intervals[i].length == 2</li>
            <li>0 &lt;= start_i &lt;= end_i &lt;= 10<sup>4</sup></li>
          </ul>
        </div>
      `;

      const parsed = parseProblemPage(undefined, 'merge-intervals');
      expect(parsed.isParsed).toBe(true);
      expect(parsed.analysis.sizeMax).toBe(10000);
      expect(parsed.analysis.valueRange.min).toBe(0);
      expect(parsed.analysis.valueRange.max).toBe(10000);
      expect(parsed.analysis.negatives).toBe(false);
    });
  });

  describe('MutationObserver waiting (waitForDescription)', () => {
    it('resolves when description element is appended asynchronously', async () => {
      const waitPromise = waitForDescription(3000);

      // Simulate asynchronous LeetCode description insertion
      setTimeout(() => {
        const desc = document.createElement('div');
        desc.setAttribute('data-track-load', 'description_content');
        desc.textContent = 'Given an array of integers nums, return indices of the two numbers such that they add up to target.';
        document.body.appendChild(desc);
      }, 50);

      const el = await waitPromise;
      expect(el).toBeDefined();
      expect(el.getAttribute('data-track-load')).toBe('description_content');
    });

    it('rejects if description element does not appear before timeout', async () => {
      await expect(waitForDescription(150)).rejects.toThrow('did not load within');
    });
  });

  describe('graceful error handling', () => {
    it('returns isParsed: false gracefully when description is missing or empty', () => {
      document.body.innerHTML = '<div>Random page content without problem description</div>';

      const parsed = parseProblemPage(null, 'unknown-slug');
      expect(parsed.isParsed).toBe(false);
      expect(parsed.error).toBeDefined();
      expect(parsed.slug).toBe('unknown-slug');
      expect(parsed.title).toBe('Unknown Slug');
      expect(parsed.difficulty).toBe('Unknown');
      expect(parsed.examples).toHaveLength(0);
      expect(parsed.constraintsLines).toHaveLength(0);
    });
  });
});
