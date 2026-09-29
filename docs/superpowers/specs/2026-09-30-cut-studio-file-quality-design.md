# Cut Studio file quality (phase 1)

Date: 2026-09-30
Status: approved direction, awaiting spec review

## Why

An audit of every Cut Studio tool on 2026-09-30 found that files look right on
screen but need manual cleanup before they cut. Omar runs "delete overlap" in
his cutting software on most of them. The measured causes:

| Finding | Measured on |
| --- | --- |
| Every export is straight line segments only. Curves are flattened into hundreds of nodes. | Arabic lettering "افتتاح قريباً": 5,307 nodes. A small traced logo: about 2,000. |
| Colour "cut-out" tracing draws every border between two colours twice, and the two copies do not coincide. The white background also becomes a cut shape around the whole page. | Test logo: 40% of cut length duplicated, 87 crossings. |
| Traced geometric shapes wobble: circles have bumps at segment joins, straight edges bend slightly. | Circle r=170 px: 0.9 px deviation with visible kinks; square edges 0.55 px off straight. |
| Lettering weld and contour offset go through a raster and back, so outlines are approximations of the font, not the font. | Weld renders at 3,200 px; at 600 mm wide that is 0.19 mm per pixel. |
| Colour tracing is slow. | 700 px photo, 4 colours, cut-out: 72 s. |
| Vector cleanup reports problems but fixes only exact duplicate contours. | |

Phase 1 fixes file quality across the toolkit. Tool features, the redesign and
moving to `cutstudio.omardeek.tech` come in later phases.

## Goals

1. Exported SVG keeps real curves; exported DXF uses lines and arcs. Node counts
   drop by an order of magnitude on curved work.
2. No tool produces duplicated or crossing cut lines.
3. Traced circles come out round and straight edges come out straight.
4. Lettering weld and contour offset use exact vector geometry.
5. Vector cleanup repairs an imported file: removes overlapping lines, joins
   open paths, reduces nodes.
6. Imported SVG and DXF keep their curves through nesting and back out.

Success is measured by the audit script (kept as a test helper) and by Omar
cutting the test pack on his machines.

## Design

### 1. Path model

A contour keeps its polyline `points` (used by nesting, collision, area and the
3D box view, unchanged) and gains an optional exact path:

```ts
type Seg = { type: 'L'; to: Point } | { type: 'C'; c1: Point; c2: Point; to: Point };
type Curve = { start: Point; segs: Seg[] };
type Contour = { points: Point[]; closed: boolean; layer?: 'engrave'; curve?: Curve };
```

Only lines and cubic Béziers. Arcs and circles are stored as cubics (a quarter
circle as one cubic, error 0.027% of the radius). Cubics are affine-invariant,
so `mapShape` (move, rotate in nesting, scale in resize & repeat) maps the
control points and stays exact.

A new module `path.ts` holds: build a curve from primitives (line, arc,
circle, rounded rectangle), flatten a curve to points within a tolerance,
transform, and `fitPolyline(points, tolerance)`, which turns a polyline into
lines and cubics: straight runs become one `L`, runs that fit a circle become
arcs, the rest become cubics, and sharp corners stay sharp.

Invariant: when `curve` is present, `points` is its flattening at 0.05 mm.
Functions that build contours set both through one helper so they cannot drift.

### 2. Export

- **SVG:** a contour with a curve is written as `M … L … C … Z`. A contour
  without one is passed through `fitPolyline` (tolerance 0.02 mm) first, so
  every export benefits, including files imported from polylines.
- **DXF:** stays R12 (`AC1009`), which RDWorks, LightBurn and CorelDRAW all read.
  Each contour is one `POLYLINE` whose vertices carry bulges (group 42) for arcs.
  Cubics are converted to arcs by biarc fitting within 0.01 mm. Lines stay lines.
- Layers and colours (CUT red / ENGRAVE blue) are unchanged.

### 3. Generators emit curves

`circle`, `roundedRect`, `polygon`, `star` and the box, tag, pattern, puzzle,
hinge, gear, ruler, fit-test and test-card generators build contours through the
path helpers. A circle exports as 4 cubics in SVG and 2 bulge arcs in DXF.
The gear's involute flanks are fitted with cubics within 0.01 mm.

### 4. Tracing

