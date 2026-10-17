import { describe, it, expect } from 'vitest';
import {
  matchKeywords,
  getComplexityTier,
  checkTLE,
  classifyOutput,
  getOutputTypeHint,
  getSizeRelationHint,
  checkIntegerOverflow,
  generateEdgeCaseWarnings,
  analyze,
} from '../src/core/engine';
import { ParsedProblem } from '../src/core/types';

describe('DSA Thinking Coach Engine', () => {
  describe('Keyword Rules Coverage (Positive & Negative tests for all 21 rules)', () => {
    const rulesToTest = [
      {
        id: 'two-pointers-sorted',
        positive: 'Given an integer array nums sorted in non-decreasing order, return 3sum pairs.',
        negative: 'Given an unsorted linked list with random pointers.',
      },
      {
        id: 'rotated-binary-search',
        positive: 'Search in a rotated sorted array containing distinct elements.',
        negative: 'Find the maximum depth of a binary tree.',
      },
      {
        id: 'sliding-window-contiguous',
        positive: 'Find the length of the longest substring without repeating characters in a contiguous array.',
        negative: 'Compute the bitwise XOR of all subset elements.',
      },
      {
        id: 'prefix-sum-hashmap',
        positive: 'Given an array of integers nums, return total subarrays with subarray sum equals k.',
        negative: 'Serialize and deserialize a binary search tree.',
      },
      {
        id: 'hashmap-frequency',
        positive: 'Count the frequency of each element and find if there are duplicate anagram occurrences.',
        negative: 'Determine if a graph contains a directed cycle using Kahn algorithm.',
      },
      {
        id: 'binary-search-answer',
        positive: 'Find the minimum eating speed to eat all piles within h hours (minimize the maximum capacity).',
        negative: 'Reverse nodes in k-group for a singly linked list.',
      },
      {
        id: 'binary-search-explicit',
        positive: 'You must write an algorithm with O(log n) runtime complexity to search in a sorted array.',
        negative: 'Perform breadth-first search on a 2D matrix of zeros and ones.',
      },
      {
        id: 'monotonic-stack',
        positive: 'Given daily temperatures, find the next greater temperature for each day in a monotonic stack.',
        negative: 'Find the shortest path between city A and city B using Dijkstra.',
      },
      {
        id: 'heap-top-k',
        positive: 'Given an integer array nums and an integer k, return the kth largest element in the stream.',
        negative: 'Validate whether a given string is a valid palindrome.',
      },
      {
        id: 'linked-list-pointers',
        positive: 'Given the head of a linked list, detect cycle and return the middle of the linked list using a dummy node.',
        negative: 'Find the maximum sum of a rectangle in a 2D matrix.',
      },
      {
        id: 'tree-dfs-bfs',
        positive: 'Given the root of a binary tree, find the lowest common ancestor in this binary search tree.',
        negative: 'Find the single number that appears once using bitwise arithmetic.',
      },
      {
        id: 'graph-bfs-shortest',
        positive: 'Find the shortest path in unweighted graph with minimum steps to reach the target word ladder.',
        negative: 'Calculate the total number of subsets with sum less than limit.',
      },
      {
        id: 'grid-traversal',
        positive: 'Given a 2D binary grid, count the number of islands using flood fill matrix traversal.',
        negative: 'Evaluate a reverse polish notation mathematical expression.',
      },
      {
        id: 'topological-sort',
        positive: 'There are a total of numCourses you have to take, given course schedule prerequisites dependency list.',
        negative: 'Check if two binary trees are leaf-similar.',
      },
      {
        id: 'backtracking',
        positive: 'Given an integer array nums of unique elements, return all possible subsets and combinations.',
        negative: 'Find the maximum contiguous subarray sum using Kadane algorithm.',
      },
      {
        id: 'dynamic-programming',
        positive: 'Find the number of ways to climb stairs with minimum cost and maximum profit.',
        negative: 'Swap nodes in pairs in a linked list.',
      },
      {
        id: 'intervals-greedy',
        positive: 'Given an array of meeting rooms intervals, merge intervals that are non-overlapping.',
        negative: 'Design a stack that supports push, pop, top, and retrieving the minimum element in O(1).',
      },
      {
        id: 'trie-prefix',
        positive: 'Implement a trie prefix tree with insert, search, and startswith operations.',
        negative: 'Calculate the power of x raised to n.',
      },
      {
        id: 'bit-manipulation',
        positive: 'Given a non-empty array of integers, every element appears twice except for one single number xor bitwise.',
        negative: 'Check whether an undirected tree is valid.',
      },
      {
        id: 'dsu-union-find',
        positive: 'Find the number of connected components and redundant connection using disjoint set union find.',
        negative: 'Implement string matching using Knuth-Morris-Pratt KMP algorithm.',
      },
      {
        id: 'design-combo',
        positive: 'Design a data structure for LRU cache that supports get and put in O(1) time.',
        negative: 'Determine if an integer is a palindrome without converting to string.',
      },
    ];

    for (const rule of rulesToTest) {
      it(`rule: ${rule.id} matches positive text and rejects negative text`, () => {
        const positiveHits = matchKeywords(rule.positive);
        const hasPositive = positiveHits.some((h) => h.id === rule.id);
        expect(hasPositive, `Expected positive match for ${rule.id}`).toBe(true);

        const negativeHits = matchKeywords(rule.negative);
        const hasNegative = negativeHits.some((h) => h.id === rule.id);
        expect(hasNegative, `Expected negative rejection for ${rule.id}`).toBe(false);
      });
    }
  });

  describe('Complexity Tier and TLE Analysis', () => {
    it('maps size to target complexity tiers', () => {
      expect(getComplexityTier(10).bigO).toBe('O(n!)');
      expect(getComplexityTier(20).bigO).toBe('O(2^n)');
      expect(getComplexityTier(400).bigO).toBe('O(n^3)');
      expect(getComplexityTier(4000).bigO).toBe('O(n^2)');
      expect(getComplexityTier(15000).bigO).toContain('O(n^2) borderline');
      expect(getComplexityTier(100000).bigO).toBe('O(n log n) ya O(n)');
      expect(getComplexityTier(5000000).bigO).toBe('O(n)');
      expect(getComplexityTier(100000000).bigO).toBe('O(log n) ya O(1)');
      expect(getComplexityTier(null).bigO).toBe('Unknown');
    });

    it('identifies TLE danger for large inputs (> 10^8 operations)', () => {
      const large = checkTLE(100000); // 10^5
      expect(large.n2TLE).toBe(true);
      expect(large.n2Explanation).toContain('Guaranteed TLE');

      const safe = checkTLE(4000); // 4000^2 = 1.6 * 10^7 < 10^8
      expect(safe.n2TLE).toBe(false);
      expect(safe.n2Explanation).toContain('Chal sakta hai');

      const cubic = checkTLE(300); // 300^3 = 2.7 * 10^7 < 10^8
      expect(cubic.n3TLE).toBe(false);

      const cubicHeavy = checkTLE(500); // 500^3 = 1.25 * 10^8 > 10^8
      expect(cubicHeavy.n3TLE).toBe(true);
    });
  });

  describe('Output classification and Socratic hints', () => {
    it('classifies diverse output types correctly', () => {
      expect(classifyOutput('true')).toBe('bool');
      expect(classifyOutput('false')).toBe('bool');
      expect(classifyOutput('42')).toBe('number');
      expect(classifyOutput('-1')).toBe('number');
      expect(classifyOutput('[0, 1]')).toBe('array');
      expect(classifyOutput('[[1, 2], [3, 4]]')).toBe('2d');
      expect(classifyOutput('"hello"')).toBe('string');
      expect(classifyOutput('TreeNode(5)')).toBe('other');
    });

    it('generates thoughtful Socratic output hints', () => {
      const boolHint = getOutputTypeHint('true');
      expect(boolHint?.type).toBe('bool');
      expect(boolHint?.socraticQuestion).toContain('early exit');

      const numHint = getOutputTypeHint('5');
      expect(numHint?.type).toBe('number');
      expect(numHint?.socraticQuestion).toContain('Binary Search on Answer');

      const arrHint = getOutputTypeHint('[1, 2]');
      expect(arrHint?.type).toBe('array');
      expect(arrHint?.socraticQuestion).toContain('Har index');
    });
  });

  describe('Size relation hints (n -> n, n -> 2, n -> 1, n -> 2^n)', () => {
    it('detects n -> 2 pair lookup pattern (Two Sum)', () => {
      const examples = [{ input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' }];
      const hint = getSizeRelationHint(examples);
      expect(hint?.relation).toContain('n -> 2');
      expect(hint?.candidateTools).toContain('HashMap');
    });

    it('detects n -> n transform pattern', () => {
      const examples = [{ input: 'nums = [1, 2, 3, 4]', output: '[24, 12, 8, 6]' }];
      const hint = getSizeRelationHint(examples);
      expect(hint?.relation).toContain('n -> n');
      expect(hint?.candidateTools).toContain('Prefix/Suffix');
    });

    it('detects n -> 1 aggregate reduction pattern', () => {
      const examples = [{ input: 'nums = [1, 2, 3]', output: '6' }];
      const hint = getSizeRelationHint(examples);
      expect(hint?.relation).toContain('n -> 1');
    });

    it('detects n -> 2^n combinatorial pattern', () => {
      const examples = [{ input: 'nums = [1, 2]', output: '[[], [1], [2], [1, 2]]' }];
      const hint = getSizeRelationHint(examples);
      expect(hint?.relation).toContain('2^n');
      expect(hint?.candidateTools).toContain('Backtracking');
    });
  });

  describe('Integer overflow and edge cases', () => {
    it('warns when values can cause integer overflow (> 10^9 or n * val > 2*10^9)', () => {
      const overflowCase = {
        parsed: [],
        sizeMax: 100000,
        sizeMin: 1,
        valueRange: { min: -1000000000, max: 1000000000 },
        negatives: true,
        params: {},
        sizeVariables: ['nums.length'],
      };
      const warn = checkIntegerOverflow(overflowCase);
      expect(warn?.hasWarning).toBe(true);
      expect(warn?.remedy).toContain('long');

      const safeCase = {
        parsed: [],
        sizeMax: 1000,
        sizeMin: 1,
        valueRange: { min: 0, max: 100 },
        negatives: false,
        params: {},
        sizeVariables: ['nums.length'],
      };
      expect(checkIntegerOverflow(safeCase)).toBeNull();
    });

    it('generates appropriate Socratic edge-case warnings', () => {
      const analysis = {
        parsed: [],
        sizeMax: 10000,
        sizeMin: 0,
        valueRange: { min: -5, max: 10 },
        negatives: true,
        params: {},
        sizeVariables: [],
      };
      const text = 'Given an array nums with duplicate values sorted ascending';
      const warnings = generateEdgeCaseWarnings(analysis, text);

      const hasNeg = warnings.some((w) => w.id === 'warn-negatives');
      const hasEmpty = warnings.some((w) => w.id === 'warn-empty-allowed');
      const hasSorted = warnings.some((w) => w.id === 'info-sorted');
      const hasDup = warnings.some((w) => w.id === 'info-duplicates');

      expect(hasNeg).toBe(true);
      expect(hasEmpty).toBe(true);
      expect(hasSorted).toBe(true);
      expect(hasDup).toBe(true);
    });
  });

  describe('End-to-End analyze(problem) integration', () => {
    it('produces full coaching analysis for Two Sum without giving code', () => {
      const problem: ParsedProblem = {
        isParsed: true,
        title: '1. Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        descriptionText: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        constraintsLines: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          '-10^9 <= target <= 10^9',
        ],
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
          },
        ],
        analysis: {
          parsed: [],
          sizeMax: 10000,
          sizeMin: 2,
          valueRange: { min: -1000000000, max: 1000000000 },
          negatives: true,
          params: { target: { lo: -1000000000, hi: 1000000000 } },
          sizeVariables: ['nums.length'],
        },
      };

      const coach = analyze(problem);

      expect(coach.complexity.bigO).toContain('O(n^2) borderline');
      expect(coach.tleChecks.n2Ops).toBe(100000000);
      expect(coach.keywordHits.length).toBeGreaterThan(0);
      expect(coach.keywordHits.some((h) => h.id === 'hashmap-frequency')).toBe(true);
      expect(coach.sizeRelationHint?.relation).toContain('n -> 2');
      expect(coach.overflowWarning?.hasWarning).toBe(true);
      expect(coach.edgeCaseWarnings.some((w) => w.id === 'warn-negatives')).toBe(true);
    });
  });
});
