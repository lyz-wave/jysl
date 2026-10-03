/**
 * 解忧森林 · 2.5D 剪纸西洋景（Diorama）核心几何与纸艺渲染引擎
 * 算法原理：基于多频波形合成、手剪折线抖动（Scissor Trace）、程序化纸木纹理与种子伪随机数
 */

export function createSeededRandom(initialSeed: number) {
  let a = initialSeed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

/**
 * 计算多边形有向面积，判断顶点顺逆时针
 */
export function polygonArea(p: [number, number][]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const u = p[i];
    const v = p[(i + 1) % p.length];
    a += u[0] * v[1] - v[0] * u[1];
  }
  return a;
}

export function orientPolygon(p: [number, number][]): [number, number][] {
  return polygonArea(p) < 0 ? p.slice().reverse() : p;
}

/**
 * 沿多边形边缘步进细分，并在法线方向加入微小随机位移，模拟手工剪刀修剪出的纸缘质感
 */
export function traceScissorEdge(
  p: [number, number][],
  jitter = 0.7,
  step = 7,
  randomFn: () => number = Math.random
): string {
  let s = '';
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.max(1, Math.round(len / step));
    const nx = -dy / len;
    const ny = dx / len;

    for (let t = 0; t < k; t++) {
      let x = a[0] + (dx * t) / k;
      let y = a[1] + (dy * t) / k;
      if (t > 0) {
        const offset = (randomFn() - 0.5) * 2 * jitter;
        x += nx * offset;
        y += ny * offset;
      }
      s += (s ? 'L' : 'M') + round1(x) + ' ' + round1(y);
    }
  }
  return s + 'Z';
}

export function cutScissorPath(
  p: [number, number][],
  jitter = 0.7,
  step = 7,
  randomFn?: () => number
): string {
  return traceScissorEdge(orientPolygon(p), jitter, step, randomFn);
}

export function holeScissorPath(
  p: [number, number][],
  jitter = 0.7,
  step = 7,
  randomFn?: () => number
): string {
  return traceScissorEdge(orientPolygon(p).slice().reverse(), jitter, step, randomFn);
}

export function polyPath(p: [number, number][]): string {
  const op = orientPolygon(p);
  let s = 'M' + round1(op[0][0]) + ' ' + round1(op[0][1]);
  for (let i = 1; i < op.length; i++) {
    s += 'L' + round1(op[i][0]) + ' ' + round1(op[i][1]);
  }
  return s + 'Z';
}

export function circlePoints(
  cx: number,
  cy: number,
  r: number,
  n?: number
): [number, number][] {
  const p: [number, number][] = [];
  const steps = n || Math.max(8, Math.round(r * 1.4));
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return p;
}

export function starPoints(r1: number, r2: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2 - Math.PI / 2;
    const r = a % 2 === 0 ? r1 : r2;
    pts.push([round1(Math.cos(ang) * r), round1(Math.sin(ang) * r)]);
  }
  return pts;
}

/**
 * 多频正弦波复合生成自然连绵的山脊/坡地线
 */
export function createWaveLine(
  base: number,
  amplitudes: number[],
  wavelengths: number[],
  randomFn: () => number
): (x: number) => number {
  const phases = amplitudes.map(() => randomFn() * Math.PI * 2);
  return (x: number) => {
    let y = base;
    for (let i = 0; i < amplitudes.length; i++) {
      y += amplitudes[i] * Math.sin((x / wavelengths[i]) * Math.PI * 2 + phases[i]);
    }
    return y;
  };
}

/**
 * 沿波形函数向下填充闭合山峦纸片
 */
export function buildRidgePolygon(
  waveFn: (x: number) => number,
  width: number,
  bottom: number,
  margin: number,
  step = 9,
  jitter = 0.9,
  randomFn: () => number = Math.random
): string {
  const p: [number, number][] = [];
  for (let x = -margin; x <= width + margin + step; x += step) {
    p.push([x, waveFn(x) + (randomFn() - 0.5) * 2 * jitter]);
  }
  p.push([width + margin + step, bottom], [-margin, bottom]);
  return polyPath(p);
}

/**
 * 生成多层剪纸松树 (Pine)
 */
