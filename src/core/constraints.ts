/**
 * Constraints parser and analyzer for LeetCode problem specifications.
 * Reference: Prem's DSA Logic Building Playbook (Rules Engine)
 */
import { ConstraintAnalysis, ParsedConstraint } from './types';

/**
 * Parses numeric expressions commonly found in LeetCode constraints:
 * e.g. "10^5" -> 100000, "2 * 10^4" -> 20000, "-10^9" -> -1000000000, "2^31 - 1" -> 2147483647
 */
export function parseNum(str: string | number | null | undefined): number | null {
  if (typeof str === 'number') return Number.isNaN(str) ? null : str;
  if (!str) return null;

  let s = String(str)
    .replace(/[,\s\u00a0]/g, '')
    .trim();
  if (!s) return null;

  // Direct integer or float
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    return Number(s);
  }

  // Handle 2^31 - 1 or 2^31-1
  const powMinusMatch = s.match(/^(-?)(\d+)\^(\d+)-1$/);
  if (powMinusMatch) {
    const sign = powMinusMatch[1] === '-' ? -1 : 1;
    const base = Number(powMinusMatch[2]);
    const exp = Number(powMinusMatch[3]);
    return sign * (Math.pow(base, exp) - 1);
  }

  // Scientific notation e.g. 1e5, 2e4, -1e9
  if (/^-?\d+(\.\d+)?e[+-]?\d+$/i.test(s)) {
    const val = Number(s);
    return Number.isNaN(val) ? null : val;
  }

  // Normalize multiplication symbols
  s = s.replace(/[×x·]/g, '*');

  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);

  // Must only contain digits, '*', '^', '.'
  if (!/^[\d*^.]+$/.test(s)) return null;

  const parts = s.split('*');
  let product = 1;

  for (const part of parts) {
    if (!part) return null;
    if (part.includes('^')) {
      const [baseStr, expStr] = part.split('^');
      const base = Number(baseStr);
      const exp = Number(expStr);
      if (Number.isNaN(base) || Number.isNaN(exp)) return null;
      product *= Math.pow(base, exp);
    } else {
      const val = Number(part);
      if (Number.isNaN(val)) return null;
      product *= val;
    }
  }

  const result = neg ? -product : product;
  return Number.isNaN(result) ? null : result;
}

/**
 * Parses a single constraint line into one or more ParsedConstraint objects.
 * Handles:
 * - "1 <= nums.length <= 10^5"
 * - "1 <= m, n <= 300" (splits into m and n)
 * - "0 <= start_i <= end_i <= 10^4"
 * - "intervals[i].length == 2"
 * - "piles.length <= h <= 10^9"
 * - "-1000 <= nums[i] <= 1000"
 */