**Shared edges (colour, cut-out):** instead of tracing each colour's mask on its
own, trace the boundary graph of the label image once. Every border between two
regions is one edge; edges meet at junctions where three or more regions touch.
Each edge is smoothed and fitted once, with its end points pinned at the
junctions. A region's outline is the chain of its edges. Neighbouring colours
therefore share the exact same curve: no gaps, no overlaps. The cut-line SVG
and the DXF write each edge once.

Stacked colour mode (for print) keeps its current behaviour, and outline mode
keeps its single-mask tracing; both gain the fitting improvements below.

**Background:** a "Remove background" option, on by default in outline and
cut-out modes, drops the region colour that covers most of the image border.

**Fitting:** the fitter first tests whether a loop, or a run inside it, is a
straight line or a circular arc within the fitting error; those become `L` and
exact arcs. A loop that fits a circle or ellipse becomes one exactly. Where no
corner was detected, neighbouring cubics share a tangent (G1), which removes
the bumps at joins.

**Output:** `resultToDrawing` passes the fitted curves into the Drawing, so the
laser tools and DXF receive curves instead of 0.02 mm polylines.

**Speed target:** the 700 px photo in cut-out mode under 15 s, measured by the
audit script. The shared-edge graph removes the per-colour isolines passes.

### 5. Vector weld and offset

Add `@countertype/clipper2-ts` (a TypeScript port of Clipper2, Boost Software
License 1.0, no dependencies).

- **Lettering weld:** flatten glyph outlines at 0.005 mm, union them with Clipper2
  (non-zero fill), and fit the result with `fitPolyline` at 0.01 mm. The raster
  weld is removed.
- **Contour offset of vector input:** Clipper2 offset with round joins, then
  `fitPolyline`. The distance-field path stays only for raster (image) input,
  where there is no vector to offset.

### 6. Vector cleanup that repairs

The cleanup tool becomes the repair step for any imported file. Operations,
each a toggle with a before/after count:

1. **Remove overlapping lines:** split segments where collinear pieces overlap
   (within 0.02 mm) and keep one copy. This is the "delete overlap" Omar runs
   by hand.
2. **Join open paths:** connect ends closer than a tolerance (default 0.1 mm)
   into closed contours.
3. **Remove tiny contours:** existing behaviour.
4. **Reduce nodes:** refit with `fitPolyline`.

The result feeds nesting and export as today.

### 7. Imports keep curves

- **SVG import:** path commands `C S Q T A` and the `circle ellipse rect`
  elements build a `curve` alongside the flattened points.
- **DXF import:** `ARC`, `CIRCLE`, `ELLIPSE` and polyline bulges build curve
  segments. `SPLINE` keeps its current flattening, then `fitPolyline`.
- **CDR:** goes through the SVG importer, so it inherits the SVG behaviour.

## Error handling

- `fitPolyline` never moves geometry by more than its tolerance. If a fit fails
  the contour falls back to its polyline, and export still succeeds.
- Clipper2 failures (degenerate input) raise a named error in the tool
  ("Could not weld these letters") rather than exporting broken geometry.
- Cleanup reports what it changed; it never removes a closed contour without
  reporting it.

## Testing

The project's Playwright suite gains:

- **Export:** a circle exports as 4 `C` segments in SVG and 2 bulge vertices in
  DXF; a rounded rectangle exports lines plus arcs; transforms keep curves exact.
- **Geometry helper:** the audit analyser (duplicate length, crossings,
  self-crossings, node count) moves into the test helpers. Every generator and
  box type must report 0 duplicates and 0 crossings.
- **Tracing fixtures:** a generated logo (circle, ring, square, Latin and
  Arabic text). Cut-out mode: 0 duplicated length, 0 crossings, no background
  contour. Outline mode: circle deviation under 0.3 px, square edges exported as
  `L` segments. The photo fixture times cut-out mode.
- **Lettering and offset:** welded text has no overlapping contours and fewer
  than 20% of today's nodes; offset of a square with round joins exports as 4
  lines and 4 arcs.
- **Cleanup:** a fixture with two overlapping rectangles sharing an edge and an
  open path with a 0.05 mm gap comes out with the shared edge once and the path
  closed.
- **Imports:** an SVG circle and a DXF ARC round-trip through nesting and export
  as curves.

A test pack (SVG and DXF of a box, gear, traced logo, welded Arabic text and an
offset) is produced for Omar to cut in RDWorks and open in CorelDRAW.

## Out of scope

Test card colours, gear 3D view, tag fixes, removing the sign tool, merging cost
and job time, upscaler UX (phase 2); the visual redesign (phase 3); the
standalone site (phase 4).
