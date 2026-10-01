// CPUs, drawn the way the vla.simd video draws its device set: a row of cores,
// the L2 under each core or cluster, and the L3 they all share.
(() => {
  const AVX2_TILE = { mr: 6, nr: 16, op: 1 };
  const NEON_TILE = { mr: 4, nr: 16, op: 4 };
  const pcol = (l2) => ({ col: [{ b: 'P$', k: 'p', h: 2 }, { b: l2, k: 'c', lo: true }] });
  const ecluster = (off) => ({
    f: 1.9, col: [
      { tiles: 4, cols: 4, k: off ? 'o' : 'e', lab: off ? 'off' : 'E', th: 32 },
      { b: 'L2 4 MB · cluster', k: off ? 'o' : 'c', lo: true },
    ],
  });
  const raptorCove = (l2s) => ({ core: { title: 'P-core · Raptor Cove', k: 'p', l1i: '32 KB', l1d: '48 KB', regs: 16, bits: 256, rn: 'ymm0–15', tile: AVX2_TILE, pipes: ['FMA 256', 'FMA 256'], l2: '2 MB', l2s } });
  const gracemont = { core: { title: 'E-core · Gracemont', k: 'e', l1i: '64 KB', l1d: '32 KB', regs: 16, bits: 256, rn: 'ymm0–15', tile: AVX2_TILE, note: 'Its vector pipes are 128 bits wide, so each 256-bit AVX2 instruction runs as two halves.', l2: '4 MB', l2s: 'shared by the 4-core cluster' } };
  const HYBRID_CAP = 'Both core types see the same 16 ymm registers, so vla.simd uses one 6 × 16 tile on all of them. The E-core does each 256-bit FMA in two 128-bit halves.';

  XPU.devices.push(
    {
      id: 'i7', stack: true, zoomRow: true, short: 'i7-14700F', hubq: 'Core i7-14700F', name: 'Intel Core i7-14700F', alt: 'Raptor Lake-S Refresh',
      group: 'cpu', kind: 'Desktop CPU', arch: 'Raptor Lake',
      measured: [['cpp', 'CPU', 'ggml'], ['simd', 'CPU', 'AVX2']],
      summary: 'A hybrid desktop CPU: <b>8 Raptor Cove P-cores</b> with 2 MB of L2 each and <b>12 Gracemont E-cores</b> in three clusters of four that each share 4 MB, all on a ring around a 33 MB L3. One E-core cluster and the integrated graphics are disabled on this model.',
      facts: [['Cores', '8P + 12E · 28 threads'], ['Turbo', 'P 5.3 (5.4) · E 4.2 GHz'], ['L2', '8 × 2 MB + 3 × 4 MB'], ['L3', '33 MB'], ['ISA', 'AVX2 · AVX-VNNI'], ['Memory', '64 GB · up to DDR5-5600'], ['Bandwidth', 'up to 89.6 GB/s'], ['Base power', '65 W']],
      chipMin: 620,
      chip: {
        col: [
          {
            frame: 'Core i7-14700F · Raptor Lake die (8P + 16E)', chip: true, body: [
              {
                frame: 'CPU · on the ring bus', k: 'p', m: [['cpp', 'ggml'], ['simd', 'AVX2']], body: [
                  { row: [{ rep: 8, of: pcol('L2 2M') }], gap: 4 },
                  { row: [ecluster(), ecluster(), ecluster(), ecluster(true)], gap: 4 },
                  { b: 'L3 33 MB', s: '36 MB on the die · shared by all 20 cores', k: 'c' },
                ],
              },
              { row: [{ b: 'UHD Graphics 770', s: 'disabled on the F model', k: 'o' }, { b: 'Memory controller', s: 'DDR5-5600 or DDR4-3200, 2 channels', k: 'f' }] },
            ],
          },
          { b: '64 GB system memory', s: 'up to DDR5-5600 · 2 channels · 89.6 GB/s', k: 'm' },
        ],
      },
      chipCap: 'The die is the one in the i9-14900HX below; this model turns off one E-core cluster and 3 MB of L3. 5.4 GHz is the Turbo Boost Max speed of its two best cores. VLA Hub capped it at 65 W.',
      zoom: [
        { tag: 'One P-core', node: raptorCove('private · 2 threads with Hyper-Threading'), cap: 'Two 256-bit FMA pipes. vla.simd\'s 6 × 16 tile takes 15 of the 16 ymm registers.' },
        { tag: 'One E-core', node: gracemont, cap: HYBRID_CAP },
      ],
      cmp: { units: '8P + 12E', vec: 'AVX2 · 2 × 256-bit FMA / P-core', near: 'L2 2 MB / P-core', llc: 'L3 33 MB', mem: '64 GB DDR', bw: 89.6, bwText: '≤ 89.6 GB/s' },
      src: [
        ['Intel ARK: Core i7-14700F', 'https://www.intel.com/content/www/us/en/products/sku/236854/intel-core-i7-processor-14700f-33m-cache-up-to-5-40-ghz/specifications.html'],
        ['Raptor Lake (Wikipedia)', 'https://en.wikipedia.org/wiki/Raptor_Lake'],
      ],
    },
    {
      id: 'i9', stack: true, zoomRow: true, short: 'i9-14900HX', hubq: 'Core i9-14900HX', name: 'Intel Core i9-14900HX', alt: 'Raptor Lake-HX Refresh',
      group: 'cpu', kind: 'Laptop CPU', arch: 'Raptor Lake',
      measured: [['cpp', 'CPU', 'ggml'], ['simd', 'CPU', 'AVX2']],
      summary: 'The full Raptor Lake die in a laptop: <b>8 P-cores and 16 E-cores</b> in four clusters, with a 36 MB L3. Two core types, two L1 sizes and two L2 arrangements serve one thread team. Under VLA Hub\'s sustained load it was limited by power and heat, at a median 92 °C.',
      facts: [['Cores', '8P + 16E · 32 threads'], ['Turbo', 'P 5.8 · E 4.1 GHz'], ['L2', '8 × 2 MB + 4 × 4 MB'], ['L3', '36 MB'], ['ISA', 'AVX2 · AVX-VNNI'], ['Memory', '32 GB · up to DDR5-5600'], ['Bandwidth', 'up to 89.6 GB/s'], ['iGPU', 'UHD Graphics']],
      chipMin: 620,
      chip: {
        col: [
          {
            frame: 'Core i9-14900HX · Raptor Lake die (8P + 16E)', chip: true, body: [
              {
                frame: 'CPU · on the ring bus', k: 'p', m: [['cpp', 'ggml'], ['simd', 'AVX2']], body: [
                  { row: [{ rep: 8, of: pcol('L2 2M') }], gap: 4 },
                  { row: [ecluster(), ecluster(), ecluster(), ecluster()], gap: 4 },
                  { b: 'L3 36 MB', s: 'shared by all 24 cores', k: 'c' },
                ],
              },
              { row: [{ b: 'UHD Graphics', s: 'not measured', k: 'g' }, { b: 'Memory controller', s: 'DDR5-5600 or DDR4-3200, 2 channels', k: 'f' }] },
            ],
          },
          { b: '32 GB system memory', s: 'up to DDR5-5600 · 2 channels · 89.6 GB/s', k: 'm' },
        ],
      },
      chipCap: 'The per-core and per-cluster L2 sizes are not on Intel ARK; they follow the Raptor Lake design that the i7-14700F above also uses. 5.8 GHz is Thermal Velocity Boost.',
      zoom: [
        { tag: 'One P-core', node: raptorCove('private · 2 threads with Hyper-Threading'), cap: 'Two 256-bit FMA pipes. vla.simd\'s 6 × 16 tile takes 15 of the 16 ymm registers.' },
        { tag: 'One E-core', node: gracemont, cap: HYBRID_CAP },
      ],
      cmp: { units: '8P + 16E', vec: 'AVX2 · 2 × 256-bit FMA / P-core', near: 'L2 2 MB / P-core', llc: 'L3 36 MB', mem: '32 GB DDR', bw: 89.6, bwText: '≤ 89.6 GB/s' },
      src: [
        ['Intel ARK: Core i9-14900HX', 'https://www.intel.com/content/www/us/en/products/sku/235995/intel-core-i9-processor-14900hx-36m-cache-up-to-5-80-ghz/specifications.html'],
        ['Raptor Lake (Wikipedia)', 'https://en.wikipedia.org/wiki/Raptor_Lake'],
      ],
    },
    {
      id: 'i5', short: 'i5-12400F', hubq: 'Core i5-12400F', name: 'Intel Core i5-12400F', alt: 'Alder Lake-S, H0 die',
      group: 'cpu', kind: 'Desktop CPU', arch: 'Alder Lake',
      measured: [['cpp', 'CPU', 'ggml'], ['simd', 'CPU', 'AVX2']],
      summary: 'Intel without E-cores: <b>6 Golden Cove P-cores</b> on the H0 die, which was built with no E-core cluster at all. Each core has 1.25 MB of L2, and all six share an 18 MB L3. The F model has its integrated graphics disabled.',
      facts: [['Cores', '6P · 12 threads'], ['Turbo', '4.4 GHz'], ['L2', '6 × 1.25 MB'], ['L3', '18 MB'], ['ISA', 'AVX2 · AVX-VNNI'], ['Memory', '16 GB · up to DDR5-4800'], ['Bandwidth', 'up to 76.8 GB/s'], ['Base power', '65 W']],
      chip: {
        col: [
          {
            frame: 'Core i5-12400F · Alder Lake H0 die (6P)', chip: true, body: [
              {
                frame: 'CPU · on the ring bus', k: 'p', m: [['cpp', 'ggml'], ['simd', 'AVX2']], body: [
                  { row: [{ rep: 6, of: pcol('L2 1.25 MB') }], gap: 5 },
                  { b: 'L3 18 MB', s: 'shared by all 6 cores', k: 'c' },
                ],
              },
              { row: [{ b: 'UHD Graphics 730', s: 'disabled on the F model', k: 'o' }, { b: 'Memory controller', s: 'DDR5-4800 or DDR4-3200, 2 channels', k: 'f' }] },
            ],
          },
          { b: '16 GB system memory', s: 'up to DDR5-4800 · 2 channels · 76.8 GB/s', k: 'm' },
        ],
      },
      chipCap: 'Golden Cove is the core that Raptor Cove refines: the same 48 KB L1d, with a smaller L2 per core.',
      zoom: [{
        tag: 'One P-core',
        node: { core: { title: 'P-core · Golden Cove', k: 'p', l1i: '32 KB', l1d: '48 KB', regs: 16, bits: 256, rn: 'ymm0–15', tile: AVX2_TILE, pipes: ['FMA 256', 'FMA 256'], l2: '1.25 MB', l2s: 'private · 2 threads with Hyper-Threading' } },
        cap: 'Two 256-bit FMA pipes. vla.simd\'s 6 × 16 tile takes 15 of the 16 ymm registers.',
      }],
      cmp: { units: '6P', vec: 'AVX2 · 2 × 256-bit FMA', near: 'L2 1.25 MB / core', llc: 'L3 18 MB', mem: '16 GB DDR', bw: 76.8, bwText: '≤ 76.8 GB/s' },
      src: [
        ['Intel ARK: Core i5-12400F', 'https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html'],
        ['Alder Lake (Wikipedia)', 'https://en.wikipedia.org/wiki/Alder_Lake'],
      ],
    },
    {
      id: 'ryzen5', short: 'Ryzen 5 5500', hubq: 'Ryzen 5 5500', name: 'AMD Ryzen 5 5500', alt: 'Cezanne',
      group: 'cpu', kind: 'Desktop CPU', arch: 'Zen 3',
      measured: [['cpp', 'CPU', 'ggml'], ['simd', 'CPU', 'AVX2']],
      summary: '<b>6 of the 8 Zen 3 cores</b> on a Cezanne die, all in one core complex that shares a 16 MB L3. The die\'s Radeon graphics are disabled. With no AVX-VNNI, vla.simd runs it in FP32 only.',
      facts: [['Cores', '6 · 12 threads'], ['Boost', '4.2 GHz'], ['L2', '6 × 512 KB'], ['L3', '16 MB'], ['ISA', 'AVX2 · FMA3, no VNNI'], ['Memory', '16 GB DDR4'], ['Bandwidth', 'up to 51.2 GB/s'], ['PCIe', '3.0']],
      chip: {
        col: [
          {
            frame: 'Ryzen 5 5500 · Cezanne die', chip: true, body: [
              {
                frame: 'CCX · 6 of 8 cores', k: 'p', m: [['cpp', 'ggml'], ['simd', 'AVX2']], body: [
                  {
                    row: [
                      { rep: 6, of: { col: [{ b: 'Core $', k: 'p', h: 2 }, { b: 'L2 512K', k: 'c', lo: true }] } },
                      { rep: 2, of: { col: [{ b: 'off', k: 'o', h: 2 }, { b: 'L2', k: 'o', lo: true }] } },
                    ], gap: 4,
                  },
                  { b: 'L3 16 MB', s: 'the full L3, shared by every core in the CCX', k: 'c' },
                ],
              },
              { row: [{ b: 'Radeon graphics', s: 'disabled on this model', k: 'o' }, { b: 'Memory controller', s: 'DDR4-3200, 2 channels · PCIe 3.0', k: 'f' }] },
            ],
          },
          { b: '16 GB DDR4', s: 'up to 3200 MT/s · 2 channels · 51.2 GB/s', k: 'm' },
        ],
      },
      chipCap: 'One core complex means every core reaches the whole L3 at the same cost, unlike the multi-CCD desktop Ryzens.',
      zoom: [{
        tag: 'One core',
        node: { core: { title: 'Zen 3 core', k: 'p', l1i: '32 KB', l1d: '32 KB', regs: 16, bits: 256, rn: 'ymm0–15', tile: AVX2_TILE, pipes: ['FMA 256', 'FMA 256', 'ADD 256', 'ADD 256'], l2: '512 KB', l2s: 'private · 2 threads with SMT' } },
        cap: 'Four 256-bit FP pipes, two of them with FMA. The L1d is 32 KB, 8-way with 64 sets, against 48 KB on Intel\'s P-cores, but the 16 ymm registers and vla.simd\'s 6 × 16 tile are the same.',
      }],
      cmp: { units: '6 cores', vec: 'AVX2 · 2 FMA + 2 ADD, 256-bit', near: 'L2 512 KB / core', llc: 'L3 16 MB', mem: '16 GB DDR4', bw: 51.2, bwText: '≤ 51.2 GB/s' },
      src: [
        ['AMD Ryzen 5000 series data sheet', 'https://www.amd.com/content/dam/amd/en/documents/products/processors/ryzen/5000/amd-ryzen-5000-datasheet.pdf'],
        ['Zen 3 (Wikipedia)', 'https://en.wikipedia.org/wiki/Zen_3'],
        ['Tom\'s Hardware review', 'https://www.tomshardware.com/reviews/amd-ryzen-5-5600-and-ryzen-5-5500-review'],
        ['Zen 3 scheduling model (LLVM)', 'https://reviews.llvm.org/D94395'],
      ],
    },
    {
      id: 'pi5', short: 'Raspberry Pi 5', hubq: 'Raspberry Pi 5', name: 'Raspberry Pi 5', alt: 'BCM2712',
      group: 'cpu', kind: 'Single-board computer', arch: 'Cortex-A76',
      measured: [['simd', 'CPU', 'NEON']],
      summary: '<b>4 Cortex-A76 cores</b> with 512 KB of L2 each and a shared 2 MB L3, no larger than the four L2s together. It runs on one 32-bit LPDDR4X channel at 17 GB/s, a hundredth of an RTX 5090. The <a href="#hierarchy">zoom ladder</a> walks down this chip.',
      facts: [['Cores', '4 × A76 · 2.4 GHz'], ['L2', '4 × 512 KB'], ['L3', '2 MB'], ['GPU', 'VideoCore VII · 12 QPUs'], ['ISA', 'Armv8.2-A · NEON · dotprod'], ['Memory', '16 GB LPDDR4X-4267 · 32-bit'], ['Bandwidth', '17 GB/s'], ['Process', '16 nm']],
      chip: {
        col: [
          {
            frame: 'BCM2712', chip: true, body: [
              {
                row: [
                  {
                    frame: 'CPU cluster · 4 × Cortex-A76', k: 'p', m: [['simd', 'NEON']], f: 1.7, body: [
                      { row: [{ rep: 4, of: { col: [{ b: 'Core $', s: 'A76', k: 'p', h: 2 }, { b: 'L2 512 KB', k: 'c', lo: true }] } }], gap: 4 },
                      { b: 'L3 2 MB', s: 'shared, no larger than the four L2s together', k: 'r' },
                    ],
                  },
                  {
                    frame: 'VideoCore VII', k: 'g', f: 0.8, body: [
                      { tiles: 12, cols: 4, k: 'g', th: 18, tt: 'QPU' },
                      { cap: '12 QPUs · 960 MHz<br>not measured' },
                    ],
                  },
                ],
              },
              { b: 'ISP · HEVC decode · display', k: 'f', lo: true },
            ],
          },
          { b: '16 GB LPDDR4X-4267', s: '32-bit · 17 GB/s', k: 'm' },
          { b: 'RP1 I/O controller', s: 'a separate chip on PCIe 2.0 ×4: USB, Ethernet, GPIO, cameras', k: 'f', lo: true },
        ],
      },
      chipCap: 'In VLA Hub\'s runs the Pi held its 85 °C soft limit with the active cooler on, so better cooling would be faster.',
      zoom: [{
        tag: 'One core',
        node: { core: { title: 'Cortex-A76', k: 'p', l1i: '64 KB', l1d: '64 KB', regs: 32, bits: 128, rn: 'v0–v31', tile: NEON_TILE, pipes: ['FMA 128', 'FMA 128'], l2: '512 KB', l2s: 'private' } },
        cap: 'Two 128-bit FMA pipes. vla.simd\'s 4 × 16 tile uses 24 of the 32 registers; a 5 × 16 tile would fit on paper but spills when compiled.',
      }],
      cmp: { units: '4 × A76', vec: 'NEON · 2 × 128-bit FMA', near: 'L2 512 KB / core', llc: 'L3 2 MB', mem: '16 GB LPDDR4X', bw: 17.1, bwText: '17 GB/s' },
      src: [
        ['Raspberry Pi docs: BCM2712', 'https://github.com/raspberrypi/documentation/blob/master/documentation/asciidoc/computers/processors/bcm2712.adoc'],
        ['Raspberry Pi 5 product brief', 'https://datasheets.raspberrypi.com/rpi5/raspberry-pi-5-product-brief.pdf'],
        ['Arm Cortex-A76 optimization guide', 'https://documentation-service.arm.com/static/5ed4bd67ca06a95ce53f917d'],
      ],
    },
  );
})();
