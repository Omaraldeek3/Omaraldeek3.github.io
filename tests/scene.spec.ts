import { test, expect } from "@playwright/test";
import { createScene, stepScene } from "../src/lib/scene";
import { copy } from "../src/content/site";

const labels = ["PLAN", "WRITE", "CHECK", "VOICE", "RENDER", "PUBLISH"];

test("the scene is built from the real factory stations", () => {
  expect(copy.ar.stations.map(s => s.code)).toEqual(labels);
  expect(copy.en.stations.map(s => s.code)).toEqual(labels);
});

test("a node per station, chained in production order", () => {
  const scene = createScene(labels);
  expect(scene.nodes).toHaveLength(6);
  expect(scene.nodes.map(n => n.label)).toEqual(labels);
  expect(scene.edges).toHaveLength(5);
  scene.edges.forEach((edge, index) => {
    expect(edge.from).toBe(scene.nodes[index].id);
    expect(edge.to).toBe(scene.nodes[index + 1].id);
  });
});

test("coordinates stay inside the unit square", () => {
  for (const node of createScene(labels).nodes) {
    expect(node.x).toBeGreaterThanOrEqual(0);
    expect(node.x).toBeLessThanOrEqual(1);
    expect(node.y).toBeGreaterThanOrEqual(0);
    expect(node.y).toBeLessThanOrEqual(1);
  }
});

test("stepping advances pulses and wraps without losing any", () => {
  let scene = createScene(labels);
  const count = scene.pulses.length;
  expect(count).toBeGreaterThan(0);
  const before = scene.pulses[0].progress;
  scene = stepScene(scene, 100);
  expect(scene.pulses).toHaveLength(count);
  expect(scene.pulses[0].progress).not.toBe(before);
  for (let i = 0; i < 300; i++) scene = stepScene(scene, 100);
  expect(scene.pulses).toHaveLength(count);
  for (const pulse of scene.pulses) {
    expect(pulse.progress).toBeGreaterThanOrEqual(0);
    expect(pulse.progress).toBeLessThanOrEqual(1);
    expect(pulse.edge).toBeGreaterThanOrEqual(0);
    expect(pulse.edge).toBeLessThan(scene.edges.length);
  }
});

test("stepping is pure", () => {
  const scene = createScene(labels);
  const snapshot = JSON.stringify(scene);
  stepScene(scene, 250);
  expect(JSON.stringify(scene)).toBe(snapshot);
});

test("a single label produces no edges and does not throw", () => {
  const scene = createScene(["ONLY"]);
  expect(scene.edges).toHaveLength(0);
  expect(() => stepScene(scene, 100)).not.toThrow();
});

test("an empty label list is handled", () => {
  const scene = createScene([]);
  expect(scene.nodes).toHaveLength(0);
  expect(scene.edges).toHaveLength(0);
  expect(() => stepScene(scene, 100)).not.toThrow();
});