export function generatePaperPine(
  cx: number,
  by: number,
  h: number,
  w: number,
  randomFn: () => number
): string {
  const tiers = h > 420 ? 9 : h > 160 ? 7 : h > 70 ? 5 : h > 32 ? 4 : 3;
  const trunkH = h * 0.09;
  const crown = h - trunkH;
  const tip = by - h;
  const st = crown / (tiers + 0.45);
  const j = Math.max(0.45, h / 520);
  const step = Math.max(5, h / 70);
  const lean = (randomFn() - 0.5) * w * 0.12;

  let d = '';
  for (let i = 0; i < tiers; i++) {
    const top = tip + i * st;
    const bot = tip + (i + 1.45) * st;
    const k = (i + 1) / tiers;
    const base = w * 0.5 * (0.26 + 0.74 * Math.pow(k, 0.9));
    const hr = base * (1 + (randomFn() - 0.5) * 0.16);
    const hl = base * (1 + (randomFn() - 0.5) * 0.16);
    const droop = st * 0.14;
    const cx0 = cx + lean * (1 - k);

    d += cutScissorPath(
      [
        [cx0, top],
        [cx + hr, bot + (randomFn() - 0.5) * droop],
        [cx + hr * 0.5, bot - st * 0.28],
        [cx, bot - st * 0.18],
        [cx - hl * 0.5, bot - st * 0.28],
        [cx - hl, bot + (randomFn() - 0.5) * droop],
      ],
      j,
      step,
      randomFn
    );
  }

  // 树干小方块
  const tw = Math.max(1.4, w * 0.055);
  d += cutScissorPath(
    [
      [cx - tw, by + 4],
      [cx - tw * 0.75, by - trunkH - st * 0.6],
      [cx + tw * 0.75, by - trunkH - st * 0.6],
      [cx + tw, by + 4],
    ],
    0.3,
    8,
    randomFn
  );
  return d;
}

/**
 * 生成手剪草叶 (Blade)
 */
export function generatePaperBlade(
  bx: number,
  by: number,
  h: number,
  lean: number,
  wb: number
): string {
  const L: [number, number][] = [];
  const Rt: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const x = bx + lean * t * t;
    const y = by - h * t;
    const hw = wb * 0.5 * (1 - t) * (1 - t * 0.15);
    L.push([x - hw, y]);
    if (i < 6) Rt.push([x + hw, y]);
  }
  return polyPath(L.concat(Rt.reverse()));
}

/**
 * 生成蘑菇丛 (Mushroom)
 */
export function generatePaperMushroom(
  cx: number,
  by: number,
  s: number,
  randomFn: () => number
) {
  const tilt = (randomFn() - 0.5) * s * 0.3;
  const capY = by - s * 0.86;
  const rx = s * (0.46 + randomFn() * 0.16);
  const ry = s * (0.34 + randomFn() * 0.12);

  const stem = cutScissorPath(
    [
      [cx - s * 0.17, by + 2],
      [cx - s * 0.11 + tilt * 0.6, capY + s * 0.05],
      [cx + s * 0.11 + tilt * 0.6, capY + s * 0.05],
      [cx + s * 0.19, by + 2],
    ],
    0.35,
    4,
    randomFn
  );

  const cp: [number, number][] = [];
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI;
    cp.push([cx + tilt + Math.cos(a) * rx, capY + Math.sin(a) * ry]);
  }
  cp.push(
    [cx + tilt + rx * 0.7, capY + ry * 0.2],
    [cx + tilt, capY + ry * 0.28],
    [cx + tilt - rx * 0.7, capY + ry * 0.2]
  );
  const cap = cutScissorPath(cp, 0.4, 4, randomFn);

  let dots = '';
  const nd = 2 + Math.floor(randomFn() * 3);
  for (let i = 0; i < nd; i++) {
    const a = Math.PI * (1.15 + randomFn() * 0.7);
    const rr2 = randomFn() * 0.55 + 0.25;
    dots += cutScissorPath(
      circlePoints(
        cx + tilt + Math.cos(a) * rx * rr2,
        capY + Math.sin(a) * ry * rr2 * 0.9,
        s * (0.05 + randomFn() * 0.05),
        7
      ),
      0.2,
      3,
      randomFn
    );
  }
  return { stem, cap, dots };
}

/**
 * 生成蕨类羽叶 (Fern)
 */
