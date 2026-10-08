# Graph Report - codex  (2026-10-09)

## Corpus Check
- Large corpus: 16044 files · ~4,641,829 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 967 nodes · 2049 edges · 51 communities (44 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx / App() / accessLocalFonts()
- ref_react / saas-panel/app.tsx / AppId
- package.json / dependencies / @fontsource/tajawal
- arabic-font-preview/ / dependencies / bidi-js
- components/app.tsx / Brand() / curated
- studio.tsx / Drag / Studio()
- ref_next_link / lab/[slug]/page.tsx / generateMetadata()
- svg-studio/package.j / dependencies / @fontsource/tajawal
- arabic-font-preview/ / playwright.config.ts / ref_playwright_test
- studies/[slug]/page. / faceNames / generateMetadata()
- next.config.ts / config / ref_next
- Brief: Portfolio v2 / Cut Studio promoted  / Hard constraints (no
- [locale]/page.tsx / Locale / copy
- Cut Studio / Clipper2 weld and of / Contour curve path m
- ref_node_assert_stri / ref_node_test / export-assets.ts
- import-icons.ts / allFiles / collections
- route.ts / dynamic / json()
- geometric-ornaments. / Cell / description()
- font-audit.mjs / auditArabic() / shape()
- ornaments.ts / arabesque() / border()
- svg-studio/tsconfig. / compilerOptions / allowImportingTsExte
- tsconfig.json / compilerOptions / allowJs
- open-font-sources.mj / sources / sync-fonts.mjs
- ref_next_font_local / src_app_concepts / src_app_globals
- systems.ts / automationFacts / AutomationSystem
- debian-font-sources. / distributions / sync-distribution-fo
- customizer.tsx / Customizer() / exportFile()
- arabic-font-preview/ / compilerOptions / allowImportingTsExte
- ref_next_server / locales.ts / defaultLocale
- app/page.tsx / Page() / App()
- scene.ts / createScene() / Pulse
- curated-font-sources / directFonts / kurinto()
- ref_fontsource_tajaw / ref_fontsource_tajaw / ref_fontsource_tajaw
- ref_node_http / ref_node_module / ref_node_path
- notices.mjs / collect() / pkg
- package-source.mjs / collect() / excluded
- fetch-test-fixture.m / bytes / production-check.mjs
- AI image description / Arabic normalization / CorelDRAW text extra
- arabic-font-preview  / Arabic Font Preview  / Device fonts via Loc
- bidi-js.d.ts / Bidi / .getEmbeddingLevels(
- Box maker v2 (slab m / Box Maker v2 Spec / src/toolkit/box3d.ts
- curated-font-sources / DirectFont / LibraryArchive
- eslint.config.mjs / ref_eslint_config / ref_eslint_config_ne
- ref_node_fs / performance-audit.mj / output
- font-audit.d.mts / FontAudit
- postcss.config.mjs / config
- directFonts
- libraryArchives
- repositories

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
- `App()` --indirect_call--> `validateProject()`  [INFERRED]
  svg-studio/src/components/app.tsx → svg-studio/src/lib/project.ts
- `three 0.186.0 for box maker 3D preview` --conceptually_related_to--> `Box maker v2 implementation plan`  [INFERRED]
  docs/DEPENDENCIES.md → docs/superpowers/plans/2026-09-17-box-maker-v2.md
- `App()` --indirect_call--> `stringList()`  [INFERRED]
  arabic-font-preview/src/App.tsx → arabic-font-preview/src/lib/storage.ts
- `accessLocalFonts()` --calls--> `inspectFont()`  [EXTRACTED]
  arabic-font-preview/src/App.tsx → arabic-font-preview/src/lib/fonts.ts
- `Props` --references--> `FontEntry`  [EXTRACTED]
  arabic-font-preview/src/components/FontCard.tsx → arabic-font-preview/src/lib/fonts.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cut Studio curve-exact export pipeline** — cut_studio_curve_path_model, cut_studio_shared_edge_tracing, cut_studio_clipper2_weld_offset [INFERRED 0.85]
- **Cut Studio toolkit planning docs** — docs_superpowers_plans_2026_09_16_design_toolkit, docs_superpowers_plans_2026_09_16_native_formats, docs_superpowers_plans_2026_09_17_box_maker_v2 [INFERRED 0.85]
- **Design file search system** — design_search_uploader, design_search_web_site, design_search_arabic_normalization, design_search_ai_description [INFERRED 0.85]
- **Portfolio site plan, QA and review docs** — docs_plan, docs_qa, docs_design_review, docs_dependencies [INFERRED 0.85]

## Communities (51 total, 7 thin omitted)

### Community 0 - "App.tsx / App() / accessLocalFonts()"
Cohesion: 0.06
Nodes (62): App(), accessLocalFonts(), card(), changeLanguage(), download(), exportFont(), importFiles(), arabicFonts (+54 more)

### Community 1 - "ref_react / saas-panel/app.tsx / AppId"
Cohesion: 0.09
Nodes (64): ref_react, AppId, appIds, icons, readHash(), SaasApp(), serverHash(), subscribeHash() (+56 more)

### Community 2 - "package.json / dependencies / @fontsource/tajawal"
Cohesion: 0.04
Nodes (46): dependencies, @fontsource/tajawal, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, motion, next, react (+38 more)

### Community 3 - "arabic-font-preview/ / dependencies / bidi-js"
Cohesion: 0.05
Nodes (42): dependencies, bidi-js, harfbuzzjs, jszip, react, react-dom, woff-lib, devDependencies (+34 more)

### Community 4 - "components/app.tsx / Brand() / curated"
Cohesion: 0.08
Nodes (32): curated, ordered, View, useLocalState(), Asset, categoryCounts, CategoryId, GalleryScope (+24 more)

### Community 5 - "studio.tsx / Drag / Studio()"
Cohesion: 0.13
Nodes (27): Drag, Studio(), addAsset(), commit(), endDrag(), importFile(), reorder(), updateLayer() (+19 more)

### Community 6 - "ref_next_link / lab/[slug]/page.tsx / generateMetadata()"
Cohesion: 0.09
Nodes (23): ref_next_link, generateMetadata(), LabPage(), features, HARF_URL, HarfView(), features, NAQSH_URL (+15 more)

### Community 7 - "svg-studio/package.j / dependencies / @fontsource/tajawal"
Cohesion: 0.06
Nodes (33): dependencies, @fontsource/tajawal, next, react, react-dom, devDependencies, @playwright/test, @types/node (+25 more)

### Community 8 - "arabic-font-preview/ / playwright.config.ts / ref_playwright_test"
Cohesion: 0.10
Nodes (9): ref_playwright_test, locales, profile, projects, LabStatus, LabWork, labWorks, text() (+1 more)

### Community 9 - "studies/[slug]/page. / faceNames / generateMetadata()"
Cohesion: 0.11
Nodes (21): faceNames, generateMetadata(), StudyPage(), Concept(), StudyFilter(), art, MotifArt(), categories (+13 more)

### Community 10 - "next.config.ts / config / ref_next"
Cohesion: 0.11
Nodes (18): config, ref_next, ref_next_image, ref_next_navigation, generateMetadata(), LocaleLayout(), Home(), generateMetadata() (+10 more)

### Community 11 - "Brief: Portfolio v2 / Cut Studio promoted  / Hard constraints (no"
Cohesion: 0.08
Nodes (27): Brief: Portfolio v2, Cut Studio promoted in page, Hard constraints (no push to main, don't break Cut Studio), Automated YouTube Shorts factory section, Dependencies: Versions and Documentation, TypeScript 6 / ESLint 9 compatibility pin, three 0.186.0 for box maker 3D preview, Design Review: visual, mobile and performance (+19 more)

### Community 12 - "[locale]/page.tsx / Locale / copy"
Cohesion: 0.16
Nodes (15): Locale, copy, About(), Contact(), Status, Fields(), Hero(), LabArt() (+7 more)

### Community 13 - "Cut Studio / Clipper2 weld and of / Contour curve path m"
Cohesion: 0.08
Nodes (26): Cut Studio, Clipper2 weld and offset (vector-ops), Contour curve path model (lines, arcs, cubics), Shared-edge tracing and background removal, Portfolio Foundation Plan, Harf Arabic Font Preview Plan, Cut Studio File Quality Plan, Overnight Lab Batch Plan (+18 more)

### Community 14 - "ref_node_assert_stri / ref_node_test / export-assets.ts"
Cohesion: 0.11
Nodes (22): ref_node_assert_strict, ref_node_test, imported, notice, originals, root, svg_studio_src_content_imported_icons, assets (+14 more)

### Community 15 - "import-icons.ts / allFiles / collections"
Cohesion: 0.18
Nodes (20): allFiles, collections, commit, index, root, rows, seen, Art (+12 more)

### Community 16 - "route.ts / dynamic / json()"
Cohesion: 0.14
Nodes (15): dynamic, json(), LIMIT, POST(), runtime, clientIp(), rateLimit(), RateLimitResult (+7 more)

### Community 17 - "geometric-ornaments. / Cell / description()"
Cohesion: 0.28
Nodes (20): Cell, description(), insetPolygon(), move(), networkCell(), num(), octagon(), outlined() (+12 more)

### Community 18 - "font-audit.mjs / auditArabic() / shape()"
Cohesion: 0.15
Nodes (18): auditArabic(), shape(), addArchive(), additions, cache, catalog, catalogPath, designs (+10 more)

### Community 19 - "ornaments.ts / arabesque() / border()"
Cohesion: 0.45
Nodes (19): arabesque(), border(), botanical(), circle(), frame(), geometricTile(), group(), leaf() (+11 more)

### Community 20 - "svg-studio/tsconfig. / compilerOptions / allowImportingTsExte"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+10 more)

### Community 21 - "tsconfig.json / compilerOptions / allowJs"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "open-font-sources.mj / sources / sync-fonts.mjs"
Cohesion: 0.15
Nodes (15): sources, arabicFamilies, catalog, classifiers, entries, families, get(), headers (+7 more)

### Community 23 - "ref_next_font_local / src_app_concepts / src_app_globals"
Cohesion: 0.13
Nodes (13): ref_next_font_local, src_app_concepts, src_app_globals, src_app_lab, arabic, latin, mono, rounded (+5 more)

### Community 24 - "systems.ts / automationFacts / AutomationSystem"
Cohesion: 0.16
Nodes (12): automationFacts, AutomationSystem, List, systems, Text, AiAutomationView(), validUrl(), CUT_STUDIO_URL (+4 more)

### Community 25 - "debian-font-sources. / distributions / sync-distribution-fo"
Cohesion: 0.14
Nodes (9): distributions, additions, cache, catalog, knownHashes, knownNames, probe, rejections (+1 more)

### Community 26 - "customizer.tsx / Customizer() / exportFile()"
Cohesion: 0.30
Nodes (12): Customizer(), exportFile(), Icon(), paths, exportComposition(), copyText(), downloadBlob(), downloadPng() (+4 more)

### Community 27 - "arabic-font-preview/ / compilerOptions / allowImportingTsExte"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 28 - "ref_next_server / locales.ts / defaultLocale"
Cohesion: 0.26
Nodes (9): ref_next_server, defaultLocale, hasLocalePrefix(), localisedPath(), oppositeLocale(), config, proxy(), NavMenu() (+1 more)

### Community 29 - "app/page.tsx / Page() / App()"
Cohesion: 0.21
Nodes (11): App(), add(), downloadPack(), navigate(), openAsset(), selectCategory(), selectScope(), validFavorites() (+3 more)

### Community 30 - "scene.ts / createScene() / Pulse"
Cohesion: 0.27
Nodes (10): createScene(), Pulse, Scene, SceneEdge, SceneNode, stepScene(), draw(), SystemScene() (+2 more)

### Community 31 - "curated-font-sources / directFonts / kurinto()"
Cohesion: 0.24
Nodes (3): directFonts, libraryArchives, repositories

### Community 32 - "ref_fontsource_tajaw / ref_fontsource_tajaw / ref_fontsource_tajaw"
Cohesion: 0.18
Nodes (9): ref_fontsource_tajawal_400_css, ref_fontsource_tajawal_500_css, ref_fontsource_tajawal_700_css, ref_fontsource_tajawal_800_css, svg_studio_src_app_globals, metadata, svg_studio_src_styles_catalog_scale, svg_studio_src_styles_ornaments (+1 more)

### Community 33 - "ref_node_http / ref_node_module / ref_node_path"
Cohesion: 0.20
Nodes (8): ref_node_http, ref_node_module, ref_node_path, config, port, root, server, types

### Community 34 - "notices.mjs / collect() / pkg"
Cohesion: 0.22
Nodes (7): collect(), pkg, root, seen, root, ref_node_child_process, ref_node_url

### Community 35 - "package-source.mjs / collect() / excluded"
Cohesion: 0.22
Nodes (7): collect(), excluded, root, target, zip, jszip, xml()

### Community 36 - "fetch-test-fixture.m / bytes / production-check.mjs"
Cohesion: 0.25
Nodes (5): bytes, errors, out, ref_node_fs_promises, ref_playwright

### Community 37 - "AI image description / Arabic normalization / CorelDRAW text extra"
Cohesion: 0.38
Nodes (7): AI image description of previews, Arabic normalization for search, CorelDRAW text extraction from page dat files, Windows uploader (Python exe), Password-protected search site (Next.js, Neon, R2), Design File Search Plan, Design File Search Spec

### Community 38 - "arabic-font-preview  / Arabic Font Preview  / Device fonts via Loc"
Cohesion: 0.33
Nodes (6): arabic-font-preview project, Arabic Font Preview Design (Harf), Device fonts via Local Font Access API, Google Fonts Arabic library (57 families), Real-outline SVG export (HarfBuzz WASM), React + Vite browser-only approach

### Community 39 - "bidi-js.d.ts / Bidi / .getEmbeddingLevels("
Cohesion: 0.33
Nodes (3): Bidi, bidi-js, Levels

### Community 40 - "Box maker v2 (slab m / Box Maker v2 Spec / src/toolkit/box3d.ts"
Cohesion: 0.40
Nodes (5): Box maker v2 (slab model, finger joints), Box Maker v2 Spec, src/toolkit/box3d.tsx, src/toolkit/box.ts, src/toolkit/box-workspace.tsx

### Community 41 - "curated-font-sources / DirectFont / LibraryArchive"
Cohesion: 0.50
Nodes (3): DirectFont, LibraryArchive, Repository

### Community 42 - "eslint.config.mjs / ref_eslint_config / ref_eslint_config_ne"
Cohesion: 0.50
Nodes (3): ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 43 - "ref_node_fs / performance-audit.mj / output"
Cohesion: 0.50
Nodes (3): ref_node_fs, output, results

## Knowledge Gaps
- **356 isolated node(s):** `name`, `version`, `private`, `type`, `license` (+351 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 443 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `package-source.mjs / collect() / excluded` to `App.tsx / App() / accessLocalFonts()`, `arabic-font-preview/ / dependencies / bidi-js`, `font-audit.mjs / auditArabic() / shape()`, `open-font-sources.mj / sources / sync-fonts.mjs`, `curated-font-sources / directFonts / kurinto()`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `Portfolio Foundation Plan` connect `Cut Studio / Clipper2 weld and of / Contour curve path m` to `arabic-font-preview/ / playwright.config.ts / ref_playwright_test`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _356 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx / App() / accessLocalFonts()` be split into smaller, more focused modules?**
  _Cohesion score 0.05822784810126582 - nodes in this community are weakly interconnected._
- **Should `ref_react / saas-panel/app.tsx / AppId` be split into smaller, more focused modules?**
  _Cohesion score 0.08648648648648649 - nodes in this community are weakly interconnected._
- **Should `package.json / dependencies / @fontsource/tajawal` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `arabic-font-preview/ / dependencies / bidi-js` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._