# DSA Thinking Coach — QA & Manual Verification Guide

This checklist provides a manual testing guide across **8 benchmark problems** representing key DSA patterns from Prem's *DSA Logic Building Playbook*. Use this guide to verify the extension on `leetcode.com/problems/*` or in the standalone test preview.

---

## Pre-Requisites & Setup

1. **Build Extension**:
   ```bash
   npm run build
   ```
2. **Load Unpacked in Chrome**:
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked**
   - Select the `dist` folder inside `DsaKode` (`/home/kali-prem/Downloads/Github/DsaKode/dist`)
3. **Verify Icons & Permissions**:
   - Extension icon with indigo gradient squircle and brain/spark symbol appears in toolbar.
   - Clicking extension icon opens the popup summary (Streak, Today's problems, Spaced Revision badge).

---

## 8 Benchmark Test Problems Checklist

### 1. Two Sum
- **URL**: `https://leetcode.com/problems/two-sum/`
- **Slug**: `two-sum`
- **Difficulty**: Easy
- **Constraints**: $2 \le nums.length \le 10^4$, $-10^9 \le nums[i] \le 10^9$, $-10^9 \le target \le 10^9$
- **Expected Insights**:
  - **Complexity Gauge**: Target $O(N)$ or $O(N \log N)$.
  - **Brute Force Warning**: $O(N^2) \approx 10^8$ operations (borderline TLE).
  - **Detected Keywords**: `Hash Map / Frequency Count` (High), `Two Pointers` (Medium, if sorted).
  - **Prescription Matrix Highlight**: Row 1 (Repeated linear scan / lookup $\to$ Hash Map).
  - **Test Case Visual**: Input size $N \to$ Output size $2$ ($O(1)$ constant output).
- **Thinking Ladder Verification**:
  - Step 1: Output type identified as `Indices Pair / Fixed Size Array`.
  - Step 4: TLE check warns about nested $O(N^2)$ scan.
  - Step 6: Waste highlighted as looking up complement `target - nums[i]`. Tool selected: Hash Map.

---

### 2. Subarray Sum Equals K
- **URL**: `https://leetcode.com/problems/subarray-sum-equals-k/`
- **Slug**: `subarray-sum-equals-k`
- **Difficulty**: Medium
- **Constraints**: $1 \le nums.length \le 2 \times 10^4$, $-1000 \le nums[i] \le 1000$, $-10^7 \le k \le 10^7$
- **Expected Insights**:
  - **Complexity Gauge**: $N = 2 \times 10^4 \implies O(N)$ or $O(N \log N)$.
  - **Brute Force Warning**: $O(N^2) \approx 4 \times 10^8$ operations $\implies$ **Critical TLE Warning**.
  - **Detected Keywords**: `Prefix Sum + Hash Map` (High), `Subarray Sum` (High).
  - **Edge Case Warning**: **Negative Numbers Allowed** badge active! Explains why monotonic sliding window fails when negative numbers are present.
  - **Prescription Matrix**: Row 2 (Range sum recalculation $\to$ Prefix Sum Array / Map).
- **Thinking Ladder Verification**:
  - Step 4 shows TLE on 400M operations.
  - Step 5 identifies waste: recalculating sum of subarray $(i \dots j)$ repeatedly.
  - Step 6 suggests Prefix Sum with frequency hash map.

---

### 3. Container With Most Water
- **URL**: `https://leetcode.com/problems/container-with-most-water/`
- **Slug**: `container-with-most-water`
- **Difficulty**: Medium
- **Constraints**: $2 \le n \le 10^5$, $0 \le height[i] \le 10^4$
- **Expected Insights**:
  - **Complexity Gauge**: $N = 10^5 \implies$ Target $O(N)$ or $O(N \log N)$.
  - **Brute Force Warning**: $O(N^2) = 10^{10} \gg 10^8$ ops $\implies$ **Definite TLE**.
  - **Detected Keywords**: `Two Pointers` (High), `Greedy Area Optimization` (High).
  - **Prescription Matrix**: Row 4 (Two-pointer shrink: move pointer with smaller height).
  - **Test Case Visual**: $N \to 1$ scalar value (maximum area).
- **Thinking Ladder Verification**:
  - Step 2: Manual trace from outermost left/right bars inward.
  - Step 5: Waste identified as evaluating pairs where width decreases and height cannot exceed current bottleneck.
  - Step 6: Shrinking two pointers from both ends.

---

### 4. Merge Intervals
- **URL**: `https://leetcode.com/problems/merge-intervals/`
- **Slug**: `merge-intervals`
- **Difficulty**: Medium
- **Constraints**: $1 \le intervals.length \le 10^4$, $intervals[i].length == 2$, $0 \le start_i \le end_i \le 10^4$
- **Expected Insights**:
  - **Complexity Gauge**: Target $O(N \log N)$ or $O(N)$.
  - **Detected Keywords**: `Greedy / Intervals` (High), `Sorting Preprocessing` (High).
  - **Prescription Matrix**: Row 7 (Unordered intervals $\to$ Sort by interval start time).
  - **Edge Case Warning**: Single interval input, nested intervals (`[1, 4], [2, 3]`), touching intervals (`[1, 4], [4, 5]`).
- **Thinking Ladder Verification**:
  - Step 3: Loop over sorted intervals, state variable keeps current active interval.
  - Step 6: Tool: Sorting array by `start` time, then single linear pass merge.

---

### 5. Koko Eating Bananas
- **URL**: `https://leetcode.com/problems/koko-eating-bananas/`
- **Slug**: `koko-eating-bananas`
- **Difficulty**: Medium
- **Constraints**: $1 \le piles.length \le 10^4$, $piles.length \le h \le 10^9$, $1 \le piles[i] \le 10^9$
- **Expected Insights**:
  - **Complexity Gauge**: Target $O(N \log(\max(P)))$.
  - **Detected Keywords**: `Binary Search on Answer` (High), `Monotonic Feasibility` (High).
  - **Prescription Matrix**: Row 5 (Search over discrete candidate answer space $\to$ Binary Search on Answer).
  - **Overflow Warning**: Warns that accumulating hours can exceed $2^{31}-1$ (64-bit integer required).
- **Thinking Ladder Verification**:
  - Step 1: Input range $h \le 10^9$ and speed $k \in [1, \max(piles)]$.
  - Step 5: Waste: Trying speeds linearly $1, 2, 3 \dots$.
  - Step 6: Tool: Binary search on the answer range with monotonic condition `totalHours(k) <= h`.

---

### 6. Coin Change
- **URL**: `https://leetcode.com/problems/coin-change/`
- **Slug**: `coin-change`
- **Difficulty**: Medium
- **Constraints**: $1 \le coins.length \le 12$, $1 \le coins[i] \le 2^{31}-1$, $0 \le amount \le 10^4$
- **Expected Insights**:
  - **Complexity Gauge**: Target $O(amount \times coins.length)$ pseudo-polynomial.
  - **Detected Keywords**: `Dynamic Programming` (High), `Fewest / Minimum coins` (High).
  - **Prescription Matrix**: Row 8 (Overlapping subproblem tree $\to$ Bottom-up DP table / memoization).
  - **Edge Case Warning**: Amount $0$ (returns 0 coins), impossible amounts (returns -1).
- **Thinking Ladder Verification**:
  - Step 4: Recursion without memoization has exponential branching factor $k^{amount}$.
  - Step 5: Waste: Same remaining amounts calculated hundreds of times.
  - Step 6: Tool: 1D DP array of size `amount + 1`.

---

### 7. Number of Islands
- **URL**: `https://leetcode.com/problems/number-of-islands/`
- **Slug**: `number-of-islands`
- **Difficulty**: Medium
- **Constraints**: $m == grid.length$, $n == grid[i].length$, $1 \le m, n \le 300$, $m \times n \le 9 \times 10^4$
- **Expected Insights**:
  - **Complexity Gauge**: Total elements $M \times N \le 9 \times 10^4 \implies O(M \times N)$ linear in grid size.
  - **Detected Keywords**: `BFS / DFS on Grid` (High), `Connected Components / Disjoint Set Union` (High).
  - **Prescription Matrix**: Row 6 (Grid graph traversal $\to$ DFS / BFS with in-place sinking).
  - **Edge Case Warning**: Single cell `['1']`, all water `['0']`, all land.
- **Thinking Ladder Verification**:
  - Step 3: Loop scans grid rows and columns; when land `'1'` found, trigger component flood fill.
  - Step 6: Tool: BFS/DFS queue or recursion with visited marking.

---

### 8. Subsets
- **URL**: `https://leetcode.com/problems/subsets/`
- **Slug**: `subsets`
- **Difficulty**: Medium
- **Constraints**: $1 \le nums.length \le 10$, $-10 \le nums[i] \le 10$
- **Expected Insights**:
  - **Complexity Gauge**: $N \le 10 \implies$ Exponential tier $O(2^N \times N) \approx 1024$ states.
  - **Detected Keywords**: `Backtracking / Power Set` (High), `Bit Manipulation` (Medium).
  - **Test Case Visual**: Input size $N \to 2^N$ exponential power set.
  - **Prescription Matrix**: Row 9 (Combinatorial exploration $\to$ Include/Exclude Backtracking).
- **Thinking Ladder Verification**:
  - Step 2: Binary decision tree (take or don't take element at index $i$).
  - Step 6: Tool: Backtracking state-space tree or bitmask iteration.

---

## Interactive Features QA Verification

| Feature | Action to Test | Expected Behavior |
|---|---|---|
| **Keyboard Alt+C** | Press `Alt+C` on LeetCode page | Side panel smoothly opens / closes without layout shift. |
| **Keyboard Esc** | Press `Esc` with panel open | Panel closes smoothly. |
| **Tab Arrow Keys** | Focus on tab and press Left/Right arrows | Switches between Guided Ladder, Insights, and Ask Coach. |
| **Stepper Keyboard** | Focus on Stepper bar and press Left/Right arrows | Navigates between accessible Thinking Ladder steps. |
| **Tab Switching** | Switch between Description $\to$ Solutions $\to$ Description | Panel does NOT crash or lose parsed problem details. |
| **SPA Fast Navigation** | Rapidly click different problems in LeetCode problemset | Header and constraints update reliably without race conditions. |
| **LeetCode Dark/Light Mode** | Toggle theme on LeetCode | Panel instantly matches theme in real-time when in `Auto` mode. |
| **Spaced Revision** | Check Options reflections archive for 7d+ problems | "Revise Karo" badge appears in popup and options list. |
| **AI Mode (Optional)** | Enter Gemini/Claude key in Options $\to$ Open Ask Coach tab | AI gives Socratic questions in Hinglish; strictly refuses to provide code or direct solutions. |