export function parseConstraintLine(line: string): ParsedConstraint[] {
  const clean = line.replace(/[\u00a0]/g, ' ').trim();
  if (!clean) return [];

  // Check equality, e.g. "intervals[i].length == 2" or "m == grid.length"
  const eqMatch = clean.match(/^([a-zA-Z0-9_.\[\]]+)\s*={1,2}\s*([^=]+)$/);
  if (eqMatch) {
    const name = eqMatch[1].trim();
    const num = parseNum(eqMatch[2]);
    if (num !== null) {
      return [{ name, lo: num, hi: num, raw: line }];
    }
  }

  // Split by comparison operators: <=, <, >=, >, ≤, ≥
  const tokens = clean
    .split(/(<=|≤|>=|≥|<|>)/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (tokens.length < 3) return [];

  const exprs = tokens.filter((_, i) => i % 2 === 0);
  const ops = tokens.filter((_, i) => i % 2 === 1);

  // Distinguish numeric values from variable names
  const numValues = exprs.map(parseNum);
  const varIndices = exprs
    .map((_, i) => i)
    .filter((i) => numValues[i] === null);

  if (varIndices.length === 0) return [];

  const results: ParsedConstraint[] = [];

  for (const vi of varIndices) {
    let lo: number | null = null;
    let hi: number | null = null;

    // Check bounds to the left
    if (vi > 0 && numValues[vi - 1] !== null) {
      const v = numValues[vi - 1]!;
      const op = ops[vi - 1];
      if (/^(<=|≤|<)$/.test(op)) {
        lo = v;
      } else if (/^(>=|≥|>)$/.test(op)) {
        hi = v;
      }
    }

    // Check bounds to the right
    if (vi < ops.length && numValues[vi + 1] !== null) {
      const v = numValues[vi + 1]!;
      const op = ops[vi];
      if (/^(<=|≤|<)$/.test(op)) {
        hi = v;
      } else if (/^(>=|≥|>)$/.test(op)) {
        lo = v;
      }
    }

    // Chained variables bounded by numbers at BOTH outer ends (e.g. 0 <= start_i <= end_i <= 10^4)
    const firstNum = numValues[0];
    const lastNum = numValues[exprs.length - 1];
    const allLess = ops.every((op) => /^(<=|≤|<)$/.test(op));
    if (firstNum !== null && lastNum !== null && allLess) {
      if (lo === null) lo = firstNum;
      if (hi === null) hi = lastNum;
    }

    if (lo === null && hi === null) continue;

    // Handle multiple comma-separated variables e.g. "m, n" in "1 <= m, n <= 300"
    const rawVar = exprs[vi];
    const subVars = rawVar
      .split(/[,&]|(?:\band\b)/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && parseNum(s) === null);

    const targetNames = subVars.length > 0 ? subVars : [rawVar];

    for (const name of targetNames) {
      results.push({ name, lo, hi, raw: line });
    }
  }

  return results;
}

/**
 * Determines whether a variable name refers to an input size (array length, matrix dimension, etc.)
 */
export function isSizeName(name: string): boolean {
  if (!name) return false;
  // Indexed elements like nums[i], grid[i][j] are values, NOT size
  if (name.includes('[')) return false;

  const lower = name.toLowerCase().trim();

  // Known parameters (k, target, h, etc.) are problem parameters, NOT array sizes
  if (isParamName(lower)) {
    return false;
  }

  // Matches length, size, count, rows, cols
  if (/(length|size|count|rows|cols)/i.test(lower)) return true;

  // Single letters like n, m, r, c or comma-separated letters like "m, n"
  if (/^[a-z](\s*,\s*[a-z])*$/i.test(lower)) return true;

  return false;
}

/**
 * Determines whether a variable refers to element values (e.g. nums[i], grid[i][j])
 */
export function isValueName(name: string): boolean {
  if (!name) return false;
  if (name.includes('[')) return true;
  return /^(start_?i|end_?i|val|element|node\.val)$/i.test(name.trim());
}

/**
 * Determines whether a variable is a named parameter (e.g. target, k, h)
 */
export function isParamName(name: string): boolean {
  if (!name) return false;
  if (name.includes('[')) return false;
  const lower = name.toLowerCase().trim();
  return ['k', 'target', 'h', 'threshold', 'capacity', 'speed', 'limit', 'val', 'hour', 'hours'].includes(lower);
}

/**
 * Analyzes an array of constraint lines to extract:
 * - sizeMax, sizeMin (e.g. 10^5, 1)
 * - valueRange { min, max }
 * - negatives (whether negative numbers are allowed in values or parameters)
 * - params (e.g. k, target, h)
 */
export function analyzeConstraints(lines: string[]): ConstraintAnalysis {
  const parsed: ParsedConstraint[] = [];

  for (const line of lines) {
    try {
      const items = parseConstraintLine(line);
      parsed.push(...items);
    } catch {
      // Graceful error recovery: continue parsing remaining lines
    }
  }

  // 1. Identify size constraints
  const sizeConstraints = parsed.filter((p) => isSizeName(p.name) && (p.hi !== null || p.lo !== null));
  const sizeHiValues = sizeConstraints.map((p) => p.hi).filter((v): v is number => v !== null);
  const sizeLoValues = sizeConstraints.map((p) => p.lo).filter((v): v is number => v !== null);

  const sizeMax = sizeHiValues.length > 0 ? Math.max(...sizeHiValues) : null;
  const sizeMin = sizeLoValues.length > 0 ? Math.min(...sizeLoValues) : null;
  const sizeVariables = Array.from(new Set(sizeConstraints.map((p) => p.name)));

  // 2. Identify value constraints
  const valueConstraints = parsed.filter((p) => isValueName(p.name));
  const valLoList = valueConstraints.map((p) => p.lo).filter((v): v is number => v !== null);
  const valHiList = valueConstraints.map((p) => p.hi).filter((v): v is number => v !== null);

  // Check for binary grid patterns e.g. "grid[i][j] is '0' or '1'"
  const hasBinaryGrid = lines.some((l) => /grid\[i\]\[j\]\s*(is|==)\s*['"]?[01]['"]?\s*or\s*['"]?[01]['"]?/i.test(l));
  if (hasBinaryGrid) {
    valLoList.push(0);
    valHiList.push(1);
  }

  const valMin = valLoList.length > 0 ? Math.min(...valLoList) : null;
  const valMax = valHiList.length > 0 ? Math.max(...valHiList) : null;

  // 3. Identify problem parameters (target, k, h, etc.)
  const params: Record<string, { lo: number | null; hi: number | null }> = {};
  parsed
    .filter((p) => isParamName(p.name))
    .forEach((p) => {
      params[p.name] = { lo: p.lo, hi: p.hi };
    });

  // 4. Check whether negatives are allowed
  const hasNegativeValues = valMin !== null && valMin < 0;
  const hasNegativeParam = Object.values(params).some((p) => p.lo !== null && p.lo < 0);
  const hasNegativeText = lines.some((l) => /-\s*\d/.test(l) && !/size|length/i.test(l));

  const negatives = hasNegativeValues || hasNegativeParam || hasNegativeText;

  return {
    parsed,
    sizeMax,
    sizeMin,
    valueRange: {
      min: valMin,
      max: valMax,
    },
    negatives,
    params,
    sizeVariables,
  };
}
