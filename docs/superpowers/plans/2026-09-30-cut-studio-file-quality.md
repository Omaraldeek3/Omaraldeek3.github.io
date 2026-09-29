# Cut Studio File Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Cut Studio export cut-ready: real lines, arcs and curves instead of polylines, no duplicated or crossing cut lines, round circles and straight edges from tracing, exact vector weld and offset, and a cleanup tool that repairs imported files.

**Architecture:** A contour keeps its polyline `points` for nesting and previews, and gains an optional exact `curve` (lines, bulge arcs, cubics). Export writes the curve, or fits one to the polyline with `fitPolyline`. Tracing in cut-out mode moves from per-colour masks to one shared boundary graph. Weld and offset move from rasters to Clipper2.

**Tech Stack:** TypeScript, Next.js 16 app at `src/app/tools`, toolkit in `src/toolkit`, Playwright test runner (`npx playwright test tests/<file>`; pure-module tests import TypeScript directly), `@countertype/clipper2-ts` 1.5.4-3.9a869ba (installed).

**Spec:** `docs/superpowers/specs/2026-09-30-cut-studio-file-quality-design.md`

## Global Constraints

- Units are millimetres everywhere in `Drawing`; drawing coordinates are y-down.
- Arc bulge sign is defined in drawing coordinates: `bulge = tan(θ/4)` where θ is the signed sweep measured with `atan2` in y-down coordinates. SVG sweep-flag = `bulge > 0 ? 1 : 0`. DXF export flips y, so it writes `-bulge`.
- DXF stays R12 (`$ACADVER AC1009`), `POLYLINE`/`VERTEX`/`SEQEND`, layers `CUT` (colour 1) and `ENGRAVE` (colour 5), `$INSUNITS 4`.
- SVG export keeps `width="…mm" height="…mm"`, red `#ff0000` cut, blue `#0000ff` engrave, `stroke-width="0.05"`.
- `fitPolyline` never moves a vertex by more than its tolerance. Export tolerance 0.02 mm; biarc tolerance 0.01 mm.
- Clipper2 `D` functions round to `precision` decimals (default 2). Always pass `precision = 4`.
- On-screen previews keep using `points`; only files change.
- Code style matches `src/toolkit`: compact TypeScript, short comments that explain why, no new UI copy without both English and Arabic (`tx(lang, en, ar)`).
- Run `npm run typecheck` and the touched test files before each commit.

## File map

| File | Responsibility |
| --- | --- |
| `src/toolkit/path.ts` (new) | `Seg`/`Curve` types, arc maths, flatten, reverse, transform, SVG path data |
| `src/toolkit/fit.ts` (new) | `fitPolyline`: polyline to lines, arcs and cubics |
| `src/toolkit/biarc.ts` (new) | cubic to arcs for DXF |
| `src/toolkit/types.ts` | `Contour.curve` |
| `src/toolkit/geometry.ts` | `mapShape` maps curves; repair operations for cleanup |
| `src/toolkit/export.ts` | SVG and DXF writers use curves |
| `src/toolkit/vectorize.ts` | snapping in `fitLoop`; shared-edge tracing; background removal |
| `src/toolkit/vector-export.ts` | curves into Drawings; cut-line export writes each edge once |
| `src/toolkit/vector-ops.ts` (new) | Clipper2 union and offset returning curve contours |
| `src/toolkit/lettering-workspace.tsx` | weld through `vector-ops` |
| `src/toolkit/contour-workspace.tsx` | vector offset through `vector-ops` |
| `src/toolkit/vector-workspaces.tsx` | cleanup UI for the repair operations |
| `tests/helpers/geometry-audit.ts` (new) | duplicate length, crossings, node counts |
| `tests/toolkit-path.spec.ts`, `tests/toolkit-fit.spec.ts`, `tests/toolkit-export-curves.spec.ts`, `tests/toolkit-audit.spec.ts`, `tests/toolkit-repair.spec.ts` (new) | tests |
| `scripts/test-pack.ts` (new) | writes the SVG/DXF test pack for Omar |

---

### Task 1: Path model

**Files:**
- Create: `src/toolkit/path.ts`
- Modify: `src/toolkit/types.ts`, `src/toolkit/geometry.ts:14-16` (`mapShape`)
- Test: `tests/toolkit-path.spec.ts`

**Interfaces:**
- Produces:
  - `type Seg = { type:'L'; to:Point } | { type:'A'; to:Point; bulge:number } | { type:'C'; c1:Point; c2:Point; to:Point }`
  - `type Curve = { start: Point; segs: Seg[] }`
  - `arcCenter(a:Point, b:Point, bulge:number): { center:Point; radius:number; start:number; sweep:number }`
  - `arcToCubics(a:Point, seg:{to:Point;bulge:number}): Seg[]` (C segments, ≤90° each)
  - `flattenCurve(curve:Curve, closed:boolean, tolerance:number): Point[]`
  - `reverseCurve(curve:Curve, closed:boolean): Curve`
  - `mapCurve(curve:Curve, fn:(p:Point)=>Point): Curve`
  - `curveToSvg(curve:Curve, closed:boolean, digits?:number): string`
  - `circleCurve(cx, cy, r): Curve`
  - `Contour.curve?: Curve`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/toolkit-path.spec.ts
import { test, expect } from '@playwright/test';
import { arcCenter, arcToCubics, circleCurve, curveToSvg, flattenCurve, mapCurve, reverseCurve, type Curve } from '../src/toolkit/path';
import { mapShape } from '../src/toolkit/geometry';