export function generatePaperFern(
  bx: number,
  by: number,
  len: number,
  dir: number,
  randomFn: () => number
): string {
  let d = '';
  const tipX = bx + dir * len * 0.62;
  const tipY = by - len * 0.86;
  const cx = bx + dir * len * 0.02;
  const cy = by - len * 0.78;
  const P = (t: number): [number, number] => [
    (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cx + t * t * tipX,
    (1 - t) * (1 - t) * by + 2 * (1 - t) * t * cy + t * t * tipY,
  ];

  const sp: [number, number][] = [];
  const sp2: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const [x, y] = P(t);
    const w = 1.8 * (1 - t) + 0.4;
    sp.push([x - w, y]);
    sp2.push([x + w, y]);
  }
  d += polyPath(sp.concat(sp2.reverse()));

  for (let t = 0.1; t < 0.97; t += 0.075) {
    const [x, y] = P(t);
    const [x2, y2] = P(Math.min(1, t + 0.01));
    const ta = Math.atan2(y2 - y, x2 - x);
    const L = len * 0.26 * (1 - t * 0.78);
    for (const side of [-1, 1]) {
      const a = ta + side * 1.05;
      const ex = x + Math.cos(a) * L;
      const ey = y + Math.sin(a) * L;
      const mx = x + Math.cos(a) * L * 0.5;
      const my = y + Math.sin(a) * L * 0.5;
      const wd = L * 0.2;
      d += cutScissorPath(
        [
          [x, y],
          [
            mx + Math.cos(a + Math.PI / 2) * wd,
            my + Math.sin(a + Math.PI / 2) * wd,
          ],
          [ex, ey],
          [
            mx - Math.cos(a + Math.PI / 2) * wd,
            my - Math.sin(a + Math.PI / 2) * wd,
          ],
        ],
        0.25,
        4,
        randomFn
      );
    }
  }
  return d;
}

/**
 * 生成毛地黄铃铛花串 (Foxglove)
 */
export function generatePaperFoxglove(
  bx: number,
  by: number,
  h: number,
  lean: number,
  side: number,
  randomFn: () => number
) {
  let stalk = '';
  let bells = '';
  let inner = '';
  const P = (t: number): [number, number] => [bx + lean * t * t, by - h * t];
  const L: [number, number][] = [];
  const Rt: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const [x, y] = P(t);
    const w = 2.2 * (1 - t) + 0.7;
    L.push([x - w, y]);
    Rt.push([x + w, y]);
  }
  stalk = polyPath(L.concat(Rt.reverse()));

  // 底部花叶
  for (const sd of [-1, 1]) {
    const ll = h * 0.28;
    stalk += cutScissorPath(
      [
        [bx, by],
        [bx + sd * ll * 0.35, by - ll * 0.5],
        [bx + sd * ll * 0.9, by - ll * 0.62],
        [bx + sd * ll * 0.55, by - ll * 0.18],
      ],
      0.5,
      6,
      randomFn
    );
  }

  for (let t = 0.36; t < 0.97; t += 0.048) {
    const [x, y] = P(t);
    const s = h * 0.075 * (1 - (t - 0.36) * 1.05);
    const sd = side * (Math.round(t * 100) % 3 === 0 ? -1 : 1);
    if (t > 0.86) {
      bells += cutScissorPath(
        circlePoints(x + sd * s * 0.35, y + s * 0.2, s * 0.42, 7),
        0.2,
        3,
        randomFn
      );
      continue;
    }
    bells += cutScissorPath(
      [
        [x, y - s * 0.15],
        [x + sd * s * 0.55, y + s * 0.05],
        [x + sd * s * 1.05, y + s * 1.05],
        [x + sd * s * 0.78, y + s * 1.28],
        [x + sd * s * 0.38, y + s * 1.14],
        [x + sd * s * 0.12, y + s * 0.5],
      ],
      0.25,
      3,
      randomFn
    );
    inner += cutScissorPath(
      circlePoints(x + sd * s * 0.66, y + s * 1.02, s * 0.13, 6),
      0.1,
      3,
      randomFn
    );
  }
  return { stalk, bells, inner };
}

/**
 * 在客户端生成高质感纯纸浆噪点与细微纤维纹理 Base64 图片
 */
export function generatePaperGrainDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const g = c.getContext('2d');
  if (!g) return '';
  const id = g.createImageData(160, 160);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random();
    if (n < 0.5) {
      d[i] = 74;
      d[i + 1] = 52;
      d[i + 2] = 30;
      d[i + 3] = (0.5 - n) * 46;
    } else {
      d[i] = 255;
      d[i + 1] = 251;
      d[i + 2] = 240;
      d[i + 3] = (n - 0.5) * 40;
    }
  }
  g.putImageData(id, 0, 0);

  // 绘制随机手工纸棉麻纤维丝
  for (let k = 0; k < 90; k++) {
    g.strokeStyle =
      k % 3 ? 'rgba(255,252,242,0.2)' : 'rgba(96,66,36,0.13)';
    g.lineWidth = 0.6;
    g.beginPath();
    const x = Math.random() * 160;
    const y = Math.random() * 160;
    const a = Math.random() * 6.28;
    const l = 4 + Math.random() * 14;
    g.moveTo(x, y);
    g.quadraticCurveTo(
      x + Math.cos(a + 0.6) * l * 0.5,
      y + Math.sin(a + 0.6) * l * 0.5,
      x + Math.cos(a) * l,
      y + Math.sin(a) * l
    );
    g.stroke();
  }
  return c.toDataURL();
}

