# Design toolkit implementation plan

**Goal:** Deliver seven usable local browser tools for the user's CorelDRAW, Illustrator, and RDWorks workflow.
**Architecture:** Dedicated /tools root layout; client workspaces; shared millimetre geometry and SVG/DXF exports; worker-based nesting and tracing.
**Stack:** Installed Next.js, React, TypeScript, browser APIs, Playwright.
**Spec:** ../specs/2026-09-16-design-toolkit-design.md

## Constraints and rulings

- Preserve existing portfolio routes. This directory is not a Git repository; worktree and commit actions do not apply.
- New tools live in src/toolkit and src/app/tools. Geometry is expressed in millimetres.
- SVG inputs are parsed from an allowlist and never inserted as raw untrusted HTML.
- Reject unsupported geometry with explanations. SVG/DXF output contains actual paths.
- Keep processing local, provide file limits and cancellation, and avoid machine-control claims.
- Arabic uses connected fonts, normal letter spacing, logical CSS, and RTL.
- Ruling: the user's named design and laser programs refine the requested build; continue with SVG input plus SVG/DXF output.
- Ruling: use parallel agents for independently testable image processing and SVG parsing, as directed by the subagent-driven-development skill; the main agent owns integration and nesting.

## Work items

- [x] Geometry and exports: types.ts, geometry.ts, export.ts, tests/toolkit-geometry.spec.ts. Verify clearance, concave overlap, physical bounds, y-axis conversion and closed DXF polylines. Implement conservative contour nesting in a worker; account for every instance.
- [x] SVG import: svg-import.ts and tests/toolkit-import.spec.ts. Parse supported shapes/transforms/units, preserve closed/open state, reject text, unsafe features and ambiguous physical scale. Use browser geometry APIs on a sanitized hidden SVG for curves.
- [x] Raster processing: image.ts and tests/toolkit-image.spec.ts. Trace threshold masks into contours with holes; implement noise filtering, simplification and Floyd–Steinberg dithering. Test known pixel fixtures.
- [x] Workspaces: components under src/toolkit; route and layout under src/app/tools; localized copy and scoped styles. Build upload, sample, settings, preview, errors, reset and downloads for each tool.
- [x] Acceptance: tests/toolkit-ui.spec.ts exercises nesting worker, SVG and DXF downloads, trace uploads, cleanup, array, calculator, coupons, engraving, invalid files, mobile and Arabic. Run typecheck, lint, build and regression suite; visually inspect screenshots; document limitations.

## Verification commands

Use `npx playwright test tests/toolkit-geometry.spec.ts tests/toolkit-image.spec.ts` for pure computations; `npx playwright test tests/toolkit-import.spec.ts tests/toolkit-ui.spec.ts` for browser behavior. Run new acceptance assertions before implementation to confirm missing behavior fails. After implementation run `npm run typecheck`, `npm run lint`, `npm run build`, and the full Playwright suite on a dedicated local server.