test('bulge 1 is a half circle and its centre sits on the chord', () => {
  const a = arcCenter({ x: 0, y: 0 }, { x: 20, y: 0 }, 1);
  expect(a.radius).toBeCloseTo(10); expect(a.center.x).toBeCloseTo(10); expect(a.center.y).toBeCloseTo(0);
  expect(Math.abs(a.sweep)).toBeCloseTo(Math.PI);
});
test('a circle curve flattens onto its radius and closes', () => {
  const pts = flattenCurve(circleCurve(50, 40, 25), true, 0.01);
  for (const p of pts) expect(Math.hypot(p.x - 50, p.y - 40)).toBeCloseTo(25, 1);
  expect(pts.length).toBeGreaterThan(40);
});
test('arc to cubics stays within 0.03% of the radius', () => {
  const segs = arcToCubics({ x: 100, y: 0 }, { to: { x: -100, y: 0 }, bulge: 1 });
  expect(segs.length).toBe(2);
  const pts = flattenCurve({ start: { x: 100, y: 0 }, segs }, false, 0.001);
  for (const p of pts) expect(Math.abs(Math.hypot(p.x, p.y) - 100)).toBeLessThan(0.03);
});
test('reverse keeps the same geometry', () => {
  const c: Curve = { start: { x: 0, y: 0 }, segs: [{ type: 'L', to: { x: 10, y: 0 } }, { type: 'A', to: { x: 10, y: 10 }, bulge: 0.5 }, { type: 'C', c1: { x: 5, y: 12 }, c2: { x: 2, y: 12 }, to: { x: 0, y: 10 } }] };
  const a = flattenCurve(c, true, 0.01), b = flattenCurve(reverseCurve(c, true), true, 0.01);
  const near = (p: { x: number; y: number }, set: { x: number; y: number }[]) => Math.min(...set.map(q => Math.hypot(p.x - q.x, p.y - q.y)));
  for (const p of a) expect(near(p, b)).toBeLessThan(0.02);
});
test('similarity keeps arcs, mirror flips the bulge, a stretch turns arcs into cubics', () => {
  const circle = circleCurve(0, 0, 10);
  const moved = mapCurve(circle, p => ({ x: p.x + 5, y: p.y + 5 }));
  expect(moved.segs.every(s => s.type === 'A')).toBe(true);
  const mirrored = mapCurve(circle, p => ({ x: -p.x, y: p.y }));
  expect((mirrored.segs[0] as { bulge: number }).bulge).toBeCloseTo(-(circle.segs[0] as { bulge: number }).bulge);
  const stretched = mapCurve(circle, p => ({ x: p.x * 2, y: p.y }));
  expect(stretched.segs.every(s => s.type === 'C')).toBe(true);
  for (const p of flattenCurve(stretched, true, 0.01)) expect((p.x / 20) ** 2 + (p.y / 10) ** 2).toBeCloseTo(1, 2);
});
test('mapShape carries curves along with points', () => {
  const shape = { id: 's', name: 's', contours: [{ closed: true, points: flattenCurve(circleCurve(0, 0, 5), true, 0.05), curve: circleCurve(0, 0, 5) }] };
  const moved = mapShape(shape, p => ({ x: p.x + 1, y: p.y }));
  expect(moved.contours[0].curve!.start.x).toBeCloseTo(6);
});
test('svg path data writes arcs with the right flags', () => {
  const d = curveToSvg({ start: { x: 0, y: 0 }, segs: [{ type: 'A', to: { x: 20, y: 0 }, bulge: 1 }] }, false);
  expect(d).toMatch(/^M0 0 A10 10 0 0 1 20 0$/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx playwright test tests/toolkit-path.spec.ts`
Expected: FAIL, cannot resolve `../src/toolkit/path`.

- [ ] **Step 3: Implement `path.ts`, the type and `mapShape`**

```ts
// src/toolkit/path.ts
import type { Point } from './types';

/* Exact outlines. A contour's polyline is enough to nest and preview; files
   need the real geometry: straight lines, circular arcs (stored the way DXF
   stores them, as a bulge) and cubic Béziers. Drawing coordinates are y-down;
   bulge = tan(sweep / 4) with the sweep measured in those coordinates. */

export type Seg =
  | { type: 'L'; to: Point }
  | { type: 'A'; to: Point; bulge: number }
  | { type: 'C'; c1: Point; c2: Point; to: Point };
export type Curve = { start: Point; segs: Seg[] };

const TAU = Math.PI * 2;

export function arcCenter(a: Point, b: Point, bulge: number) {
  const sweep = 4 * Math.atan(bulge);
  const chord = Math.hypot(b.x - a.x, b.y - a.y);
  const radius = chord / (2 * Math.abs(Math.sin(sweep / 2)));
  // Distance from the chord's midpoint to the centre, towards the side the sweep turns.
  const h = (chord / 2) / Math.tan(sweep / 2);
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const nx = -(b.y - a.y) / chord, ny = (b.x - a.x) / chord;
  const center = { x: mx + nx * h, y: my + ny * h };
  const start = Math.atan2(a.y - center.y, a.x - center.x);
  return { center, radius, start, sweep };
}

export function arcPoint(a: Point, b: Point, bulge: number, t: number): Point {
  const { center, radius, start, sweep } = arcCenter(a, b, bulge);
  const angle = start + sweep * t;
  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

/** The arc as cubic Béziers of at most 90° each. */
export function arcToCubics(a: Point, seg: { to: Point; bulge: number }): Seg[] {
  const { center, radius, start, sweep } = arcCenter(a, seg.to, seg.bulge);
  const pieces = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-9));
  const step = sweep / pieces, k = (4 / 3) * Math.tan(step / 4);
  const out: Seg[] = [];
  for (let i = 0; i < pieces; i++) {
    const t0 = start + step * i, t1 = t0 + step;
    const p0 = { x: center.x + radius * Math.cos(t0), y: center.y + radius * Math.sin(t0) };
    const p1 = i === pieces - 1 ? seg.to : { x: center.x + radius * Math.cos(t1), y: center.y + radius * Math.sin(t1) };
    out.push({
      type: 'C',
      c1: { x: p0.x - k * radius * Math.sin(t0), y: p0.y + k * radius * Math.cos(t0) },
      c2: { x: p1.x + k * radius * Math.sin(t1), y: p1.y - k * radius * Math.cos(t1) },
      to: p1,
    });
  }
  return out;
}

export function circleCurve(cx: number, cy: number, r: number): Curve {
  return { start: { x: cx + r, y: cy }, segs: [{ type: 'A', to: { x: cx - r, y: cy }, bulge: 1 }, { type: 'A', to: { x: cx + r, y: cy }, bulge: 1 }] };
}

/** The end of each segment, in order, with the start first. */
function ends(curve: Curve) { return [curve.start, ...curve.segs.map(s => s.to)]; }

export function flattenCurve(curve: Curve, closed: boolean, tolerance: number): Point[] {
  const out: Point[] = [curve.start];
  let at = curve.start;
  for (const s of curve.segs) {
    if (s.type === 'L') out.push(s.to);
    else if (s.type === 'A') {
      const { radius, sweep } = arcCenter(at, s.to, s.bulge);
      const step = radius > tolerance ? 2 * Math.acos(1 - tolerance / radius) : Math.PI / 4;
      const n = Math.max(2, Math.ceil(Math.abs(sweep) / step));
      for (let i = 1; i < n; i++) out.push(arcPoint(at, s.to, s.bulge, i / n));
      out.push(s.to);
    } else {
      const split = (p0: Point, p1: Point, p2: Point, p3: Point, depth: number) => {
        const dx = p3.x - p0.x, dy = p3.y - p0.y, chord = Math.hypot(dx, dy) || 1e-12;
        const d1 = Math.abs((p1.x - p3.x) * dy - (p1.y - p3.y) * dx) / chord, d2 = Math.abs((p2.x - p3.x) * dy - (p2.y - p3.y) * dx) / chord;
        if (d1 + d2 <= tolerance || depth > 16) { out.push(p3); return; }
        const m = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        const a = m(p0, p1), b = m(p1, p2), c = m(p2, p3), e = m(a, b), f = m(b, c), g = m(e, f);
        split(p0, a, e, g, depth + 1); split(g, f, c, p3, depth + 1);
      };
      split(at, s.c1, s.c2, s.to, 0);
    }
    at = s.to;
  }
  if (closed && out.length > 1) {
    const first = out[0], last = out[out.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) < 1e-9) out.pop();
  }
  return out;
}

export function reverseCurve(curve: Curve, closed: boolean): Curve {
  const points = ends(curve);
  const segs: Seg[] = [];
  for (let i = curve.segs.length - 1; i >= 0; i--) {
    const s = curve.segs[i], to = points[i];
    if (s.type === 'L') segs.push({ type: 'L', to });
    else if (s.type === 'A') segs.push({ type: 'A', to, bulge: -s.bulge });
    else segs.push({ type: 'C', c1: s.c2, c2: s.c1, to });
  }
  const start = points[points.length - 1];
  void closed;
  return { start, segs };
}

/** Maps a curve through `fn`. Arcs stay arcs when `fn` is a similarity
 *  (checked on a unit frame), and become cubics otherwise. */
export function mapCurve(curve: Curve, fn: (p: Point) => Point): Curve {
  const o = fn({ x: 0, y: 0 }), ex = fn({ x: 1, y: 0 }), ey = fn({ x: 0, y: 1 });
  const ax = { x: ex.x - o.x, y: ex.y - o.y }, ay = { x: ey.x - o.x, y: ey.y - o.y };
  const la = Math.hypot(ax.x, ax.y), lb = Math.hypot(ay.x, ay.y);
  const similar = Math.abs(la - lb) < 1e-9 * Math.max(1, la) && Math.abs(ax.x * ay.x + ax.y * ay.y) < 1e-9 * Math.max(1, la * lb);
  const flip = ax.x * ay.y - ax.y * ay.x < 0 ? -1 : 1;
  const segs: Seg[] = [];
  let at = curve.start;
  for (const s of curve.segs) {
    if (s.type === 'L') segs.push({ type: 'L', to: fn(s.to) });
    else if (s.type === 'C') segs.push({ type: 'C', c1: fn(s.c1), c2: fn(s.c2), to: fn(s.to) });
    else if (similar) segs.push({ type: 'A', to: fn(s.to), bulge: s.bulge * flip });
    else for (const c of arcToCubics(at, s)) if (c.type === 'C') segs.push({ type: 'C', c1: fn(c.c1), c2: fn(c.c2), to: fn(c.to) });
    at = s.to;
  }
  return { start: fn(curve.start), segs };
}

export function curveToSvg(curve: Curve, closed: boolean, digits = 5): string {
  const f = (v: number) => String(Math.round(v * 10 ** digits) / 10 ** digits);
  const p = (q: Point) => `${f(q.x)} ${f(q.y)}`;
  let d = `M${p(curve.start)}`, at = curve.start;
  for (const s of curve.segs) {
    if (s.type === 'L') d += ` L${p(s.to)}`;
    else if (s.type === 'C') d += ` C${p(s.c1)} ${p(s.c2)} ${p(s.to)}`;
    else {
      const { radius, sweep } = arcCenter(at, s.to, s.bulge);
      d += ` A${f(radius)} ${f(radius)} 0 ${Math.abs(sweep) > Math.PI ? 1 : 0} ${s.bulge > 0 ? 1 : 0} ${p(s.to)}`;
    }
    at = s.to;
  }
  return closed ? d + ' Z' : d;
}

export { TAU };
```

In `src/toolkit/types.ts` replace the `Contour` line with:

```ts
import type { Curve } from './path';
/** layer 'engrave' marks marking strokes (labels); everything else is cut.
 *  curve, when present, is the exact outline; points is its 0.05 mm flattening. */
export type Contour = { points: Point[]; closed: boolean; layer?: 'engrave'; curve?: Curve };
```

In `src/toolkit/geometry.ts` replace `mapShape`:

```ts
export function mapShape(shape: Shape, fn: (p: Point)=>Point): Shape {
  return {...shape,contours:shape.contours.map(c=>({...c,points:c.points.map(fn),...(c.curve?{curve:mapCurve(c.curve,fn)}:{})}))};
}
```

and add `import { mapCurve } from './path';` at the top.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx playwright test tests/toolkit-path.spec.ts tests/toolkit-geometry.spec.ts && npm run typecheck`
Expected: PASS. If the svg-flags test fails on sign, fix `curveToSvg` (sweep-flag 1 = positive angle in y-down), not the test.

- [ ] **Step 5: Commit**

```bash
git add src/toolkit/path.ts src/toolkit/types.ts src/toolkit/geometry.ts tests/toolkit-path.spec.ts
git commit -m "feat: give contours an exact outline of lines, arcs and curves"
```

---

### Task 2: `fitPolyline`

**Files:**
- Create: `src/toolkit/fit.ts`
- Modify: `src/toolkit/vectorize.ts` (export `fitCubic` and its `Bez`/`V` helpers unchanged)
- Test: `tests/toolkit-fit.spec.ts`

**Interfaces:**
- Consumes: `Seg`, `Curve`, `arcCenter`, `flattenCurve` from Task 1; `fitCubic(d, first, last, t1, t2, error, out)` from `vectorize.ts`.
- Produces: `fitPolyline(points: Point[], closed: boolean, tolerance: number): Curve`

Algorithm (vertex-based, because generated and imported vertices sit on the true geometry):
1. Drop consecutive duplicate points (and the closing duplicate).
2. Corners: vertices whose turn exceeds 30° (for a closed contour, the ring wraps). A closed contour with no corner starts at vertex 0.
3. Walk each run between corners. At position `i`, find the longest straight run `i..j` (every vertex within `tol` of the chord) and the longest arc run `i..k` (circle through `p[i]`, `p[(i+k)/2]`, `p[k]` fits every vertex within `tol`, all turns share one sign, at least 3 segments). Take the arc if it covers more vertices than the line, else the line if it covers at least 2 segments; otherwise add `p[i+1]` to a pending free-form run.
4. Flush a pending free-form run of ≥ 3 points through `fitCubic` with the given tolerance; a run of 2 points becomes one `L`.
5. A closed contour with no corners that fits one circle becomes two semicircle arcs.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/toolkit-fit.spec.ts
import { test, expect } from '@playwright/test';
import { fitPolyline } from '../src/toolkit/fit';
import { circle, roundedRect, gearDrawing, defaultGear } from '../src/toolkit/generators';
import { flattenCurve } from '../src/toolkit/path';

const dist = (p: { x: number; y: number }, set: { x: number; y: number }[]) => Math.min(...set.map(q => Math.hypot(p.x - q.x, p.y - q.y)));

test('a generated circle becomes two arcs', () => {
  const c = fitPolyline(circle(40, 30, 20), true, 0.02);
  expect(c.segs.map(s => s.type)).toEqual(['A', 'A']);
});
test('a rounded rectangle becomes four lines and four arcs', () => {
  const c = fitPolyline(roundedRect(0, 0, 80, 40, 6), true, 0.02);
  expect(c.segs.filter(s => s.type === 'L')).toHaveLength(4);
  expect(c.segs.filter(s => s.type === 'A')).toHaveLength(4);
});
test('a square stays four exact lines', () => {
  const c = fitPolyline([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }], true, 0.02);
  expect(c.segs).toHaveLength(4); expect(c.segs.every(s => s.type === 'L')).toBe(true);
});
test('an open zigzag keeps every corner', () => {
  const pts = [{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 0 }, { x: 15, y: 5 }];
  expect(fitPolyline(pts, false, 0.02).segs).toHaveLength(3);
});
test('fitting never moves a vertex further than the tolerance', () => {
  const gear = gearDrawing(defaultGear).shapes[0].contours.filter(c => c.layer !== 'engrave');
  for (const contour of gear) {
    const curve = fitPolyline(contour.points, contour.closed, 0.02);
    const dense = flattenCurve(curve, contour.closed, 0.002);
    for (const p of contour.points) expect(dist(p, dense)).toBeLessThan(0.025);
    expect(curve.segs.length).toBeLessThan(contour.points.length / 2);
  }
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test tests/toolkit-fit.spec.ts`
Expected: FAIL, cannot resolve `../src/toolkit/fit`.

- [ ] **Step 3: Implement**

In `src/toolkit/vectorize.ts` change `type V`, `type Bez` and `function fitCubic` declarations to `export type V`, `export type Bez`, `export function fitCubic` (no body change).

```ts
// src/toolkit/fit.ts
import type { Point } from './types';
import type { Curve, Seg } from './path';
import { fitCubic, type Bez } from './vectorize';

/* Turns a polyline back into the geometry it was sampled from: straight
   lines, circular arcs and, for everything else, cubic curves. Error is
   measured at the vertices, because the generators and importers place every
   vertex on the true outline and only the chords between them cut corners. */

const CORNER = Math.cos(Math.PI / 6); // a turn sharper than 30° is a corner

function clean(points: Point[], closed: boolean) {
  const d: Point[] = [];
  for (const p of points) if (!d.length || Math.hypot(p.x - d[d.length - 1].x, p.y - d[d.length - 1].y) > 1e-9) d.push(p);
  if (closed && d.length > 1 && Math.hypot(d[0].x - d[d.length - 1].x, d[0].y - d[d.length - 1].y) < 1e-9) d.pop();
  return d;
}

function circleThrough(a: Point, b: Point, c: Point) {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a.x * a.x + a.y * a.y, b2 = b.x * b.x + b.y * b.y, c2 = c.x * c.x + c.y * c.y;
  const x = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
  const y = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;
  return { x, y, r: Math.hypot(a.x - x, a.y - y) };
}

const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

function straight(p: Point[], i: number, j: number, tol: number) {
  const a = p[i], b = p[j], l = Math.hypot(b.x - a.x, b.y - a.y);
  if (l < 1e-12) return false;
  for (let k = i + 1; k < j; k++) {
    if (Math.abs(cross(a, b, p[k])) / l > tol) return false;
    const t = ((p[k].x - a.x) * (b.x - a.x) + (p[k].y - a.y) * (b.y - a.y)) / (l * l);
    if (t < 0 || t > 1) return false;
  }
  return true;
}

/** The bulge of the arc from p[i] to p[j] through the vertices between, or null. */
function arc(p: Point[], i: number, j: number, tol: number): number | null {
  if (j - i < 3) return null;
  const c = circleThrough(p[i], p[(i + j) >> 1], p[j]);
  if (!c || c.r > 1e5) return null;
  const sign = Math.sign(cross(p[i], p[i + 1], p[i + 2]));
  let sweep = 0;
  for (let k = i; k < j; k++) {
    if (Math.abs(Math.hypot(p[k].x - c.x, p[k].y - c.y) - c.r) > tol) return null;
    if (k + 2 <= j && Math.sign(cross(p[k], p[k + 1], p[k + 2])) !== sign) return null;
    const a0 = Math.atan2(p[k].y - c.y, p[k].x - c.x), a1 = Math.atan2(p[k + 1].y - c.y, p[k + 1].x - c.x);
    let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    sweep += d;
  }
  if (Math.abs(sweep) >= 2 * Math.PI - 1e-6) return null;
  return Math.tan(sweep / 4);
}

function freeForm(run: Point[], tol: number, out: Seg[]) {
  if (run.length < 2) return;
  if (run.length === 2) { out.push({ type: 'L', to: run[1] }); return; }
  const unit = (a: Point, b: Point) => { const l = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: (b.x - a.x) / l, y: (b.y - a.y) / l }; };
  const beziers: Bez[] = [];
  fitCubic(run, 0, run.length - 1, unit(run[0], run[1]), unit(run[run.length - 1], run[run.length - 2]), tol, beziers);
  for (const b of beziers) out.push({ type: 'C', c1: b[1], c2: b[2], to: b[3] });
}

function fitRun(p: Point[], tol: number, out: Seg[]) {
  let pending: Point[] = [p[0]];
  let i = 0;
  const flush = () => { freeForm(pending, tol, out); pending = [p[i]]; };
  while (i < p.length - 1) {
    let line = i + 1;
    while (line + 1 < p.length && straight(p, i, line + 1, tol)) line++;
    let best = -1, bulge = 0;
    for (let k = p.length - 1; k >= i + 3 && best < 0; k--) { const b = arc(p, i, k, tol); if (b !== null) { best = k; bulge = b; } }
    if (best > line) { flush(); out.push({ type: 'A', to: p[best], bulge }); i = best; pending = [p[i]]; continue; }
    if (line - i >= 2 || pending.length === 1) { flush(); out.push({ type: 'L', to: p[line] }); i = line; pending = [p[i]]; continue; }
    i++; pending.push(p[i]);
  }
  if (pending.length > 1) freeForm(pending, tol, out);
}

export function fitPolyline(points: Point[], closed: boolean, tolerance: number): Curve {
  const d = clean(points, closed);
  if (d.length < 2) return { start: d[0] ?? { x: 0, y: 0 }, segs: [] };
  const n = d.length;
  if (closed && n >= 8) {
    const c = circleThrough(d[0], d[Math.floor(n / 3)], d[Math.floor((2 * n) / 3)]);
    if (c && d.every(p => Math.abs(Math.hypot(p.x - c.x, p.y - c.y) - c.r) <= tolerance)) {
      const opposite = { x: 2 * c.x - d[0].x, y: 2 * c.y - d[0].y };
      const b = Math.sign(cross(d[0], d[1], d[2])) || 1;
      return { start: d[0], segs: [{ type: 'A', to: opposite, bulge: b }, { type: 'A', to: d[0], bulge: b }] };
    }
  }
  const turn = (i: number) => {
    const a = d[(i - 1 + n) % n], b = d[i], c = d[(i + 1) % n];
    const ux = b.x - a.x, uy = b.y - a.y, vx = c.x - b.x, vy = c.y - b.y;
    return (ux * vx + uy * vy) / ((Math.hypot(ux, uy) * Math.hypot(vx, vy)) || 1);
  };
  const corners: number[] = [];
  for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) if (turn(i) < CORNER) corners.push(i);
  const start = closed ? (corners[0] ?? 0) : 0;
  const ring = closed ? [...d.slice(start), ...d.slice(0, start), d[start]] : d;
  const cuts = closed ? corners.map(c => (c - start + n) % n).concat(n) : [...corners, n - 1];
  const segs: Seg[] = [];
  let from = 0;
  for (const to of cuts) { if (to > from) fitRun(ring.slice(from, to + 1), tolerance, segs); from = to; }
  return { start: ring[0], segs };
}
```

- [ ] **Step 4: Run tests**

Run: `npx playwright test tests/toolkit-fit.spec.ts && npm run typecheck`
Expected: PASS. If the rounded-rectangle test yields extra `L` segments at the tangent points, the arc search must start at the first arc vertex; debug with the failing contour printed.

- [ ] **Step 5: Commit**

```bash
git add src/toolkit/fit.ts src/toolkit/vectorize.ts tests/toolkit-fit.spec.ts
git commit -m "feat: fit polylines back into lines, arcs and curves"
```

---

### Task 3: Curves in SVG and DXF export

**Files:**
- Create: `src/toolkit/biarc.ts`
- Modify: `src/toolkit/export.ts`
- Test: `tests/toolkit-export-curves.spec.ts`; existing `tests/toolkit-geometry.spec.ts`, `tests/toolkit-dxf.spec.ts` must stay green

**Interfaces:**
- Consumes: `fitPolyline` (Task 2), `curveToSvg`, `arcCenter`, `Curve`, `Seg` (Task 1).
- Produces: `contourCurve(c: Contour): Curve` (the curve, or the fitted polyline); `cubicToArcs(from: Point, seg: {c1,c2,to}, tolerance: number): Seg[]`.

- [ ] **Step 1: Failing tests**

```ts
// tests/toolkit-export-curves.spec.ts
import { test, expect } from '@playwright/test';
import { toSvg, toDxf } from '../src/toolkit/export';
import { circle, roundedRect } from '../src/toolkit/generators';
import { parseDxf } from '../src/toolkit/dxf-import';
import { cubicToArcs } from '../src/toolkit/biarc';
import { flattenCurve } from '../src/toolkit/path';

