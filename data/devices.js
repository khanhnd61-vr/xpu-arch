// XPU Arch data. Each file under data/ pushes its devices onto XPU.devices, in
// VLA Hub's display order within each group (gpu, soc, cpu).
//
// A device:
//   id, short, name, alt   anchor, picker label, full name, die or variant
//   hubq                   its search on VLA Hub (the device's short name there)
//   group, kind, arch      picker group, kicker line
//   measured               [[engine, processor, backend]], as in VLA Hub's data/bench.js
//   summary, facts         lede (HTML) and [label, value] chips
//   chip, chipCap          the chip diagram (see the grammar in assets/xpu.js) and its caption
//   zoom                   [{tag, node, cap}]: one unit of the chip, drawn larger
//   cmp                    the row in the compare table; bw in GB/s
//   src                    [[label, url]]

window.XPU = {
  devices: [],

  // Register files of the Registers section. The tiles are vla.simd's FP32 SMK
  // output tiles per instruction set, from its paper.
  regfiles: {
    avx2: { regs: 16, bits: 256, cols: 4, tile: { mr: 6, nr: 16, op: 1 } },
    neon: { regs: 32, bits: 128, cols: 8, tile: { mr: 4, nr: 16, op: 4 } },
  },
};
