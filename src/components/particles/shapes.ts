/**
 * Point-cloud generators for the five morph targets. Each returns N xyz triples
 * in a ~±3 unit box. A seeded RNG keeps the field identical on every visit.
 *
 *   0 sphere  · runtime            1 mesh  · service mesh (13 nodes)
 *   2 stack   · data layer         3 text  · {API}
 *   4 core    · single endpoint
 */

export function createRng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

const gaussian = (rand: Rng) => {
  let u = 0;
  let v = 0;
  while (!u) u = rand();
  while (!v) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Fibonacci sphere plus a tilted equatorial ring. */
export function shapeSphere(n: number, rand: Rng): Float32Array {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const onSphere = Math.floor(n * 0.72);
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (i < onSphere) {
      const yy = 1 - (i / (onSphere - 1)) * 2;
      const r = Math.sqrt(1 - yy * yy);
      const theta = golden * i;
      const radius = 2.0 + gaussian(rand) * 0.03;
      x = Math.cos(theta) * r * radius;
      y = yy * radius;
      z = Math.sin(theta) * r * radius;
    } else {
      const u = rand() * Math.PI * 2;
      const v = rand() * Math.PI * 2;
      const tube = 0.08 + rand() * 0.06;
      const ring = 2.75;
      const tx = (ring + tube * Math.cos(v)) * Math.cos(u);
      const tz = (ring + tube * Math.cos(v)) * Math.sin(u);
      const ty = tube * Math.sin(v);
      const tilt = 0.42;
      x = tx;
      y = ty * Math.cos(tilt) - tz * Math.sin(tilt);
      z = ty * Math.sin(tilt) + tz * Math.cos(tilt);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** 13 clustered nodes joined by their nearest neighbours, plus spokes to a hub. */
export function shapeMesh(n: number, rand: Rng): Float32Array {
  const nodes: [number, number, number, number][] = [[0, 0, 0, 0.32]];
  for (let tries = 0; nodes.length < 13 && tries < 5000; tries++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 1.5 + rand() * 1.1;
    const p: [number, number, number, number] = [
      Math.sin(phi) * Math.cos(theta) * r * 1.15,
      Math.cos(phi) * r * 0.85,
      Math.sin(phi) * Math.sin(theta) * r,
      0.12 + rand() * 0.14,
    ];
    if (nodes.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) > 1.0)) nodes.push(p);
  }
  const edges: [number, number][] = [];
  const hasEdge = (a: number, b: number) => edges.some((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
  nodes.forEach((p, i) => {
    nodes
      .map((q, j) => [j, Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2])] as const)
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .forEach(([j]) => {
        if (!hasEdge(i, j)) edges.push([i, j]);
      });
    if (i > 0 && rand() < 0.5 && !hasEdge(0, i)) edges.push([0, i]);
  });

  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (rand() < 0.55) {
      const node = nodes[Math.floor(rand() * nodes.length)];
      x = node[0] + gaussian(rand) * node[3];
      y = node[1] + gaussian(rand) * node[3];
      z = node[2] + gaussian(rand) * node[3];
    } else {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const p = nodes[a];
      const q = nodes[b];
      const t = rand();
      const jitter = 0.018;
      x = p[0] + (q[0] - p[0]) * t + gaussian(rand) * jitter;
      y = p[1] + (q[1] - p[1]) * t + gaussian(rand) * jitter;
      z = p[2] + (q[2] - p[2]) * t + gaussian(rand) * jitter;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** Four stacked database cylinders, tilted towards the viewer. */
export function shapeStack(n: number, rand: Rng): Float32Array {
  const out = new Float32Array(n * 3);
  const disks = 4;
  const radius = 1.45;
  const height = 0.42;
  const gap = 0.24;
  const tilt = 0.4;
  const total = disks * height + (disks - 1) * gap;
  for (let i = 0; i < n; i++) {
    const disk = Math.floor(rand() * disks);
    const y0 = -total / 2 + disk * (height + gap);
    const k = rand();
    const theta = rand() * Math.PI * 2;
    let y: number;
    let r = radius;
    if (k < 0.34) y = y0 + height; // top rim
    else if (k < 0.54) y = y0; // bottom rim
    else if (k < 0.78) y = y0 + rand() * height; // wall
    else {
      // lid (only the top disk shows a filled lid)
      y = y0 + height;
      r = radius * Math.sqrt(rand()) * (disk === disks - 1 ? 1 : 0.98);
      if (disk !== disks - 1 && rand() < 0.6) {
        y = y0 + rand() * height;
        r = radius;
      }
    }
    const x = Math.cos(theta) * r + gaussian(rand) * 0.01;
    const z = Math.sin(theta) * r + gaussian(rand) * 0.01;
    out.set([x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)], i * 3);
  }
  return out;
}

/** Points sampled from text drawn on an offscreen canvas. Falls back to the sphere. */
export async function shapeText(n: number, rand: Rng, text = "{API}"): Promise<Float32Array> {
  const font = '700 230px "Geist Mono", ui-monospace, monospace';
  try {
    await Promise.race([document.fonts.load(font), new Promise((resolve) => setTimeout(resolve, 1200))]);
  } catch {
    // Font loading is best effort; the fallback monospace still reads.
  }
  const width = 900;
  const height = 320;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return shapeSphere(n, rand);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.fillText(text, width / 2, height / 2 + 8);
  const data = ctx.getImageData(0, 0, width, height).data;
  const pixels: number[] = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 140) pixels.push(x, y);
    }
  }
  const count = pixels.length / 2;
  if (!count) return shapeSphere(n, rand);
  const span = 5.4;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(rand() * count) * 2;
    out.set(
      [
        ((pixels[k] + rand() * 2 - width / 2) / width) * span,
        (-(pixels[k + 1] + rand() * 2 - height / 2) / width) * span,
        gaussian(rand) * 0.09,
      ],
      i * 3,
    );
  }
  return out;
}

/** A dense glowing core with a thin orbit ring. */
export function shapeCore(n: number, rand: Rng): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (rand() < 0.74) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 0.55 * Math.pow(rand(), 2.2);
      x = Math.sin(phi) * Math.cos(theta) * r;
      y = Math.cos(phi) * r;
      z = Math.sin(phi) * Math.sin(theta) * r;
    } else {
      const theta = rand() * Math.PI * 2;
      const r = 1.05 + Math.pow(rand(), 1.6) * 0.75;
      const tilt = 1.15;
      const rx = Math.cos(theta) * r;
      const rz = Math.sin(theta) * r;
      const ry = gaussian(rand) * 0.02;
      x = rx;
      y = ry * Math.cos(tilt) - rz * Math.sin(tilt);
      z = ry * Math.sin(tilt) + rz * Math.cos(tilt);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}