const drawing = (points: { x: number; y: number }[]) => ({ width: 100, height: 100, shapes: [{ id: 'a', name: 'a', contours: [{ closed: true, points }] }] });

test('a circle exports as two SVG arcs', () => {
  const svg = toSvg(drawing(circle(50, 50, 20)));
  expect((svg.match(/ A/g) || []).length).toBe(2);
  expect(svg).not.toMatch(/ L/);
});
test('a circle exports as two DXF bulge vertices and imports back round', () => {
  const dxf = toDxf(drawing(circle(50, 50, 20)));
  expect((dxf.match(/\n42\n/g) || []).length).toBe(2);
  const back = parseDxf(dxf);
  expect(back.width).toBeCloseTo(40, 2); expect(back.height).toBeCloseTo(40, 2);
});
test('a rounded rectangle exports 4 lines and 4 arcs', () => {
  const svg = toSvg(drawing(roundedRect(10, 10, 60, 30, 5)));
  expect((svg.match(/ A/g) || []).length).toBe(4);
  expect((svg.match(/ L/g) || []).length).toBeLessThanOrEqual(4);
});
test('a cubic becomes arcs within 0.01 mm', () => {
  const from = { x: 0, y: 0 }, seg = { c1: { x: 10, y: 20 }, c2: { x: 30, y: -10 }, to: { x: 40, y: 10 } };
  const arcs = cubicToArcs(from, seg, 0.01);
  expect(arcs.length).toBeLessThan(24);
  const exact = flattenCurve({ start: from, segs: [{ type: 'C', ...seg }] }, false, 0.001);
  const approx = flattenCurve({ start: from, segs: arcs }, false, 0.001);
  for (const p of exact) expect(Math.min(...approx.map(q => Math.hypot(p.x - q.x, p.y - q.y)))).toBeLessThan(0.012);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test tests/toolkit-export-curves.spec.ts`
Expected: FAIL (`biarc` missing; SVG has `L` only).

- [ ] **Step 3: Implement**

```ts
// src/toolkit/biarc.ts
import type { Point } from './types';
import type { Seg } from './path';
import { arcPoint } from './path';

/* DXF R12 has lines and arcs but no Béziers, so each cubic is replaced by a
   chain of biarcs: two arcs meeting tangentially, split further until every
   sampled point of the cubic lies within the tolerance. */

type C = { c1: Point; c2: Point; to: Point };
const at = (p0: Point, s: C, t: number): Point => {
  const m = 1 - t, a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
  return { x: a * p0.x + b * s.c1.x + c * s.c2.x + d * s.to.x, y: a * p0.y + b * s.c1.y + c * s.c2.y + d * s.to.y };
};
const unit = (x: number, y: number) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };

/** Bulge of the arc leaving `a` along tangent `t` and ending at `b` (0 when straight). */
function bulgeFrom(a: Point, t: Point, b: Point) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const angle = Math.atan2(t.x * dy - t.y * dx, t.x * dx + t.y * dy); // half the sweep
  return Math.tan(angle / 2);
}

