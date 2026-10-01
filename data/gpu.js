// Discrete GPUs: NVIDIA GPCs of SMs, and Intel render slices of Xe-cores.
(() => {
  const gpc = (label, sms, off = 0, cols = 4, th = 10) => ({ frame: label, body: [{ tiles: sms, cols, th, off, tt: 'SM' }] });

  const AMPERE_SM = {
    sm: {
      title: 'SM · Ampere', rf: '64 KB', tensor: '3rd gen', l1: '128 KB',
      lanes: [[16, 'FP32', 'g'], [16, 'FP32 / INT32', 'g2']],
      extra: ['RT core · 2nd gen', '4 texture units'],
    },
  };
  const BLACKWELL_SM = {
    sm: {
      title: 'SM · Blackwell', rf: '64 KB', tensor: '5th gen', l1: '128 KB',
      lanes: [[32, 'FP32 or INT32', 'g']],
      extra: ['RT core · 4th gen', '4 texture units'],
    },
  };
  const AMPERE_CAP = 'Each partition issues one 32-thread warp per clock. Half its lanes are FP32 only and half run FP32 or INT32, so an SM does up to 128 FP32 multiply-adds a clock. The four 64 KB register files together are twice the L1.';
  const BLACKWELL_CAP = 'Each partition issues one 32-thread warp per clock. Every Blackwell lane runs FP32 or INT32, one or the other in a given clock. The four 64 KB register files together are twice the L1.';

  XPU.devices.push(
    {
      id: 'rtx5090', short: 'RTX 5090', hubq: 'RTX 5090', name: 'NVIDIA GeForce RTX 5090', alt: 'GB202',
      group: 'gpu', kind: 'Desktop GPU', arch: 'Blackwell',
      measured: [['cpp', 'GPU', 'CUDA']],
      summary: 'The largest GPU here. The GB202 die has <b>192 SMs in 12 GPCs</b>; the RTX 5090 enables 170 of them in 11 GPCs, around a 96 MB L2 and 32 GB of GDDR7 on a 512-bit bus.',
      facts: [['SMs', '170 of 192'], ['CUDA cores', '21,760'], ['Tensor cores', '680 · 5th gen'], ['L2', '96 MB'], ['Memory', '32 GB GDDR7 · 512-bit'], ['Bandwidth', '1,792 GB/s'], ['Boost', '2.41 GHz'], ['Process', 'TSMC 4N']],
      chip: {
        col: [
          {
            frame: 'GB202 · GeForce RTX 5090', chip: true, body: [
              {
                frame: 'GPU · 11 of 12 GPCs, 170 of 192 SMs', k: 'g', m: [['cpp', 'CUDA']], body: [
                  { row: [{ rep: 6, of: gpc('GPC $', 16) }], gap: 5 },
                  { row: [gpc('GPC 6', 16), gpc('GPC 7', 16), gpc('GPC 8', 16, 2), gpc('GPC 9', 16, 2), gpc('GPC 10', 16, 2), gpc('GPC 11', 16, 16)], gap: 5 },
                  { b: 'L2 cache 96 MB', s: '128 MB on the die · shared by every SM', k: 'c' },
                ],
              },
              { b: 'PCIe 5.0 · video encode and decode · display', k: 'f', lo: true },
            ],
          },
          { b: '32 GB GDDR7', s: '512-bit · 28 Gbps · 1,792 GB/s', k: 'm' },
        ],
      },
      chipCap: 'Each GPC holds 8 TPCs of 2 SMs. Disabled SMs are dashed; which ones are disabled differs from chip to chip.',
      zoom: [{ tag: 'One SM', node: BLACKWELL_SM, cap: BLACKWELL_CAP }],
      cmp: { units: '170 SMs · 11 GPCs', vec: '21,760 FP32 lanes · 680 Tensor cores', near: 'L1 128 KB / SM', llc: 'L2 96 MB', mem: '32 GB GDDR7', bw: 1792, bwText: '1,792 GB/s' },
      src: [['NVIDIA RTX Blackwell architecture whitepaper', 'https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf']],
    },
    {
      id: 'rtx3090', short: 'RTX 3090', hubq: 'RTX 3090', name: 'NVIDIA GeForce RTX 3090', alt: 'GA102',
      group: 'gpu', kind: 'Desktop GPU', arch: 'Ampere',
      measured: [['cpp', 'GPU', 'CUDA']],
      summary: 'GA102 with <b>82 of its 84 SMs</b> enabled across 7 GPCs, a 6 MB L2 and 24 GB of GDDR6X on a 384-bit bus. VLA Hub\'s LIBERO success rates were measured on this card, and the <a href="#hierarchy">zoom ladder</a> walks down this chip.',
      facts: [['SMs', '82 of 84'], ['CUDA cores', '10,496'], ['Tensor cores', '328 · 3rd gen'], ['L2', '6 MB'], ['Memory', '24 GB GDDR6X · 384-bit'], ['Bandwidth', '936 GB/s'], ['Boost', '1.70 GHz'], ['Process', 'Samsung 8N']],
      chip: {
        col: [
          {
            frame: 'GA102 · GeForce RTX 3090', chip: true, body: [
              {
                frame: 'GPU · 7 GPCs, 82 of 84 SMs', k: 'g', m: [['cpp', 'CUDA']], body: [
                  { row: [{ rep: 6, of: gpc('GPC $', 12, 0, 4, 14) }, gpc('GPC 6', 12, 2, 4, 14)], gap: 5 },
                  { b: 'L2 cache 6 MB', s: 'shared by every SM', k: 'c' },
                ],
              },
              { b: 'PCIe 4.0 · video encode and decode · display', k: 'f', lo: true },
            ],
          },
          { b: '24 GB GDDR6X', s: '384-bit · 19.5 Gbps · 936 GB/s', k: 'm' },
        ],
      },
      chipCap: 'Each GPC holds a raster engine and 6 TPCs of 2 SMs. One TPC is disabled on the RTX 3090.',
      zoom: [{ tag: 'One SM', node: AMPERE_SM, cap: AMPERE_CAP }],
      cmp: { units: '82 SMs · 7 GPCs', vec: '10,496 FP32 lanes · 328 Tensor cores', near: 'L1 128 KB / SM', llc: 'L2 6 MB', mem: '24 GB GDDR6X', bw: 936 },
      src: [['NVIDIA Ampere GA102 whitepaper', 'https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf']],
    },
    {
      id: 'rtx5070l', short: 'RTX 5070 Laptop', hubq: 'RTX 5070 Laptop', name: 'NVIDIA GeForce RTX 5070 Laptop GPU', alt: 'GB206',
      group: 'gpu', kind: 'Laptop GPU', arch: 'Blackwell',
      measured: [['cpp', 'GPU', 'CUDA']],
      summary: 'A full GB206: <b>36 SMs in 3 GPCs</b>, the same SM as the RTX 5090, with 8 GB of GDDR7 on a 128-bit bus. It has about a fifth of the 5090\'s SMs and bandwidth, in a 50 to 100 W laptop budget.',
      facts: [['SMs', '36'], ['CUDA cores', '4,608'], ['Tensor cores', '144 · 5th gen'], ['L2', '32 MB on the die'], ['Memory', '8 GB GDDR7 · 128-bit'], ['Bandwidth', '384 GB/s'], ['Boost', '1.43–2.35 GHz'], ['Power', '50–100 W']],
      chip: {
        col: [
          {
            frame: 'GB206 · GeForce RTX 5070 Laptop', chip: true, body: [
              {
                frame: 'GPU · 3 GPCs, 36 SMs', k: 'g', m: [['cpp', 'CUDA']], body: [
                  { row: [{ rep: 3, of: gpc('GPC $', 12, 0, 6, 16) }], gap: 6 },
                  { b: 'L2 cache 32 MB', s: 'the GB206 die\'s; NVIDIA does not list it for the laptop part', k: 'c' },
                ],
              },
              { b: 'PCIe 5.0 · video encode and decode · display', k: 'f', lo: true },
            ],
          },
          { b: '8 GB GDDR7', s: '128-bit · 384 GB/s', k: 'm' },
        ],
      },
      chipCap: 'Each GPC holds 6 TPCs of 2 SMs. NVIDIA now also sells this GPU with 12 GB.',
      zoom: [{ tag: 'One SM', node: BLACKWELL_SM, cap: BLACKWELL_CAP }],
      cmp: { units: '36 SMs · 3 GPCs', vec: '4,608 FP32 lanes · 144 Tensor cores', near: 'L1 128 KB / SM', llc: 'L2 32 MB (die)', mem: '8 GB GDDR7', bw: 384 },
      src: [
        ['NVIDIA laptop GPU specifications', 'https://www.nvidia.com/en-us/geforce/laptops/compare/'],
        ['GB206 die (KitGuru, RTX 5060 Ti review)', 'https://www.kitguru.net/components/graphic-cards/dominic-moass/nvidia-rtx-5060-ti-16gb-review-ft-gigabyte-palit/'],
        ['NVIDIA RTX Blackwell whitepaper', 'https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf'],
      ],
    },
    {
      id: 'rtx3060', short: 'RTX 3060', hubq: 'RTX 3060', name: 'NVIDIA GeForce RTX 3060', alt: 'GA106',
      group: 'gpu', kind: 'Desktop GPU', arch: 'Ampere',
      measured: [['cpp', 'GPU', 'CUDA']],
      summary: 'GA106 with <b>28 of its 30 SMs</b> in 3 GPCs, a 3 MB L2 and 12 GB of GDDR6 on a 192-bit bus. It uses the same SM as the RTX 3090, about a third as many of them.',
      facts: [['SMs', '28 of 30'], ['CUDA cores', '3,584'], ['Tensor cores', '112 · 3rd gen'], ['L2', '3 MB'], ['Memory', '12 GB GDDR6 · 192-bit'], ['Bandwidth', '360 GB/s'], ['Boost', '1.78 GHz'], ['Process', 'Samsung 8N']],
      chip: {
        col: [
          {
            frame: 'GA106 · GeForce RTX 3060', chip: true, body: [
              {
                frame: 'GPU · 3 GPCs, 28 of 30 SMs', k: 'g', m: [['cpp', 'CUDA']], body: [
                  { row: [gpc('GPC 0', 10, 0, 5, 16), gpc('GPC 1', 10, 0, 5, 16), gpc('GPC 2', 10, 2, 5, 16)], gap: 6 },
                  { b: 'L2 cache 3 MB', s: 'shared by every SM', k: 'c' },
                ],
              },
              { b: 'PCIe 4.0 · video encode and decode · display', k: 'f', lo: true },
            ],
          },
          { b: '12 GB GDDR6', s: '192-bit · 15 Gbps · 360 GB/s', k: 'm' },
        ],
      },
      chipCap: 'Each GPC holds 5 TPCs of 2 SMs. One TPC is disabled on the RTX 3060.',
      zoom: [{ tag: 'One SM', node: AMPERE_SM, cap: AMPERE_CAP }],
      cmp: { units: '28 SMs · 3 GPCs', vec: '3,584 FP32 lanes · 112 Tensor cores', near: 'L1 128 KB / SM', llc: 'L2 3 MB', mem: '12 GB GDDR6', bw: 360 },
      src: [
        ['Tom\'s Hardware RTX 3060 review', 'https://www.tomshardware.com/reviews/nvidia-geforce-rtx-3060-review'],
        ['NVIDIA Ampere GA102 whitepaper (SM)', 'https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf'],
      ],
    },
    {
      id: 'a380', short: 'Arc A380', hubq: 'Arc A380', name: 'Intel Arc A380', alt: 'ACM-G11',
      group: 'gpu', kind: 'Desktop GPU', arch: 'Xe-HPG (Alchemist)',
      measured: [['cpp', 'GPU', 'SYCL']],
      summary: 'Intel\'s smallest Alchemist die: <b>8 Xe-cores in 2 render slices</b>, a 4 MB L2 and 6 GB of GDDR6 on a 96-bit bus. Each Xe-core pairs 16 vector engines with 16 XMX matrix engines. vla.cpp reaches it through SYCL.',
      facts: [['Xe-cores', '8'], ['Vector engines', '128 · 1,024 FP32 lanes'], ['XMX engines', '128'], ['L2', '4 MB'], ['Memory', '6 GB GDDR6 · 96-bit'], ['Bandwidth', '186 GB/s'], ['Clock', '2.0 GHz'], ['Process', 'TSMC N6']],
      chip: {
        col: [
          {
            frame: 'ACM-G11 · Arc A380', chip: true, body: [
              {
                frame: 'GPU · 2 render slices, 8 Xe-cores', k: 'g', m: [['cpp', 'SYCL']], body: [
                  {
                    row: [{
                      rep: 2, of: {
                        frame: 'Render slice $', body: [
                          { row: [{ rep: 4, of: { b: 'Xe-core', s: '16 XVE<br>16 XMX', k: 'g', h: 2 } }], gap: 4 },
                          { b: 'Geometry · raster · 4 RT units', k: 'f', lo: true },
                        ],
                      },
                    }], gap: 6,
                  },
                  { b: 'L2 cache 4 MB', s: 'shared by both slices', k: 'c' },
                ],
              },
              { b: 'PCIe 4.0 · media engine · display', k: 'f', lo: true },
            ],
          },
          { b: '6 GB GDDR6', s: '96-bit · 15.5 Gbps · 186 GB/s', k: 'm' },
        ],
      },
      chipCap: 'A render slice is Intel\'s counterpart to a GPC: fixed-function geometry and raster hardware around four Xe-cores.',
      zoom: [{
        tag: 'One Xe-core',
        node: { xe: { title: 'Xe-core · Xe-HPG', xve: 16, lanes: 8, xmx: 16, xmxBits: 1024, l1: '192 KB', extra: ['Load / store', 'Ray tracing unit'] } },
        cap: 'Each XVE is 256 bits wide, 8 FP32 lanes, with a 32 KB register file of its own. Up to 128 KB of the 192 KB L1 can serve as shared local memory.',
      }],
      cmp: { units: '8 Xe-cores · 2 slices', vec: '1,024 FP32 lanes · 128 XMX', near: 'L1 192 KB / Xe-core', llc: 'L2 4 MB', mem: '6 GB GDDR6', bw: 186 },
      src: [
        ['Intel ARK: Arc A380', 'https://www.intel.com/content/www/us/en/products/sku/227959/intel-arc-a380-graphics/specifications.html'],
        ['Intel Xe-HPG architecture whitepaper', 'https://cdrdv2-public.intel.com/758302/introduction-to-the-xe-hpg-architecture-white-paper.pdf'],
      ],
    },
  );
})();
