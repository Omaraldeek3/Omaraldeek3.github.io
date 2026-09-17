# Box maker v2 — design

Approved in chat on 2026-09-17. Extends the v1 closed finger-joint box tool (`src/toolkit/box.ts`, `box-workspace.tsx`).

## Goals

1. Box types: closed, open-top tray, lift-off lid, sliding lid, drawer in sleeve.
2. Interactive 3D preview (assembled + exploded) using three.js, loaded only on the 3D tab.
3. Dividers: rows × columns egg-crate grid with through-tenons into walls.
4. Extras: engraved panel labels (ENGRAVE layer), hand holes, thumb hole pull, rounded free corners, CNC dogbone reliefs.

Non-goals: living hinges, curved boxes, glue-free lid latches, machine settings, arbitrary text fonts.

## Architecture

### Units

| File | Responsibility |
|---|---|
| `src/toolkit/box/model.ts` | Types: `Slab` (axis-aligned panel cuboid + in-plane axis mapping), `Joint` rules, `BoxModel` (slabs, joints, cut volumes, round/label hints). |
| `src/toolkit/box/types.ts` | Builders per box type: options → `BoxModel` (slab positions, joint rules, clearance cuts). Dividers and pulls/hand holes are added here. |
| `src/toolkit/box/panels.ts` | Model → 2D panel shapes: 3D ownership per grid cell, rectilinear boundary tracing, kerf offset, round holes, rounded corners, dogbones, labels. |
| `src/toolkit/box/font.ts` | Single-stroke uppercase/digit font → open polylines. |
| `src/toolkit/box/index.ts` | Public API: `buildBox(options)` → `{parts, drawing, stats}`; `boxLayout`. |
| `src/toolkit/box3d.tsx` | Client-only three.js viewer: extrudes each part shape with holes, places it with the slab transform, orbit/zoom, explode slider. |
| `src/toolkit/box-workspace.tsx` | UI: type cards, size, material, dividers, extras, flat/3D tabs, parts list, stats, exports, arrange on sheet. |

`src/toolkit/box.ts` is replaced by the `box/` folder; v1 tests are migrated.

### Coordinate model

Outside box: x ∈ [0,W] (width), y ∈ [0,D] (depth, y=0 is front), z ∈ [0,H] (height, z=0 bottom). Material thickness t.
Each part is a **slab**: an axis-aligned cuboid whose thin axis has extent t. The slab defines its 2D mapping: `u` axis → drawing x, `v` axis → drawing y (walls use `flipV` so the top edge is at drawing y=0). The 3D viewer uses the inverse mapping.

### Ownership (joints)

For a panel P, drawing breakpoints are collected from P's extent and every overlap with other slabs, finger segment boundaries and cut volumes. Each grid cell centre (at P's mid-thickness) is assigned:

- Not inside P's slab → empty (except explicit `add` volumes such as tenons, which are modelled by extending the divider slab through the wall).
- Inside a cut volume that applies to P → empty.
- Set S = slabs containing the point.
  - |S| = 1 → P keeps it.
  - |S| ≥ 3 → highest priority keeps it (Front/Back > Left/Right > Bottom/Top; sleeve/drawer parts analogous; dividers lowest).
  - |S| = 2 → the pair's joint rule:
    - `fingers`: along the shared long axis, interval = overlap extent, inset by t at an end only where a third slab meets that end. Odd count nearest the finger width (min 3). Even segments → higher-priority panel. Outside the interval (inset ends) → priority winner.
    - `owner:<part>`: whole overlap to that part (sliding-lid slots, divider tenons outside tab zone).
    - `tenon`: centre zone of length min(finger, span/2) → divider (mortise in wall), rest → wall.
    - `halflap`: lower half → X divider, upper half → Y divider.

Mating panels compute the same rule from the same pair, so joints are consistent by construction.

### Boundary

Cells → directed boundary edges (material on the left), joined into loops using integer grid indices (exact), consistent turn rule at checkerboard vertices, collinear points removed. Exactly one outer loop per part, else an error ("part would fall apart"). Holes are inner loops.