function split(p0: Point, s: C): [C, Point, C] {
  const m = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const a = m(p0, s.c1), b = m(s.c1, s.c2), c = m(s.c2, s.to), e = m(a, b), f = m(b, c), g = m(e, f);
  return [{ c1: a, c2: e, to: g }, g, { c1: f, c2: c, to: s.to }];
}

function biarc(p0: Point, s: C): Seg[] | null {
  const t0 = unit(s.c1.x - p0.x || s.c2.x - p0.x, s.c1.y - p0.y || s.c2.y - p0.y);
  const t1 = unit(s.to.x - s.c2.x || s.to.x - s.c1.x, s.to.y - s.c2.y || s.to.y - s.c1.y);
  // Joint on the incentre-style point: equal tangent lengths from both ends.
  const v = { x: s.to.x - p0.x, y: s.to.y - p0.y }, tt = { x: t0.x + t1.x, y: t0.y + t1.y };
  const a = 2 * (1 - (t0.x * t1.x + t0.y * t1.y)), b = 2 * (v.x * tt.x + v.y * tt.y), c = -(v.x * v.x + v.y * v.y);
  const d = Math.abs(a) < 1e-12 ? -c / b : (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  if (!Number.isFinite(d) || d <= 0) return null;
  const joint = { x: (p0.x + d * t0.x + s.to.x - d * t1.x) / 2, y: (p0.y + d * t0.y + s.to.y - d * t1.y) / 2 };
  const b1 = bulgeFrom(p0, t0, joint);
  const back = bulgeFrom(s.to, { x: -t1.x, y: -t1.y }, joint);
  return [{ type: 'A', to: joint, bulge: b1 }, { type: 'A', to: s.to, bulge: -back }];
}

export function cubicToArcs(from: Point, seg: C, tolerance: number, depth = 0): Seg[] {
  const arcs = biarc(from, seg);
  if (arcs && depth < 12) {
    let ok = true;
    const probe = (t: number) => {
      const p = at(from, seg, t);
      let best = Infinity, start = from;
      for (const s of arcs) {
        if (s.type !== 'A') continue;
        for (let k = 0; k <= 16; k++) {
          const q = Math.abs(s.bulge) < 1e-9 ? { x: start.x + (s.to.x - start.x) * k / 16, y: start.y + (s.to.y - start.y) * k / 16 } : arcPoint(start, s.to, s.bulge, k / 16);
          best = Math.min(best, Math.hypot(p.x - q.x, p.y - q.y));
        }
        start = s.to;
      }
      return best;
    };
    for (let k = 1; k < 16 && ok; k++) if (probe(k / 16) > tolerance) ok = false;
    if (ok) return arcs.map(s => (s.type === 'A' && Math.abs(s.bulge) < 1e-9 ? { type: 'L', to: s.to } : s));
  }
  if (depth >= 12) return [{ type: 'L', to: seg.to }];
  const [left, mid, right] = split(from, seg);
  return [...cubicToArcs(from, left, tolerance, depth + 1), ...cubicToArcs(mid, right, tolerance, depth + 1)];
}
```

The probe samples 16 points per arc; that is a sampling bound, which the test checks with a dense comparison. Keep it.

Replace the writers in `src/toolkit/export.ts`:

```ts
import type { Contour, Drawing, Shape } from './types';
import type { Curve, Seg } from './path';
import { curveToSvg } from './path';
import { fitPolyline } from './fit';
import { cubicToArcs } from './biarc';

const n=(v:number)=>{if(!Number.isFinite(v))throw new Error('Export contains an invalid dimension.');return String(Math.round(v*1e5)/1e5);};
const engraved=(c:Contour)=>c.layer==='engrave';
/** The contour's exact outline, or one fitted to its polyline within 0.02 mm. */
export function contourCurve(c:Contour):Curve{return c.curve??fitPolyline(c.points,c.closed,0.02);}
/** Path data for a shape's cut contours, or its engrave contours when `layer` is 'engrave'. Previews use this polyline form. */
export function pathData(s:Shape,layer:'cut'|'engrave'='cut'){return s.contours.filter(c=>engraved(c)===(layer==='engrave')).map(c=>c.points.map((p,i)=>`${i?'L':'M'}${n(p.x)} ${n(p.y)}`).join(' ')+(c.closed?' Z':'')).join(' ');}
function fileData(s:Shape,layer:'cut'|'engrave'){return s.contours.filter(c=>engraved(c)===(layer==='engrave')).map(c=>curveToSvg(contourCurve(c),c.closed)).join(' ');}
```

In `toSvg`, change `pathData(s,layer)` to `fileData(s,layer)`. In `toDxf`, replace the per-contour loop with:

```ts
  for(const s of [...d.shapes,...labelShapes(d)])for(const c of s.contours){
    const layer=engraved(c)?'ENGRAVE':'CUT';
    const curve=contourCurve(c);
    // DXF has no Béziers: cubics become arcs. Each vertex carries the bulge of the segment that leaves it.
    const segs:Seg[]=[];let at=curve.start;
    for(const seg of curve.segs){if(seg.type==='C')segs.push(...cubicToArcs(at,seg,0.01));else segs.push(seg);at=seg.to;}
    const closed=c.closed&&segs.length>0;
    // A closed curve ends on its start; that vertex is implied by the closed flag.
    const last=segs[segs.length-1];
    const drop=closed&&last&&Math.hypot(last.to.x-curve.start.x,last.to.y-curve.start.y)<1e-9;
    pairs.push(0,'POLYLINE',8,layer,66,1,10,0,20,0,30,0,70,closed?1:0);
    const vertex=(p:{x:number;y:number},bulge:number)=>{pairs.push(0,'VERTEX',8,layer,10,n(p.x),20,n(d.height-p.y),30,0);if(bulge)pairs.push(42,n(-bulge));};
    const bulgeOf=(s:Seg|undefined)=>s&&s.type==='A'?s.bulge:0;
    vertex(curve.start,bulgeOf(segs[0]));
    for(let i=0;i<segs.length-(drop?1:0);i++)vertex(segs[i].to,drop&&i===segs.length-2?bulgeOf(segs[segs.length-1]):bulgeOf(segs[i+1]));
    pairs.push(0,'SEQEND',8,layer);
  }
```

Check: when `drop` is true the closing segment's bulge belongs to the last written vertex, which the ternary handles.

- [ ] **Step 4: Run all export-related tests**

Run: `npx playwright test tests/toolkit-export-curves.spec.ts tests/toolkit-geometry.spec.ts tests/toolkit-dxf.spec.ts tests/toolkit-box.spec.ts tests/toolkit-generators.spec.ts && npm run typecheck`
Expected: PASS. Old assertions that searched for exact polyline vertex text in SVG/DXF may need updating to curve output; update them only where they asserted the old flattening, and keep their intent (closure, dimensions, y direction, layers).

- [ ] **Step 5: Commit**

```bash
git add src/toolkit/biarc.ts src/toolkit/export.ts tests/
git commit -m "feat: export real lines, arcs and curves to SVG and DXF"
```

---

### Task 4: Geometry audit helper and generator guarantees

**Files:**
- Create: `tests/helpers/geometry-audit.ts`, `tests/toolkit-audit.spec.ts`

**Interfaces:**
- Produces: `audit(d: Drawing): { contours, points, openCut, duplicateMm, crossings, selfCrossings, cutMm }` and `auditSvg(svg: string)` is not needed (tests work on Drawings).

- [ ] **Step 1: Write the helper** — copy the analyser from the audit (scratchpad `analyze.ts`) into `tests/helpers/geometry-audit.ts`, typed with `Drawing` from `../../src/toolkit/types`, exporting `audit`. Keep `EPS = 0.02`, the self-crossing cap of 400 segments, and field names `duplicateMm`, `crossings`, `selfCrossings`.

- [ ] **Step 2: Write the tests**

```ts
// tests/toolkit-audit.spec.ts
import { test, expect } from '@playwright/test';
import { audit } from './helpers/geometry-audit';
import * as g from '../src/toolkit/generators';
import { buildBox } from '../src/toolkit/box';
import { defaultBoxOptions } from '../src/toolkit/box/types';
import { kerfDrawing } from '../src/toolkit/geometry';

const drawings: [string, () => ReturnType<typeof g.hingeDrawing>][] = [
  ['hinge', () => g.hingeDrawing(g.defaultHinge)], ['gear', () => g.gearDrawing(g.defaultGear)],
  ['puzzle', () => g.puzzleDrawing(g.defaultPuzzle)], ['tag', () => g.tagDrawing(g.defaultTag)],
  ...(['hex', 'circle', 'slot', 'diamond'] as const).map(kind => [`pattern-${kind}`, () => g.patternDrawing({ ...g.defaultPattern, kind })] as [string, () => ReturnType<typeof g.hingeDrawing>]),
  ['testcard', () => g.testCardDrawing(g.defaultTestCard)], ['ruler', () => g.rulerDrawing(g.defaultRuler)],
  ['kerf', () => kerfDrawing(3, 0.05, 5)],
  ...(['closed', 'open', 'liftoff', 'sliding', 'drawer'] as const).map(type => [`box-${type}`, () => buildBox({ ...defaultBoxOptions, type }).drawing] as [string, () => ReturnType<typeof g.hingeDrawing>]),
];
for (const [name, make] of drawings) test(`${name} has no duplicated or crossing cut lines`, () => {
  const a = audit(make());
  expect(a.duplicateMm).toBe(0); expect(a.crossings).toBe(0); expect(a.selfCrossings).toBe(0);
});
```

- [ ] **Step 3: Run**

Run: `npx playwright test tests/toolkit-audit.spec.ts`
Expected: PASS (the audit found these clean). This locks the guarantee in.

- [ ] **Step 4: Commit**

```bash
git add tests/helpers/geometry-audit.ts tests/toolkit-audit.spec.ts
git commit -m "test: guard every generator against duplicated and crossing cut lines"
```

---

### Task 5: Tracing fits real lines and circles, and hands curves to the laser tools

**Files:**
- Modify: `src/toolkit/vectorize.ts` (`fitLoop`), `src/toolkit/vector-export.ts` (`resultToDrawing`)
- Create: `tests/fixtures/logo.ts` (builds the audit logo raster with `sharp`, which is installed)
- Test: `tests/toolkit-vectorize.spec.ts` (add cases)

**Interfaces:**
- Consumes: `fitPolyline`-style helpers are not used here; snapping lives inside `fitLoop`. `Curve` from Task 1.
- Produces: `resultToDrawing(result, widthMm)` sets `contour.curve` for every traced contour (collinear cubics become `L`).

Snapping rules inside `fitLoop(points, error, cornerAngle, reach)`, after `soften`:
1. **Whole-loop circle:** if there are no corners and a least-squares circle (Kåsa fit) matches every point within `max(0.35, error * 0.5)` pixels, return the circle as 4 cubics (use `arcToCubics` twice on semicircles and convert to `Curve` tuples).
2. **Straight pieces:** for each piece between two corners, if every point lies within `max(0.35, error * 0.5)` of the chord, emit one cubic with controls at 1/3 and 2/3 of the chord.
3. **G1 joins:** the no-corner branch fits the whole ring with one tangent at the seam; confirm with the test below that consecutive cubics share tangents (angle < 2°) wherever no corner was detected. If the test shows kinks, find where `fitCubic` emits the depth-limit fallback and replace that fallback with a split at the midpoint using the shared centre tangent.

- [ ] **Step 1: Fixture**

```ts
// tests/fixtures/logo.ts
import sharp from 'sharp';
export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#fff"/><circle cx="220" cy="250" r="170" fill="#d62828"/><circle cx="220" cy="250" r="110" fill="#fff"/><rect x="150" y="180" width="140" height="140" fill="#003049"/><text x="430" y="230" font-family="Arial" font-weight="bold" font-size="110" fill="#003049">SIGN</text><text x="430" y="360" font-family="Tahoma" font-weight="bold" font-size="110" fill="#f77f00">ورشة</text></svg>`;
export async function logoRaster() {
  const { data, info } = await sharp(Buffer.from(LOGO_SVG)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}
```

- [ ] **Step 2: Failing tests (append to `tests/toolkit-vectorize.spec.ts`)**

```ts
import { logoRaster } from './fixtures/logo';
import { resultToDrawing } from '../src/toolkit/vector-export';
import { flattenCurve } from '../src/toolkit/path';

test('outline tracing draws the ring as true circles and the square with straight sides', async () => {
  const r = vectorize(await logoRaster(), { ...defaultVectorize, mode: 'outline' });
  const d = resultToDrawing(r, 800); // 1 mm per pixel
  const contours = d.shapes.flatMap(s => s.contours);
  for (const R of [170, 110]) {
    const ring = contours.find(c => c.points.every(p => Math.abs(Math.hypot(p.x - 220, p.y - 250) - R) < 3))!;
    expect(ring).toBeTruthy();
    const dense = flattenCurve(ring.curve!, true, 0.01);
    expect(Math.max(...dense.map(p => Math.abs(Math.hypot(p.x - 220, p.y - 250) - R)))).toBeLessThan(0.4);
  }
  const square = contours.find(c => c.points.every(p => p.x > 140 && p.x < 300 && p.y > 170 && p.y < 330))!;
  expect(square.curve!.segs.filter(s => s.type === 'L')).toHaveLength(4);
});
test('smooth traced outlines have no kinks where no corner was found', async () => {
  const r = vectorize(await logoRaster(), { ...defaultVectorize, mode: 'outline' });
  const ring = resultToDrawing(r, 800).shapes.flatMap(s => s.contours).find(c => c.points.every(p => Math.abs(Math.hypot(p.x - 220, p.y - 250) - 170) < 3))!;
  const segs = ring.curve!.segs;
  for (let i = 0; i < segs.length; i++) {
    const a = segs[i], b = segs[(i + 1) % segs.length];
    if (a.type !== 'C' || b.type !== 'C') continue;
    const t1 = Math.atan2(a.to.y - a.c2.y, a.to.x - a.c2.x), t2 = Math.atan2(b.c1.y - a.to.y, b.c1.x - a.to.x);
    let diff = Math.abs(t1 - t2); if (diff > Math.PI) diff = 2 * Math.PI - diff;
    expect(diff).toBeLessThan((2 * Math.PI) / 180);
  }
});
```

- [ ] **Step 3: Run to verify failure**

Run: `npx playwright test tests/toolkit-vectorize.spec.ts -g "circles|kinks"`
Expected: FAIL (`curve` undefined; deviation ≈0.9 px).

- [ ] **Step 4: Implement**

In `vector-export.ts` `resultToDrawing`, build each contour with both forms:

```ts
import type { Curve, Seg } from './path';
/** A traced path as a Curve in millimetres; a cubic whose controls sit on its chord is a line. */
export function pathCurve(path: VectorPath, k: number): Curve {
  const P = (x: number, y: number) => ({ x: x * k, y: y * k });
  const segs: Seg[] = [];
  let at = P(path.x, path.y);
  for (const c of path.curves) {
    const c1 = P(c[0], c[1]), c2 = P(c[2], c[3]), to = P(c[4], c[5]);
    const l = Math.hypot(to.x - at.x, to.y - at.y) || 1;
    const off = (q: { x: number; y: number }) => Math.abs((to.x - at.x) * (q.y - at.y) - (to.y - at.y) * (q.x - at.x)) / l;
    segs.push(off(c1) < 1e-6 && off(c2) < 1e-6 ? { type: 'L', to } : { type: 'C', c1, c2, to });
    at = to;
  }
  return { start: P(path.x, path.y), segs };
}
```

and in `resultToDrawing` set `curve: pathCurve(path, k)` next to `points`.

In `vectorize.ts` add inside `fitLoop` (after `soften`, before the corner branches):

```ts
  const snap = Math.max(0.35, error * 0.5);
  if (!corners.length) {
    // Kåsa least-squares circle.
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
    for (const p of d) { const z = p.x * p.x + p.y * p.y; sx += p.x; sy += p.y; sxx += p.x * p.x; syy += p.y * p.y; sxy += p.x * p.y; sxz += p.x * z; syz += p.y * z; sz += z; }
    const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]], B = [sxz, syz, sz];
    const det3 = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det3(A);
    if (Math.abs(D) > 1e-9) {
      const col = (i: number) => A.map((row, r) => row.map((v, c) => (c === i ? B[r] : v)));
      const a = det3(col(0)) / D, b = det3(col(1)) / D, c = det3(col(2)) / D;
      const cx = a / 2, cy = b / 2, r = Math.sqrt(c + cx * cx + cy * cy);
      if (Number.isFinite(r) && d.every(p => Math.abs(Math.hypot(p.x - cx, p.y - cy) - r) <= snap)) {
        const dir = polygonArea(d) > 0 ? 1 : -1;
        const s0 = { x: cx + r, y: cy }, s1 = { x: cx - r, y: cy };
        const cubics = [...arcToCubics(s0, { to: s1, bulge: dir }), ...arcToCubics(s1, { to: s0, bulge: dir })];
        return { x: s0.x, y: s0.y, curves: cubics.map(s => (s.type === 'C' ? [s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.to.x, s.to.y] : [0, 0, 0, 0, 0, 0]) as Curve) };
      }
    }
  }
