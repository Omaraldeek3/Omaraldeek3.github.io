# Design and laser preparation toolkit

## Native format update

The user's follow-up request adds CDR and DXF input to the original SVG-only import scope below. ASCII DXF runs in the browser with explicit unit handling and containment grouping for holes. CDR uses the private local libcdr runtime through a loopback-only conversion endpoint with temporary-file cleanup and a page selector. The original statements excluding these two import formats are superseded by this update. Current support and limits are documented in docs/TOOLKIT.md; implementation record: docs/superpowers/plans/2026-09-16-native-formats.md.

Status: implemented and verified. Production build, lint, and all 59 tests pass; desktop and Arabic mobile screenshots reviewed. Native desktop software import requires the supplied 100 mm reference check.

Workflow refinement (overrides the initial SVG-only output scope below): import SVG exported from CorelDRAW or Illustrator. Export SVG for editing and ASCII DXF polylines for RDWorks. Include a 100 mm scale-reference download. Curves are flattened for both SVG and DXF with a 0.1 mm approximation target. Direct CDR and AI import is excluded. RDWorks desktop compatibility must be verified with the user's installed version.

## Purpose

Create a practical collection of tools for a designer preparing artwork for laser cutting. The main workflows are arranging vector parts to use less sheet material and converting raster artwork into editable vector paths.

## Recommended approach

Add a dedicated `/tools` area to the existing Next.js project. Process files in the browser, with heavier geometry work in a worker to keep the interface responsive. Provide Arabic and English interfaces, matching the existing project's language support. No account or paid conversion service is needed for this version.

Alternatives considered:

- A separate desktop application would allow deeper filesystem and machine integrations, but adds installation and platform maintenance.
- A server processing service could handle larger jobs, but needs hosting, uploads, and operational limits.

The browser approach fits an accessible first version. Actual capacity must be measured and shown honestly.

## Tools included

### 1. Material nesting

Import SVG parts, set copies, sheet width and height, edge margin, part spacing, and allowed rotation. Rotation may be disabled for directional materials. Arrange parts by their outlines, show the resulting sheet layouts, and export physical-size SVG files for each sheet.

Use a heuristic outline packing algorithm: it searches useful placements, but does not claim a mathematically optimal layout. Start with largest parts and compare multiple ordering and rotation strategies. Curves are flattened to a 0.1 mm approximation target for collision testing and SVG/DXF export; transforms are resolved into millimetre coordinates. Clearance must include the approximation tolerance. Nesting inside part holes is excluded from the initial algorithm.

Show placed and unplaced part counts, sheet count, occupied material area, and unused area. A savings comparison is shown only when an actual baseline layout has been calculated for the same parts and settings. Never silently omit unplaced parts. Sheet dimensions and all margins are validated before execution. Allow cancellation and reject jobs beyond tested complexity limits with a useful explanation.

### 2. Image to vector

Accept PNG, JPEG, and WebP artwork. Provide image preview, monochrome threshold, invert, noise removal, and path simplification controls. Trace foreground contours and preserve enclosed holes. Display the vector beside the source and export real SVG paths rather than an embedded raster image.

The initial tracing mode is for silhouettes, logos, and high-contrast artwork. Image input is downscaled to at most 768 pixels on its longest side, with a visible notice. Photographs produce thresholded silhouettes; multicolour tracing and centreline tracing are future capabilities. Export width and height are explicit in millimetres because image pixels alone do not establish physical size.

### 3. Vector inspection and cleanup

Inspect imported SVGs for supported open contours, exact duplicate geometry, tiny shapes, and unsupported elements. Offer explicit cleanup operations with before/after previews. Duplicate removal is limited to geometry the parser can compare reliably. Do not automatically close arbitrary open paths or imply that every machine compatibility problem can be detected.

### 4. Resize and repeat

Scale artwork to a physical width or height with optional aspect-ratio lock. Repeat it in rows and columns with adjustable spacing. Display total bounds and export the result as SVG.

### 5. Material cost estimate

Enter sheet price, quantity, and optional overhead percentage. Calculate material cost per job and per finished item, with visible arithmetic. Enter the sheet count shown by the nesting result. Costs are estimates based on the user's entries; machine time and labour are only included when explicitly entered.

### 6. Kerf test generator

Generate labelled slot-width test coupons from a user-entered nominal material thickness and adjustment range. Preview and export the dimensions so the user can cut a sample and determine a suitable fit. This tool measures fit experimentally; it does not infer a laser's cut width or recommend power and speed settings.

### 7. Image engraving preparation

Provide grayscale, brightness, contrast, invert, and black-and-white dithering controls. Export the processed PNG at explicit pixel dimensions. Include a reset and side-by-side preview.

## Interface and architecture

A tool gallery opens focused workspaces. Each workspace has inputs and controls, a large preview, measured results, and a clear export button. Include built-in sample artwork so each tool can be tried before importing files. Shared modules own units, safe file loading, SVG parsing, geometry, downloads, and reusable preview controls; individual tools own their parameters and transformations.

File handling is local to the browser. Imported SVGs are parsed as data, with scripts, event handlers, external resources, and embedded HTML rejected or removed before any preview. Support a documented set of path and primitive geometry. Text must be converted to outlines in the source editor before nesting; embedded images and unsupported features receive clear errors. Resolve viewBox, units, and transforms before measuring, and ask for physical dimensions when missing or ambiguous.

Use deterministic tool outputs and browser workers for expensive operations. Reset output when inputs change so a stale export cannot appear to reflect new settings. Surface invalid inputs, unsupported files, empty tracing results, cancellation, and export failures directly in the workspace.

## Verification and completion criteria

- Nesting fixtures cover concave parts, curves, nested transforms, multiple copies, oversized parts, rotation restrictions, spacing, and sheet edges. Independent collision checks verify every placement and clearance; every requested part is accounted for.
- Exported SVGs have physical dimensions, valid geometry, and can be reimported without changing measured sizes beyond the declared tolerance.
- Tracing fixtures include a solid silhouette, an enclosed hole, transparent background, noise, and a blank image. Output contains vector paths and preserves expected holes.
- Resizing, array spacing, cost arithmetic, and coupon dimensions are checked against known inputs.
- Malformed or unsafe SVGs produce useful errors without executing imported content.
- Browser tests exercise upload, parameter changes, preview, reset, error states, and downloadable output for every tool. Inspect desktop, mobile, and Arabic layouts.
- Run the project's relevant type, lint, production build, and regression checks. Read installed Next.js guides before implementation, as required by AGENTS.md.

## Explicit limits

Initial vector input is SVG, with SVG and DXF output. DXF, CDR, AI, PDF import, multicolour tracing, machine control, toolpath ordering, automated kerf compensation, and guaranteed optimal nesting are outside this version. Export previews support human inspection before manufacturing; machine-specific compatibility is not established until tested with the user's cutting software.

## Delivered configuration

The seven tools are implemented within this project in Arabic and English, with SVG input, SVG/DXF vector output and the user's CorelDRAW, Illustrator and RDWorks workflow documented in docs/TOOLKIT.md.