Post-processing order: kerf offset (outer grows, holes shrink, by kerf/2) → dogbones (radius r, at concave corners of outer loops and every corner of rectilinear holes) → rounded corners (only at part corners whose two sides touch no other slab) → round cut volumes (circle, stadium) added as hole contours shrunk by kerf/2 → labels.

### Box types

| Type | Parts |
|---|---|
| Closed | Bottom, Top, Front, Back, Left, Right |
| Open tray | Bottom, Front, Back, Left, Right |
| Lift-off lid | Open tray + Lid (W×D, z ∈ [H, H+t]) + Lid locator (inside opening minus clearance c, z ∈ [H−t, H]) |
| Sliding lid | Bottom, Back, Left, Right full height; Front height H − 2t − c; Lid x ∈ [0,W], y ∈ [0, D−t], z ∈ [H−2t, H−t]. Lid/wall overlap `owner:Lid` plus clearance cut (c) → open-front slots. Top strip t above slot. |
| Drawer in sleeve | Sleeve: Bottom, Top, Left, Right, Back (open front). Drawer tray inside the sleeve with clearance c: outside (W−2t−2c) × (D−t−c) × (H−2t−2c). Drawer front plate W×H at y ∈ [−t, 0]. |

`sizing: inside` refers to the main compartment (tray/sleeve interior).
Clearance c: 0–2 mm, default 0.3.

### Dividers

`rows` dividers across depth (X-dividers, parallel to front) and `columns` across width (Y-dividers), evenly spaced inside. Height = compartment inside height, reduced below lids (sliding: under lid minus c; lift-off: under locator minus c). Divider slabs extend through the walls (tenons) with `tenon` rule; X/Y crossings use `halflap`. Max 20 each. Dividers sit on the bottom (no bottom mortise).

### Extras

- Labels: part name uppercase, single-stroke font, height clamp(min(side)×0.12, 3, 10) mm, placed at centre then 30%/70% height; skipped if no position clears holes/bands (reported in stats). Contour `layer: 'engrave'`.
- Hand holes: stadium w×h at distance from top, on Left/Right walls (tray, closed, lids) or drawer front plate + drawer front wall.
- Pull: none | thumb hole (Ø) | hand slot, on Lid + locator (lift-off), Lid near front edge (sliding), drawer front.
- Rounded corners radius on free corners.
- Dogbone radius (0 = off).
Validation: every round hole must lie inside the part interior (t inset) and clear of rectilinear cut-outs; otherwise a named error.

## Data changes

- `Contour.layer?: 'cut' | 'engrave'` (default cut). `toSvg`/`toDxf` put engrave contours on the blue ENGRAVE layer. Preview draws engrave strokes blue. Nesting keeps them inside parts (already supported: open paths inside the outer outline).
- Part metadata for 3D: `BoxPart = { name, shape, slab }`.

## UI

Controls: 01 Box type cards (icon + name) → 02 Size (inside/outside, W, D, H) → 03 Material & joints (thickness, finger, kerf, clearance, spacing) → 04 Dividers (rows, columns) → 05 Extras (labels toggle, hand holes, pull, corner radius, dogbone radius).
Canvas: tabs Flat layout / 3D view; 3D has explode slider, drag rotate, wheel zoom, reset. Parts list with names and sizes. Stats: outside, inside, fingers per edge, layout size. Export SVG/DXF, Arrange on sheet. English and Arabic.

## Testing

- Engine: for every type × dividers on/off: each grid cell point in the union of slabs is owned by exactly one part (sampled at cell centres in 3D); each part has one outer loop; outlines are simple (no self-intersection besides dogbone touch points).
- v1 tests: dimensions, kerf growth, spacing, validation.
- Types: sliding lid slot opens at front; drawer fits sleeve with clearance; lift-off locator inside opening.
- Extras: labels on engrave layer and inside parts; holes inside parts; dogbone adds arcs only at concave corners; rounding only on free corners.
- Export: engrave contours on ENGRAVE layer in DXF/SVG.
- UI: each type exports and nests; 3D tab renders a canvas; Arabic mobile no overflow.

## Dependency

`three` 0.186.0 and `@types/three` 0.186.0 pinned; dynamic import in `box3d.tsx`; recorded in `docs/DEPENDENCIES.md`.