```

(Import `arcToCubics` from `./path`; note the local `Curve` type in `vectorize.ts` is the 6-tuple, so import path's type under another name if needed.)

In the corner branch, before `fitCubic(piece, …)`, add:

```ts
      const a = piece[0], b = piece[piece.length - 1], l = Math.hypot(b.x - a.x, b.y - a.y);
      if (l > 0 && piece.every(p => Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / l <= snap)) {
        out.push([a, { x: a.x + (b.x - a.x) / 3, y: a.y + (b.y - a.y) / 3 }, { x: a.x + (2 * (b.x - a.x)) / 3, y: a.y + (2 * (b.y - a.y)) / 3 }, b]);
        continue;
      }
```

- [ ] **Step 5: Run the vectorize tests and the full toolkit suite**

Run: `npx playwright test tests/toolkit-vectorize.spec.ts tests/toolkit-image.spec.ts && npm run typecheck`
Expected: PASS. If the kink test still fails, apply rule 3 above and re-run.

- [ ] **Step 6: Commit**

```bash
git add src/toolkit/vectorize.ts src/toolkit/vector-export.ts tests/fixtures/logo.ts tests/toolkit-vectorize.spec.ts
git commit -m "fix: trace round circles and straight edges, and keep the curves"
```

---

### Task 6: Cut-out tracing on one shared boundary graph

**Files:**
- Create: `src/toolkit/edges.ts`
- Modify: `src/toolkit/vectorize.ts` (cut-out branch, `VectorResult.edges`, `removeBackground` option), `src/toolkit/vector-export.ts` (`outlineSvg`, `cutDrawing`), `src/toolkit/vectorize-workspace.tsx` (option toggle; DXF uses `cutDrawing` in cut-out mode)
- Test: `tests/toolkit-vectorize.spec.ts`

**Interfaces:**
- Produces:
  - `type VectorEdge = VectorPath & { closed: boolean; left: number; right: number }` (labels; `-1` = outside or removed background)
  - `VectorResult.edges?: VectorEdge[]` (present in cut-out mode)
  - `VectorizeOptions.removeBackground: boolean` (default `true`)
  - `traceEdges(labels: Uint8Array, w: number, h: number, error: number, cornerAngle: number, reach: number): VectorEdge[]`
  - `cutDrawing(result: VectorResult, widthMm: number): Drawing` — one shape, each edge once

Algorithm for `traceEdges` (in `edges.ts`):
1. Vertices are pixel corners `(x, y)`, `0 ≤ x ≤ w`, `0 ≤ y ≤ h`; label outside the image is `-1`.
2. A crack exists on every pixel side whose two pixels differ in label. Record for each crack the label on its left and right when walked in +x or +y direction.
3. A vertex is a junction when it touches ≠ 2 cracks, or 2 cracks with different label pairs.
4. Walk chains from junction to junction (and closed chains with no junction), collecting vertex coordinates and the left/right labels of the chain.
5. Smooth each chain with the existing `soften` (endpoints fixed as corners), find corners with `findCorners` on the chain (open version: treat endpoints as corners), fit with `fitCubic` between corners with `error`, pinning the chain's end points exactly.
6. Return edges in pixel units. `vectorize` divides by the upsample factor as it does for paths.

Region loops for the colour preview and per-colour nesting: for each label, collect edges where it is `left` or `right`, orient them so the label is on the left (reverse with swapped controls), and chain them by matching end points (exact equality, since ends are shared junction coordinates) into closed `VectorPath`s. That replaces the per-colour `traceMask` call in cut-out mode.

Background: when `removeBackground` is on, the label covering the most border pixels (if more than 50% of border pixels) is treated as `-1`: its regions are not emitted as layers, and edges between it and the outside disappear.

`outlineSvg` in cut-out mode writes `result.edges` (each once) grouped by the colour of their `left` label (or `right` if `left` is `-1`). `cutDrawing` converts every edge to a contour with `curve` (via `pathCurve`) and `points` (via `flatten`).

- [ ] **Step 1: Failing tests**

```ts
test('cut-out tracing shares every border between colours and drops the background', async () => {
  const r = vectorize(await logoRaster(), { ...defaultVectorize, mode: 'color', layering: 'cutout', colors: 4 });
  expect(r.edges?.length).toBeGreaterThan(0);
  const d = cutDrawing(r, 800);
  const a = audit(d);
  expect(a.duplicateMm).toBe(0);
  expect(a.crossings).toBe(0);
  // No contour runs along the image border.
  for (const c of d.shapes.flatMap(s => s.contours)) expect(c.points.some(p => p.x > 1 && p.x < 799 && p.y > 1 && p.y < 499)).toBe(true);
  expect(r.layers.some(l => l.color.toLowerCase() >= '#f0f0f0')).toBe(false);
});
test('cut-out tracing of a photo stays under 15 seconds', async () => {
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp('public/images/coffee.jpg').resize(700).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const t = Date.now();
  vectorize({ width: info.width, height: info.height, data: new Uint8ClampedArray(data) }, { ...defaultVectorize, mode: 'color', layering: 'cutout', colors: 4 });
  expect(Date.now() - t).toBeLessThan(15000);
});
```

(Imports: `audit` from `./helpers/geometry-audit`, `cutDrawing` from `../src/toolkit/vector-export`.)

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test tests/toolkit-vectorize.spec.ts -g "cut-out"`
Expected: FAIL (`edges` undefined; photo ≈72 s, the test times out — set `test.setTimeout(120000)` in that test).

