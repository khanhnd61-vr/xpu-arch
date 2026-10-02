# XPU Arch

Block diagrams of the CPUs, GPUs, NPUs and systems on chip behind
[VLA Hub](https://havi.fit/vla-hub/), from the package down to one lane: core clusters
and the caches they share, GPU clusters and their SMs, register files, and the memory
under all of them. It uses the theme of the main site ([havi.fit](https://havi.fit/)).
There is no build step: open `index.html`, or serve the folder with any static server.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Files

| Path | What it holds |
|---|---|
| `index.html` | Page shell: hero, hierarchy ladders, register files, devices, compare table, notes |
| `assets/site.css` | Main-site palette and fonts, plus the diagram styles |
| `assets/ladder.js` | The two zoom ladders (Raspberry Pi 5 and RTX 3090), drawn as inline SVG |
| `assets/xpu.js` | Renders every device diagram from data as HTML, and runs the page (picker, filter, scrollspy) |
| `data/devices.js` | The `XPU` container, the device fields, and the register files |
| `data/{gpu,soc,cpu}.js` | One file per picker group; each pushes its devices in VLA Hub's order |

## Diagram data

A device's `chip` and each `zoom` node are trees of a small layout grammar:

```js
{ frame: 'GPU · 7 GPCs, 82 of 84 SMs', k: 'g', m: [['cpp', 'CUDA']], body: [
  { row: [{ rep: 7, of: { frame: 'GPC $', body: [{ tiles: 12, cols: 4, tt: 'SM' }] } }] },
  { b: 'L2 cache 6 MB', s: 'shared by every SM', k: 'c' },
] }
```

- `row` and `col` lay children out; a child's `f` is its flex weight.
- `b` is a block with sub-label `s`; `tiles` is a grid of `tiles` units, the last `off` of
  them dashed (fused off); `regs` is a register file of `regs` × `bits`, with an optional
  vla.simd `tile` colouring it.
- `frame` groups `body`; `m` marks it as measured on VLA Hub, as `[engine, backend]`.
- `rep` repeats `of`, with `$` replaced by the index.
- `core`, `sm`, `xe` and `agpu` are macros for one CPU core, NVIDIA SM, Intel Xe-core
  and Apple GPU core.
- Kinds (`k`): `p` big core, `e` small core, `c` cache, `g`/`g2` GPU unit, `x` matrix
  engine, `n` NPU, `m` memory, `f` other logic, `o` absent.

## Updating

A new device in VLA Hub needs an entry in the matching `data/*.js` file, with `measured`
copied from the processors and backends in VLA Hub's `data/bench.js`, and `hubq` set to
the device's short name there. Every card links its sources; cite one for any new number.

Readers report a wrong diagram or ask for a new processor through the buttons on the page:
each opens a prefilled issue at [khanhnd61-vr/xpu-arch/issues](https://github.com/khanhnd61-vr/xpu-arch/issues).
The templates live in `reportUrl` and `requestUrl` in `assets/xpu.js`.
