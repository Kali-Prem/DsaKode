import { describe, it, expect } from 'vitest';
import { parseNum, parseConstraintLine, analyzeConstraints } from '../src/core/constraints';

describe('constraints analyzer', () => {
  describe('parseNum', () => {
    it('parses basic integers and scientific notation', () => {
      expect(parseNum('1000')).toBe(1000);
      expect(parseNum('-1000')).toBe(-1000);
      expect(parseNum('1e5')).toBe(100000);
      expect(parseNum('2e4')).toBe(20000);
    });

    it('parses exponential expressions (e.g. 10^5, -10^9)', () => {
      expect(parseNum('10^5')).toBe(100000);
      expect(parseNum('10^4')).toBe(10000);
      expect(parseNum('10^9')).toBe(1000000000);
      expect(parseNum('-10^9')).toBe(-1000000000);
      expect(parseNum('10^7')).toBe(10000000);
      expect(parseNum('-10^7')).toBe(-10000000);
    });

    it('parses product expressions (e.g. 2 * 10^4, 3 * 10^5)', () => {
      expect(parseNum('2 * 10^4')).toBe(20000);
      expect(parseNum('3 * 10^5')).toBe(300000);
      expect(parseNum('2.5 * 10^3')).toBe(2500);
      expect(parseNum('2 x 10^4')).toBe(20000);
    });

    it('parses 2^31 - 1 and powers of 2', () => {
      expect(parseNum('2^31 - 1')).toBe(2147483647);
      expect(parseNum('-2^31')).toBe(-2147483648);
    });

    it('returns null for non-numeric or variable expressions', () => {
      expect(parseNum('nums.length')).toBeNull();
      expect(parseNum('k')).toBeNull();
      expect(parseNum('')).toBeNull();
      expect(parseNum(null)).toBeNull();
    });
  });

  describe('parseConstraintLine', () => {
    it('parses standard double inequality (1 <= nums.length <= 10^5)', () => {
      const res = parseConstraintLine('1 <= nums.length <= 10^5');
      expect(res).toHaveLength(1);
      expect(res[0]).toEqual({
        name: 'nums.length',
        lo: 1,
        hi: 100000,
        raw: '1 <= nums.length <= 10^5',
      });
    });

    it('parses multiple variables e.g. "1 <= m, n <= 300"', () => {
      const res = parseConstraintLine('1 <= m, n <= 300');
      expect(res).toHaveLength(2);
      expect(res[0]).toEqual({
        name: 'm',
        lo: 1,
        hi: 300,
        raw: '1 <= m, n <= 300',
      });
      expect(res[1]).toEqual({
        name: 'n',
        lo: 1,
        hi: 300,
        raw: '1 <= m, n <= 300',
      });
    });

    it('parses chained variables e.g. "0 <= start_i <= end_i <= 10^4"', () => {
      const res = parseConstraintLine('0 <= start_i <= end_i <= 10^4');
      expect(res).toHaveLength(2);
      expect(res[0].name).toBe('start_i');
      expect(res[0].lo).toBe(0);
      expect(res[0].hi).toBe(10000);

      expect(res[1].name).toBe('end_i');
      expect(res[1].lo).toBe(0);
      expect(res[1].hi).toBe(10000);
    });

    it('parses equality constraints e.g. "intervals[i].length == 2"', () => {
      const res = parseConstraintLine('intervals[i].length == 2');
      expect(res).toHaveLength(1);
      expect(res[0]).toEqual({
        name: 'intervals[i].length',
        lo: 2,
        hi: 2,
        raw: 'intervals[i].length == 2',
      });
    });

    it('handles unicode comparison operators (≤, ≥)', () => {
      const res = parseConstraintLine('1 ≤ nums.length ≤ 10^5');
      expect(res).toHaveLength(1);
      expect(res[0].lo).toBe(1);
      expect(res[0].hi).toBe(100000);
    });
  });

  describe('5 Required LeetCode Problem Test Cases', () => {
    it('1. Two Sum', () => {
      const lines = [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
      ];
      const analysis = analyzeConstraints(lines);

      expect(analysis.sizeMax).toBe(10000);
      expect(analysis.sizeMin).toBe(2);
      expect(analysis.valueRange.min).toBe(-1000000000);
      expect(analysis.valueRange.max).toBe(1000000000);
      expect(analysis.negatives).toBe(true);
      expect(analysis.params.target).toEqual({ lo: -1000000000, hi: 1000000000 });
    });

    it('2. Subarray Sum Equals K', () => {
      const lines = [
        '1 <= nums.length <= 2 * 10^4',
        '-1000 <= nums[i] <= 1000',
        '-10^7 <= k <= 10^7',
      ];
      const analysis = analyzeConstraints(lines);

      expect(analysis.sizeMax).toBe(20000);
      expect(analysis.sizeMin).toBe(1);
      expect(analysis.valueRange.min).toBe(-1000);
      expect(analysis.valueRange.max).toBe(1000);
      expect(analysis.negatives).toBe(true);
      expect(analysis.params.k).toEqual({ lo: -10000000, hi: 10000000 });
    });

    it('3. Koko Eating Bananas', () => {
      const lines = [
        '1 <= piles.length <= 10^4',
        'piles.length <= h <= 10^9',
        '1 <= piles[i] <= 10^9',
      ];
      const analysis = analyzeConstraints(lines);

      expect(analysis.sizeMax).toBe(10000);
      expect(analysis.sizeMin).toBe(1);
      expect(analysis.valueRange.min).toBe(1);
      expect(analysis.valueRange.max).toBe(1000000000);
      expect(analysis.negatives).toBe(false);
      expect(analysis.params.h?.hi).toBe(1000000000);
    });

    it('4. Number of Islands', () => {
      const lines = [
        'm == grid.length',
        'n == grid[i].length',
        '1 <= m, n <= 300',
        "grid[i][j] is '0' or '1'.",
      ];
      const analysis = analyzeConstraints(lines);

      expect(analysis.sizeMax).toBe(300);
      expect(analysis.sizeMin).toBe(1);
      expect(analysis.sizeVariables).toContain('m');
      expect(analysis.sizeVariables).toContain('n');
      expect(analysis.valueRange.min).toBe(0);
      expect(analysis.valueRange.max).toBe(1);
      expect(analysis.negatives).toBe(false);
    });

    it('5. Merge Intervals', () => {
      const lines = [
        '1 <= intervals.length <= 10^4',
        'intervals[i].length == 2',
        '0 <= start_i <= end_i <= 10^4',
      ];
      const analysis = analyzeConstraints(lines);

      expect(analysis.sizeMax).toBe(10000);
      expect(analysis.sizeMin).toBe(1);
      expect(analysis.valueRange.min).toBe(0);
      expect(analysis.valueRange.max).toBe(10000);
      expect(analysis.negatives).toBe(false);
    });
  });

  describe('graceful error handling', () => {
    it('handles empty or malformed constraint lists without crashing', () => {
      const empty = analyzeConstraints([]);
      expect(empty.sizeMax).toBeNull();
      expect(empty.sizeMin).toBeNull();
      expect(empty.negatives).toBe(false);
      expect(empty.parsed).toHaveLength(0);

      const garbage = analyzeConstraints(['nonsense words without operators', 'foo bar baz']);
      expect(garbage.sizeMax).toBeNull();
      expect(garbage.parsed).toHaveLength(0);
    });
  });
});
