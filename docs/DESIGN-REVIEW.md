# Visual review, followed by mobile and performance review

Completed 2026-09-15. The visual pass was implemented first. Its production build became the **before** baseline for the separate performance pass; these are not comparisons against the original visual design.

## 1. Visual decisions

The earlier composition had several generic portfolio patterns: repeated mint star ornaments, equal browser-window treatments, decorative English labels, a large circular monogram in the biography, and three adjacent cooperation cards resembling a pricing table.

Changes applied:

- Replaced repeated stars, the underline flourish and the slogan strip with restrained rules, clear author identification and useful location information.
- Made the hero previews less tilted, gave the coffee concept priority, and moved the concept disclosure to a horizontal caption. Keyboard focus raises the relevant preview above the overlapping previews.
- Gave the work gallery three different compositions: dark espresso with an offset light preview, a spacious architectural canvas, and deep blue with a restrained angle. Removed miniature browser chrome in hero/work exhibits.
- Enlarged project names and separated the idea description from the concept label. Removed redundant tag pills and competing arrows from project metadata.
- Kept services as an editorial list with plain deliverables instead of icon/card repetition.
- Simplified the process timeline and replaced the oversized star with useful information about the four-step sequence.
- Replaced the oversized monogram with a short personal note, without inventing a portrait, career history or achievements.
- Replaced pricing-style cooperation cards with rows that make the three choices easier to compare. Optional prices remain supported, and no prices were invented.
- Gave the contact section a quiet ivory surface and a clear reading order; retained the honest missing-contact state and local-only brief download.

The existing project routes, bilingual copy structure, actual RTL/LTR, local previews, contact validation and accessibility behavior were preserved. Shared refinements are in `src/app/editorial.css`.

## 2. Separate mobile and performance pass

- Corrected image `sizes` for the actual thumbnail and gallery compositions, added a 480px candidate, and reused responsive variants where the same photograph appears twice near the first viewport.
- Replaced the full Motion component bundle with `m` and asynchronous `LazyMotion`/`domAnimation`, using the current Context7 documentation. No new motion dependency was added.
- Passed only the localized text needed by navigation, process and brief controls from the server. Client components no longer import the full bilingual site content.
- Prevented desktop hero tracking/parallax and card-scroll subscriptions from mounting on phones or in reduced-motion mode, instead of merely hiding their resulting transforms with CSS.
- Removed the Arabic font preload and excluded the Arabic fallback face from the English body stack. The small Arabic language label uses a system Arabic face. A browser test confirms that the English page does not download the full Arabic font; Arabic pages retain Noto Sans Arabic.
- Added safe-area spacing and retained minimum primary touch targets, visible focus, native scrolling, menu focus management and the no-JavaScript form safeguard.

### Measurements

Median of **three fresh browser contexts per scenario**, against production builds. Mobile: 390 × 844, DPR 2, 1.6 Mbps download, 150 ms latency and 4× CPU slowdown. Desktop: 1440 × 1000, DPR 1, unthrottled. Browser HTTP cache disabled; local server image cache warm. Encoded response bodies are measured in KiB, excluding HTTP headers.

| Measurement | Before | After | Change |
|---|---:|---:|---:|
| Arabic mobile total transfer | 536.2 KiB | 483.5 KiB | −9.8% |
| English mobile total transfer | 533.8 KiB | 319.1 KiB | −40.2% |
| Mobile image transfer | 107.6 KiB | 63.7 KiB | −40.8% |
| JavaScript transfer | 190.7 KiB | 178.6 KiB | −6.3% |
| English font transfer | 186.3 KiB | 24.3 KiB | −87.0% |
| Arabic mobile LCP | 2776 ms | 2640 ms | −4.9% |
| English mobile LCP | 2692 ms | 2584 ms | −4.0% |
| Desktop Arabic LCP | 776 ms | 668 ms | −13.9% |

Mobile CLS was 0 in the final runs. Desktop median CLS was 0.00542 (previously 0); the small font/layout adjustment is recorded rather than omitted. LCP gains on mobile are modest and timings vary between runs; the transferred-byte reductions are the clearer result. No 60fps, INP, Lighthouse score or physical-device performance claim is made.

Raw measurements: `docs/performance-before.json` and `docs/performance-after.json`. Reproduce with a production server:

```sh
node scripts/performance-audit.mjs after http://localhost:3002
```

## 3. Verification

- Production build: passed, 17 static pages generated.
- TypeScript: passed.
- ESLint: passed without warnings.
- Playwright: **19 passed, 0 failed**, 20.7 seconds, against the final production build.
- Both languages checked at 360, 390, 768, 1024 and 1440px. All three detail pages and their local previews also tested at 360px in both languages.
- Tests cover keyboard and touch-emulated navigation, Escape/focus return, reduced motion, no horizontal overflow, unclipped work previews, no Arabic-font request on English, local brief download and disabled form fields without JavaScript.
- Actual browser screenshots inspected for the revised hero, work, process and contact compositions, including a 390px mobile view. Native section-link scrolling was checked in the live preview.
- Final 768px visual check covered the cooperation rows, FAQ and visible keyboard focus. An independent code review found no important actionable issues in the hydration, LazyMotion or localized-prop changes.

Not performed: physical iOS/Android tests, Safari/Firefox sessions, a screen-reader audit or field Core Web Vitals collection. Real contact details and a production domain are still not provided.

## Documentation consulted

- Installed Next.js 16.3.5 server/client component and Image documentation under `node_modules/next/dist/docs/`.
- Context7 `resolve-library-id` for Motion, then `query-docs` on `/websites/motion_dev` for LazyMotion, `m`, async feature loading and strict mode.
- [Motion LazyMotion](https://motion.dev/docs/react-lazy-motion)
- [Motion bundle size](https://motion.dev/docs/react-reduce-bundle-size)