- [ ] **Step 3: Implement `edges.ts`**, then wire the cut-out branch in `vectorize` to call `traceEdges` once instead of looping `traceMask` per colour, build layers from region loops, add `removeBackground` to `VectorizeOptions` and `defaultVectorize`, add `edges` to `VectorResult`, update `outlineSvg` and add `cutDrawing`. In `vectorize-workspace.tsx`: add a `Toggle` "Remove background" / "احذف الخلفية" bound to the option, and make the DXF button use `cutDrawing(result, width)` when `mode === 'color' && layering === 'cutout'`.

Export `soften`, `findCorners`, `fitCubic`, `tangent` from `vectorize.ts` for reuse (no body changes); `findCorners` works on closed loops, so for an open chain pass the endpoints as fixed corners and skip wrap-around by checking indices.

- [ ] **Step 4: Run tests**

Run: `npx playwright test tests/toolkit-vectorize.spec.ts tests/toolkit-image.spec.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Check the result by eye** — render `outlineSvg` of the logo cut-out to PNG with `sharp` (as in the audit) and view it: every border drawn once, no page frame.

- [ ] **Step 6: Commit**

```bash
git add src/toolkit/edges.ts src/toolkit/vectorize.ts src/toolkit/vector-export.ts src/toolkit/vectorize-workspace.tsx tests/toolkit-vectorize.spec.ts
git commit -m "fix: trace cut-out colours on shared borders, each cut once, without the background"
```

---

### Task 7: Vector weld and offset with Clipper2

**Files:**
- Create: `src/toolkit/vector-ops.ts`
- Modify: `src/toolkit/lettering-workspace.tsx` (`weld`), `src/toolkit/contour-workspace.tsx` (vector mode)
- Test: `tests/toolkit-vector-ops.spec.ts`

**Interfaces:**
- Consumes: `fitPolyline` (Task 2), `flattenCurve` (Task 1).
- Produces:
  - `unionContours(loops: Point[][], tolerance?: number): Contour[]` — closed contours with `curve`, holes included, non-zero fill
  - `offsetContours(loops: Point[][], distance: number, tolerance?: number): Contour[]` — round joins, positive grows

- [ ] **Step 1: Failing tests**

```ts
// tests/toolkit-vector-ops.spec.ts
import { test, expect } from '@playwright/test';
import { unionContours, offsetContours } from '../src/toolkit/vector-ops';
import { audit } from './helpers/geometry-audit';

