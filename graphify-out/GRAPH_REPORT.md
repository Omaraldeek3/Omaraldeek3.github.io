# Graph Report - codex  (2026-11-18)

## Corpus Check
- 648 files · ~13,620,951 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1095 file(s) not represented in the graph (top: .ttf 728, (none) 300, .xz 13)
- WARNING: 1095 of 2280 files seen (48%) have no supported extractor and are missing from this graph entirely. It may look complete while representing only part of the codebase.

## Summary
- 1315 nodes · 2675 edges · 82 communities (59 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `362f3de5`
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
- copy
- studies.ts
- isLocale
- Plan: portfolio v2 The Cut Line
- site.ts
- Overnight Lab Batch Plan
- export-assets.ts
- svg.ts
- route.ts
- geometric-ornaments.ts
- sync-curated-fonts.mjs
- ornaments.ts
- compilerOptions
- compilerOptions
- sync-fonts.mjs
- [locale]/layout.tsx
- Locale
- sync-distribution-fonts.mjs
- customizer.tsx
- compilerOptions
- locales.ts
- figure-fx.ts
- system-scene.tsx
- source-audit.test.ts
- svg-studio/src/app/layout.tsx
- ref_node_path
- ref_node_fs
- package-source.mjs
- point-cloud.ts
- Design File Search Spec
- Arabic Font Preview Design (Harf)
- bidi-js.d.ts
- Box maker v2 (slab model, finger joints)
- curated-font-sources.d.mts
- steps
- build.mjs
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
- build-bust-cloud.py
- AGENTS.md
- PULL_REQUEST_TEMPLATE.md
- with
- arabic-font-preview/docs/verification.md
- process-nextick-args/license.md
- fixtures/README.md
- svg-studio/AGENTS.md
- catalog-expansion.md
- connected-geometry.md
- design.md
- implementation-plan.md
- ornament-focus.md
- components/app.tsx
- body
- النتائج بحسب الأولوية
- tiktok-designs.ts
- دليل أفضل الـ Skills لوكلاء الذكاء الاصطناعي (AI Agent Skills)
- body
- notebook-sheet/build.mjs
- fill.mjs
- notices.mjs

## God Nodes (most connected - your core abstractions)
1. `Locale` - 39 edges
2. `copy` - 35 edges
3. `App()` - 34 edges
4. `Studio()` - 30 edges
5. `renderAsset()` - 28 edges
6. `App()` - 22 edges
7. `isLocale()` - 20 edges
8. `getStores()` - 17 edges
9. `isoDay()` - 17 edges
10. `Customizer()` - 16 edges

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

## Communities (82 total, 23 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (58): App(), accessLocalFonts(), card(), changeLanguage(), download(), exportFont(), importFiles(), statusMessage() (+50 more)

### Community 1 - "data.ts"
Cohesion: 0.09
Nodes (66): AppId, appIds, icons, readHash(), SaasApp(), serverHash(), subscribeHash(), Bookings() (+58 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (50): dependencies, @fontsource/tajawal@5.3.0, @fontsource-variable/jetbrains-mono@5.3.0, @fontsource-variable/manrope@5.3.0, @fontsource-variable/space-grotesk@5.3.0, motion@13.3.0, next@16.3.5, react@19.3.0 (+42 more)

### Community 3 - "arabic-font-preview/package.json"
Cohesion: 0.06
Nodes (41): dependencies, bidi-js@1.1.0, harfbuzzjs@1.6.2, jszip@^3.10.1, react@^19.2.0, react-dom@^19.2.0, woff-lib@0.0.3, devDependencies (+33 more)

### Community 4 - "components/app.tsx"
Cohesion: 0.08
Nodes (33): Asset, categories, categoryCounts, CategoryId, legacyAssets, names, normalize(), palettes (+25 more)

### Community 5 - "studio.tsx"
Cohesion: 0.13
Nodes (26): Drag, Studio(), addAsset(), commit(), endDrag(), importFile(), reorder(), updateLayer() (+18 more)

### Community 6 - "lab/[slug]/page.tsx"
Cohesion: 0.07
Nodes (35): generateMetadata(), LabPage(), copy, CUT_STUDIO_URL, cutStudioToolCount, CutStudioView(), tools, cta (+27 more)

### Community 7 - "svg-studio/package.json"
Cohesion: 0.07
Nodes (33): dependencies, @fontsource/tajawal@5.3.0, next@16.3.5, react@19.3.0, react-dom@19.3.0, devDependencies, @playwright/test@1.63.0, @types/node@^24 (+25 more)

### Community 8 - "copy"
Cohesion: 0.10
Nodes (7): config, profile, projects, LabStatus, LabWork, labWorks, NAMES

### Community 9 - "studies.ts"
Cohesion: 0.12
Nodes (21): faceNames, generateMetadata(), StudyPage(), Concept(), StudyFilter(), art, MotifArt(), categories (+13 more)

### Community 10 - "isLocale"
Cohesion: 0.18
Nodes (12): generateMetadata(), Arrow(), generateMetadata(), ProjectPage(), generateMetadata(), PreviewPage(), DemoContent(), SitePreview() (+4 more)

### Community 11 - "Plan: portfolio v2 The Cut Line"
Cohesion: 0.08
Nodes (24): Brief: Portfolio v2, Cut Studio promoted in page, Automated YouTube Shorts factory section, Dependencies: Versions and Documentation, three 0.186.0 for box maker 3D preview, Design Review: visual, mobile and performance, LazyMotion bundle reduction, Portfolio design and implementation plan (+16 more)

### Community 12 - "site.ts"
Cohesion: 0.14
Nodes (19): CONTENT, Home(), Locale, About(), Contact(), CARD_TAGS, Fields(), Hero() (+11 more)

### Community 13 - "Overnight Lab Batch Plan"
Cohesion: 0.08
Nodes (26): Cut Studio, Clipper2 weld and offset (vector-ops), Contour curve path model (lines, arcs, cubics), Shared-edge tracing and background removal, Portfolio Foundation Plan, Harf Arabic Font Preview Plan, Cut Studio File Quality Plan, Overnight Lab Batch Plan (+18 more)

### Community 14 - "export-assets.ts"
Cohesion: 0.10
Nodes (16): imported, makeDeflatedZip(), notice, originals, root, allFiles, collections, commit (+8 more)

### Community 15 - "svg.ts"
Cohesion: 0.35
Nodes (12): sourceLicense(), sourceSvg(), circle(), leaf(), line(), path(), person(), rect() (+4 more)

### Community 16 - "route.ts"
Cohesion: 0.15
Nodes (15): dynamic, json(), LIMIT, POST(), runtime, clientIp(), rateLimit(), RateLimitResult (+7 more)

### Community 17 - "geometric-ornaments.ts"
Cohesion: 0.28
Nodes (20): Cell, description(), insetPolygon(), move(), networkCell(), num(), octagon(), outlined() (+12 more)

### Community 18 - "sync-curated-fonts.mjs"
Cohesion: 0.15
Nodes (17): auditArabic(), shape(), addArchive(), additions, cache, catalog, catalogPath, designs (+9 more)

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
Cohesion: 0.12
Nodes (13): arabic, latin, LocaleLayout(), mono, rounded, viewport, oppositeLocale(), Footer() (+5 more)

### Community 24 - "Locale"
Cohesion: 0.19
Nodes (11): automationFacts, AutomationSystem, List, systems, Text, AiAutomationView(), validUrl(), Bidi() (+3 more)

### Community 25 - "sync-distribution-fonts.mjs"
Cohesion: 0.14
Nodes (9): distributions, additions, cache, catalog, knownHashes, knownNames, probe, rejections (+1 more)

### Community 26 - "customizer.tsx"
Cohesion: 0.27
Nodes (17): downloadPack(), Art, Customizer(), exportFile(), exportComposition(), copyText(), downloadBlob(), downloadPng() (+9 more)

### Community 27 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 28 - "locales.ts"
Cohesion: 0.40
Nodes (6): defaultLocale, hasLocalePrefix(), locales, localisedPath(), config, proxy()

### Community 29 - "figure-fx.ts"
Cohesion: 0.10
Nodes (28): Cloud, loadCloud(), sampleGlyph(), applyPalette(), Choice, DEFAULT, listeners, loadChoice() (+20 more)

### Community 30 - "system-scene.tsx"
Cohesion: 0.27
Nodes (10): createScene(), Pulse, Scene, SceneEdge, SceneNode, stepScene(), draw(), SystemScene() (+2 more)

### Community 31 - "source-audit.test.ts"
Cohesion: 0.19
Nodes (4): directFonts, libraryArchives, repositories, jszip

### Community 33 - "ref_node_path"
Cohesion: 0.20
Nodes (5): config, port, root, server, types

### Community 34 - "ref_node_fs"
Cohesion: 0.20
Nodes (5): bytes, errors, out, output, results

### Community 35 - "package-source.mjs"
Cohesion: 0.33
Nodes (5): collect(), excluded, root, target, zip

### Community 36 - "point-cloud.ts"
Cohesion: 0.14
Nodes (27): buildMorphTargets(), BUST_CLOUD_URL, BUST_MAX_DESKTOP, BUST_MAX_MOBILE, BUST_PIVOTS, BUST_RECORD_BYTES, BustCloudBuffers, clamp() (+19 more)

### Community 37 - "Design File Search Spec"
Cohesion: 0.38
Nodes (7): AI image description of previews, Arabic normalization for search, CorelDRAW text extraction from page dat files, Windows uploader (Python exe), Password-protected search site (Next.js, Neon, R2), Design File Search Plan, Design File Search Spec

### Community 38 - "Arabic Font Preview Design (Harf)"
Cohesion: 0.33
Nodes (5): arabic-font-preview project, Arabic Font Preview Design (Harf), Device fonts via Local Font Access API, Google Fonts Arabic library (57 families), Real-outline SVG export (HarfBuzz WASM)

### Community 39 - "bidi-js.d.ts"
Cohesion: 0.33
Nodes (3): bidi-js, Bidi, Levels

### Community 40 - "Box maker v2 (slab model, finger joints)"
Cohesion: 0.40
Nodes (5): Box maker v2 (slab model, finger joints), Box Maker v2 Spec, src/toolkit/box3d.tsx, src/toolkit/box.ts, src/toolkit/box-workspace.tsx

### Community 41 - "curated-font-sources.d.mts"
Cohesion: 0.50
Nodes (3): DirectFont, LibraryArchive, Repository

### Community 42 - "steps"
Cohesion: 0.07
Nodes (30): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+22 more)

### Community 43 - "build.mjs"
Cohesion: 0.14
Nodes (13): bankDiagram, { chromium }, dayDiagram, engineDiagram, map, require, rows(), shopDiagram (+5 more)

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
Cohesion: 0.33
Nodes (5): Accepted design, Review focus, Tasks and ownership, Verified result, Workshop file repairs and local sessions

### Community 55 - "Verification"
Cohesion: 0.40
Nodes (4): Connected geometry verification — 2026-10-01, Expansion verification — 2026-10-01, Ornament focus verification — 2026-10-01, Verification

### Community 56 - "build-bust-cloud.py"
Cohesion: 0.24
Nodes (12): axis_angle_mat4(), build_all(), compute_skin_mats(), get_world(), fetch_cached(), load_glb(), acc(), local_node_mat4() (+4 more)

### Community 59 - "with"
Cohesion: 0.10
Nodes (20): jobs, verify, name, on, pull_request, push, permissions, contents (+12 more)

### Community 72 - "components/app.tsx"
Cohesion: 0.09
Nodes (38): Page(), App(), add(), navigate(), openAsset(), openSection(), selectCategory(), selectScope() (+30 more)

### Community 73 - "body"
Cohesion: 0.18
Nodes (10): description, label, body, attributes, id, type, validations, description (+2 more)

### Community 74 - "النتائج بحسب الأولوية"
Cohesion: 0.18
Nodes (10): 1. عالية: كشف رواتب العمال خارج صلاحيتها, 2. عالية: تغيير زبون المسودة بعد العربون يفصل الطلبية عن حساب الزبون, 3. عالية: الفاصلة في المبلغ قد تضاعفه مئة مرة بصمت, 4. متوسطة: الطلبية الملغاة تظل تعرض مبلغاً مطلوباً من الزبون, 5. متوسطة: معرف غير صالح يسبب خطأ خادم في الموقع المنشور, 6. منخفضة: أرقام الطلبيات في الرئيسية لا تستعمل تعريفاً واحداً, الاختبارات والأدلة, النتائج بحسب الأولوية (+2 more)

### Community 75 - "tiktok-designs.ts"
Cohesion: 0.20
Nodes (11): escXml(), readTiktokEntrySync(), renderTiktokDesign(), sharedTags, specs, tiktokAssets, tiktokCategory, tiktokDataCache (+3 more)

### Community 76 - "دليل أفضل الـ Skills لوكلاء الذكاء الاصطناعي (AI Agent Skills)"
Cohesion: 0.18
Nodes (10): 1. Skills لتصميم الواجهات وتجربة المستخدم (UI/UX Design & Frontend), 2. Skills للمونتاج والفيديو (Video Editing & Motion), 3. Skills لتصميم الصور والرسوميات (Image Generation & Graphic Design), 4. Skills للكتابة والتحرير (Writing & Copywriting), 5. Skills لصناعة المحتوى والنشر (Content Creation & Social Media), 6. Skills للتسويق والنمو والـ SEO (Marketing, Growth & SEO), 7. Skills للمحاسبة والمالية (Accounting & Finance), 8. Skills أساسية إضافية (المستندات، التخطيط، واكتشاف المهارات) (+2 more)

### Community 77 - "body"
Cohesion: 0.20
Nodes (9): label, body, attributes, id, type, validations, description, name (+1 more)

### Community 79 - "notebook-sheet/build.mjs"
Cohesion: 0.24
Nodes (6): root, ar(), here, out, rows(), template

### Community 80 - "fill.mjs"
Cohesion: 0.22
Nodes (8): BOXES, CELLS, CIRCLES, file, here, html, META, out

### Community 81 - "notices.mjs"
Cohesion: 0.40
Nodes (4): collect(), pkg, root, seen

## Knowledge Gaps
- **36 isolated node(s):** `repositories`, `libraryArchives`, `directFonts`, `src/app/editorial.css`, `src/toolkit/box` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 557 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jszip` connect `source-audit.test.ts` to `App.tsx`, `package-source.mjs`, `arabic-font-preview/package.json`, `sync-curated-fonts.mjs`, `sync-fonts.mjs`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `App()` (e.g. with `validFavorites()` and `validateProject()`) actually correct?**
  _`App()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `repositories`, `libraryArchives`, `directFonts` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055077452667814115 - nodes in this community are weakly interconnected._
- **Why does `FigureStage()` connect `figure-fx.ts` to `package.json`, `site.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0863356053229471 - nodes in this community are weakly interconnected._
- **Why does `Portfolio Foundation Plan` connect `Overnight Lab Batch Plan` to `copy`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._