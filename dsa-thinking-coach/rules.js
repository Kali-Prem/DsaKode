/* DSA Thinking Coach - rules engine (pure functions, no DOM).
   Source of truth: Kali-Prem/dsa-logic-building-playbook */

const DSA_RULES = (() => {
  // ---------- number / constraint parsing ----------
  const parseNum = (s) => {
    s = String(s).replace(/[,\s]/g, '');
    if (!/^-?[\d*^]+$/.test(s)) return null;
    const neg = s.startsWith('-');
    if (neg) s = s.slice(1);
    let prod = 1;
    for (const part of s.split('*')) {
      if (!part) return null;
      const [b, e] = part.split('^');
      const v = e !== undefined ? Math.pow(Number(b), Number(e)) : Number(b);
      if (Number.isNaN(v)) return null;
      prod *= v;
    }
    return neg ? -prod : prod;
  };

  // "1 <= nums.length <= 10^5"  ->  {name:'nums.length', lo:1, hi:100000}
  const parseConstraintLine = (line) => {
    const parts = line.split(/(<=|≤|>=|≥|<|>)/).map((s) => s.trim());
    if (parts.length < 3) return null;
    const exprs = parts.filter((_, i) => i % 2 === 0);
    const ops = parts.filter((_, i) => i % 2 === 1);
    const vi = exprs.findIndex((e) => parseNum(e) === null);
    if (vi === -1) return null;
    let lo = null, hi = null;
    if (vi > 0) {
      const v = parseNum(exprs[vi - 1]);
      if (v !== null) (/^(<=|≤|<)$/.test(ops[vi - 1]) ? (lo = v) : (hi = v));
    }
    if (vi < exprs.length - 1) {
      const v = parseNum(exprs[vi + 1]);
      if (v !== null) (/^(<=|≤|<)$/.test(ops[vi]) ? (hi = v) : (lo = v));
    }
    if (lo === null && hi === null) return null;
    return { name: exprs[vi], lo, hi };
  };

  const isSizeName = (n) =>
    !/\[/.test(n) && n !== 'k' &&
    (/(length|size|count)/i.test(n) || /^[a-z](\s*,\s*[a-z])*$/i.test(n));

  const analyzeConstraints = (lines) => {
    const parsed = lines.map(parseConstraintLine).filter(Boolean);
    const sizes = parsed.filter((p) => isSizeName(p.name) && p.hi !== null);
    const sizeMax = sizes.length ? Math.max(...sizes.map((p) => p.hi)) : null;
    const sizeLo = sizes.length ? Math.min(...sizes.map((p) => (p.lo === null ? 0 : p.lo))) : null;
    const vals = parsed.filter((p) => /\[/.test(p.name));
    const valHi = vals.length ? Math.max(...vals.map((p) => Math.abs(p.hi ?? 0), ...vals.map((p) => Math.abs(p.lo ?? 0)))) : null;
    const negatives = vals.some((p) => p.lo !== null && p.lo < 0);
    return { parsed, sizeMax, sizeLo, valHi, negatives };
  };

  // ---------- constraints -> target complexity (playbook section 7) ----------
  const TIERS = [
    { max: 12, big: 'O(n!)', tech: 'Permutations, Backtracking - n bahut chhota hai, sab try kar sakte ho.' },
    { max: 25, big: 'O(2^n)', tech: 'Subsets, Bitmask DP, Backtracking.' },
    { max: 500, big: 'O(n^3)', tech: '3 nested loops, Floyd-Warshall, 3D DP.' },
    { max: 5000, big: 'O(n^2)', tech: '2 nested loops, 2D DP.' },
    { max: 20000, big: 'O(n^2) borderline (~10^8) ya usse better', tech: '2D DP kabhi-kabhi chalta hai, par O(n log n) / O(n) safer hai.' },
    { max: 300000, big: 'O(n log n) ya O(n)', tech: 'Sorting, Heap, Binary Search, Hashing, Two Pointers, Sliding Window, Prefix Sum.' },
    { max: 10000000, big: 'O(n)', tech: 'Single pass: Hashing, Two Pointers, Sliding Window, Prefix Sum.' },
    { max: Infinity, big: 'O(log n) ya O(1)', tech: 'Binary Search, Math formula, Bit Manipulation.' },
  ];
  const tierFor = (n) => TIERS.find((t) => n <= t.max);
  const pow10 = (x) => '~10^' + Math.round(Math.log10(Math.max(x, 1)));

  // ---------- keyword -> technique (playbook section 8) ----------
  // row = index in WASTE_TOOL matrix (to highlight)
  const KEYWORDS = [
    { re: /\bsorted\b/, tool: 'Two Pointers / Binary Search', row: 2, why: 'Sorted input = 90% chance Two Pointers ya Binary Search.', ask: 'Kya main pair/triplet dhoondh raha hoon? Ya kisi value ko search?' },
    { re: /rotated/, tool: 'Modified Binary Search', row: 4, why: 'Rotated sorted array me ek half hamesha sorted hota hai.', ask: 'mid ke left ya right me se kaunsa half strictly sorted hai?' },
    { re: /subarray|substring|contiguous/, tool: 'Sliding Window / Prefix Sum + HashMap / Kadane', row: 3, why: 'Contiguous part = window ya prefix sum.', ask: 'Negative numbers allowed hain? Nahi -> Sliding Window. Haan -> Prefix Sum + Map.' },
    { re: /(subarray|sum).*(equals?|equal to|sum to|divisible).*\bk\b|sum equals k/, tool: 'Prefix Sum + HashMap', row: 1, why: 'P[j] - P[i] = k  =>  P[i] = P[j] - k, map me frequency rakho.', ask: 'Har index pe poochho: P[j]-k pehle kitni baar dekha?' },
    { re: /two sum|\bpair\b|\btarget\b|complement/, tool: 'HashMap / Two Pointers', row: 0, why: 'Pair ya complement lookup = O(1) map lookup.', ask: '"Kya ye element pehle dekha tha?" - yahi linear search hatani hai.' },
    { re: /duplicate|frequency|anagram|unique|distinct|occurrence|appears|majority/, tool: 'HashMap / HashSet', row: 0, why: 'Counting / "pehle dekha hai?" = HashMap/HashSet.', ask: 'Kya main frequency array (26 letters) ya map use kar sakta hoon?' },
    { re: /minimum .*(speed|capacity|days|time|rate)|maximi[sz]e the minimum|minimi[sz]e the maximum|within .*(days|hours)|at most .*(hours|days)|\bh hours\b/, tool: 'Binary Search on Answer', row: 4, why: 'Answer ki range hai aur check(x) monotonic (fail..fail, pass..pass).', ask: 'Answer ki range [lo, hi] kya hai? check(mid) kaise likhunga? X valid hai to X+1 bhi valid?' },
    { re: /o\(log n\)|logarithmic|o\(log\(n\)\)/, tool: 'Binary Search', row: 4, why: 'Problem khud O(log n) maang raha hai.', ask: 'Search space har step pe aadha kaise hoga?' },
    { re: /parenthes|bracket|next greater|next warmer|temperatures|nested|decode/, tool: 'Stack / Monotonic Stack', row: 6, why: 'LIFO: sabse recent element ko pehle resolve karna.', ask: 'Kya pichhle unresolved elements ko yaad rakhna hai?' },
    { re: /\bk (largest|smallest|most frequent|closest)|kth|top k|k-th|median|k sorted lists|merge k/, tool: 'Heap / PriorityQueue (size K)', row: 7, why: 'Top-K ke liye size-K heap, O(n log k).', ask: 'Min-heap ya max-heap? Size K maintain karun?' },
    { re: /linked list/, tool: 'Fast & Slow pointers / Dummy node / Reverse', row: null, why: 'Linked list: cycle/middle = fast-slow, head badalne wale case = dummy node.', ask: 'Kya head change ho sakta hai? Dummy node chahiye?' },
    { re: /binary tree|binary search tree|\bbst\b|\broot\b|\btree\b/, tool: 'DFS (recursion) / BFS (level order)', row: null, why: 'Tree = recursion. Level-by-level = BFS.', ask: 'Left aur right subtree se kya return karwana hai? Base case (null) kya hai?' },
    { re: /shortest|fewest|minimum number of (steps|moves)|level order|nearest|minimum (steps|moves)/, tool: 'BFS (unweighted) / Dijkstra (weighted)', row: null, why: 'Unweighted shortest path = BFS.', ask: 'Edges weighted hain? Haan -> Dijkstra.' },
    { re: /\bgrid\b|\bmatrix\b|island|m x n|\bm == grid/, tool: 'DFS / BFS on grid (visited track karo)', row: null, why: '2D grid = graph jahan 4 directions neighbours hain.', ask: 'Visited kaise mark karun (extra array ya in-place)?' },
    { re: /prerequisite|dependenc|course|topological/, tool: 'Topological Sort (Kahn / DFS)', row: null, why: 'Dependency ordering = DAG + topological sort / cycle detection.', ask: 'Indegree array bana ke queue se Kahn chalaun?' },
    { re: /all possible|all (the )?subsets|subsets|permutation|combination|generate all|return all|power set/, tool: 'Backtracking (Choose -> Explore -> Undo)', row: null, why: 'Saare outputs maange hain = decision tree.', ask: 'Answer har node pe collect hoga ya sirf leaf pe? Duplicates kaise skip?' },
    { re: /number of ways|how many ways|distinct ways|minimum cost|maximum profit|minimum number of coins|longest .*subsequence|can you reach|partition|knapsack|climb|rob\b|fewest number of coins/, tool: 'Dynamic Programming', row: 5, why: 'Count ways / min cost / max profit + har step pe choice = DP.', ask: 'dp[i] ka exact matlab kya? Transition? Base case? Pehle brute recursion likho.' },
    { re: /interval|meeting|overlap|schedule|merge/, tool: 'Sort by start + Greedy', row: 8, why: 'Intervals: sort by start time, phir previous se compare.', ask: 'Sort kis key pe? Overlap condition: cur.start <= last.end?' },
    { re: /\btrie\b|prefix tree|startswith|autocomplete|dictionary/, tool: 'Trie', row: null, why: 'Prefix based search = Trie.', ask: 'Kya bahut saare words pe prefix queries aa rahe hain?' },
    { re: /\bxor\b|bitwise|power of two|single number|\bbit\b/, tool: 'Bit Manipulation', row: null, why: 'XOR tricks / bit ops.', ask: 'Kya a ^ a = 0 jaisa koi property kaam aayegi?' },
    { re: /palindrom/, tool: 'Two Pointers (expand from center) / DP', row: null, why: 'Palindrome = dono ends se ya center se expand.', ask: 'Odd aur even length dono center handle kiye?' },
    { re: /10\^9 ?\+ ?7|modulo/, tool: 'DP / Counting (mod arithmetic)', row: 5, why: 'Answer bahut bada ho sakta hai = counting problem, aksar DP.', ask: 'Har addition/multiplication ke baad % MOD lagaya? long use karo.' },
    { re: /in-place|in place|o\(1\) (extra )?space|constant (extra )?space/, tool: 'Two Pointers / swap tricks (extra DS mat lo)', row: 2, why: 'Extra memory ki permission nahi hai.', ask: 'Kya existing array ko hi read+write pointers se use kar sakta hoon?' },
    { re: /without (using )?(the )?division|except self/, tool: 'Prefix + Suffix', row: 1, why: '"Current ko chhodke" = left aur right do hisson me todo.', ask: 'answer[i] = left[i] * right[i] - dono kaise banenge?' },
    { re: /connected|union|component|friend|province|group|network|redundant/, tool: 'DFS / BFS / Union-Find (DSU)', row: null, why: 'Connected components = graph traversal ya DSU.', ask: 'Baar-baar merge queries aa rahi hain? To DSU.' },
    { re: /weighted|cheapest|dijkstra|edges\[i\]|vertices|\bgraph\b/, tool: 'Graph (BFS / Dijkstra / DFS)', row: null, why: 'Nodes + edges = graph. Adjacency list banao.', ask: 'Directed hai ya undirected? Weighted hai?' },
    { re: /lru|\bcache\b|design|implement (the )?\w+ class|data stream|insert\(|getrandom/, tool: 'Design: HashMap + Doubly Linked List / combo of DS', row: null, why: 'Design problems me 2 data structures combine hote hain.', ask: 'Har operation ka required time O(1) hai? Kaunse 2 DS milake ye milega?' },
    { re: /spiral|rotate (the )?image|diagonal|transpose/, tool: 'Simulation / index math (boundaries track karo)', row: null, why: 'Matrix traversal = top/bottom/left/right boundaries.', ask: 'Boundaries kab shrink hongi?' },
    { re: /maximum|minimum|largest|smallest/, tool: '(Low confidence) Greedy / DP / Binary Search on Answer', row: null, why: 'Optimization problem hai - pehle brute force, phir bottleneck dekho.', ask: 'Kya locally best choice globally best hai? Counter-example banao.', weak: true },
  ];

  const matchKeywords = (text) => {
    const t = text.toLowerCase();
    const hits = KEYWORDS.filter((k) => k.re.test(t));
    const strong = hits.filter((h) => !h.weak);
    return strong.length ? strong : hits;
  };

  // ---------- waste -> tool matrix (playbook section 10) ----------
  const WASTE_TOOL = [
    ['Baar-baar linear search: "ye element pehle dekha tha?"', 'HashMap / HashSet', 'O(n) -> O(1)'],
    ['Har query pe range sum/product baar-baar nikalna', 'Prefix / Suffix array', 'O(n) -> O(1)'],
    ['Har pair check, jabki sorted hai ya sort ho sakta hai', 'Sort + Two Pointers', 'O(n^2) -> O(n)'],
    ['Window ka common part har step recalculate', 'Sliding Window', 'O(n^2) -> O(n)'],
    ['Monotonic range me ek-ek step aage badhna', 'Binary Search (on answer)', 'O(n) -> O(log n)'],
    ['Same subproblem recursion tree me baar-baar', 'Dynamic Programming', 'O(2^n) -> O(n)'],
    ['Pichhle elements ka order yaad rakhna (LIFO)', 'Monotonic Stack', 'O(n^2) -> O(n)'],
    ['Har step pe dynamic min/max dhoondna', 'Heap / PriorityQueue', 'O(n) -> O(log n)'],
    ['Unordered intervals me overlap check', 'Sort by start time', 'O(n^2) -> O(n log n)'],
  ];

  // ---------- test case parsing / output type ----------
  const parseExamples = (text) => {
    const out = [];
    const re = /Input:\s*([\s\S]*?)\s*Output:\s*([\s\S]*?)\s*(?=Explanation:|Example\s*\d|Constraints:|$)/g;
    let m;
    while ((m = re.exec(text)) && out.length < 3) {
      out.push({ input: m[1].trim().slice(0, 200), output: m[2].trim().slice(0, 120) });
    }
    return out;
  };

  const classifyOutput = (o) => {
    if (/^\[\s*\[/.test(o)) return '2d';
    if (/^\[/.test(o)) return 'array';
    if (/^(true|false)$/i.test(o)) return 'bool';
    if (/^-?\d+(\.\d+)?$/.test(o)) return 'number';
    if (/^["']/.test(o)) return 'string';
    return 'other';
  };

  const arrLen = (s) => {
    const m = s.match(/\[([^\[\]]*)\]/);
    if (!m) return null;
    return m[1].trim() ? m[1].split(',').length : 0;
  };

  const OUTPUT_HINT = {
    bool: ['Sirf true/false', 'Hashing, Two Pointers, DP, Graph Traversal'],
    number: ['Ek number (count / min / max / index)', 'Count ways -> DP/Combinatorics | Min/Max -> DP, Greedy, Binary Search on Answer'],
    array: ['Array return hoga', 'n -> n: har index ka answer (prefix/suffix, stack, sort+index) | n -> 2: pair/index (HashMap, Two Pointers, Binary Search)'],
    '2d': ['2D list (groups / subsets / intervals)', 'Subsets/Permutations -> Backtracking | Intervals -> Sort+Merge | Groups -> HashMap grouping'],
    string: ['String return hoga', 'Two Pointers, Stack, StringBuilder, Sliding Window'],
    other: ['Output type clear nahi', 'Problem statement ka "Return ..." wala sentence dobara padho'],
  };

  return { parseNum, parseConstraintLine, analyzeConstraints, tierFor, pow10, matchKeywords, KEYWORDS, WASTE_TOOL, parseExamples, classifyOutput, arrLen, OUTPUT_HINT };
})();

if (typeof module !== 'undefined') module.exports = DSA_RULES;
