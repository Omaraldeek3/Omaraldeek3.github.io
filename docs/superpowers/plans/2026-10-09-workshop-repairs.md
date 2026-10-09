# Workshop file repairs and local sessions

> Execute the already approved review recommendations. Use regression tests before fixes, and verify the complete suites before integrating.

**Goal:** Preserve cut geometry and layer identity, retain useful work locally, reduce initial loading and memory waste, and make service availability explicit.

**Scope:** Cut Studio at `D:/work/cut-studio`, implemented in the isolated checkout `D:/work/codex/.tools/cut-studio-repairs`; the portfolio is edited in its existing checkout. Existing unrelated changes remain outside this task. No paid AI requests, new dependencies, cloud project storage, or speculative multiuser SaaS backend.

## Accepted design

- Keep the existing Drawing/Contour/Curve interfaces. Repairs must preserve unchanged curves and pens; incompatible pen layers must not join or erase one another.
- SVG paint classification follows selector specificity, source order, inline declarations and `!important` for supported stroke/fill styles.
- A versioned local session stores artwork, filename and validated tool settings. Offer export/import of a project snapshot and explicit reset. API keys and raster image buffers are excluded.
- Load each workspace through explicit module-level `next/dynamic` imports, preserving current routes, Arabic text and handovers.
- Revoke generated image URLs when removed from the gallery. Correlate upscaler requests so previews cannot consume one another's results; serialize PNG writes with backpressure.
- Show the portfolio contact form's disabled status before submission. Do not invent a delivery provider or credentials. Exclude generated/subproject files from the portfolio's own lint pass.

## Tasks and ownership

- [x] Geometry: `geometry.ts`, `path.ts`, `svg-import.ts`, regression cases in repair/path/import specs. Prove middle-edge removal, unchanged open curves/pens, incompatible layers, coincident/overshooting cubics and CSS priority failures; fix and run focused specs.
- [x] Image runtime: `generate-workspace.tsx`, `upscale-workspace.tsx`, `upscale.worker.ts`, related focused tests. Bound URL lifetime, correlate previews, wait for PNG encoding, and retain local-only file processing.
- [x] Session/loading: new local-session helpers/hooks, `toolkit.tsx`, persistent settings in workspace components, session unit/browser tests. Preserve hydration, reject malformed project files, handle unavailable/quota-full storage, and restore state across reload/tool navigation.
- [x] Portfolio: `src/ui/contact.tsx`, its copy and tests, `eslint.config.mjs`. Disable unavailable form actions with existing fallback channels and verify source lint.
- [x] Verify: Cut Studio focused failures first, then full Playwright suite, TypeScript, ESLint and production build; portfolio full suite and checks. Browser-check Arabic/English and narrow widths. Compare production JS sizes. Refresh Graphify after code changes and review the final diff.

## Review focus

- Removed segments must not introduce a connector through the missing span.
- Unchanged contours keep exact curves, layer properties and colour identity.
- Simplification cannot erase reverse/looping cubic geometry or exceed its tolerance.
- Storage failures or imported malformed files cannot erase an existing drawing; secrets stay outside project snapshots.
- Late worker replies, cancelled jobs and discarded previews do not replace a newer result or retain resources indefinitely.

## Verified result

- Cut Studio commit `13105d3` was integrated into `D:/work/cut-studio` with a fast-forward merge. The full suite passed: **403 tests**, no failures, skips or flaky cases. The portfolio's full suite passed: **122 tests**.
- Both projects passed TypeScript, full ESLint and their normal Turbopack production builds. **36 focused tests** also passed against Cut Studio's production server after integration, covering projects, exported lettering outlines, worker replies, file import, quotes and dragging.
- Production browser checks covered eight tools in both locales at 390 and 1440 pixels: **32 cases**, no horizontal overflow or page errors. The Arabic mobile cleanup view was inspected visually.
- On the same local production setup, initial Image to vector JavaScript fell from **1,157,829 to 773,269 bytes** (33%). Gzip calculated over those script responses fell from **361,770 to 242,021 bytes** (33%). This measures script payload, not a promised loading-time improvement.
- Portfolio Graphify was refreshed: **1,049 nodes / 2,116 edges**. A separate current Cut Studio source graph is saved at `D:/work/codex/.tools/cut-studio-context/graphify-out/`: **1,114 nodes / 3,210 edges**, with report and interactive HTML. Both used local AST extraction without paid LLM calls.
- Reports: `D:/work/codex/.tools/cut-studio-final-results.json` and `D:/work/codex/.tools/cut-studio-production-results.json`. Local production preview: `http://127.0.0.1:3313/ar/vector-cleanup`.
- Source photos and font files remain outside project copies; the UI and README explain reimporting them. Contact delivery remains unavailable until a provider is implemented. No public deployment or paid AI generation was performed.
