/**
 * The figure's experiments: how it is lit (a "look") and what it does when the
 * pointer or a finger touches it (a "mode"). The picker on the page writes the
 * choice here; the stage reads it every frame. Once one pair is chosen for
 * good, it becomes the default below and the picker can go.
 */

export type Rgb = [number, number, number];

export type Look = {
  id: string;
  name: { ar: string; en: string };
  key: Rgb; // main light colour
  fill: Rgb; // the opposite side
  rim: Rgb; // edge light
  top: Rgb; // grade at the head
  low: Rgb; // grade at the shoulders
  accent: Rgb; // touch glow, letter walls
  exposure: number;
  floor: number; // soft light from above, lifts the shadows
  opacity: number;
};

export const LOOKS: Look[] = [
  {
    id: "ember",
    name: { ar: "جمر", en: "Ember" },
    key: [1, 0.94, 0.86],
    fill: [0.45, 0.6, 1],
    rim: [1, 0.45, 0.15],
    top: [1, 1, 1],
    low: [1.05, 0.62, 0.38],
    accent: [1, 0.45, 0.16],
    exposure: 1.17,
    floor: 0.08,
    opacity: 0.78,
  },
  {
    id: "gold",
    name: { ar: "ذهب", en: "Gold" },
    key: [1, 0.9, 0.7],
    fill: [1, 0.72, 0.45],
    rim: [1, 0.85, 0.55],
    top: [1.08, 1.04, 0.98],
    low: [1.1, 0.72, 0.36],
    accent: [1, 0.78, 0.35],
    exposure: 1.6,
    floor: 0.16,
    opacity: 0.9,
  },
  {
    id: "pearl",
    name: { ar: "لؤلؤ", en: "Pearl" },
    key: [0.98, 0.98, 1],
    fill: [0.62, 0.78, 1],
    rim: [1, 0.66, 0.82],
    top: [1.05, 1.05, 1.1],
    low: [0.8, 0.86, 1.15],
    accent: [0.7, 0.85, 1],
    exposure: 1.25,
    floor: 0.11,
    opacity: 0.86,
  },
  {
    id: "dawn",
    name: { ar: "فجر", en: "Dawn" },
    key: [1, 0.9, 0.95],
    fill: [0.7, 0.55, 1],
    rim: [1, 0.6, 0.35],
    top: [0.95, 0.85, 1.2],
    low: [1.2, 0.75, 0.45],
    accent: [1, 0.55, 0.75],
    exposure: 1.29,
    floor: 0.11,
    opacity: 0.82,
  },
];

export type Mode = { id: number; name: { ar: string; en: string } };

export const MODES: Mode[] = [
  { id: 1, name: { ar: "تبعثر", en: "Scatter" } },
  { id: 2, name: { ar: "تموّج", en: "Ripple" } },
  { id: 3, name: { ar: "دوّامة", en: "Vortex" } },
  { id: 4, name: { ar: "غبار", en: "Dust" } },
];

/** Site palettes. "gold" is the stylesheet's own :root; the others are
 *  `html[data-palette]` blocks in studio.css. */
export const PALETTES = [
  { id: "gold", name: { ar: "ذهب وحبر", en: "Gold & ink" }, swatch: ["#0b0a08", "#e8b45c"] },
  { id: "olive", name: { ar: "زيتون", en: "Olive" }, swatch: ["#0b0c09", "#c9bd6a"] },
  { id: "night", name: { ar: "ليل", en: "Night" }, swatch: ["#080914", "#8e9cff"] },
  { id: "ember", name: { ar: "جمر", en: "Ember" }, swatch: ["#09090b", "#ff6b2c"] },
] as const;

/** The figures, each a baked point cloud in public/models. */
export const MODELS = [
  // fusion: the clean scan moved to Omar's own proportions and coloured from his
  // video, with rebuilt eyes (made in the codex-claude worktree, scripts/bake-fusion.py).
  { id: "fusion", name: { ar: "عمر الجديد", en: "Omar (new)" }, turn: 0, faceY: 1.9, photo: 1, maxYaw: 9, neck: [-1.6, -0.45], pivot: [-1.1, -0.5] },
] as const;

export function modelById(id: string) {
  return MODELS.find(m => m.id === id) ?? MODELS[0];
}

type Choice = { look: string; mode: number; palette: string; model: string };
const KEY = "figure-fx";
const DEFAULT: Choice = { look: "gold", mode: 1, palette: "olive", model: "fusion" };

let current: Choice = DEFAULT;
if (typeof window !== "undefined") loadChoice();
const listeners = new Set<() => void>();

export function readChoice(): Choice {
  return current;
}

export function loadChoice(): Choice {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && LOOKS.some(l => l.id === saved.look) && MODES.some(m => m.id === saved.mode))
      current = {
        ...DEFAULT,
        ...saved,
        palette: PALETTES.some(p => p.id === saved.palette) ? saved.palette : DEFAULT.palette,
        model: MODELS.some(m => m.id === saved.model) ? saved.model : DEFAULT.model,
      };
  } catch {}
  applyPalette();
  return current;
}

export function setChoice(next: Partial<Choice>) {
  current = { ...current, ...next };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch {}
  applyPalette();
  listeners.forEach(fn => fn());
}

export function onChoice(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function applyPalette() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (current.palette === "gold") delete root.dataset.palette;
  else root.dataset.palette = current.palette;
}

export function lookById(id: string): Look {
  return LOOKS.find(l => l.id === id) ?? LOOKS[0];
}