const sq = (x: number, y: number, s: number) => [{ x, y }, { x: x + s, y }, { x: x + s, y: y + s }, { x, y: y + s }];
test('overlapping squares weld into one outline of straight lines', () => {
  const out = unionContours([sq(0, 0, 10), sq(5, 5, 10)]);
  expect(out).toHaveLength(1);
  expect(out[0].curve!.segs.every(s => s.type === 'L')).toBe(true);
  expect(out[0].curve!.segs).toHaveLength(8);
});
test('a ring keeps its hole', () => {
  const outer = Array.from({ length: 200 }, (_, i) => ({ x: 20 * Math.cos((i / 200) * 2 * Math.PI), y: 20 * Math.sin((i / 200) * 2 * Math.PI) }));
  const inner = outer.map(p => ({ x: p.x / 2, y: p.y / 2 })).reverse();
  expect(unionContours([outer, inner])).toHaveLength(2);
});
test('offsetting a square with round joins gives four lines and four arcs', () => {
  const out = offsetContours([sq(0, 0, 20)], 3);
  expect(out).toHaveLength(1);
  const segs = out[0].curve!.segs;
  expect(segs.filter(s => s.type === 'L')).toHaveLength(4);
  expect(segs.filter(s => s.type === 'A')).toHaveLength(4);
  expect(audit({ width: 30, height: 30, shapes: [{ id: 'o', name: 'o', contours: out }] }).selfCrossings).toBe(0);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test tests/toolkit-vector-ops.spec.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement**

```ts
// src/toolkit/vector-ops.ts
import { unionD, inflatePathsD, FillRule, JoinType, EndType } from '@countertype/clipper2-ts';
import type { Contour, Point } from './types';
import { fitPolyline } from './fit';
import { flattenCurve } from './path';

/* Weld and offset on the outlines themselves, not on a picture of them.
   Clipper2 works on polygons, so curves go in finely flattened and come out
   refitted into lines, arcs and curves within the tolerance. Clipper2's
   double-precision calls round to `precision` decimals: 4 keeps 0.0001 mm. */

const PRECISION = 4;

function toContours(paths: Point[][], tolerance: number): Contour[] {
  return paths.filter(p => p.length >= 3).map(p => {
    const curve = fitPolyline(p, true, tolerance);
    return { closed: true, curve, points: flattenCurve(curve, true, 0.05) };
  });
}

export function unionContours(loops: Point[][], tolerance = 0.01): Contour[] {
  const out = unionD(loops.map(l => l.map(p => ({ x: p.x, y: p.y }))), [], FillRule.NonZero, PRECISION);
  if (!out.length && loops.length) throw new Error('Could not weld these outlines.');
  return toContours(out, tolerance);
}

export function offsetContours(loops: Point[][], distance: number, tolerance = 0.01): Contour[] {
  const merged = unionD(loops, [], FillRule.NonZero, PRECISION);
  // arcTolerance sets how finely round joins are drawn before refitting.
  const out = inflatePathsD(merged, distance, JoinType.Round, EndType.Polygon, 2, PRECISION, 0.002);
  return toContours(out, tolerance);
}
```

In `lettering-workspace.tsx`, replace the body of `weld(glyphs, bounds)` with: flatten each glyph's commands to loops with the existing `commandLoops(glyphs, 0.005 / unitsPerMm)` equivalent already used for the exact path (use `commandLoops` from `lettering.ts`), call `unionContours(loops)`, and return the contours' `points` plus keep the `curve` on the resulting Drawing contours. Remove the canvas code and the `isolines` import.

In `contour-workspace.tsx`, for `mode === 'vector'`: skip `rasterizeDrawing`; collect the closed cut contours' points (or `flattenCurve(c.curve, true, 0.005)` when present), call `offsetContours(loops, d)` for each ring distance, and use the returned contours (they carry `curve`). When `holes` is on, pass only outer loops (the loops with the largest absolute area per shape and those not inside another loop; reuse `inside` logic via point-in-polygon on the first vertex). Keep the raster path unchanged for `mode === 'image'`.

- [ ] **Step 4: Run tests and the lettering/offset suites**

Run: `npx playwright test tests/toolkit-vector-ops.spec.ts tests/toolkit-lettering.spec.ts tests/toolkit-offset.spec.ts && npm run typecheck`
Expected: PASS. Update lettering/offset tests only where they asserted raster-specific node counts.

- [ ] **Step 5: Browser check** — start `portfolio-dev`, open `/tools?lang=ar`, switch to Arabic lettering, export SVG, and confirm with the in-page analyser (see audit) 0 duplicates and far fewer than 5,307 points; repeat for Contour & offset.

- [ ] **Step 6: Commit**

```bash
git add src/toolkit/vector-ops.ts src/toolkit/lettering-workspace.tsx src/toolkit/contour-workspace.tsx tests/toolkit-vector-ops.spec.ts tests/
git commit -m "feat: weld letters and offset outlines as vectors, with Clipper2"
```

---

### Task 8: Vector cleanup that repairs

**Files:**
- Modify: `src/toolkit/geometry.ts` (add repair operations; keep `cleanDrawing` signature working for existing tests), `src/toolkit/vector-workspaces.tsx` (cleanup UI)
- Test: `tests/toolkit-repair.spec.ts`

**Interfaces:**
- Produces:
  - `type RepairOptions = { overlaps: boolean; join: number /* mm, 0 = off */; minArea: number; reduce: boolean }`
  - `repairDrawing(d: Drawing, o: RepairOptions): { drawing: Drawing; overlapsRemovedMm: number; joined: number; tiny: number; nodesBefore: number; nodesAfter: number }`

Algorithm:
- **Overlaps:** collect every cut segment of every contour. For each pair of collinear, overlapping segments (distance of both ends to the other's line ≤ 0.02 mm, positive overlap length), remove the overlapping interval from the later segment (split it into up to two pieces). Rebuild: contours untouched by removal keep their shape; a contour that lost pieces becomes one or more open contours made from its remaining consecutive pieces. Run on flattened points (use `c.points`), then drop `curve` on changed contours.
- **Join:** repeatedly connect the two open contours whose end points are closest, if the gap is ≤ `join`; a contour whose own ends are within `join` becomes closed.
- **Tiny:** existing `minArea` rule.
- **Reduce:** set `curve = fitPolyline(points, closed, 0.02)` on every contour without one (export would do the same; this makes the node counts visible in the UI).

- [ ] **Step 1: Failing tests**

```ts
// tests/toolkit-repair.spec.ts
import { test, expect } from '@playwright/test';
import { repairDrawing } from '../src/toolkit/geometry';
import { audit } from './helpers/geometry-audit';

const rect = (x: number, y: number, w: number, h: number) => ({ closed: true, points: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }] });
test('two rectangles sharing an edge are cut along it once', () => {
  const d = { width: 40, height: 20, shapes: [{ id: 'a', name: 'a', contours: [rect(0, 0, 20, 20)] }, { id: 'b', name: 'b', contours: [rect(20, 0, 20, 20)] }] };
  expect(audit(d).duplicateMm).toBeCloseTo(20);
  const r = repairDrawing(d, { overlaps: true, join: 0, minArea: 0, reduce: false });
  expect(audit(r.drawing).duplicateMm).toBe(0);
  expect(r.overlapsRemovedMm).toBeCloseTo(20);
  expect(audit(r.drawing).cutMm).toBeCloseTo(100, 0);
});
test('an open path with a small gap is closed', () => {
  const d = { width: 20, height: 20, shapes: [{ id: 'a', name: 'a', contours: [{ closed: false, points: [{ x: 0, y: 0.05 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 0 }] }] }] };
  const r = repairDrawing(d, { overlaps: false, join: 0.1, minArea: 0, reduce: false });
  expect(r.joined).toBe(1);
  expect(r.drawing.shapes[0].contours[0].closed).toBe(true);
});
test('reduce nodes turns a polygon circle into arcs', () => {
  const pts = Array.from({ length: 360 }, (_, i) => ({ x: 10 + 5 * Math.cos((i * Math.PI) / 180), y: 10 + 5 * Math.sin((i * Math.PI) / 180) }));
  const r = repairDrawing({ width: 20, height: 20, shapes: [{ id: 'c', name: 'c', contours: [{ closed: true, points: pts }] }] }, { overlaps: false, join: 0, minArea: 0, reduce: true });
  expect(r.nodesBefore).toBe(360); expect(r.nodesAfter).toBe(2);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test tests/toolkit-repair.spec.ts`
Expected: FAIL (`repairDrawing` missing).

- [ ] **Step 3: Implement `repairDrawing`** in `geometry.ts` following the algorithm above (count `nodesAfter` as the sum of `curve.segs.length` for contours with a curve, else `points.length`). Keep `cleanDrawing` as is for its existing callers and tests.

- [ ] **Step 4: UI** — in `EditWorkspace` for `tool === 'clean'`, replace the duplicates toggle with four controls: `Toggle` "Remove overlapping lines" / "احذف الخطوط المتداخلة" (default on), `NumberField` "Join gaps up to" / "اربط الفجوات حتى" in mm (default 0.1), the existing minimum area field, and `Toggle` "Reduce nodes" / "قلّل النقاط" (default on). Show `Stat`s: overlapping length removed (mm), paths joined, tiny removed, nodes before → after. "Apply" calls `repairDrawing` and stores the result as today.

- [ ] **Step 5: Run**

Run: `npx playwright test tests/toolkit-repair.spec.ts tests/toolkit-geometry.spec.ts tests/toolkit-ui.spec.ts && npm run typecheck`
Expected: PASS (update `toolkit-ui.spec.ts` only where it clicked the removed duplicates toggle).

- [ ] **Step 6: Commit**

```bash
git add src/toolkit/geometry.ts src/toolkit/vector-workspaces.tsx tests/toolkit-repair.spec.ts tests/toolkit-ui.spec.ts
git commit -m "feat: make vector cleanup repair overlaps, gaps and node counts"
```

---

### Task 9: Imports round-trip as curves, full suite, test pack

**Files:**
- Test: `tests/toolkit-export-curves.spec.ts` (add round-trip cases)
- Create: `scripts/test-pack.ts`
- Modify: `docs/TOOLKIT.md` (export section: curves, arcs, DXF bulges; cleanup operations)

- [ ] **Step 1: Round-trip tests (append)**

```ts
import { parseDxf } from '../src/toolkit/dxf-import';
test('a DXF ARC and CIRCLE import and export as arcs', () => {
  const src = [0,'SECTION',2,'HEADER',9,'$INSUNITS',70,4,0,'ENDSEC',0,'SECTION',2,'ENTITIES',0,'CIRCLE',8,'0',10,50,20,50,40,20,0,'ENDSEC',0,'EOF'].join('\n');
  const out = toDxf(parseDxf(src));
  expect((out.match(/\n42\n/g) || []).length).toBe(2);
});
```

SVG import needs a DOM, so its round-trip runs in the browser test file `tests/toolkit-import.spec.ts`: add a test that loads `/tools`, imports an SVG with `<circle r="20">` through the page's file input (follow the pattern already in that file), exports SVG via the page, and asserts 2 `A` commands in the download.

- [ ] **Step 2: Run the entire suite**

Run: `npm run typecheck && npm run lint && npx playwright test`
Expected: PASS. Fix regressions before continuing.

- [ ] **Step 3: Test pack script**

```ts
// scripts/test-pack.ts — run with: npx jiti scripts/test-pack.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { toSvg, toDxf } from '../src/toolkit/export';
import { buildBox } from '../src/toolkit/box';
import { defaultBoxOptions } from '../src/toolkit/box/types';
import { gearDrawing, defaultGear, puzzleDrawing, defaultPuzzle } from '../src/toolkit/generators';
import { vectorize, defaultVectorize } from '../src/toolkit/vectorize';
import { cutDrawing, resultToDrawing } from '../src/toolkit/vector-export';
import { offsetContours } from '../src/toolkit/vector-ops';
import { logoRaster } from '../tests/fixtures/logo';

const out = 'test-pack';
mkdirSync(out, { recursive: true });
const save = (name: string, d: Parameters<typeof toSvg>[0]) => { writeFileSync(`${out}/${name}.svg`, toSvg(d)); writeFileSync(`${out}/${name}.dxf`, toDxf(d)); };
save('box-closed', buildBox(defaultBoxOptions).drawing);
save('gear-24', gearDrawing(defaultGear));
save('puzzle', puzzleDrawing(defaultPuzzle));
const raster = await logoRaster();
save('logo-outline', resultToDrawing(vectorize(raster, { ...defaultVectorize, mode: 'outline' }), 200));
save('logo-cutout-cutlines', cutDrawing(vectorize(raster, { ...defaultVectorize, mode: 'color', layering: 'cutout', colors: 4 }), 200));
const square = [{ x: 10, y: 10 }, { x: 60, y: 10 }, { x: 60, y: 40 }, { x: 10, y: 40 }];
save('offset-5mm', { width: 80, height: 60, shapes: [{ id: 'o', name: 'offset', contours: offsetContours([square], 5) }] });
console.log(`test pack written to ${out}/`);
```

Arabic welded lettering needs HarfBuzz in the browser; export it from the running app's lettering tool (default text, Bold) into `test-pack/lettering-weld.svg` and `.dxf` manually via the page, as in Task 7 Step 5.

Add `test-pack/` to `.gitignore`.

- [ ] **Step 4: Update `docs/TOOLKIT.md`** — replace the statement that curves export as line segments with: SVG keeps lines, arcs and Bézier curves; DXF R12 uses lines and arcs (bulges), with curves converted to arcs within 0.01 mm; files without curves are fitted within 0.02 mm; the cleanup tool's four operations and their defaults.

- [ ] **Step 5: Commit and push the branch**

```bash
git add scripts/test-pack.ts docs/TOOLKIT.md .gitignore tests/
git commit -m "test: round-trip imported curves and write a machine test pack"
git push -u origin cut-studio-file-quality
```

- [ ] **Step 6: Hand the test pack to Omar** with what to check: opens in CorelDRAW with few nodes; imports into RDWorks at the right size; the logo cut lines need no "delete overlap"; circles cut round.
