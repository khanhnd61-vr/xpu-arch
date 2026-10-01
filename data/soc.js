// Systems on chip: CPU clusters, a GPU and an NPU sharing one pool of memory.
(() => {
  const a78 = (n, label = 'A78AE') => ({ row: [{ rep: n, of: { col: [{ b: label, k: 'p', lo: true }, { b: 'L2 256K', k: 'c', lo: true }] } }], gap: 3 });

  XPU.devices.push(
    {
      id: 'agxorin', short: 'AGX Orin', hubq: 'Jetson AGX Orin', name: 'NVIDIA Jetson AGX Orin 64GB', alt: 'Orin',
      group: 'soc', kind: 'Embedded', arch: 'Ampere GPU · Cortex-A78AE',
      measured: [['cpp', 'GPU', 'CUDA']],
      summary: 'A robot computer on one chip: <b>12 Cortex-A78AE cores</b> in 3 clusters, an Ampere GPU with 16 SMs, two deep-learning accelerators and a vision accelerator, all sharing 64 GB of LPDDR5. vla.cpp ran on the GPU in MAXN mode.',
      facts: [['GPU', '16 SMs · 2,048 CUDA'], ['Tensor cores', '64 · 3rd gen'], ['CPU', '12 × A78AE · 2.2 GHz'], ['DLA', '2 × NVDLA v2'], ['Memory', '64 GB LPDDR5 · 256-bit'], ['Bandwidth', '204.8 GB/s'], ['AI', '275 TOPS INT8 sparse'], ['GPU clock', '1.3 GHz']],
      chipMin: 660,
      chip: {
        col: [
          {
            frame: 'Orin SoC', chip: true, body: [
              {
                row: [
                  {
                    frame: 'CPU · 12 × Cortex-A78AE', k: 'p', f: 1.25, body: [
                      { rep: 3, of: { frame: 'Cluster $', body: [a78(4), { b: 'L3 2 MB', k: 'c', lo: true }] } },
                    ],
                  },
                  {
                    frame: 'GPU · Ampere, 16 SMs', k: 'g', m: [['cpp', 'CUDA']], f: 1.2, body: [
                      { row: [{ rep: 2, of: { frame: 'GPC $', body: [{ tiles: 8, cols: 2, th: 20, tt: 'SM' }] } }], gap: 5 },
                      { b: 'L2 cache 4 MB', k: 'c', lo: true },
                      { cap: '128 CUDA cores and 4 Tensor cores per SM' },
                    ],
                  },
                  {
                    frame: 'Accelerators', f: 0.62, body: [
                      { b: 'DLA 0', s: 'NVDLA v2', k: 'n', h: 2 },
                      { b: 'DLA 1', s: 'NVDLA v2', k: 'n', h: 2 },
                      { b: 'PVA v2', s: 'vision DSP', k: 'f' },
                    ],
                  },
                ],
              },
              { b: 'System cache 4 MB', s: 'on chip, in front of DRAM', k: 'c' },
            ],
          },
          { b: '64 GB LPDDR5', s: '256-bit · 204.8 GB/s · one pool for every processor', k: 'm' },
        ],
      },
      chipCap: 'Each CPU core has 64 KB + 64 KB of L1 and a 256 KB L2; each cluster of four shares a 2 MB L3. The GPU has 2 GPCs of 4 TPCs. Each DLA delivers 52.5 sparse INT8 TOPS of the module\'s 275.',
      zoom: [{
        tag: 'One SM',
        node: {
          sm: {
            title: 'SM · Ampere (Orin)', rf: '64 KB', tensor: '3rd gen', l1: '192 KB',
            lanes: [[32, 'CUDA cores', 'g']],
          },
        },
        cap: 'Orin\'s SM has the 128 CUDA cores and 4 Tensor Cores of a desktop Ampere SM, but 192 KB of L1 and shared memory instead of 128 KB, and no RT core.',
      }],
      cmp: { units: '16 SMs · 12 A78AE · 2 DLA', vec: '2,048 CUDA · 64 Tensor cores', near: 'L1 192 KB / SM', llc: 'L2 4 MB · SC 4 MB', mem: '64 GB LPDDR5, shared', bw: 204.8, bwText: '204.8 GB/s' },
      src: [
        ['Jetson AGX Orin technical brief', 'https://www.nvidia.com/content/dam/en-zz/Solutions/gtcf21/jetson-orin/nvidia-jetson-agx-orin-technical-brief.pdf'],
        ['Jetson AGX Orin data sheet', 'https://static.generation-robots.com/media/Jetson-AGX-Orin-Data-Sheet.pdf'],
        ['Jetson power modes', 'https://docs.nvidia.com/jetson/archives/r36.4.3/DeveloperGuide/SD/PlatformPowerAndPerformance/JetsonOrinNanoSeriesJetsonOrinNxSeriesAndJetsonAgxOrinSeries.html'],
      ],
    },
    {
      id: 'orinnano', short: 'Orin Nano Super', hubq: 'Jetson Orin Nano Super', name: 'NVIDIA Jetson Orin Nano Super', alt: '8 GB',
      group: 'soc', kind: 'Embedded', arch: 'Ampere GPU · Cortex-A78AE',
      measured: [['cpp', 'GPU', 'CUDA']],
      summary: 'The same Orin design, cut down: <b>6 Cortex-A78AE cores</b> in two clusters, an 8-SM Ampere GPU, no DLA, and 8 GB of LPDDR5 on a 128-bit bus. The MAXN_SUPER mode VLA Hub used raises the GPU to 1,020 MHz and the memory to 102 GB/s.',
      facts: [['GPU', '8 SMs · 1,024 CUDA'], ['Tensor cores', '32 · 3rd gen'], ['CPU', '6 × A78AE · 1.7 GHz'], ['DLA', 'none'], ['Memory', '8 GB LPDDR5 · 128-bit'], ['Bandwidth', '102 GB/s'], ['AI', '67 TOPS INT8 sparse'], ['GPU clock', '1.02 GHz']],
      chip: {
        col: [
          {
            frame: 'Orin SoC · Orin Nano configuration', chip: true, body: [
              {
                row: [
                  {
                    frame: 'CPU · 6 × Cortex-A78AE', k: 'p', f: 1.35, body: [
                      {
                        row: [
                          { frame: 'Cluster 0', f: 4, body: [a78(4, 'core'), { b: 'L3 2 MB', k: 'c', lo: true }] },
                          { frame: 'Cluster 1', f: 2.2, body: [a78(2, 'core'), { b: 'L3 2 MB', k: 'c', lo: true }] },
                        ], gap: 5,
                      },
                    ],
                  },
                  {
                    frame: 'GPU · Ampere, 8 SMs', k: 'g', m: [['cpp', 'CUDA']], f: 1, body: [
                      { row: [{ rep: 4, of: { frame: 'TPC', body: [{ tiles: 2, cols: 1, th: 16, tt: 'SM' }] } }], gap: 4 },
                      { b: 'L2 cache 2 MB', s: 'as reported by deviceQuery', k: 'c', lo: true },
                    ],
                  },
                  { b: 'No DLA, no PVA', s: 'off on Orin Nano', k: 'o', f: 0.42 },
                ],
              },
              { b: 'System cache 4 MB', s: 'on chip, in front of DRAM', k: 'c' },
            ],
          },
          { b: '8 GB LPDDR5', s: '128-bit · 102 GB/s in Super mode (68 GB/s otherwise)', k: 'm' },
        ],
      },
      chipCap: 'NVIDIA lists 4 TPCs for the GPU but not how they group into GPCs, so the TPCs are drawn without GPC frames.',
      zoom: [{
        tag: 'One CPU core',
        node: { core: { title: 'Cortex-A78AE', k: 'p', l1i: '64 KB', l1d: '64 KB', regs: 32, bits: 128, rn: 'v0–v31', pipes: ['FMA 128', 'FMA 128'], l2: '256 KB', l2s: 'private · L3 2 MB per cluster' } },
        cap: 'The A78AE is a Cortex-A78 with a lockstep mode for safety-critical work. Its NEON unit has the same 32 registers of 128 bits as the Raspberry Pi 5\'s Cortex-A76. VLA Hub measured only the GPU here.',
      }],
      cmp: { units: '8 SMs · 6 A78AE', vec: '1,024 CUDA · 32 Tensor cores', near: '—', llc: 'L2 2 MB · SC 4 MB', mem: '8 GB LPDDR5, shared', bw: 102 },
      src: [
        ['Jetson Orin Nano series data sheet', 'https://www.esys.ir/images/img_Item/3029/Files/Jetson-Orin-Nano-Series-Modules-Datasheet_DS-11105-001_v1.5.pdf'],
        ['Orin Nano Super developer kit', 'https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/nano-super-developer-kit/'],
        ['Jetson power modes', 'https://docs.nvidia.com/jetson/archives/r36.4.3/DeveloperGuide/SD/PlatformPowerAndPerformance/JetsonOrinNanoSeriesJetsonOrinNxSeriesAndJetsonAgxOrinSeries.html'],
        ['deviceQuery on the NVIDIA forum', 'https://forums.developer.nvidia.com/t/jetson-orin-nano-8gb-cache-line-size-and-page-size/306256'],
      ],
    },
    {
      id: 'm5max', short: 'M5 Max', hubq: 'Apple M5 Max', name: 'Apple M5 Max', alt: '40-core GPU',
      group: 'soc', kind: 'Apple Silicon', arch: 'M5 family · Fusion',
      measured: [['cpp', 'GPU', 'Metal']],
      summary: 'Apple\'s two-die Mac chip, built with what Apple calls its Fusion Architecture. It has <b>18 CPU cores and no efficiency cores</b>: 6 super cores and 12 of a new, smaller performance core. Beside them sit a 40-core GPU with a Neural Accelerator in every core and a 16-core Neural Engine, all on 614 GB/s of unified memory.',
      facts: [['CPU', '6 super + 12 performance'], ['GPU', '40 cores · 5,120 ALUs'], ['Neural Engine', '16 cores'], ['L2', '16 MB + 2 × 8 MB'], ['Memory', '64 GB unified · LPDDR5X'], ['Bandwidth', '614 GB/s'], ['Clocks', '4.6 / 4.4 GHz'], ['Process', 'TSMC N3P · 2 dies']],
      chipMin: 620,
      chip: {
        col: [
          {
            frame: 'M5 Max · two 3 nm dies in one SoC', chip: true, body: [
              {
                row: [
                  {
                    frame: 'CPU · 18 cores', k: 'p', f: 1.3, body: [
                      { frame: 'Super cluster', k: 'p', body: [{ tiles: 6, cols: 6, k: 'p', lab: 'S#', th: 24 }, { b: 'L2 16 MB', k: 'c', lo: true }] },
                      { row: [{ rep: 2, of: { frame: 'Perf cluster $', k: 'e', body: [{ tiles: 6, cols: 3, k: 'e', lab: 'P', th: 18 }, { b: 'L2 8 MB', k: 'c', lo: true }] } }], gap: 5 },
                    ],
                  },
                  {
                    frame: 'GPU · 40 cores', k: 'g', m: [['cpp', 'Metal']], f: 1.25, body: [
                      { tiles: 40, cols: 8, k: 'g', th: 17, tt: 'GPU core' },
                      { cap: 'each core: 128 ALUs and a Neural Accelerator' },
                    ],
                  },
                  {
                    frame: 'Neural Engine', k: 'n', f: 0.55, body: [
                      { tiles: 16, cols: 4, k: 'n', th: 14 },
                      { cap: '16 cores' },
                    ],
                  },
                ],
              },
              { b: 'System level cache', s: 'size not published by Apple', k: 'c' },
            ],
          },
          { b: '64 GB unified memory', s: 'LPDDR5X · 614 GB/s · shared by CPU, GPU and Neural Engine', k: 'm' },
        ],
      },
      chipCap: 'TechInsights reports that the M5 Pro and M5 Max share one CPU die and differ in the GPU die. Apple has not said which die holds the Neural Engine, the system cache and the memory controllers, so the two dies are drawn as one package. Cluster sizes and L2s are as macOS reports them.',
      zoom: [{
        tag: 'One GPU core',
        node: { agpu: { title: 'GPU core · M5', na: true, mem: 'registers, threadgroup and tile memory' } },
        cap: 'The M5 generation adds a Neural Accelerator, a matrix unit, to every GPU core, so matrix work no longer needs the Neural Engine. Apple does not publish its size.',
      }],
      cmp: { units: '40 GPU cores · 18 CPU · 16 NE', vec: '5,120 ALUs · 40 Neural Accelerators', near: '—', llc: 'SLC, size n/p', mem: '64 GB unified', bw: 614 },
      src: [
        ['Apple Newsroom: M5 Pro and M5 Max', 'https://www.apple.com/newsroom/2026/03/apple-debuts-m5-pro-and-m5-max-to-supercharge-the-most-demanding-pro-workflows/'],
        ['MacBook Pro (M5 Max) tech specs', 'https://support.apple.com/en-us/126318'],
        ['M5 Max sysctl output', 'https://gist.github.com/chockenberry/1d08129bdf41bfb70e98c3a75ce74578'],
        ['TechInsights die analysis', 'https://www.techinsights.com/blog/what-die-level-analysis-reveals-about-apples-m5-pro-gpu-design'],
      ],
    },
    {
      id: 'm4', stack: true, zoomRow: true, short: 'M4', hubq: 'Apple M4', name: 'Apple M4', alt: 'Mac mini',
      group: 'soc', kind: 'Apple Silicon', arch: 'M4',
      measured: [['cpp', 'GPU', 'Metal'], ['simd', 'CPU', 'NEON + Accelerate']],
      summary: '<b>4 performance and 6 efficiency cores</b>, each cluster with its own L2, a 10-core GPU and a 16-core Neural Engine on 120 GB/s of unified memory. Each CPU cluster also shares an SME matrix unit, which vla.simd reaches through Accelerate. vla.cpp ran on the GPU through Metal.',
      facts: [['CPU', '4P + 6E · 4.4 GHz'], ['GPU', '10 cores · 1,280 ALUs'], ['Neural Engine', '16 cores · 38 TOPS'], ['L2', 'P 16 MB · E 4 MB'], ['Matrix', 'SME · 512-bit vectors'], ['Memory', '24 GB LPDDR5X-7500 · 128-bit'], ['Bandwidth', '120 GB/s'], ['Process', 'TSMC N3E']],
      chipMin: 620,
      chip: {
        col: [
          {
            frame: 'M4', chip: true, body: [
              {
                row: [
                  {
                    frame: 'CPU · 4P + 6E', k: 'p', m: [['simd', 'NEON + Accelerate']], f: 1.55, body: [
                      {
                        row: [
                          { frame: 'P cluster', k: 'p', f: 1, body: [{ tiles: 4, cols: 2, k: 'p', lab: 'P#', th: 26 }, { b: 'L2 16 MB', k: 'c', lo: true }, { b: 'SME unit', k: 'x', lo: true }] },
                          { frame: 'E cluster', k: 'e', f: 1.1, body: [{ tiles: 6, cols: 3, k: 'e', lab: 'E#', th: 26 }, { b: 'L2 4 MB', k: 'c', lo: true }, { b: 'SME unit', k: 'x', lo: true }] },
                        ], gap: 5,
                      },
                    ],
                  },
                  {
                    frame: 'GPU · 10 cores', k: 'g', m: [['cpp', 'Metal']], f: 1, body: [
                      { tiles: 10, cols: 5, k: 'g', th: 30, tt: 'GPU core' },
                      { cap: '128 ALUs per core' },
                    ],
                  },
                  {
                    frame: 'Neural Engine', k: 'n', f: 0.6, body: [
                      { tiles: 16, cols: 4, k: 'n', th: 13 },
                      { cap: '16 cores · 38 TOPS' },
                    ],
                  },
                ],
              },
              { b: 'System level cache', s: '8 MB as reported; Apple does not publish it', k: 'c' },
            ],
          },
          { b: '24 GB unified memory', s: 'LPDDR5X-7500 · 128-bit · 120 GB/s', k: 'm' },
        ],
      },
      chipCap: 'The M4 implements Arm SME with 512-bit streaming vectors. Each cluster shares one SME unit; measured, the P-cluster\'s unit is several times faster than the E-cluster\'s.',
      zoom: [
        {
          tag: 'One P-core',
          node: { core: { title: 'P-core', k: 'p', l1i: '192 KB', l1d: '128 KB', regs: 32, bits: 128, rn: 'v0–v31', tile: { mr: 4, nr: 16, op: 4 }, l2: '16 MB', l2s: 'shared by the 4 P-cores' } },
          cap: 'NEON\'s 32 registers of 128 bits hold vla.simd\'s 4 × 16 tile with 8 registers to spare.',
        },
        {
          tag: 'One GPU core',
          node: { agpu: { title: 'GPU core · M4', mem: 'Dynamic Caching allocates it per shader, in hardware' } },
          cap: 'Since the M3, registers, threadgroup and tile memory come out of one on-chip pool that the GPU sizes for each shader as it runs.',
        },
      ],
      cmp: { units: '10 GPU cores · 4P + 6E · 16 NE', vec: '1,280 ALUs · NEON · SME', near: 'L1d 128 KB / P-core', llc: 'SLC ~8 MB', mem: '24 GB unified', bw: 120 },
      src: [
        ['Apple Newsroom: M4', 'https://www.apple.com/newsroom/2024/05/apple-introduces-m4-chip/'],
        ['Apple Newsroom: Mac mini', 'https://www.apple.com/newsroom/2024/10/apples-new-mac-mini-is-more-mighty-more-mini-and-built-for-apple-intelligence/'],
        ['Inside M4 chips (Eclectic Light)', 'https://eclecticlight.co/2024/11/18/inside-m4-chips-e-and-p-cores/'],
        ['SME on the M4 (arXiv 2409.18779)', 'https://arxiv.org/abs/2409.18779'],
        ['M4 specs (Low End Mac)', 'https://lowendmac.com/1234/apple-silicon-m4-chip-specs/'],
      ],
    },
    {
      id: 'x7', stack: true, zoomRow: true, short: 'X7 358H', hubq: 'Core Ultra X7 358H', name: 'Intel Core Ultra X7 358H', alt: 'Panther Lake',
      group: 'soc', kind: 'Laptop SoC', arch: 'Panther Lake · Intel 18A',
      measured: [['cpp', 'GPU', 'OpenVINO'], ['cpp', 'NPU', 'OpenVINO'], ['cpp', 'CPU', 'OpenVINO'], ['cpp', 'CPU', 'ggml']],
      summary: 'Three tiles on one Foveros package: an Intel 18A compute tile with <b>4 P-cores, 8 E-cores and 4 low-power E-cores</b>, a 12-core Xe3 GPU tile (Arc B390) on TSMC N3E, and a platform controller tile on N6, plus NPU 5. It is the only device in VLA Hub with its GPU, NPU and CPU all measured.',
      facts: [['CPU', '4P + 8E + 4 LP-E'], ['GPU', 'Arc B390 · 12 Xe3 cores'], ['NPU', 'NPU 5 · 50 TOPS'], ['L3', '18 MB'], ['Memory', 'LPDDR5X-9600 · 128-bit'], ['Bandwidth', '153.6 GB/s'], ['Turbo', 'P 4.8 · E 3.5 · LP-E 3.3 GHz'], ['Process', 'Intel 18A + TSMC N3E']],
      chipMin: 720,
      chip: {
        col: [
          {
            frame: 'Core Ultra X7 358H · 3 tiles on Foveros', chip: true, body: [
              {
                row: [
                  {
                    frame: 'Compute tile · Intel 18A', f: 1.55, body: [
                      {
                        frame: 'CPU · 16 cores', k: 'p', m: [['cpp', 'ggml'], ['cpp', 'OpenVINO']], body: [
                          {
                            row: [
                              { rep: 4, of: { col: [{ b: 'P$', k: 'p', h: 2 }, { b: 'L2 3M', k: 'c', lo: true }] } },
                              { rep: 2, of: { f: 1.6, col: [{ tiles: 4, cols: 2, k: 'e', lab: 'E', th: 31 }, { b: 'L2 4 MB', k: 'c', lo: true }] } },
                            ], gap: 4,
                          },
                          { b: 'L3 18 MB', s: 'shared by P- and E-cores on the ring', k: 'c' },
                          { row: [{ frame: 'LP-E cluster · off the ring', k: 'e', body: [{ row: [{ tiles: 4, cols: 4, k: 'e', lab: 'LP', th: 22, f: 2 }, { b: 'L2 4 MB', k: 'c', lo: true }], gap: 4 }] }] },
                        ],
                      },
                      { b: 'Memory-side cache 8 MB', s: 'in front of DRAM, used by every agent', k: 'c' },
                    ],
                  },
                  {
                    frame: 'GPU tile · TSMC N3E', f: 1, body: [
                      {
                        frame: 'Arc B390 · 12 Xe3 cores', k: 'g', m: [['cpp', 'OpenVINO']], body: [
                          { row: [{ rep: 2, of: { frame: 'Slice $', body: [{ tiles: 6, cols: 2, k: 'g', th: 20, tt: 'Xe3 core' }] } }], gap: 4 },
                          { b: 'L2 16 MB', k: 'c', lo: true },
                          { cap: '12 RT units · 2.5 GHz' },
                        ],
                      },
                    ],
                  },
                  {
                    frame: 'NPU 5', k: 'n', m: [['cpp', 'OpenVINO']], f: 0.62, body: [
                      { tiles: 3, cols: 1, k: 'n', lab: 'NCE', th: 26 },
                      { b: 'Scratchpad 4.5 MB', k: 'c', lo: true },
                      { cap: '50 TOPS INT8' },
                    ],
                  },
                ],
              },
              { b: 'Platform controller tile · TSMC N6', s: 'I/O', k: 'f', lo: true },
            ],
          },
          { b: '62 GiB LPDDR5X, shared', s: 'up to 9600 MT/s · 128-bit · 153.6 GB/s', k: 'm' },
        ],
      },
      chipCap: 'The LP-E cores sit off the ring and do not use the L3, but they do use the 8 MB memory-side cache. NPU 5 has 3 neural compute engines (NCE) of 4,096 INT8 MACs each. The sources do not say which tile holds it, so it is drawn on its own. The 153.6 GB/s is calculated from the bus width; Intel does not publish it.',
      zoom: [
        {
          tag: 'One Xe3 core',
          node: { xe: { title: 'Xe3 core', xve: 8, lanes: 16, xmx: 8, xmxBits: 2048, l1: '256 KB', cols: 2, extra: ['Load / store', 'Ray tracing unit'] } },
          cap: 'Xe3 keeps the Xe2 layout: half as many vector engines per core as Alchemist, each twice as wide, and XMX engines twice as wide again. The L1 grows from 192 KB to 256 KB.',
        },
        {
          tag: 'One P-core',
          node: { core: { title: 'P-core · Cougar Cove', k: 'p', l1i: '64 KB', l1d: '48 + 192 KB', regs: 16, bits: 256, rn: 'ymm0–15', l2: '3 MB', l2s: 'private · some sources list 2.5 MB' } },
          cap: 'A 48 KB L0 data cache sits in front of a 192 KB L1. AVX2 with no AVX-512, the same 16 ymm registers as the desktop chips.',
        },
      ],
      cmp: { units: '12 Xe3 · 16 CPU cores · NPU 5', vec: '1,536 FP32 lanes · 96 XMX · AVX2', near: 'L1 256 KB / Xe3 core', llc: 'L3 18 MB · MSC 8 MB', mem: 'LPDDR5X-9600, shared', bw: 153.6, bwText: '153.6 GB/s' },
      src: [
        ['Intel ARK: Core Ultra X7 358H', 'https://www.intel.com/content/www/us/en/products/sku/245527/intel-core-ultra-x7-processor-358h-18m-cache-up-to-4-80-ghz/specifications.html'],
        ['Core Ultra Series 3 quick reference', 'https://cdrdv2-public.intel.com/871380/Intel%20Core%20Ultra%20Series%203%20Processors%20-%20Quick%20Reference%20Guide%20v1.pdf'],
        ['Chips and Cheese: Panther Lake', 'https://chipsandcheese.com/p/panther-lakes-reveal-at-itt-2025'],
        ['Wccftech: compute tile deep dive', 'https://wccftech.com/intel-panther-lake-deep-dive-18a-compute-tile-cougar-cove-p-cores-darkmont-e-cores/'],
      ],
    },
    {
      id: 'snapx', short: 'Snapdragon X', hubq: 'Snapdragon X', name: 'Qualcomm Snapdragon X', alt: 'X1-26-100',
      group: 'soc', kind: 'Laptop SoC', arch: 'Oryon · Hexagon',
      measured: [['cpp', 'NPU', 'Hexagon'], ['cpp', 'CPU', 'ggml'], ['simd', 'CPU', 'NEON']],
      summary: '<b>8 Oryon cores</b> in two clusters of four, each cluster sharing 12 MB of L2, with no L3 but a 6 MB system cache. Beside them sit an Adreno X1-45 GPU and a 45 TOPS Hexagon NPU, all on 135 GB/s of LPDDR5X. vla.cpp ran on the NPU and the CPU, vla.simd on the CPU.',
      facts: [['CPU', '8 × Oryon · 3.0 GHz'], ['L2', '2 × 12 MB'], ['GPU', 'Adreno X1-45 · 1.7 TFLOPS'], ['NPU', 'Hexagon · 45 TOPS'], ['Memory', '16 GB LPDDR5X-8448 · 128-bit'], ['Bandwidth', '135 GB/s'], ['ISA', 'Armv8.7-A · no SVE'], ['Process', 'TSMC 4 nm']],
      chipMin: 600,
      chip: {
        col: [
          {
            frame: 'Snapdragon X X1-26-100', chip: true, body: [
              {
                row: [
                  {
                    frame: 'CPU · 8 × Oryon', k: 'p', m: [['cpp', 'ggml'], ['simd', 'NEON']], f: 1.45, body: [
                      { row: [{ rep: 2, of: { frame: 'Cluster $', k: 'p', body: [{ tiles: 4, cols: 2, k: 'p', lab: 'Oryon', th: 30 }, { b: 'L2 12 MB', s: 'shared by 4 cores', k: 'c', lo: true }] } }], gap: 6 },
                    ],
                  },
                  {
                    frame: 'Adreno X1-45', k: 'g', f: 0.62, body: [
                      { b: 'GPU', s: '1.7 TFLOPS FP32<br>not measured', k: 'g', h: 3 },
                    ],
                  },
                  {
                    frame: 'Hexagon NPU', k: 'n', m: [['cpp', 'Hexagon']], f: 0.95, body: [
                      { row: [{ b: 'Scalar', k: 'n', h: 2 }, { b: 'Vector', s: 'HVX', k: 'n', h: 2 }, { b: 'Tensor', s: 'HMX', k: 'x', h: 2 }], gap: 3 },
                      { b: 'Shared NPU memory', k: 'c', lo: true },
                      { cap: '45 TOPS INT8' },
                    ],
                  },
                ],
              },
              { b: 'System level cache 6 MB', s: 'the only cache shared by the clusters', k: 'c' },
            ],
          },
          { b: '16 GB LPDDR5X', s: '8448 MT/s · 128-bit · 135 GB/s', k: 'm' },
        ],
      },
      chipCap: 'Qualcomm publishes 30 MB of total cache for this SKU, not its layout. Two Oryon clusters of 12 MB plus the 6 MB system cache account for it. The NPU fuses scalar, vector and tensor units around one shared memory. Ops it rejects fall back to the CPU.',
      zoom: [{
        tag: 'One Oryon core',
        node: { core: { title: 'Oryon core', k: 'p', l1i: '192 KB', l1d: '96 KB', regs: 32, bits: 128, rn: 'v0–v31', pipes: ['FMA', 'FMA', 'FMA', 'FMA'], l2: '12 MB', l2s: 'shared by the 4-core cluster' } },
        cap: 'Four 128-bit FP and SIMD pipes, all with FMA: twice the vector throughput per clock of a Cortex-A76, from the same 32 NEON registers. vla.simd runs its NEON kernels here.',
      }],
      cmp: { units: '8 Oryon · Hexagon · Adreno', vec: 'NEON, 4 × 128-bit FMA · HVX + HMX', near: 'L1d 96 KB / core', llc: 'SLC 6 MB', mem: '16 GB LPDDR5X', bw: 135 },
      src: [
        ['Snapdragon X platform product brief', 'https://docs.qualcomm.com/doc/87-86493-1/87-86493-1_REV_B_Snapdragon_X_Platform_Product_Brief.pdf'],
        ['Chips and Cheese: Oryon core', 'https://chipsandcheese.com/p/qualcomms-oryon-core-a-long-time-in-the-making'],
        ['Chips and Cheese: Oryon at Hot Chips', 'https://chipsandcheese.com/p/hot-chips-2024-qualcomms-oryon-core'],
        ['Qualcomm NPU whitepaper', 'https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/Unlocking-on-device-generative-AI-with-an-NPU-and-heterogeneous-computing.pdf'],
      ],
    },
  );
})();
