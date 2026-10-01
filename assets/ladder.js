// XPU Arch: the two zoom ladders of the Hierarchy section, drawn as inline SVG.
// Each ladder has five panels; a framed block in one panel is what the next
// panel zooms into, joined by a funnel.

(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1100, PW = 186, STEP = (W - PW) / 4, PY = 22, PH = 232, PAD = 10, H = PY + PH + 2;

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const text = (g, x, y, s, cls, anchor = 'middle') => {
    const t = el('text', { x, y, class: cls, 'text-anchor': anchor }, g);
    t.textContent = s;
    return t;
  };
  const box = (g, x, y, w, h, k, label, sub) => {
    el('rect', { x, y, width: w, height: h, rx: 3, class: `k-${k}` }, g);
    if (label) text(g, x + w / 2, y + h / 2 + (sub ? -1.5 : 3.2), label, `zl t-${k}`);
    if (sub) text(g, x + w / 2, y + h / 2 + 8.5, sub, `zl t-${k}`);
    return { x, y, w, h };
  };
  const frame = (g, x, y, w, h, label) => {
    el('rect', { x, y, width: w, height: h, rx: 6, class: 'grp' }, g);
    if (label) text(g, x + 5, y + 11, label, 'zs', 'start');
    return { x, y, w, h };
  };
  // A register drawn as its 32-bit lanes
  const reg = (g, x, y, w, h, lanes, k, hot = -1) => {
    const lw = (w - (lanes - 1)) / lanes;
    for (let i = 0; i < lanes; i++) {
      el('rect', { x: x + i * (lw + 1), y, width: lw, height: h, rx: 1, class: `k-${hot < 0 || hot === i ? k : 'g2'}` }, g);
    }
    return { x, y, w, h };
  };

  function chain(root, levels, label) {
    const scroll = root.querySelector('.chain__scroll');
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'zg', role: 'img', 'aria-label': label });
    const bg = el('g', {}, svg), fun = el('g', {}, svg), fg = el('g', {}, svg);
    levels.forEach((lv, i) => {
      const x = i * STEP;
      text(bg, x + 2, 12, `${i + 1} · ${lv.name.toUpperCase()}`, 'zn', 'start');
      el('rect', { x, y: PY, width: PW, height: PH, rx: 10, class: 'panel' }, bg);
      const f = lv.draw(fg, x + PAD, PY + PAD, PW - 2 * PAD, PH - 2 * PAD);
      if (f && i < levels.length - 1) {
        el('rect', { x: f.x - 2, y: f.y - 2, width: f.w + 4, height: f.h + 4, rx: 4, class: 'focus' }, fg);
        const nx = (i + 1) * STEP;
        el('polygon', { points: `${f.x + f.w + 2},${f.y - 2} ${nx},${PY} ${nx},${PY + PH} ${f.x + f.w + 2},${f.y + f.h + 2}`, class: 'funnel' }, fun);
      }
    });
    scroll.appendChild(svg);
    const caps = document.createElement('div');
    caps.className = 'chain__levels';
    caps.innerHTML = levels.map((lv) => `<p class="chain__level"><b>${lv.title}</b>${lv.text}<br><span class="mem">${lv.mem}</span></p>`).join('');
    scroll.appendChild(caps);
  }

  // ---------------------------------------------------------------------------
  // CPU: Raspberry Pi 5, from the BCM2712 package down to one FP32 lane
  // ---------------------------------------------------------------------------
  const CPU = [
    {
      name: 'Package', title: 'Package: BCM2712',
      text: 'One CPU cluster, a VideoCore VII GPU and the media and display blocks, all on one LPDDR4X channel.',
      mem: 'DRAM · 16 GB · 17 GB/s',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'BCM2712', 'zt', 'start');
        const f = frame(g, x, y + 18, w, 88, 'CPU cluster');
        const cw = (w - 10 - 9) / 4;
        for (let i = 0; i < 4; i++) box(g, x + 5 + i * (cw + 3), y + 36, cw, 34, 'p', 'A76');
        box(g, x + 5, y + 76, w - 10, 22, 'c', 'L3 2 MB');
        box(g, x, y + 116, 80, 34, 'g', 'VideoCore VII', 'GPU');
        box(g, x + 86, y + 116, 80, 34, 'f', 'ISP · codecs', 'display');
        box(g, x, y + h - 40, w, 40, 'm', 'LPDDR4X-4267', '32-bit · 17 GB/s');
        return f;
      },
    },
    {
      name: 'Cluster', title: 'Cluster: 4 × Cortex-A76',
      text: 'Four cores share a 2 MB L3 in the DynamIQ Shared Unit. Each core keeps its own L2.',
      mem: 'L3 · 2 MB, shared',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'Cortex-A76 × 4', 'zt', 'start');
        const cw = (w - 12) / 4;
        for (let i = 0; i < 4; i++) {
          box(g, x + i * (cw + 4), y + 18, cw, 76, 'p', `Core ${i}`);
          box(g, x + i * (cw + 4), y + 100, cw, 34, 'c', 'L2', '512 KB');
        }
        box(g, x, y + 142, w, 30, 'c', 'L3 2 MB', 'shared by the cluster');
        text(g, x + w / 2, y + h - 8, '↓ to LPDDR4X', 'zs');
        return { x, y: y + 18, w: cw, h: 116 };
      },
    },
    {
      name: 'Core', title: 'Core: one Cortex-A76',
      text: 'Private 64 KB L1 instruction and data caches and a private 512 KB L2.',
      mem: 'L1 · 64 + 64 KB · L2 · 512 KB',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'One Cortex-A76', 'zt', 'start');
        box(g, x, y + 18, 80, 30, 'c', 'L1i', '64 KB');
        box(g, x + 86, y + 18, 80, 30, 'c', 'L1d', '64 KB');
        box(g, x, y + 54, w, 30, 'f', 'Integer · load / store', 'out-of-order core');
        const f = frame(g, x, y + 90, w, 74, 'NEON / FP');
        box(g, x + 5, y + 106, w - 10, 22, 'op', '32 × 128-bit registers');
        const pw = (w - 14) / 2;
        box(g, x + 5, y + 134, pw, 24, 'p', 'FMA pipe 0');
        box(g, x + 9 + pw, y + 134, pw, 24, 'p', 'FMA pipe 1');
        box(g, x, y + 172, w, 32, 'c', 'L2 512 KB', 'private');
        return f;
      },
    },
    {
      name: 'Vector unit', title: 'Vector unit: NEON',
      text: '32 registers of 128 bits feed two FMA pipes. vla.simd keeps its 4 × 16 output tile in 16 of them.',
      mem: 'Registers · 32 × 128-bit',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'v0 – v31', 'zt', 'start');
        const bw = (w - 18) / 4;
        const role = (i) => (i < 16 ? 'acc' : i < 20 ? 'wt' : i < 24 ? 'op' : 'free');
        for (let i = 0; i < 32; i++) reg(g, x + (i % 4) * (bw + 6), y + 18 + Math.floor(i / 4) * 14, bw, 10, 4, role(i));
        const key = [['acc', '16 accumulators'], ['wt', '4 weights'], ['op', '4 operands'], ['free', '8 free']];
        key.forEach(([k, l], i) => {
          const kx = x + (i % 2) * 100, ky = y + 140 + Math.floor(i / 2) * 14;
          el('rect', { x: kx, y: ky - 7, width: 8, height: 8, rx: 1, class: `k-${k}` }, g);
          text(g, kx + 12, ky, l, 'zs', 'start');
        });
        const pw = (w - 6) / 2;
        box(g, x, y + 176, pw, 28, 'p', 'FMA', '128-bit');
        box(g, x + pw + 6, y + 176, pw, 28, 'p', 'FMA', '128-bit');
        return { x, y: y + 18, w: bw, h: 10 };
      },
    },
    {
      name: 'Lane', title: 'Lane: 32 bits',
      text: 'A register holds 4 FP32 lanes, and one fmla updates all four. With two pipes, a core does 8 multiply-adds a cycle.',
      mem: 'One FP32 value',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'fmla, lane by lane', 'zt', 'start');
        const lx = x + 30, lw = w - 30;
        ['0', '1', '2', '3'].forEach((s, i) => text(g, lx + (i + 0.5) * (lw / 4), y + 26, s, 'zs'));
        text(g, x, y + 44, 'v16', 'zs', 'start'); reg(g, lx, y + 32, lw, 18, 4, 'wt');
        text(g, x, y + 76, 'v20', 'zs', 'start'); reg(g, lx, y + 64, lw, 18, 4, 'op', 0);
        text(g, x, y + 108, 'v0', 'zs', 'start'); reg(g, lx, y + 96, lw, 18, 4, 'acc');
        text(g, lx + lw / 2, y + 130, 'v0 += v16 × v20[0]', 'zs');
        text(g, x, y + 160, 'fmla v0.4s, v16.4s, v20.s[0]', 'zs', 'start');
        text(g, x, y + 176, 'each lane: one FP32 FMA', 'zs', 'start');
        text(g, x, y + 192, '4 lanes × 2 pipes', 'zs', 'start');
        text(g, x, y + 208, '= 8 FMAs per cycle per core', 'zs', 'start');
        return null;
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // GPU: GeForce RTX 3090, from the GA102 die down to one CUDA core
  // ---------------------------------------------------------------------------
  const GPU = [
    {
      name: 'GPU', title: 'GPU: GA102',
      text: 'Seven GPCs around one 6 MB L2, over 24 GB of GDDR6X on a 384-bit bus.',
      mem: 'VRAM 24 GB · L2 6 MB',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'GA102 · RTX 3090', 'zt', 'start');
        const bw = (w - 12) / 4;
        for (let i = 0; i < 7; i++) box(g, x + (i % 4) * (bw + 4), y + 18 + Math.floor(i / 4) * 46, bw, 40, 'g', `GPC ${i}`);
        box(g, x, y + 112, w, 28, 'c', 'L2 cache 6 MB', 'shared by every SM');
        box(g, x, y + 146, w, 22, 'f', 'PCIe 4.0 · NVENC · display');
        box(g, x, y + h - 40, w, 40, 'm', '24 GB GDDR6X', '384-bit · 936 GB/s');
        return { x, y: y + 18, w: bw, h: 40 };
      },
    },
    {
      name: 'GPC', title: 'GPC: 6 TPCs, 12 SMs',
      text: 'A raster engine and six texture processing clusters of two SMs each. The RTX 3090 runs 82 of the die\'s 84 SMs.',
      mem: 'No cache of its own: shares the L2',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'Graphics processing cluster', 'zt', 'start');
        box(g, x, y + 18, w, 20, 'f', 'Raster engine');
        const tw = (w - 10) / 3, th = 66;
        let f = null;
        for (let i = 0; i < 6; i++) {
          const tx = x + (i % 3) * (tw + 5), ty = y + 46 + Math.floor(i / 3) * (th + 8);
          frame(g, tx, ty, tw, th, 'TPC');
          const sw = (tw - 13) / 2;
          const a = box(g, tx + 5, ty + 17, sw, 42, 'g', 'SM');
          box(g, tx + 8 + sw, ty + 17, sw, 42, 'g', 'SM');
          if (i === 0) f = a;
        }
        text(g, x + w / 2, y + h - 8, '12 SMs per GPC', 'zs');
        return f;
      },
    },
    {
      name: 'SM', title: 'SM: streaming multiprocessor',
      text: 'Four partitions share 128 KB that is split between L1 cache and shared memory, plus an RT core and texture units.',
      mem: 'L1 / shared · 128 KB',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'One SM', 'zt', 'start');
        const pw = (w - 6) / 2, ph = 58;
        let f = null;
        for (let i = 0; i < 4; i++) {
          const px = x + (i % 2) * (pw + 6), py = y + 18 + Math.floor(i / 2) * (ph + 6);
          const r = box(g, px, py, pw, ph, 'g');
          text(g, px + pw / 2, py + 13, `Partition ${i}`, 'zl t-g');
          const tw = (pw - 10 - 15) / 16;
          for (let j = 0; j < 32; j++) {
            el('rect', { x: px + 5 + (j % 16) * (tw + 1), y: py + 22 + Math.floor(j / 16) * 9, width: tw, height: 7, rx: 1, class: j < 16 ? 'k-g' : 'k-g2' }, g);
          }
          box(g, px + 5, py + 42, pw - 10, 11, 'x');
          if (i === 0) f = r;
        }
        box(g, x, y + 148, w, 26, 'c', 'L1 / shared memory', '128 KB');
        const bw = (w - 6) / 2;
        box(g, x, y + 180, bw, 24, 'f', 'RT core', '2nd gen');
        box(g, x + bw + 6, y + 180, bw, 24, 'f', 'Texture', '4 units');
        return f;
      },
    },
    {
      name: 'Partition', title: 'Partition: one warp at a time',
      text: 'A warp scheduler issues one 32-thread instruction per clock to 32 lanes. A 64 KB register file holds the registers of every resident thread.',
      mem: 'Register file · 64 KB',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'One SM partition', 'zt', 'start');
        box(g, x, y + 18, w, 26, 'f', 'Warp scheduler · dispatch', '32 threads / clk');
        box(g, x, y + 50, w, 26, 'c', 'Register file 64 KB', '16,384 × 32-bit');
        const tw = (w - 15 * 2) / 16;
        let f = null;
        for (let j = 0; j < 32; j++) {
          const r = { x: x + (j % 16) * (tw + 2), y: y + 84 + Math.floor(j / 16) * 18, w: tw, h: 14 };
          el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 1, class: j < 16 ? 'k-g' : 'k-g2' }, g);
          if (j === 0) f = r;
        }
        text(g, x, y + 128, '16 FP32 + 16 FP32 / INT32', 'zs', 'start');
        box(g, x, y + 138, w, 26, 'x', 'Tensor Core', '3rd gen');
        box(g, x, y + 170, w, 22, 'f', 'Load / store · SFU');
        return f;
      },
    },
    {
      name: 'Lane', title: 'Lane: one CUDA core',
      text: 'Each lane runs one thread of the warp, one FP32 multiply-add per clock, out of its own registers.',
      mem: 'Up to 255 registers per thread',
      draw(g, x, y, w, h) {
        text(g, x, y + 8, 'One thread of a warp', 'zt', 'start');
        text(g, x, y + 26, 'one warp: 32 threads', 'zs', 'start');
        const tw = (w - 15 * 2) / 16;
        for (let j = 0; j < 32; j++) {
          el('rect', { x: x + (j % 16) * (tw + 2), y: y + 34 + Math.floor(j / 16) * 16, width: tw, height: 12, rx: 1, class: j === 0 ? 'k-g' : 'k-g2' }, g);
        }
        el('rect', { x: x - 1.5, y: y + 32.5, width: tw + 3, height: 15, rx: 2, class: 'focus' }, g);
        text(g, x, y + 86, 'thread 0: its registers', 'zs', 'start');
        const rw = (w - 7 * 3) / 8;
        for (let i = 0; i < 8; i++) {
          const rx = x + i * (rw + 3);
          if (i === 6) { text(g, rx + rw / 2, y + 106, '…', 'zs'); continue; }
          box(g, rx, y + 94, rw, 18, 'c', i === 7 ? 'R254' : `R${i}`);
        }
        text(g, x, y + 140, 'FFMA R0, R1, R2, R0', 'zs', 'start');
        text(g, x, y + 156, 'each lane: one FP32 FMA', 'zs', 'start');
        text(g, x, y + 172, '32 lanes × 4 partitions', 'zs', 'start');
        text(g, x, y + 188, '= 128 FMAs per SM per clock', 'zs', 'start');
        return null;
      },
    },
  ];

  const cpuRoot = document.querySelector('[data-chain="cpu"]');
  const gpuRoot = document.querySelector('[data-chain="gpu"]');
  if (cpuRoot) chain(cpuRoot, CPU, 'Zoom from the Raspberry Pi 5 package to one FP32 lane of a NEON register');
  if (gpuRoot) chain(gpuRoot, GPU, 'Zoom from the RTX 3090 GA102 die to one CUDA core');
})();
