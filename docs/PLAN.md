# Omar Aldeek portfolio

## Design and implementation plan
User-approved scope: the detailed brief in this task. Proceed directly without additional design approval.

- [x] Create a bilingual App Router site with server-rendered content and localized root layouts.
- [x] Build an editorial charcoal/ivory identity with mint accents, asymmetric hero and three original concept previews.
- [x] Implement Motion hero tilt, desktop stacking work cards, and process progress; disable large motion and sticky spacing for reduced motion and mobile.
- [x] Complete project pages, services, process, about, cooperation options, FAQ and honest contact states.
- [x] Verify real browser behavior at 360, 390, 768, 1024 and 1440px, both locales, keyboard and reduced motion; refine design.
- [x] Run TypeScript, ESLint, production build and browser tests; document actual results and missing contact data.

Architecture: src/content/site.ts owns editable bilingual copy and project records. Server pages and preview components render content. Small client components own navigation, motion and contact brief download. Locale routes /ar and /en set lang and dir on the root html element. / redirects to /ar. Native scrolling, links and details elements remain usable without animation.
