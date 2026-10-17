/* DSA Thinking Coach - content script (runs on leetcode.com/problems/*) */
(() => {
  const R = DSA_RULES;
  const DESC_SELECTOR = '[data-track-load="description_content"]';

  let currentSlug = null;
  let startedAt = Date.now();
  let timerEl = null;
  let saved = { checks: {} };

  // ---------- tiny DOM helper (textContent only -> no HTML injection) ----------
  const el = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    kids.flat().forEach((c) => c != null && e.append(c));
    return e;
  };
  const section = (title, open, ...kids) => {
    const d = el('details', { class: 'dsc-sec' }, el('summary', { text: title }), el('div', { class: 'dsc-sec-body' }, ...kids));
    if (open) d.open = true;
    return d;
  };
  const ul = (items, cls = '') => el('ul', { class: cls }, items.map((t) => el('li', { text: t })));
  const note = (t, cls = '') => el('p', { class: 'dsc-note ' + cls, text: t });

  // ---------- storage ----------
  const store = {
    get: (key) => new Promise((res) => { try { chrome.storage.local.get(key, (r) => res(r[key])); } catch { res(undefined); } }),
    set: (key, val) => { try { chrome.storage.local.set({ [key]: val }); } catch { /* ignore */ } },
  };

  // ---------- read problem from page ----------
  const cleanText = (node) => {
    const c = node.cloneNode(true);
    c.querySelectorAll('sup').forEach((s) => s.replaceWith('^' + s.textContent));
    return c.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const readProblem = (root, slug) => {
    const fullText = cleanText(root);
    const lis = [...root.querySelectorAll('li')].map(cleanText).filter((t) => /(<=|≤|>=|≥)/.test(t));
    const titleEl = document.querySelector('a[href^="/problems/"][class*="cursor-text"], div[data-cy="question-title"]');
    const title = (titleEl && titleEl.textContent.trim()) || document.title.replace(/\s*-\s*LeetCode.*/, '');
    const examples = R.parseExamples(fullText);
    return {
      slug, title, fullText, examples,
      constraintLines: lis,
      analysis: R.analyzeConstraints(lis),
      hits: R.matchKeywords(fullText + ' ' + slug.replace(/-/g, ' ') + ' ' + title),
    };
  };

  // ---------- sections ----------
  const secProblem = (d) => {
    const ex = d.examples[0];
    const vars = ex ? [...ex.input.matchAll(/(\w+)\s*=/g)].map((m) => m[1]) : [];
    const outType = ex ? R.OUTPUT_HINT[R.classifyOutput(ex.output)] : null;
    const a = d.analysis;
    const flags = [];
    flags.push(/sorted/i.test(d.fullText) ? '✅ "sorted" mention hai -> Two Pointers / Binary Search ke chance zyada.' : 'ℹ️ Sorted ka mention nahi - sort karna allowed/useful ho sakta hai?');
    if (a.negatives) flags.push('⚠️ Negative values allowed hain -> Sliding Window tootegi, Prefix Sum + Map socho.');
    if (a.sizeLo !== null) flags.push(a.sizeLo >= 1 ? `✅ Min size ${a.sizeLo} hai -> empty input nahi aayega.` : '⚠️ Size 0 ho sakta hai -> empty input handle karo.');
    if (/duplicate/i.test(d.fullText)) flags.push('ℹ️ Duplicates ka zikr hai - unka behaviour dhyan se padho.');
    return section('🔎 Step 1-2: Problem samjho', true,
      note('Code nahi, pehle 5 sawal (khud jawab do):'),
      ul([
        '1. Problem ko apne words me 1 line me bolo.',
        `2. Input kya hai?${vars.length ? ' (variables: ' + vars.join(', ') + ')' : ''}`,
        `3. Output kya chahiye?${outType ? ' -> ' + outType[0] : ''}`,
        '4. Sorted? Duplicates? Negatives? Empty?',
        '5. Constraints me n kitna bada hai? (neeche dekho)',
      ]),
      ul(flags, 'dsc-flags'));
  };

  const secConstraints = (d) => {
    const a = d.analysis;
    if (!a.parsed.length) {
      return section('⏱️ Constraints se complexity', true, note('Constraints auto-parse nahi hue. Manually padho: n kitna bada hai? (10^5 => O(n log n), 10^4 => O(n^2) borderline, 20 => 2^n).'));
    }
    const kids = [ul(a.parsed.map((p) => `${p.name}:  ${p.lo ?? '-'} .. ${p.hi ?? '-'}`), 'dsc-mono')];
    if (a.sizeMax !== null) {
      const t = R.tierFor(a.sizeMax);
      kids.push(el('div', { class: 'dsc-callout' },
        el('b', { text: `n ≈ ${a.sizeMax.toLocaleString()}  →  target ${t.big}` }),
        el('div', { text: t.tech })));
      const n2 = a.sizeMax ** 2;
      kids.push(ul([
        `O(n^2) brute force = ${R.pow10(n2)} ops  ${n2 > 1e8 ? '❌ TLE (limit ~10^8/sec)' : '✅ chal sakta hai'}`,
        ...(a.sizeMax <= 500 ? [`O(n^3) = ${R.pow10(a.sizeMax ** 3)} ops  ${a.sizeMax ** 3 > 1e8 ? '❌ TLE' : '✅ chal sakta hai'}`] : []),
      ]));
    }
    if (a.valHi !== null && a.valHi >= 1e9) kids.push(note('💥 Values ~10^9 hain -> sum/product me int overflow ho sakta hai, long use karo.', 'dsc-warn'));
    else if (a.valHi !== null && a.sizeMax !== null && a.valHi * a.sizeMax >= 2.1e9) kids.push(note('💥 n × value 2^31 paar kar sakta hai -> sum ke liye long.', 'dsc-warn'));
    return section('⏱️ Constraints se complexity', true, ...kids);
  };

  const secTestCase = (d) => {
    const ex = d.examples[0];
    const kids = [];
    if (ex) {
      const type = R.classifyOutput(ex.output);
      kids.push(el('div', { class: 'dsc-callout dsc-mono' }, el('div', { text: 'Input:  ' + ex.input }), el('div', { text: 'Output: ' + ex.output })));
      const il = R.arrLen(ex.input), ol = type === 'array' ? R.arrLen(ex.output) : null;
      const rel = ol !== null && il !== null ? `Size check: input array ${il} -> output ${ol} elements.` : null;
      if (rel) kids.push(note(rel));
      kids.push(note(`Output type hint: ${R.OUTPUT_HINT[type][1]}`));
    }
    kids.push(
      note('Ab Example 1 ko paper pe insaan ki tarah solve karo, phir ye 3 sawal:'),
      ul(['🔁 Maine kaunsa kaam baar-baar kiya?  → wahi LOOP hai', '🧠 Pichhle step ka kya yaad rakha?  → wahi VARIABLE / DATA STRUCTURE hai', '🛑 Kab ruka?  → wahi STOP condition hai']),
      note('Atak gaye? 6 nazar se dekho:'),
      ul([
        '📏 Size: n→n, n→1, n→2^n, n→n! ?',
        '🔄 Kya badla, kya same raha?',
        '🪜 n = 1,2,3,4 ke answers likho - pattern/recurrence dikhega',
        '⏪ Output se ulta chalo',
        '⚠️ Extreme case: sab same / sorted / negatives',
        '🥊 Apni trick ko todne wala counter-example banao',
      ]));
    return section('🧪 Step 3: Test case se logic nikalo', false, ...kids);
  };

  const secKeywords = (d) => {
    const wrap = el('div');
    const hint = el('div', { class: 'dsc-hidden' });
    if (!d.hits.length) hint.append(note('Koi strong keyword nahi mila. Brute force se shuru karo aur bottleneck dhoondo.'));
    d.hits.forEach((h) => hint.append(el('div', { class: 'dsc-hit' },
      el('b', { text: '🧰 ' + h.tool }), el('div', { text: 'Kyun: ' + h.why }), el('div', { class: 'dsc-ask', text: '❓ ' + h.ask }))));
    hint.style.display = 'none';
    const btn = el('button', { class: 'dsc-btn', text: '🔓 Pehle 2-3 min khud socho... phir hint dikhao', onclick: () => {
      hint.style.display = 'block'; btn.remove();
    } });
    wrap.append(note('Problem text me jo keywords mile unke hisaab se candidate techniques (spoiler-gated):'), btn, hint);
    return section('🔑 Keywords se technique', false, wrap);
  };

  const secBrute = (d) => {
    const rows = new Set(d.hits.map((h) => h.row).filter((r) => r !== null && r !== undefined));
    const table = el('div', { class: 'dsc-matrix' }, R.WASTE_TOOL.map((r, i) => el('div', { class: 'dsc-row' + (rows.has(i) ? ' dsc-hl' : '') },
      el('div', { text: '🚨 ' + r[0] }), el('div', { text: '🧰 ' + r[1] + '   ⚡ ' + r[2] }))));
    return section('🔨 Step 4-6: Brute force → Waste → Tool', false,
      ul(['Sabse simple tareeka kya hai (saari possibilities)? Complexity?', 'Constraints se compare: ye TLE dega?', 'Brute force me kaunsa kaam baar-baar / bina wajah repeat ho raha hai?', 'Us waste ko hatane wala tool kaunsa? (neeche matrix, highlighted = keywords se match)']),
      table);
  };

  const EDGE = [
    ['e1', '📭 Empty input'], ['e2', '1️⃣ Single element'], ['e3', '👯 Sab elements identical'],
    ['e4', '➖ Negative / Zero'], ['e5', '🔁 Duplicates'], ['e6', '📶 Already sorted / reverse sorted'],
    ['e7', '💥 Integer overflow (long?)'], ['e8', '🚫 Index out of bounds (i±1, mid-1)'], ['e9', '❓ No solution -> default return (-1 / [] / null)'],
  ];
  const checklist = (items) => el('div', { class: 'dsc-checks' }, items.map(([id, label]) => {
    const cb = el('input', { type: 'checkbox' });
    cb.checked = !!saved.checks[id];
    cb.addEventListener('change', () => { saved.checks[id] = cb.checked; store.set('dsa:' + currentSlug, saved); });
    return el('label', {}, cb, ' ' + label);
  }));
  const secEdge = () => section('✅ Step 7: Edge cases (code se pehle)', false, checklist(EDGE));

  const LADDER = [
    ['l1', '👁️ Observe - input se output kaise bana?'], ['l2', '✍️ Manual solve - pen-paper pe 3-4 elements'],
    ['l3', '🏷️ Naam do - loop aur variable pehchano'], ['l4', '🔨 Brute force + complexity'],
    ['l5', '🔍 Waste dhoondo (bottleneck)'], ['l6', '🧰 Tool chuno (matrix se)'],
    ['l7', '🧪 Dry run trace table'], ['l8', '💻 Ab code likho'],
  ];
  const secLadder = () => section('🪜 Thinking Ladder (progress)', false, checklist(LADDER));

  const secStuck = () => {
    timerEl = el('p', { class: 'dsc-note', text: '' });
    return section('🆘 Atak gaye?', false, timerEl,
      ul(['Sabse chhota input (2-3 elements) paper pe solve karo', 'Brute force bhi nahi soojh raha? "saari possibilities try karo" socho', 'Sorting ya extra HashMap se faayda hai?', '15-20 min stuck? Solution dekho, SAMJHO, 2 din baad scratch se likho']));
  };

  const updateTimer = () => {
    if (!timerEl) return;
    const m = Math.floor((Date.now() - startedAt) / 60000);
    timerEl.textContent = m >= 20 ? `⏳ ${m} min ho gaye - ab solution/editorial dekh ke samjho, phir 2 din baad dobara try karo.`
      : m >= 15 ? `⏳ ${m} min - thoda aur socho, 20 min pe stuck guide follow karo.` : `⏱️ ${m} min ho gaye. 20 min tak khud try karo.`;
  };
  setInterval(updateTimer, 30000);

  // ---------- panel shell ----------
  let rootEl, panelBody, titleEl;
  const ensureShell = async () => {
    if (rootEl && document.contains(rootEl)) return;
    rootEl = el('div', { id: 'dsa-coach-root' });
    const open = (await store.get('dsa:open')) ?? false;
    titleEl = el('div', { class: 'dsc-title', text: '🧠 DSA Thinking Coach' });
    panelBody = el('div', { class: 'dsc-body' });
    const panel = el('div', { id: 'dsa-coach-panel' }, el('div', { class: 'dsc-head' }, titleEl,
      el('button', { class: 'dsc-x', text: '✕', onclick: () => toggle(false) })), panelBody);
    const fab = el('button', { id: 'dsa-coach-fab', text: '🧠', title: 'DSA Thinking Coach', onclick: () => toggle() });
    const toggle = (force) => {
      const show = force ?? panel.style.display === 'none';
      panel.style.display = show ? 'flex' : 'none';
      store.set('dsa:open', show);
    };
    panel.style.display = open ? 'flex' : 'none';
    rootEl.append(panel, fab);
    document.body.append(rootEl);
  };

  const render = async (d) => {
    await ensureShell();
    saved = (await store.get('dsa:' + d.slug)) || { checks: {} };
    startedAt = Date.now();
    titleEl.textContent = '🧠 ' + (d.title || d.slug);
    panelBody.replaceChildren(
      note('Ye coach solution nahi deta - sochne ka tareeka batata hai. Har section khud try karke kholo.', 'dsc-intro'),
      secProblem(d), secConstraints(d), secTestCase(d), secKeywords(d), secBrute(d), secEdge(), secLadder(), secStuck());
    updateTimer();
  };

  // ---------- SPA navigation watcher ----------
  const tick = () => {
    const m = location.pathname.match(/^\/problems\/([^/]+)/);
    if (!m) return;
    const slug = m[1];
    if (slug === currentSlug) return;
    const root = document.querySelector(DESC_SELECTOR);
    if (!root || root.textContent.trim().length < 80) return; // description abhi load nahi hua
    currentSlug = slug;
    render(readProblem(root, slug));
  };
  setInterval(tick, 1000);
  tick();
})();
