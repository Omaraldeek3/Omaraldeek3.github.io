/**
 * Data for the particle figure on the home page.
 *
 * `public/models/fusion.bin` joins the others: scan.bin's clean surface moved
 * to Omar's own proportions and coloured from his video, with rebuilt eyes
 * (`scripts/bake-fusion.py`); `video.bin` is that video's head on its own
 * (`scripts/bake-video.py`).
 *
 * `public/models/scan.bin`, the default, is the Lee Perry-Smith scan with
 * Omar's hair, brows, eyes and beard from a photo (`scripts/bake-bust.py`).
 * `public/models/omar.bin` is baked by `scripts/bake-depth.py`
 * from a photo of Omar and its Depth Anything V2 depth map; `omar3d.bin` by
 * `scripts/bake-stl.py` from a Hunyuan3D-2 mesh of an earlier photo.
 * `public/models/david.bin` is baked offline by `scripts/bake-stl.py` from
 * SMK's public-domain scan of a cast of Michelangelo's Head of David (KAS2232);
 * `scan.bin` by `scripts/bake-bust.py` from the Lee Perry-Smith head scan
 * (Infinite-Realities, CC BY 3.0). After a 12-byte header ("PCB1", count, unit), each
 * record is 13 bytes: int16 x,y,z · int8 normal · uint8 albedo · uint8 ambient
 * occlusion · uint8 seed · uint8 region (1 = face). Records are shuffled, so reading only the first
 * `count` gives an even subsample: that is how a phone loads fewer points.
 */
export type Cloud = {
  count: number;
  position: Float32Array; // bust surface
  normal: Float32Array; // bust normals, detail from the scan's normal map
  shade: Float32Array; // albedo, ambient occlusion, seed, region
  color: Float32Array; // sRGB albedo; grey for files that carry none
  letter: Float32Array; // the same points arranged as a solid letter
  letterNormal: Float32Array;
  scatter: Float32Array; // where each point waits before it joins the figure
};

// PCB1: 13-byte records with one albedo byte. PCB2: 15 bytes, RGB in its place.

export async function loadCloud(url: string, want: number, glyph: string, fontFamily: string): Promise<Cloud> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`cloud ${response.status}`);
  const buffer = await response.arrayBuffer();
  const view = new DataView(buffer);
  const v2 = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)) === "PCB2";
  const RECORD = v2 ? 15 : 13;
  const total = view.getUint32(4, true);
  const unit = view.getFloat32(8, true);
  const count = Math.min(want, total);

  const position = new Float32Array(count * 3);
  const normal = new Float32Array(count * 3);
  const shade = new Float32Array(count * 4);
  const color = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const o = 12 + i * RECORD;
    position[i * 3] = view.getInt16(o, true) * unit;
    position[i * 3 + 1] = view.getInt16(o + 2, true) * unit;
    position[i * 3 + 2] = view.getInt16(o + 4, true) * unit;
    normal[i * 3] = view.getInt8(o + 6) / 127;
    normal[i * 3 + 1] = view.getInt8(o + 7) / 127;
    normal[i * 3 + 2] = view.getInt8(o + 8) / 127;
    const c = o + 9;
    const r = view.getUint8(c) / 255;
    const g = v2 ? view.getUint8(c + 1) / 255 : r;
    const b = v2 ? view.getUint8(c + 2) / 255 : r;
    const tail = v2 ? c + 3 : c + 1;
    color[i * 3] = r; color[i * 3 + 1] = g; color[i * 3 + 2] = b;
    shade[i * 4] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    shade[i * 4 + 1] = view.getUint8(tail) / 255;
    shade[i * 4 + 2] = view.getUint8(tail + 1) / 255;
    shade[i * 4 + 3] = view.getUint8(tail + 2);
  }

  // A loose shell around the figure: the cloud the points arrive from on load
  // and drift back to at the end of the page.
  // mulberry32: small, fast, and well spread (a plain LCG clumps here).
  let s = 1234567;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const r = 7 + rand() * 9;
    const k = Math.sqrt(1 - u * u);
    scatter[i * 3] = Math.cos(t) * k * r * 1.5;
    scatter[i * 3 + 1] = u * r * 0.8 + 1;
    scatter[i * 3 + 2] = Math.sin(t) * k * r - 4;
  }

  const { letter, letterNormal } = sampleGlyph(glyph, fontFamily, count, rand);
  return { count, position, normal, shade, color, letter, letterNormal, scatter };
}

/** Lays `count` points over a thick, solid letter: two faces and the walls
 *  between them, the way a laser-cut acrylic letter stands on a shelf. */
function sampleGlyph(glyph: string, fontFamily: string, count: number, rand: () => number) {
  const size = 420;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${size * 0.78}px ${fontFamily}`;
  ctx.fillText(glyph, size / 2, size * 0.52);
  const data = ctx.getImageData(0, 0, size, size).data;

  const fill: number[] = [];
  const edge: number[] = [];
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= size || y >= size ? 0 : data[(y * size + x) * 4 + 3]);
  let minX = size, maxX = 0, minY = size, maxY = 0;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      if (at(x, y) < 128) continue;
      fill.push(x, y);
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (at(x - 1, y) < 128 || at(x + 1, y) < 128 || at(x, y - 1) < 128 || at(x, y + 1) < 128) edge.push(x, y);
    }

  const letter = new Float32Array(count * 3);
  const letterNormal = new Float32Array(count * 3);
  if (fill.length === 0) return { letter, letterNormal };

  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const scale = 5.6 / Math.max(maxX - minX, maxY - minY);
  const depth = 0.55;

  for (let i = 0; i < count; i++) {
    const r = rand();
    let x: number, y: number, z: number, nx = 0, ny = 0, nz = 1;
    if (r < 0.62 || edge.length === 0) {
      const k = Math.floor(rand() * (fill.length / 2)) * 2;
      x = fill[k] + rand(); y = fill[k + 1] + rand();
      const front = r < 0.5;
      z = front ? depth : -depth;
      nz = front ? 1 : -1;
    } else {
      const k = Math.floor(rand() * (edge.length / 2)) * 2;
      const ex = edge[k], ey = edge[k + 1];
      x = ex + rand(); y = ey + rand();
      z = (rand() * 2 - 1) * depth;
      // Outward normal from the alpha gradient.
      nx = at(ex - 1, ey) - at(ex + 1, ey);
      ny = at(ex, ey + 1) - at(ex, ey - 1);
      const l = Math.hypot(nx, ny) || 1;
      nx /= l; ny /= l; nz = 0;
    }
    letter[i * 3] = (x - cx) * scale;
    letter[i * 3 + 1] = -(y - cy) * scale + 0.8;
    letter[i * 3 + 2] = z;
    letterNormal[i * 3] = nx;
    letterNormal[i * 3 + 1] = ny;
    letterNormal[i * 3 + 2] = nz;
  }
  return { letter, letterNormal };
}
