# Verification report

**Latest revision:** a subsequent visual/mobile/performance review passed 19 browser tests. See [DESIGN-REVIEW.md](DESIGN-REVIEW.md) for the current results and measured before/after data. The report below records the initial delivery.

Date: 2026-09-15. Environment: Windows, Node 24.19.0, Next 16.3.5. Browser tests ran in Microsoft Edge via Playwright. The final suite ran against the production build served at localhost:3000.

## Final commands

| Command | Actual result |
|---|---|
| npm run typecheck | Passed, no TypeScript errors |
| npm run lint | Passed, no errors or warnings |
| npm run build | Passed; 17 generated static pages including the root and framework not-found route |
| npm test | 16 passed, 0 failed, 18.0 seconds against the production server |

## Browser coverage

- Arabic RTL and English LTR at widths 360, 390, 768, 1024 and 1440px.
- No unintended horizontal overflow in the home page sections at those widths; no page JavaScript errors.
- All three project detail routes, matching English language switching, concept disclosures and local previews.
- Mobile modal: visible opening, keyboard focus wrap in both directions, Escape closing and focus return.
- Touch-emulated mobile menu navigation and local concept CTA navigation.
- Reduced-motion preference removes sticky positioning; native FAQ opens using the keyboard.
- Brief required-field validation, actual text-file download and explicit no-send status.
- Core content renders with JavaScript disabled. Brief fields stay disabled in this state.
- Unknown project returns HTTP 404.

The Playwright configuration starts a dev server if no existing preview is available, and reuses a running server locally. This avoids a dependency on manually keeping a terminal open. Tests can also run against the production server as in the final run.

## Visual review and refinement

Actual in-app browser screenshots were inspected at 360, 390, 768, 1024 and 1440px across the two languages. Reviewed the asymmetric hero, Arabic connections and line wrapping, tablet work gallery, mobile composition and English project details. A second pass removed fixed work-preview heights that could crop the embedded websites, increased body-copy sizes, improved mobile language touch targets and separated location/role text. The three concept interfaces use complete local HTML/CSS and bundled photography.

## Bugs found and resolved

1. TypeScript 7 and ESLint 10 were incompatible with the installed Next lint plugins. Selected verified compatible stable versions; see DEPENDENCIES.md.
2. Work-preview wrappers could crop content at tablet sizes. Replaced fixed heights with intrinsic content height and prevented flex shrink.
3. Independent review found that the local brief's native form fallback could send fields via GET without JavaScript. A regression assertion failed before the fix. The fieldset is now disabled until hydration, with a no-JavaScript explanation; the targeted tests and complete suite pass.
4. An intermediate suite failed with connection-refused after the earlier development process stopped when the session resumed. Restarted a hidden production preview, verified HTTP 200, and reran the full suite successfully. This was not counted as a successful test run.

## Limits and remaining configuration

- No measured 60fps claim, Lighthouse score or real-world Core Web Vitals result. Performance was not benchmarked on physical medium-range phones or throttled networks.
- Touch was emulated in Edge; no physical iOS/Android testing, Safari/Firefox testing or screen-reader session was performed.
- No real WhatsApp, email or production domain was supplied. These are empty settings and do not create fake links.
- No backend email delivery or external submission exists. The project brief is a local text download only.
- No hosting deployment or domain connection was performed. The delivered site is running locally.
- The three projects are labeled design concepts, not client work. No business results, testimonials, prices or client histories are invented.
