import { test, expect } from "@playwright/test";
import {
  defaultGear, defaultHinge, defaultPattern, defaultPuzzle, defaultRuler, defaultSign, defaultTag, defaultTestCard,
  gearDrawing, gearGeometry, hingeDrawing, jobEstimate, patternDrawing, printSize, puzzleDrawing, resolution,
  rulerDrawing, signDrawing, steps, tagDrawing, testCardDrawing, defaultJob,
} from "../src/toolkit/generators";
import { toDxf, toSvg } from "../src/toolkit/export";
import type { Drawing } from "../src/toolkit/types";

const inside = (d: Drawing) =>
  d.shapes.every(s => s.contours.every(c => c.points.every(p =>
    p.x >= -1e-6 && p.y >= -1e-6 && p.x <= d.width + 1e-6 && p.y <= d.height + 1e-6)));

const engraved = (d: Drawing) => d.shapes.flatMap(s => s.contours).filter(c => c.layer === "engrave");

test("every generator draws inside its own artboard and exports", () => {
  const drawings = [
    hingeDrawing(defaultHinge), gearDrawing(defaultGear), puzzleDrawing(defaultPuzzle), tagDrawing(defaultTag),
    patternDrawing(defaultPattern), testCardDrawing(defaultTestCard), rulerDrawing(defaultRuler), signDrawing(defaultSign),
  ];
  for (const d of drawings) {
    expect(inside(d), d.shapes[0].name).toBe(true);
    expect(toSvg(d)).toContain("<svg");
    expect(toDxf(d)).toContain("EOF");
  }
});

test("the hinge alternates its slits and keeps them off the edges", () => {
  const d = hingeDrawing({ ...defaultHinge, zone: 10, spacing: 2 });
  const slits = d.shapes[0].contours.slice(1);
  const columns = new Set(slits.map(c => c.points[0].x.toFixed(3)));
  expect(columns.size).toBe(6);
  for (const c of slits) {
    expect(c.closed).toBe(false);
    expect(Math.min(...c.points.map(p => p.y))).toBeGreaterThanOrEqual(defaultHinge.margin - 1e-9);
  }
});

test("the gear's outline reaches the outside diameter and not beyond", () => {
  const d = gearDrawing(defaultGear);
  const g = gearGeometry(defaultGear);
  const centre = d.width / 2;
  const radii = d.shapes[0].contours[0].points.map(p => Math.hypot(p.x - centre, p.y - centre));
  expect(Math.max(...radii)).toBeCloseTo(g.outer, 3);
  expect(Math.min(...radii)).toBeCloseTo(g.root, 3);
  expect(g.pitch * 2).toBeCloseTo(defaultGear.module * defaultGear.teeth, 6);
});

test("a gear with many teeth, whose root lies above the base circle, still closes cleanly", () => {
  const d = gearDrawing({ ...defaultGear, teeth: 80, module: 1 });
  const points = d.shapes[0].contours[0].points;
  for (let i = 1; i < points.length; i++)
    expect(Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)).toBeLessThan(2);
});

test("a puzzle has one edge per shared side, and the same seed gives the same puzzle", () => {
  const o = { ...defaultPuzzle, columns: 4, rows: 3 };
  const d = puzzleDrawing(o);
  expect(d.shapes[0].contours.length - 1).toBe((3 - 1) * 4 + (4 - 1) * 3);
  expect(JSON.stringify(puzzleDrawing(o))).toBe(JSON.stringify(d));
  expect(JSON.stringify(puzzleDrawing({ ...o, seed: o.seed + 1 }))).not.toBe(JSON.stringify(d));
});

test("a tag refuses text that does not fit and places the hole inside", () => {
  expect(() => tagDrawing({ ...defaultTag, text: "A VERY LONG LABEL TEXT", textHeight: 8 })).toThrow(/wider/);
  const d = tagDrawing(defaultTag);
  expect(engraved(d).length).toBeGreaterThan(1);
  for (const shape of ["circle", "hexagon", "star", "shield"] as const)
    expect(inside(tagDrawing({ ...defaultTag, shape, text: "" }))).toBe(true);
});

test("grille holes all sit inside the margin", () => {
  for (const kind of ["hex", "circle", "slot", "diamond"] as const) {
    const o = { ...defaultPattern, kind };
    const d = patternDrawing(o);
    const holes = d.shapes[0].contours.slice(1);
    expect(holes.length, kind).toBeGreaterThan(10);
    for (const c of holes) for (const p of c.points) {
      expect(p.x).toBeGreaterThanOrEqual(o.margin - 1e-6);
      expect(p.x).toBeLessThanOrEqual(o.width - o.margin + 1e-6);
    }
  }
});

test("the test card engraves one square per power and speed pair", () => {
  const d = testCardDrawing({ ...defaultTestCard, columns: 4, rows: 3 });
  const squares = engraved(d).filter(c => c.closed);
  expect(squares).toHaveLength(12);
  expect(steps(100, 500, 5)).toEqual([100, 200, 300, 400, 500]);
});

test("a millimetre ruler has one tick per millimetre", () => {
  const d = rulerDrawing({ ...defaultRuler, length: 100 });
  const ticks = engraved(d).filter(c => c.points.length === 2 && Math.abs(c.points[0].x - c.points[1].x) < 1e-9 && c.points[0].y < 0.01);
  expect(ticks).toHaveLength(101);
  const first = Math.min(...ticks.map(c => c.points[0].x)), last = Math.max(...ticks.map(c => c.points[0].x));
  expect(last - first).toBeCloseTo(100, 9);
});

test("a sign only accepts what the engraving font can draw", () => {
  expect(() => signDrawing({ ...defaultSign, line1: "مرحبا" })).toThrow(/A–Z/);
  expect(() => signDrawing({ ...defaultSign, line1: "", line2: "" })).toThrow();
  expect(signDrawing(defaultSign).width).toBeGreaterThan(0);
});

test("the job estimate adds cutting, piercing and travel", () => {
  const square: Drawing = { width: 100, height: 100, shapes: [{ id: "a", name: "a", contours: [{ closed: true, points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] }] }] };
  const r = jobEstimate(square, { ...defaultJob, cutSpeed: 10, pierce: 1, travel: 0, copies: 2, rate: 36 });
  expect(r.cut).toBe(400);
  expect(r.each).toBeCloseTo(41, 9);
  expect(r.seconds).toBeCloseTo(82, 9);
  expect(r.cost).toBeCloseTo(0.82, 9);
});

test("resolution converts both ways", () => {
  const r = resolution(254, 100, 50);
  expect(r.width).toBe(1000);
  expect(r.height).toBe(500);
  expect(r.interval).toBeCloseTo(0.1, 9);
  const back = printSize(254, 1000, 500);
  expect(back.width).toBeCloseTo(100, 9);
});