export interface DioramaData {
  W: number;
  H: number;
  M: number;
  lw: number;
  lh: number;
  d1: string;
  d2: string;
  roofs: string;
  wins: string;
  cottageGlows: Array<{ cx: number; cy: number; r: number }>;
  d3: string;
  d4: string;
  riverPath: string;
  ripples: string;
  glints: Array<{ d: string; delay: number }>;
  d5: string;
  d6: string;
  d7: string;
  tufts: string;
  burrow: string;
  mStems: string;
  mCaps: string;
  mDots: string;
  ferns: string;
  fall1: string;
  fall2: string;
  pebbles: string;
  d8: string;
  fg2: string;
  stalks: string;
  bells: string;
  inner: string;
  mat: string;
  frame: string;
  sunD: number;
  sunX: number;
  sunY: number;
  sunRays: [number, number][];
  moonD: number;
  cloudsConfig: [number, number, number][];
  starsConfig: [number, number][];
  pinStars: Array<{ cx: number; cy: number; r: number; twinkle: boolean; delay: number }>;
}

export function generateDioramaLayers(W: number, H: number, seed: number): DioramaData {
  const R = createSeededRandom(seed);
  const rr = (a: number, b: number) => a + (b - a) * R();
  const portrait = H > W * 1.08;
  const U = Math.sqrt(W * H) / 100;
  const S = Math.min(W, H) * 0.042;
  const M = Math.ceil(S * 1.35 + 14);

  function P<T>(land: T, port: T): T {
    return portrait ? port : land;
  }

  // ---------- L1: 远山纸层 (Far Hills) ----------
  const farWave = createWaveLine(
    H * P(0.395, 0.43),
    [H * 0.034, H * 0.016, H * 0.007],
    [W * 1.15, W * 0.43, W * 0.16],
    R
  );
  const d1 = buildRidgePolygon(farWave, W, H + M, M, 9, 0.9, R);

  // ---------- L2: 连绵丘陵与林中木屋 (Rolling Hills & Cottages) ----------
  const hillWave = createWaveLine(
    H * P(0.47, 0.5),
    [H * 0.036, H * 0.014, H * 0.006],
    [W * 0.9, W * 0.34, W * 0.13],
    R
  );
  let d2 = buildRidgePolygon(hillWave, W, H + M, M, 9, 0.9, R);

  // 丘陵上的微型远松林群
  const phs = R() * 6;
  for (let x = -M; x < (W + M); x += rr(6, 16)) {
    if (
      Math.sin((x / W) * 8.5 + phs) + Math.sin((x / W) * 21 + phs * 2) * 0.5 >
      0.35
    ) {
      const ph = rr(2.1, 4.2) * U;
      d2 += generatePaperPine(x, hillWave(x) + 3, ph, ph * 0.55, R);
    }
  }

  // 远方亮灯的林中小屋 (两座)
  let roofs = '';
  let wins = '';
  const cottageGlows: Array<{ cx: number; cy: number; r: number }> = [];
  for (const cxF of P([0.2, 0.8], [0.24, 0.8])) {
    const cx = W * cxF;
    const s = Math.max(12, U * 2.3);
    const by = hillWave(cx) + s * 0.25;
    d2 += cutScissorPath(
      [
        [cx - s * 0.52, by],
        [cx - s * 0.52, by - s * 0.62],
        [cx + s * 0.52, by - s * 0.62],
        [cx + s * 0.52, by],
      ],
      0.4,
      5,
      R
    );
    // 烟囱
    d2 += cutScissorPath(
      [
        [cx + s * 0.2, by - s * 0.8],
        [cx + s * 0.2, by - s * 1.12],
        [cx + s * 0.36, by - s * 1.12],
        [cx + s * 0.36, by - s * 0.7],
      ],
      0.3,
      4,
      R
    );
    roofs += cutScissorPath(
      [
        [cx - s * 0.66, by - s * 0.54],
        [cx, by - s * 1.08],
        [cx + s * 0.66, by - s * 0.54],
      ],
      0.4,
      4,
      R
    );
    for (const wx of [-0.26, 0.18]) {
      wins += polyPath([
        [cx + wx * s, by - s * 0.42],
        [cx + (wx + 0.15) * s, by - s * 0.42],
        [cx + (wx + 0.15) * s, by - s * 0.24],
        [cx + wx * s, by - s * 0.24],
      ]);
    }
    cottageGlows.push({
      cx: round1(cx),
      cy: round1(by - s * 0.35),
      r: round1(s * 1.6),
    });
  }

  // ---------- L3: 灰绿松木山脊 (Sage Pine Ridge) ----------
  const ridgeWave = createWaveLine(
    H * P(0.545, 0.565),
    [H * 0.014, H * 0.007],
    [W * 0.7, W * 0.23],
    R
  );
  let d3 = buildRidgePolygon(ridgeWave, W, H + M, M, 9, 0.9, R);
  for (let x = -M; x < (W + M); ) {
    const ph = rr(3.6, 7.8) * U * (portrait ? 1.15 : 1);
    const pw = ph * rr(0.46, 0.58);
    d3 += generatePaperPine(x, ridgeWave(x) + 4, ph, pw, R);
    x += pw * rr(0.42, 0.8);
  }

  // ---------- L4: 林间草甸与蜿蜒溪流 (Meadow & River) ----------
  const meadowWave = createWaveLine(
    H * P(0.6, 0.615),
    [H * 0.008, H * 0.004],
    [W * 0.8, W * 0.25],
    R
  );
  const d4 = buildRidgePolygon(meadowWave, W, H + M, M, 10, 0.6, R);

  // 蜿蜒溪流计算
  const yBot = H * P(0.86, 0.84);
  const N = 38;
  const riverAmp = W * P(0.12, 0.2);
  const riverPhase = R() * 0.7 - 0.2;
  const cl: Array<[number, number, number]> = [];
  const Lb: [number, number][] = [];
  const Rb: [number, number][] = [];

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = meadowWave(W * 0.5) + 5 + (yBot - meadowWave(W * 0.5) - 5) * Math.pow(t, 1.3);
    const x =
      W * 0.52 +
      riverAmp * Math.sin(t * Math.PI * 1.9 + riverPhase) * Math.pow(t, 0.65) +
      W * 0.03 * Math.sin(t * 9 + riverPhase);
    const w = W * 0.006 + W * P(0.25, 0.4) * Math.pow(t, 1.75);
    cl.push([x, y, w]);
    Lb.push([x - w / 2 + (R() - 0.5) * 1.4, y]);
    Rb.push([x + w / 2 + (R() - 0.5) * 1.4, y]);
  }
  const riverPath = polyPath(Lb.concat(Rb.slice().reverse()));

  // 溪流表层水波纹 (Ripples)
  let ripples = '';
  for (let i = 0; i < 20; i++) {
    const k = Math.floor(rr(0.18, 1) * N);
    const [rx, ry, rw] = cl[k];
    const cx = rx + (R() - 0.5) * rw * 0.55;
    const len = rw * rr(0.12, 0.32);
    const th = Math.max(1, rw * 0.022);
    ripples += polyPath([
      [cx - len / 2, ry],
      [cx, ry - th],
      [cx + len / 2, ry],
      [cx, ry + th * 0.6],
    ]);
  }

  // 夜晚水面磷光闪烁 (Glints)
  const glints: Array<{ d: string; delay: number }> = [];
  for (let i = 0; i < 15; i++) {
    const k = Math.floor(rr(0.1, 0.95) * N);
    const [gx, gy, gw] = cl[k];
    const cx = gx + (R() - 0.5) * gw * 0.35;
    const len = Math.max(3, gw * rr(0.05, 0.14));
    const th = Math.max(0.8, gw * 0.012);
    glints.push({
      d: polyPath([
        [cx - len / 2, gy],
        [cx, gy - th],
        [cx + len / 2, gy],
        [cx, gy + th],
      ]),
      delay: Number((R() * 3).toFixed(2)),
    });
  }

  // ---------- L5: 溪流两岸苔藓松林 (Moss Pines on River Banks) ----------
  const w5 = createWaveLine(0, [H * 0.012, H * 0.006], [W * 0.5, W * 0.17], R);
  const xL5 = W * P(0.4, 0.44);
  const xR5 = W * P(0.61, 0.56);
  const y5 = H * P(0.675, 0.69);

  const bankFn = (xa: number, xb: number, yEdge: number) => (x: number) => {
    const s = clamp((x - xa) / (xb - xa), 0, 1);
    return yEdge + w5(x) + Math.pow(s, 3) * (H + M - yEdge) * 1.02;
  };
  const bL5 = bankFn(-M, xL5, y5);
  const bR5 = bankFn(W + M, xR5, y5 * 1.005);

  const bankPolygon = (fn: (x: number) => number, x0: number, x1: number) => {
    const p: [number, number][] = [];
    const st = x1 > x0 ? 9 : -9;
    for (let x = x0; st > 0 ? x <= x1 : x >= x1; x += st) {
      p.push([x, Math.min(H + M, fn(x)) + (R() - 0.5) * 1.6]);
    }
    p.push([x1, H + M], [x0, H + M]);
    return polyPath(p);
  };

  let d5 = bankPolygon(bL5, -M, xL5) + bankPolygon(bR5, W + M, xR5);
  const pinesAlong = (
    fn: (x: number) => number,
    xa: number,
    xb: number,
    hMin: number,
    hMax: number,
    wr: number,
    fromEdge: (x: number) => number
  ) => {
    let pD = '';
    for (let x = xa; x < xb; ) {
      const s = fromEdge(x);
      const ph = rr(hMin, hMax) * (1 - s * 0.5);
      const pw = Math.min(ph * wr, W * P(0.14, 0.2));
      if (fn(x) < H * 0.95) pD += generatePaperPine(x, fn(x) + 5, ph, pw, R);
      x += pw * rr(0.4, 0.7);
    }
    return pD;
  };
  d5 += pinesAlong(
    bL5,
    -M * 0.6,
    xL5 * 0.74,
    H * P(0.2, 0.19),
    H * P(0.36, 0.3),
    0.44,
    (x) => clamp((x + M) / (xL5 + M), 0, 1)
  );
  d5 += pinesAlong(
    bR5,
    xR5 + (W - xR5) * 0.26,
    W + M * 0.6,
    H * P(0.2, 0.19),
    H * P(0.36, 0.3),
    0.44,
    (x) => clamp((W + M - x) / (W + M - xR5), 0, 1)
  );

  // ---------- L6: 左右墨绿巨松 (Framing Teal Pines) ----------
  const w6 = createWaveLine(0, [H * 0.01, H * 0.005], [W * 0.4, W * 0.15], R);
  const xL6 = W * P(0.26, 0.34);
  const xR6 = W * P(0.74, 0.66);
  const y6 = H * P(0.82, 0.83);
  const bL6 = (x: number) => {
    const s = clamp((x - -M) / (xL6 - -M), 0, 1);
    return y6 + w6(x) + Math.pow(s, 3) * (H + M - y6) * 1.02;
  };
  const bR6 = (x: number) => {
    const s = clamp((x - (W + M)) / (xR6 - (W + M)), 0, 1);
    return y6 + w6(x) + Math.pow(s, 3) * (H + M - y6) * 1.02;
  };

  let d6 = bankPolygon(bL6, -M, xL6) + bankPolygon(bR6, W + M, xR6);
  const giants = portrait
    ? [
        [-0.06, 0.9],
        [0.12, 0.52],
        [1.05, 0.86],
        [0.9, 0.5],
      ]
    : [
        [0.015, 1.02],
        [0.098, 0.7],
        [0.975, 0.96],
        [0.9, 0.64],
      ];
  for (const [gx, gh] of giants) {
    const x = W * gx;
    const ph = H * gh;
    const pw = Math.min(ph * 0.4, W * P(0.2, 0.36));
    d6 += generatePaperPine(x, (gx < 0.5 ? bL6 : bR6)(x) + 8, ph, pw, R);
  }

  // ---------- L7: 暖赭林地、蘑菇、蕨草与落叶 (Forest Floor) ----------
  const g7w = createWaveLine(
    H * P(0.785, 0.8),
    [H * 0.011, H * 0.006],
    [W * 0.95, W * 0.3],
    R
  );
  const burX = W * P(0.25, 0.2);
  const burR = W * P(0.1, 0.18);
  const g7 = (x: number) => g7w(x) - H * 0.04 * Math.exp(-Math.pow((x - burX) / burR, 2));
  const d7 = buildRidgePolygon(g7, W, H + M, M, 8, 0.7, R);

  // 草丛丝
  let tufts = '';
  for (let x = -M; x < (W + M); x += rr(18, 55)) {
    const y = g7(x) + 2;
    const tn = 3 + Math.floor(R() * 3);
    for (let k = 0; k < tn; k++) {
      tufts += generatePaperBlade(
        x + k * 2.2,
        y + 2,
        rr(0.9, 2.1) * U,
        rr(-0.6, 0.6) * U,
        rr(2, 3.4)
      );
    }
  }

  // 树根洞穴 (Burrow)
  const bw = Math.max(18, W * P(0.042, 0.085));
  const bh = bw * 0.72;
  const by0 = g7(burX) + bh * 1.25;
  const arch: [number, number][] = [[burX - bw / 2, by0]];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI;
    arch.push([
      burX + (Math.cos(a) * bw) / 2,
      by0 - bh * 0.35 + (Math.sin(a) * bh) * 0.9,
    ]);
  }
  arch.push([burX + bw / 2, by0]);
  const burrow = cutScissorPath(arch, 0.6, 5, R);

  // 蘑菇 (Mushrooms)
  let mStems = '';
  let mCaps = '';
  let mDots = '';
  const mClusters = P(
    [
      [0.1, 4],
      [0.6, 3],
      [0.87, 5],
      [0.38, 2],
    ],
    [
      [0.12, 3],
      [0.64, 3],
      [0.9, 2],
    ]
  );
  for (const [cf, mn] of mClusters) {
    for (let k = 0; k < mn; k++) {
      const mx = W * cf + (k - (mn - 1) / 2) * U * rr(1.4, 2.6);
      const ms = U * rr(1.1, 3.1) * (k === Math.floor(mn / 2) ? 1.25 : 1) * P(1, 1.25);
      const m = generatePaperMushroom(mx, g7(mx) + ms * 0.18, ms, R);
      mStems += m.stem;
      mCaps += m.cap;
      mDots += m.dots;
    }
  }

  // 蕨类羽叶 (Ferns)
  let ferns = '';
  const fernClusters = P(
    [
      [0.03, 13, 1],
      [0.33, 9, -1],
      [0.47, 7, 1],
      [0.72, 10, 1],
      [0.96, 12, -1],
    ],
    [
      [0.04, 12, 1],
      [0.42, 9, -1],
      [0.78, 10, 1],
    ]
  );
  for (const [ff, fsz, fdir] of fernClusters) {
    const fx = W * ff;
    ferns += generatePaperFern(fx, g7(fx) + 4, fsz * U * P(1, 1.25), fdir, R);
    ferns += generatePaperFern(
      fx + U * 0.8,
      g7(fx) + 4,
      fsz * U * 0.7 * P(1, 1.25),
      -fdir,
      R
    );
  }

  // 落叶与鹅卵石
  let fall1 = '';
  let fall2 = '';
  let pebbles = '';
  for (let i = 0; i < 9; i++) {
    const px = rr(0.05, 0.95) * W;
    const py = g7(px) + rr(0.6, 3.5) * U;
    const pr = rr(0.3, 0.75) * U;
    pebbles += cutScissorPath(
      circlePoints(px, py, pr, 9).map(([a, b]) => [a, py + (b - py) * 0.6]),
      0.25,
      3,
      R
    );
  }
  const nFall = Math.round(W / 48);
  for (let i = 0; i < nFall; i++) {
    const lx = rr(-0.02, 1.02) * W;
    const lTop = g7(lx) + U * 2.2;
    const ly = lTop + Math.pow(R(), 1.3) * (H * 0.965 - lTop);
    const lsz = rr(0.45, 0.9) * U;
    const la = R() * Math.PI;
    const ca = Math.cos(la);
    const sa = Math.sin(la);
    const lp: [number, number][] = [
      [-1, 0],
      [-0.3, -0.42],
      [0.35, -0.36],
      [1, 0],
      [0.3, 0.4],
      [-0.35, 0.36],
    ].map(([u, v]) => [
      lx + (u * ca - v * sa * 0.8) * lsz,
      ly + (u * sa + v * ca * 0.8) * lsz * 0.62,
    ]);
    if (R() < 0.6) fall1 += cutScissorPath(lp, 0.2, 3, R);
    else fall2 += cutScissorPath(lp, 0.2, 3, R);
  }

  // ---------- L8: 前景长草与毛地黄花串 (Foreground Grass & Foxgloves) ----------
  const g8Wave = createWaveLine(
    H * P(0.945, 0.955),
    [H * 0.008, H * 0.005],
    [W * 0.6, W * 0.2],
    R
  );
  let d8 = buildRidgePolygon(g8Wave, W, H + M, M, 9, 0.8, R);
  let fg2 = '';
  for (let x = -M; x < (W + M); x += rr(3.5, 9)) {
    const s = Math.abs(x - W / 2) / (W / 2);
    const hm = H * (0.018 + P(0.23, 0.2) * Math.pow(clamp(s, 0, 1.2), 2.4));
    const bh = hm * rr(0.35, 1);
    const lean = rr(-0.38, 0.38) * bh;
    const wb = rr(4, 9) * (U / 11 + 0.4);
    const b = generatePaperBlade(x, g8Wave(x) + 6, bh, lean, wb);
    if (R() < 0.3) fg2 += b;
    else d8 += b;
  }

  // 毛地黄花串
  let stalks = '';
  let bells = '';
  let inner = '';
  const flowerConfigs = P(
    [
      [0.065, 0.4, 0.05, 1],
      [0.115, 0.29, -0.03, 1],
      [0.925, 0.36, -0.04, -1],
      [0.885, 0.24, 0.03, -1],
    ],
    [
      [0.08, 0.3, 0.04, 1],
      [0.92, 0.26, -0.04, -1],
    ]
  );
  for (const [fx, fh, fl, fsd] of flowerConfigs) {
    const fxCoord = W * fx;
    const f = generatePaperFoxglove(
      fxCoord,
      g8Wave(fxCoord) + 4,
      H * fh,
      W * fl,
      fsd,
      R
    );
    stalks += f.stalk;
    bells += f.bells;
    inner += f.inner;
  }

  // ---------- L9: 手工相框与毛边卡纸衬圈 (Deckle Mat & Frame Box) ----------
  const e = Math.max(10, Math.min(W, H) * 0.024);
  const rad = e * 3;
  const outer: [number, number][] = [
    [-M - 4, -M - 4],
    [W + M + 4, -M - 4],
    [W + M + 4, H + M + 4],
    [-M - 4, H + M + 4],
  ];
  const rrect = (ins: number, wob: number) => {
    const p: [number, number][] = [];
    const x0 = ins;
    const y0 = ins;
    const x1 = W - ins;
    const y1 = H - ins;
    const seg = (
      ax: number,
      ay: number,
      bx: number,
      by: number
    ) => {
      const len = Math.hypot(bx - ax, by - ay);
      const k = Math.max(1, Math.round(len / 11));
      for (let t = 0; t < k; t++) {
        const u = t / k;
        p.push([
          ax + (bx - ax) * u + (R() - 0.5) * wob,
          ay + (by - ay) * u + (R() - 0.5) * wob,
        ]);
      }
    };
    const arc = (cx: number, cy: number, a0: number) => {
      for (let i = 0; i < 6; i++) {
        const a = a0 + (i / 6) * (Math.PI / 2);
        p.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
    };
    seg(x0 + rad, y0, x1 - rad, y0);
    arc(x1 - rad, y0 + rad, -Math.PI / 2);
    seg(x1, y0 + rad, x1, y1 - rad);
    arc(x1 - rad, y1 - rad, 0);
    seg(x1 - rad, y1, x0 + rad, y1);
    arc(x0 + rad, y1 - rad, Math.PI / 2);
    seg(x0, y1 - rad, x0, y0 + rad);
    arc(x0 + rad, y0 + rad, Math.PI);
    return p;
  };

  const mat =
    cutScissorPath(outer, 0, 4000, R) +
    holeScissorPath(rrect(e, 2.4), 0.5, 6, R);
  const frame =
    cutScissorPath(outer, 0, 4000, R) +
    holeScissorPath(rrect(e * 0.55, 1.2), 0.3, 8, R);

  // ---------- 悬挂日月星云 ----------
  const mSize = Math.min(W, H);
  const sunD = clamp(mSize * 0.16, 78, 168);
  const sunX = W * (portrait ? 0.74 : 0.7);
  const sunY = H * (portrait ? 0.33 : 0.2);

  const sunRays: [number, number][] = [];
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const r = i % 2 ? 47 : 58;
    sunRays.push([Math.cos(a) * r, Math.sin(a) * r]);
  }

  const moonD = sunD * 0.86;
  const cloudsConfig: [number, number, number][] = portrait
    ? [
        [0.8, 0.12, 0.8],
        [0.5, 0.375, 0.6],
      ]
    : [
        [0.44, 0.12, 1],
        [0.575, 0.305, 0.62],
      ];

  const starsConfig: [number, number][] = portrait
    ? [
        [0.14, 0.4],
        [0.5, 0.26],
        [0.88, 0.16],
        [0.4, 0.38],
        [0.64, 0.12],
      ]
    : [
        [0.36, 0.1],
        [0.5, 0.26],
        [0.58, 0.08],
        [0.84, 0.36],
        [0.93, 0.12],
        [0.3, 0.3],
        [0.76, 0.06],
      ];

  const pinStars: Array<{ cx: number; cy: number; r: number; twinkle: boolean; delay: number }> = [];
  const nPins = Math.round((W * H) / 9000);
  for (let i = 0; i < nPins; i++) {
    pinStars.push({
      cx: round1(R() * W),
      cy: round1(Math.pow(R(), 1.4) * H * 0.5),
      r: round1(rr(0.5, 1.5)),
      twinkle: R() < 0.35,
      delay: Number((R() * 3).toFixed(2)),
    });
  }

  return {
    W,
    H,
    M,
    lw: W + 2 * M,
    lh: H + 2 * M,
    d1,
    d2,
    roofs,
    wins,
    cottageGlows,
    d3,
    d4,
    riverPath,
    ripples,
    glints,
    d5,
    d6,
    d7,
    tufts,
    burrow,
    mStems,
    mCaps,
    mDots,
    ferns,
    fall1,
    fall2,
    pebbles,
    d8,
    fg2,
    stalks,
    bells,
    inner,
    mat,
    frame,
    sunD,
    sunX,
    sunY,
    sunRays,
    moonD,
    cloudsConfig,
    starsConfig,
    pinStars,
  };
}

