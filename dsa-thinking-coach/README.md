# DSA Thinking Coach (Chrome Extension)

LeetCode problem page pe side panel (🧠 button, bottom-right) kholta hai aur
Prem ke *DSA Logic Building Playbook* ke hisaab se sochne ka tareeka batata hai:

- Constraints parse karke target complexity (n=10^5 -> O(n log n) ...) + TLE check
- Test case se output type / size-relation hint + paper-trace ke 3 sawal
- Keywords -> candidate technique (spoiler-gated button ke peeche)
- Brute force -> Waste -> Tool matrix (matched row highlight hoti hai)
- Edge-case checklist + 8-step Thinking Ladder (progress har problem ke liye save hota hai)
- 20 min stuck timer

## Install (Chrome / Edge / Brave)
1. Is folder ko unzip karo.
2. `chrome://extensions` kholo -> **Developer mode** ON.
3. **Load unpacked** -> `dsa-thinking-coach` folder chuno.
4. Koi bhi `https://leetcode.com/problems/two-sum/` jaisa page kholo -> 🧠 pe click.

## Files
- `rules.js`   - sara "dimag": constraint parser, complexity tiers, keyword table, waste->tool matrix
- `content.js` - page se problem padhta hai aur panel banata hai
- `panel.css`  - styling
- `manifest.json`

## Customize
- Naya keyword/pattern: `rules.js` me `KEYWORDS` array me ek object add karo.
- Agar LeetCode UI badle aur panel nahi dikhe: `content.js` me `DESC_SELECTOR` update karo.
