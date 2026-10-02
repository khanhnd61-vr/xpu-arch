// XPU Arch: renders the atlas from data/*.js.
// Every device diagram is data (rows, columns, blocks, tiles, frames and register
// files) drawn here as HTML, so all chips share one visual grammar.

(() => {
  const DATA = window.XPU;
  if (!DATA) return;

  const ENGINES = { cpp: 'vla.cpp', simd: 'vla.simd' };
  const HUB = '/vla-hub/';
  const ISSUES = 'https://github.com/khanhnd61-vr/xpu-arch/issues/new';
  // Links in an issue should point at the published page, also when the page is opened from disk
  const PAGE = location.protocol.startsWith('http') ? `${location.origin}${location.pathname}` : 'https://havi.fit/xpu-arch/';
  const GROUPS = [
    { id: 'gpu', name: 'Discrete GPUs', short: 'GPUs' },
    { id: 'soc', name: 'Systems on chip', short: 'SoCs' },
    { id: 'cpu', name: 'CPUs', short: 'CPUs' },
  ];

  const h = (tag, attrs = {}, html) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v);
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const cls = (...xs) => xs.filter(Boolean).join(' ');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mtag = ([e, label]) => `<span class="mtag mtag--${e}"><i>${ENGINES[e]}</i>${esc(label)}</span>`;

  // ---------------------------------------------------------------------------
  // GitHub issues: a prefilled report for a wrong diagram, a request for a new processor
  // ---------------------------------------------------------------------------
  const issueUrl = (title, body) => `${ISSUES}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  const reportUrl = () => issueUrl('Incorrect: ', [
    '### Device',
    '<!-- e.g. RTX 3090, Apple M4, Raspberry Pi 5 -->',
    '',
    '### What is wrong',
    '<!-- e.g. the L2 size in the chip diagram, a core count, a cluster layout, a measured tag -->',
    '',
    '### What it should be',
    '',
    '### Source',
    '<!-- a datasheet, whitepaper, die analysis or measurement that shows it -->',
    '',
    `Page: ${PAGE}`,
  ].join('\n'));
  const requestUrl = () => issueUrl('Request: ', [
    '### Processor',
    '<!-- name and model number -->',
    '',
    '### Kind',
    '<!-- CPU, GPU, NPU or system on chip -->',
    '',
    '### Why it would help',
    '<!-- e.g. you run a VLA policy on it, or it has results on VLA Hub -->',
    '',
    '### Sources',
    '<!-- a datasheet, whitepaper or die analysis, if you know one -->',
    '',
    `Page: ${PAGE}`,
  ].join('\n'));
  document.querySelectorAll('[data-issue="report"]').forEach((a) => { a.href = reportUrl(); });
  document.querySelectorAll('[data-issue="request"]').forEach((a) => { a.href = requestUrl(); });

  // ---------------------------------------------------------------------------
  // Block diagram grammar
  //   { row: [...] } { col: [...] }        flex containers; children may set f (flex weight)
  //   { b, s, k, h, lo, dash }              a block: label, sub-label, kind, height, low, dashed
  //   { tiles, cols, k, mix, off, th, lab } a grid of units; mix = [[n, kind], ...]; the
  //                                         last `off` tiles are drawn dashed (fused off)
  //   { frame, k, body, dir, chip, m }      a group; m = [[engine, label]] marks it measured
  //   { regs, bits, cols, tile, role }      a register file, one cell per 32-bit lane
  //   { cap, l }                            a caption line
  //   { rep, of, from }                     repeat a node; '$' in its strings becomes the index
  //   { core } { sm } { xe } { agpu }       macros for one CPU core, SM, Xe-core, Apple GPU core
  // Kinds: p performance core · e efficiency core · c cache · g / g2 GPU unit · x matrix
  // engine · n NPU · m memory · f other logic · o absent (fused off, or not on this SKU)
  // ---------------------------------------------------------------------------
  const subst = (node, i) => JSON.parse(JSON.stringify(node).replace(/\$/g, i));
  const expand = (list) => {
    const out = [];
    for (const c of list || []) {
      if (!c) continue;
      if (c.rep) for (let i = 0; i < c.rep; i++) out.push(subst(c.of, i + (c.from || 0)));
      else out.push(c);
    }
    return out;
  };
  const kids = (list, parent) => expand(list).forEach((c) => { const el = build(c); if (el) parent.appendChild(el); });
  // A frame whose first-level children carry measured tags needs room above them for the tags
  const topM = (body) => expand(body).some((c) => c.m || ((c.row || c.col) && expand(c.row || c.col).some((d) => d.m)));

  function build(n) {
    if (n.core) return build(coreMacro(n.core));
    if (n.sm) return build(smMacro(n.sm));
    if (n.xe) return build(xeMacro(n.xe));
    if (n.agpu) return build(agpuMacro(n.agpu));
    let el;
    if (n.row || n.col) {
      el = h('div', { class: cls(n.row ? 'L-row' : 'L-col', n.q && 'L-row--q') });
      kids(n.row || n.col, el);
      if (n.gap !== undefined) el.style.gap = `${n.gap}px`;
      if (n.al) el.style.alignItems = n.al;
    } else if (n.frame !== undefined) {
      el = h('div', { class: cls('frm', n.k && `frm--${n.k}`, n.dir === 'row' && 'frm--row', n.chip && 'frm--chip', n.m && 'is-m', topM(n.body) && 'frm--mt') });
      if (n.frame) el.appendChild(h('span', { class: 'frm__l', title: n.frame.replace(/<[^>]+>/g, '') }, n.frame));
      if (n.m) el.appendChild(h('span', { class: 'frm__m' }, n.m.map(mtag).join('')));
      kids(n.body, el);
    } else if (n.b !== undefined) {
      el = h('div', { class: cls('blk', `k-${n.k || 'f'}`, n.h && `blk--h${n.h}`, n.lo && 'blk--lo', n.dash && 'is-dash') },
        n.b + (n.s ? `<small>${n.s}</small>` : ''));
    } else if (n.tiles) {
      el = h('div', { class: cls('tiles', n.lab && 'tiles--lab') });
      el.style.setProperty('--cols', n.cols || n.tiles);
      if (n.th) el.style.setProperty('--th', `${n.th}px`);
      const kinds = [];
      (n.mix || [[n.tiles - (n.off || 0), n.k || 'g']]).forEach(([c, k]) => { for (let i = 0; i < c; i++) kinds.push(k); });
      while (kinds.length < n.tiles) kinds.push('o');
      kinds.forEach((k, i) => {
        const label = n.lab ? n.lab.replace('#', i) : undefined;
        el.appendChild(h('i', { class: `tile k-${k}`, title: k === 'o' ? 'fused off' : (n.tt ? `${n.tt} ${i}` : label) }, label));
      });
    } else if (n.regs) {
      const lanes = n.bits / 32;
      el = h('div', { class: 'regs', role: 'img', 'aria-label': `${n.regs} registers of ${n.bits} bits` });
      el.style.setProperty('--cols', n.cols || (n.regs <= 16 ? 4 : 8));
      const roles = [];
      if (n.tile) {
        const nv = n.tile.nr / lanes;
        const push = (c, r) => { for (let i = 0; i < c; i++) roles.push(r); };
        push(n.tile.mr * nv, 'r-acc'); push(nv, 'r-wt'); push(n.tile.op, 'r-op');
        while (roles.length < n.regs) roles.push('r-free');
      }
      for (let i = 0; i < n.regs; i++) {
        const bar = h('span', { class: cls('reg', roles[i] || n.role) });
        bar.style.setProperty('--lanes', lanes);
        bar.innerHTML = '<i></i>'.repeat(lanes);
        el.appendChild(bar);
      }
    } else if (n.cap !== undefined) {
      el = h('div', { class: cls('cap', n.l && 'cap--l') }, n.cap);
    } else {
      return null;
    }
    if (n.f) el.style.setProperty('--f', n.f);
    if (n.w) el.style.flex = `0 0 ${n.w}px`;
    if (n.t) el.title = n.t;
    return el;
  }

  const SW = { acc: 'accumulators', wt: 'weights', op: 'operands', free: 'free' };
  const swatch = (r) => `<i class="sw sw-${r}"></i>`;

  // One CPU core: its L1s, its architectural vector registers and pipes, its L2.
  // tile = vla.simd's FP32 SMK output tile on this ISA (from the vla.simd paper).
  function coreMacro(c) {
    const lanes = c.bits / 32;
    let tileCap = null;
    if (c.tile) {
      const nv = c.tile.nr / lanes;
      const acc = c.tile.mr * nv, used = acc + nv + c.tile.op;
      tileCap = { cap: `vla.simd ${c.tile.mr} × ${c.tile.nr} tile: ${swatch('acc')}${acc} + ${swatch('wt')}${nv} + ${swatch('op')}${c.tile.op} = ${used} of ${c.regs}`, l: true };
    }
    return {
      frame: c.title, k: c.k, f: c.f, body: [
        { row: [{ b: `L1i ${c.l1i}`, k: 'c', lo: true }, { b: `L1d ${c.l1d}`, k: 'c', lo: true }], gap: 4 },
        { cap: `${c.regs} × ${c.bits}-bit vector registers${c.rn ? ` (${c.rn})` : ''}`, l: true },
        { regs: c.regs, bits: c.bits, tile: c.tile, role: c.tile ? undefined : 'r-op' },
        tileCap,
        c.pipes ? { row: c.pipes.map((p) => ({ b: p, k: c.k, lo: true })), gap: 4 } : null,
        c.note ? { cap: c.note, l: true } : null,
        c.l2 ? { b: `L2 ${c.l2}`, s: c.l2s, k: 'c', lo: true } : null,
      ],
    };
  }

  // One NVIDIA SM: four partitions, each a warp scheduler, a register file,
  // 32 lanes and a tensor core, around a shared L1.
  function smMacro(s) {
    const part = {
      frame: 'Partition', k: 'g', body: [
        { b: 'Scheduler', k: 'f', lo: true, t: 'Warp scheduler: one 32-thread warp per clock' },
        { b: `RF ${s.rf}`, k: 'c', lo: true, t: 'Register file' },
        { tiles: 32, cols: 8, th: 8, mix: s.lanes.map(([n, , k]) => [n, k]) },
        { b: 'Tensor', s: s.tensor, k: 'x', lo: true },
      ],
    };
    return {
      frame: s.title, k: 'g', body: [
        { row: [part, part, part, part], gap: 4, q: true },
        { cap: `Per partition: a warp scheduler, a ${s.rf} register file (RF), 32 lanes (${s.lanes.map(([n, l, k]) => `${swatch(k)}${n} ${l}`).join(', ')}) and a Tensor Core`, l: true },
        { b: `L1 data cache / shared memory · ${s.l1}`, k: 'c', lo: true },
        s.extra ? { row: s.extra.map((e) => ({ b: e, k: 'f', lo: true })), gap: 4 } : null,
      ],
    };
  }

  // One Intel Xe-core: vector engines (XVE) and matrix engines (XMX) around an L1 / SLM.
  function xeMacro(x) {
    return {
      frame: x.title, k: 'g', body: [
        { cap: `${x.xve} vector engines (XVE), ${x.lanes * 32}-bit: ${x.lanes} FP32 lanes each`, l: true },
        { regs: x.xve, bits: x.lanes * 32, cols: x.cols || 4, role: 'r-op' },
        { cap: `${x.xmx} matrix engines (XMX), ${x.xmxBits}-bit`, l: true },
        { tiles: x.xmx, cols: 8, k: 'x', th: 12 },
        { b: `L1 cache / shared local memory · ${x.l1}`, k: 'c', lo: true },
        x.extra ? { row: x.extra.map((e) => ({ b: e, k: 'f', lo: true })), gap: 4 } : null,
      ],
    };
  }

  // One Apple GPU core: 128 FP32 ALUs, its on-chip memory, and on M5 a Neural Accelerator.
  function agpuMacro(a) {
    return {
      frame: a.title, k: 'g', body: [
        { cap: '128 FP32 ALUs: 16 execution units × 8', l: true },
        { tiles: 128, cols: 16, k: 'g', th: 8 },
        a.na ? { b: 'Neural Accelerator', s: 'matrix multiply inside the GPU core', k: 'x', lo: true } : null,
        { b: 'On-chip memory', s: a.mem, k: 'c', lo: true },
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // Legend
  // ---------------------------------------------------------------------------
  const LEGEND = [
    ['p', 'Big core (P, super)'], ['e', 'Small core (E, LP-E)'], ['c', 'Cache, on-chip memory'],
    ['g', 'GPU unit'], ['x', 'Matrix engine'], ['n', 'NPU'], ['m', 'Memory (DRAM)'],
    ['f', 'Other logic'], ['o', 'Fused off, or not in this SKU'],
  ];
  const legendRoot = document.querySelector('[data-legend]');
  if (legendRoot) {
    legendRoot.innerHTML = '<span class="legend__title">Blocks</span>'
      + LEGEND.map(([k, l]) => `<span class="legend__item"><i class="legend__sw k-${k}"></i>${l}</span>`).join('')
      + '<span class="legend__sep"></span>'
      + '<span class="legend__item"><i class="legend__sw legend__sw--m"></i>Measured in VLA Hub</span>';
  }

  // ---------------------------------------------------------------------------
  // Page
  // ---------------------------------------------------------------------------
  const devices = DATA.devices;
  const procsOf = (d) => [...new Set(d.measured.map(([, p]) => p))];
  const byEngine = (d) => d.measured.reduce((o, [e, p]) => { (o[e] ||= []).includes(p) || o[e].push(p); return o; }, {});

  // Hero stats: processors VLA Hub measured, by kind
  const setCount = (k, v) => document.querySelectorAll(`[data-count="${k}"]`).forEach((n) => { n.textContent = v; });
  setCount('devices', devices.length);
  for (const p of ['GPU', 'NPU', 'CPU']) setCount(p, devices.filter((d) => procsOf(d).includes(p)).length);

  // Register files
  document.querySelectorAll('[data-regs]').forEach((n) => {
    const spec = DATA.regfiles[n.dataset.regs];
    if (spec) n.appendChild(build(spec));
  });

  // Picker + device cards
  const side = document.querySelector('[data-side]');
  const list = document.querySelector('[data-devices]');
  for (const g of GROUPS) {
    const grp = h('div', { class: 'picker__group', 'data-group': g.id });
    grp.appendChild(h('span', { class: 'picker__group-title' }, g.short));
    for (const d of devices.filter((x) => x.group === g.id)) {
      grp.appendChild(h('a', { href: `#${d.id}`, 'data-nav': d.id, 'data-procs': procsOf(d).join(' ') }, esc(d.short)));
      list.appendChild(deviceCard(d));
    }
    side.appendChild(grp);
  }

  function figure(tag, node, cap, minw) {
    const f = h('figure', { class: 'fig' });
    f.appendChild(h('p', { class: 'fig__tag' }, tag));
    const scroll = h('div', { class: 'fig__scroll' });
    const body = h('div', { class: 'fig__body' });
    if (minw) body.style.setProperty('--minw', `${minw}px`);
    body.appendChild(build(node));
    scroll.appendChild(body);
    f.appendChild(scroll);
    if (cap) f.appendChild(h('figcaption', {}, cap));
    return f;
  }

  function deviceCard(d) {
    const sec = h('article', { class: 'dev', id: d.id, 'data-procs': procsOf(d).join(' ') });
    const head = h('header', { class: 'dev__head' });
    head.appendChild(h('div', {}, `<p class="dev__kicker">// ${esc(d.kind)} · ${esc(d.arch)}</p><h3 class="dev__name">${esc(d.name)}${d.alt ? `<small>${esc(d.alt)}</small>` : ''}</h3>`));
    head.appendChild(h('div', { class: 'dev__tags' }, d.measured.map(([e, p, b]) => mtag([e, `${p} · ${b}`])).join('')));
    head.appendChild(h('p', { class: 'dev__summary' }, d.summary));
    sec.appendChild(head);

    const ul = h('ul', { class: 'facts' });
    d.facts.forEach(([k, v]) => ul.appendChild(h('li', {}, `<span>${esc(k)}</span><b>${esc(v)}</b>`)));
    sec.appendChild(ul);

    const figs = h('div', { class: cls('figs', d.stack && 'figs--stack') });
    figs.appendChild(figure(d.chipTag || 'Chip', d.chip, d.chipCap, d.chipMin || 560));
    if (d.zoom?.length) {
      const z = h('div', { class: cls('zooms', d.zoomRow && 'zooms--row') });
      d.zoom.forEach((x) => z.appendChild(figure(x.tag, x.node, x.cap, x.minw || 300)));
      figs.appendChild(z);
    }
    sec.appendChild(figs);

    const src = h('p', { class: 'src' });
    src.innerHTML = '<span class="src__label">Sources</span>'
      + d.src.map(([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`).join('')
      + `<a class="hub" href="${HUB}?q=${encodeURIComponent(d.hubq || d.short)}">Its measurements on VLA Hub ↗</a>`;
    sec.appendChild(src);
    return sec;
  }

  // Compare table: one row per device, bandwidth on a log scale
  const tbody = document.querySelector('[data-compare]');
  const LOG_LO = Math.log10(10), LOG_HI = Math.log10(2000);
  for (const g of GROUPS) {
    tbody.appendChild(h('tr', { class: 'grp' }, `<td colspan="8">${g.name}</td>`));
    for (const d of devices.filter((x) => x.group === g.id)) {
      const c = d.cmp;
      const pct = Math.max(2, ((Math.log10(c.bw) - LOG_LO) / (LOG_HI - LOG_LO)) * 100);
      const tr = h('tr', { 'data-procs': procsOf(d).join(' ') });
      tr.innerHTML = `<th scope="row"><a href="#${d.id}">${esc(d.short)}</a><small>${esc(d.arch)}</small></th>`
        + `<td>${c.units}</td><td>${c.vec}</td><td class="num nw">${c.near}</td><td class="num nw">${c.llc}</td><td>${c.mem}</td>`
        + `<td><span class="bw"><span class="bw__v">${c.bwText || `${c.bw} GB/s`}</span><span class="bw__bar"><i style="width:${pct.toFixed(1)}%"></i></span></span></td>`
        + `<td><span class="mtags">${Object.entries(byEngine(d)).map(([e, ps]) => mtag([e, ps.join(' · ')])).join('')}</span></td>`;
      tbody.appendChild(tr);
    }
  }

  // Processor filter: devices where VLA Hub measured that kind of processor
  const filterBtns = document.querySelectorAll('[data-filter]');
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    const show = (n) => f === 'all' || n.dataset.procs.split(' ').includes(f);
    document.querySelectorAll('.dev, [data-nav]').forEach((n) => { n.hidden = !show(n); });
    document.querySelectorAll('.picker__group').forEach((g) => { g.hidden = !g.querySelector('a:not([hidden])'); });
  }));

  // Scrollspy for the picker
  const navLinks = Object.fromEntries([...document.querySelectorAll('[data-nav]')].map((a) => [a.dataset.nav, a]));
  const seen = new Map();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => seen.set(en.target.id, en.isIntersecting ? en.boundingClientRect.top : null));
    let best = null, bestTop = Infinity;
    for (const [id, top] of seen) if (top !== null && Math.abs(top) < bestTop) { best = id; bestTop = Math.abs(top); }
    if (!best) return;
    Object.values(navLinks).forEach((a) => a.classList.remove('is-current'));
    const cur = navLinks[best];
    if (!cur) return;
    cur.classList.add('is-current');
    const bar = cur.closest('.picker__groups');
    const l = cur.offsetLeft - bar.offsetLeft, r = l + cur.offsetWidth;
    if (l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: l - 40, behavior: 'smooth' });
  }, { rootMargin: '-90px 0px -55% 0px' });
  document.querySelectorAll('.dev').forEach((s) => spy.observe(s));

  // Mobile nav, footer year, reveal-on-scroll (as on the main site)
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
})();
