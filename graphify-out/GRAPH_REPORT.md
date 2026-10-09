# Graph Report - codex  (2026-10-09)

## Corpus Check
- 206 files · ~1,213,448 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1092 file(s) not represented in the graph (top: .ttf 728, (none) 300, .xz 13)

## Summary
- 1049 nodes · 2116 edges · 72 communities (49 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d290b22a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- data.ts
- package.json
- arabic-font-preview/package.json
- components/app.tsx
- studio.tsx
- lab/[slug]/page.tsx
- svg-studio/package.json
- site.ts
- studies.ts
- isLocale
- Plan: portfolio v2 The Cut Line
- Locale
- Overnight Lab Batch Plan
- core.test.ts
- svg.ts
- route.ts
- geometric-ornaments.ts
- sync-curated-fonts.mjs
- ornaments.ts
- compilerOptions
- compilerOptions
- sync-fonts.mjs
- [locale]/layout.tsx
- ai-automation/view.tsx
- sync-distribution-fonts.mjs
- customizer.tsx
- compilerOptions
- locales.ts
- App
- system-scene.tsx
- source-audit.test.ts
- svg-studio/src/app/layout.tsx
- ref_node_path
- notices.mjs
- package-source.mjs
- ref_node_fs_promises
- Design File Search Spec
- Arabic Font Preview Design (Harf)
- bidi-js.d.ts
- Box maker v2 (slab model, finger joints)
- curated-font-sources.d.mts
- eslint.config.mjs
- performance-audit.mjs
- font-audit.d.mts
- postcss.config.mjs
- directFonts
- libraryArchives
- repositories
- حرف · Harf
- نقش — Naqsh SVG Studio
- عمر الديك — Omar Aldeek
- Workshop file repairs and local sessions
- Verification
- text
- AGENTS.md
- PULL_REQUEST_TEMPLATE.md
- arabic-font-preview/docs/verification.md
- process-nextick-args/license.md
- fixtures/README.md
- svg-studio/AGENTS.md
- catalog-expansion.md
- connected-geometry.md
- design.md
- implementation-plan.md
- ornament-focus.md

## God Nodes (most connected - your core abstractions)
1. `Locale` - 34 edges
2. `copy` - 32 edges
3. `renderAsset()` - 27 edges
4. `Studio()` - 25 edges
5. `App()` - 21 edges
6. `App()` - 20 edges
7. `isLocale()` - 20 edges
8. `getStores()` - 17 edges
9. `isoDay()` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Third-party notices` --references--> `licenseKind()`  [INFERRED]
  arabic-font-preview/THIRD_PARTY_NOTICES.md → arabic-font-preview/scripts/sync-curated-fonts.mjs
- `App()` --indirect_call--> `validateProject()`  [INFERRED]
  svg-studio/src/components/app.tsx → svg-studio/src/lib/project.ts
- `three 0.186.0 for box maker 3D preview` --conceptually_related_to--> `Box maker v2 implementation plan`  [INFERRED]
  docs/DEPENDENCIES.md → docs/superpowers/plans/2026-09-17-box-maker-v2.md
- `App()` --indirect_call--> `stringList()`  [INFERRED]
  arabic-font-preview/src/App.tsx → arabic-font-preview/src/lib/storage.ts
- `accessLocalFonts()` --calls--> `inspectFont()`  [EXTRACTED]
  arabic-font-preview/src/App.tsx → arabic-font-preview/src/lib/fonts.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cut Studio curve-exact export pipeline** — cut_studio_curve_path_model, cut_studio_shared_edge_tracing, cut_studio_clipper2_weld_offset [INFERRED 0.85]
- **Cut Studio toolkit planning docs** — docs_superpowers_plans_2026_09_16_design_toolkit, docs_superpowers_plans_2026_09_16_native_formats, docs_superpowers_plans_2026_09_17_box_maker_v2 [INFERRED 0.85]
- **Design file search system** — design_search_uploader, design_search_web_site, design_search_arabic_normalization, design_search_ai_description [INFERRED 0.85]
- **Portfolio site plan, QA and review docs** — docs_plan, docs_qa, docs_design_review, docs_dependencies [INFERRED 0.85]

## Communities (72 total, 23 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (62): App(), accessLocalFonts(), card(), changeLanguage(), download(), exportFont(), importFiles(), arabicFonts (+54 more)

### Community 1 - "data.ts"
Cohesion: 0.09
Nodes (64): ref_react, AppId, appIds, icons, readHash(), SaasApp(), serverHash(), subscribeHash() (+56 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (46): dependencies, @fontsource/tajawal, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, motion, next, react (+38 more)

### Community 3 - "arabic-font-preview/package.json"
Cohesion: 0.05
Nodes (42): dependencies, bidi-js, harfbuzzjs, jszip, react, react-dom, woff-lib, devDependencies (+34 more)

### Community 4 - "components/app.tsx"
Cohesion: 0.08
Nodes (32): curated, ordered, View, useLocalState(), Asset, categoryCounts, CategoryId, GalleryScope (+24 more)

### Community 5 - "studio.tsx"
Cohesion: 0.13
Nodes (27): Drag, Studio(), addAsset(), commit(), endDrag(), importFile(), reorder(), updateLayer() (+19 more)

### Community 6 - "lab/[slug]/page.tsx"
Cohesion: 0.08
Nodes (24): ref_next_link, generateMetadata(), LabPage(), DesignStudiesView(), features, HARF_URL, HarfView(), features (+16 more)

### Community 7 - "svg-studio/package.json"
Cohesion: 0.06
Nodes (33): dependencies, @fontsource/tajawal, next, react, react-dom, devDependencies, @playwright/test, @types/node (+25 more)

### Community 8 - "site.ts"
Cohesion: 0.18
Nodes (6): ref_playwright_test, copy, CUT_STUDIO_URL, cutStudioToolCount, CutStudioView(), tools

### Community 9 - "studies.ts"
Cohesion: 0.11
Nodes (22): ref_next_navigation, faceNames, generateMetadata(), StudyPage(), projects, Concept(), StudyFilter(), art (+14 more)

### Community 10 - "isLocale"
Cohesion: 0.13
Nodes (15): ref_next_image, generateMetadata(), LocaleLayout(), Home(), generateMetadata(), ProjectPage(), generateMetadata(), PreviewPage() (+7 more)

### Community 11 - "Plan: portfolio v2 The Cut Line"
Cohesion: 0.08
Nodes (27): Brief: Portfolio v2, Cut Studio promoted in page, Hard constraints (no push to main, don't break Cut Studio), Automated YouTube Shorts factory section, Dependencies: Versions and Documentation, TypeScript 6 / ESLint 9 compatibility pin, three 0.186.0 for box maker 3D preview, Design Review: visual, mobile and performance (+19 more)

### Community 12 - "Locale"
Cohesion: 0.17
Nodes (13): Locale, About(), Contact(), Fields(), Hero(), LabArt(), LabSection(), Process() (+5 more)

### Community 13 - "Overnight Lab Batch Plan"
Cohesion: 0.08
Nodes (26): Cut Studio, Clipper2 weld and offset (vector-ops), Contour curve path model (lines, arcs, cubics), Shared-edge tracing and background removal, Portfolio Foundation Plan, Harf Arabic Font Preview Plan, Cut Studio File Quality Plan, Overnight Lab Batch Plan (+18 more)

### Community 14 - "core.test.ts"
Cohesion: 0.11
Nodes (22): ref_node_assert_strict, ref_node_test, imported, notice, originals, root, svg_studio_src_content_imported_icons, assets (+14 more)

### Community 15 - "svg.ts"
Cohesion: 0.18
Nodes (20): allFiles, collections, commit, index, root, rows, seen, Art (+12 more)

### Community 16 - "route.ts"
Cohesion: 0.14
Nodes (15): dynamic, json(), LIMIT, POST(), runtime, clientIp(), rateLimit(), RateLimitResult (+7 more)

### Community 17 - "geometric-ornaments.ts"
Cohesion: 0.28
Nodes (20): Cell, description(), insetPolygon(), move(), networkCell(), num(), octagon(), outlined() (+12 more)

### Community 18 - "sync-curated-fonts.mjs"
Cohesion: 0.14
Nodes (19): auditArabic(), shape(), addArchive(), additions, cache, catalog, catalogPath, designs (+11 more)

### Community 19 - "ornaments.ts"
Cohesion: 0.45
Nodes (19): arabesque(), border(), botanical(), circle(), frame(), geometricTile(), group(), leaf() (+11 more)

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+10 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "sync-fonts.mjs"
Cohesion: 0.15
Nodes (15): sources, arabicFamilies, catalog, classifiers, entries, families, get(), headers (+7 more)

### Community 23 - "[locale]/layout.tsx"
Cohesion: 0.09
Nodes (19): config, ref_next, ref_next_font_local, src_app_concepts, src_app_globals, src_app_lab, arabic, latin (+11 more)

### Community 24 - "ai-automation/view.tsx"
Cohesion: 0.25
Nodes (8): automationFacts, AutomationSystem, List, systems, Text, AiAutomationView(), validUrl(), Bidi()

### Community 25 - "sync-distribution-fonts.mjs"
Cohesion: 0.14
Nodes (9): distributions, additions, cache, catalog, knownHashes, knownNames, probe, rejections (+1 more)

### Community 26 - "customizer.tsx"
Cohesion: 0.30
Nodes (12): Customizer(), exportFile(), Icon(), paths, exportComposition(), copyText(), downloadBlob(), downloadPng() (+4 more)

### Community 27 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 28 - "locales.ts"
Cohesion: 0.22
Nodes (10): ref_next_server, defaultLocale, hasLocalePrefix(), locales, localisedPath(), LabStatus, LabWork, labWorks (+2 more)

### Community 29 - "App"
Cohesion: 0.21
Nodes (11): App(), add(), downloadPack(), navigate(), openAsset(), selectCategory(), selectScope(), validFavorites() (+3 more)

### Community 30 - "system-scene.tsx"
Cohesion: 0.27
Nodes (10): createScene(), Pulse, Scene, SceneEdge, SceneNode, stepScene(), draw(), SystemScene() (+2 more)

### Community 31 - "source-audit.test.ts"
Cohesion: 0.24
Nodes (3): directFonts, libraryArchives, repositories

### Community 32 - "svg-studio/src/app/layout.tsx"
Cohesion: 0.18
Nodes (9): ref_fontsource_tajawal_400_css, ref_fontsource_tajawal_500_css, ref_fontsource_tajawal_700_css, ref_fontsource_tajawal_800_css, svg_studio_src_app_globals, metadata, svg_studio_src_styles_catalog_scale, svg_studio_src_styles_ornaments (+1 more)

### Community 33 - "ref_node_path"
Cohesion: 0.20
Nodes (8): ref_node_http, ref_node_module, ref_node_path, config, port, root, server, types

### Community 34 - "notices.mjs"
Cohesion: 0.22
Nodes (7): collect(), pkg, root, seen, root, ref_node_child_process, ref_node_url

### Community 35 - "package-source.mjs"
Cohesion: 0.22
Nodes (7): collect(), excluded, root, target, zip, jszip, xml()

### Community 36 - "ref_node_fs_promises"
Cohesion: 0.25
Nodes (5): bytes, errors, out, ref_node_fs_promises, ref_playwright

### Community 37 - "Design File Search Spec"
Cohesion: 0.38
Nodes (7): AI image description of previews, Arabic normalization for search, CorelDRAW text extraction from page dat files, Windows uploader (Python exe), Password-protected search site (Next.js, Neon, R2), Design File Search Plan, Design File Search Spec

### Community 38 - "Arabic Font Preview Design (Harf)"
Cohesion: 0.33
Nodes (6): arabic-font-preview project, Arabic Font Preview Design (Harf), Device fonts via Local Font Access API, Google Fonts Arabic library (57 families), Real-outline SVG export (HarfBuzz WASM), React + Vite browser-only approach

### Community 39 - "bidi-js.d.ts"
Cohesion: 0.33
Nodes (3): Bidi, bidi-js, Levels

### Community 40 - "Box maker v2 (slab model, finger joints)"
Cohesion: 0.40
Nodes (5): Box maker v2 (slab model, finger joints), Box Maker v2 Spec, src/toolkit/box3d.tsx, src/toolkit/box.ts, src/toolkit/box-workspace.tsx

### Community 41 - "curated-font-sources.d.mts"
Cohesion: 0.50
Nodes (3): DirectFont, LibraryArchive, Repository

### Community 42 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 43 - "performance-audit.mjs"
Cohesion: 0.50
Nodes (3): ref_node_fs, output, results

### Community 51 - "حرف · Harf"
Cohesion: 0.09
Nodes (21): المساهمة · Contributing, أمثلة الاستبعاد, شروط القبول, مراجعة مصادر الخطوط — 30 سبتمبر 2026, الخصوصية · Privacy, Deploy to GitHub Pages, Features, Harf — Arabic & English Font Preview (+13 more)

### Community 52 - "نقش — Naqsh SVG Studio"
Cohesion: 0.20
Nodes (8): Bundled third-party collections, Original asset license, التحقق والبناء, التشغيل, المساهمة والترخيص, بنية المشروع, ما يمكنك فعله, نقش — Naqsh SVG Studio

### Community 53 - "عمر الديك — Omar Aldeek"
Cohesion: 0.22
Nodes (8): إضافة عمل جديد إلى المختبر, البنية, التشغيل, المختبر, النشر, حدود معروفة, عمر الديك — Omar Aldeek, قواعد التصميم

### Community 54 - "Workshop file repairs and local sessions"
Cohesion: 0.40
Nodes (4): Accepted design, Review focus, Tasks and ownership, Workshop file repairs and local sessions

### Community 55 - "Verification"
Cohesion: 0.40
Nodes (4): Connected geometry verification — 2026-10-01, Expansion verification — 2026-10-01, Ornament focus verification — 2026-10-01, Verification

## Knowledge Gaps
- **404 isolated node(s):** `name`, `version`, `private`, `type`, `license` (+399 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 505 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `package-source.mjs` to `App.tsx`, `arabic-font-preview/package.json`, `sync-curated-fonts.mjs`, `sync-fonts.mjs`, `source-audit.test.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `Third-party notices` connect `sync-curated-fonts.mjs` to `حرف · Harf`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _404 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05822784810126582 - nodes in this community are weakly interconnected._
- **Should `data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08648648648648649 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `arabic-font-preview/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._