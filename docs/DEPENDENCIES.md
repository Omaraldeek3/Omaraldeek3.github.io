# Versions and documentation

Verified on 2026-09-15 against the official npm registry's `latest` tags and package peer dependencies. Exact direct versions are pinned; `package-lock.json` fixes the transitive graph.

| Dependency | Installed version | Notes |
|---|---|---|
| Next.js | 16.3.5 | Stable App Router, server components, async params, generateStaticParams |
| React / React DOM | 19.3.0 | Matching versions; supported by Next and Motion peers |
| Tailwind CSS / @tailwindcss/postcss | 4.3.3 | v4 CSS import and dedicated PostCSS plugin |
| Motion | 13.3.0 | `motion/react`; useScroll, useTransform, useSpring, useReducedMotion |
| TypeScript | 6.0.3 | Latest stable 6.x supported by the bundled typescript-eslint parser |
| ESLint | 9.39.5 | Latest stable 9.x supported by the bundled React, JSX-a11y and import plugins |
| eslint-config-next | 16.3.5 | Matches Next.js |
| @playwright/test | 1.63.0 | Browser checks against local Microsoft Edge |
| three / @types/three | 0.186.0 | Box maker 3D preview; dynamically imported only when the 3D view opens (added 2026-09-17) |
| @fontsource-variable/manrope | 5.3.0 | Local Latin variable WOFF2 via next/font/local |
| @fontsource-variable/noto-sans-arabic | 5.3.0 | Local Arabic variable WOFF2 via next/font/local |

Node used: 24.19.0. npm: 11.17.0. Type declarations resolve to @types/react 19.3.0, @types/react-dom 19.3.0 and @types/node 24.13.4.

## Compatibility findings

The registry's newest TypeScript was 7.0.2, but the installed `typescript-eslint` 8.70.0 explicitly rejects TypeScript 7 and declares `>=4.8.4 <6.1.0`. TypeScript was therefore set to 6.0.3. The registry's newest ESLint was 10.10.0, but Next's bundled `eslint-plugin-import` 2.32.0, `eslint-plugin-jsx-a11y` 6.10.2 and `eslint-plugin-react` 7.37.5 declare support through ESLint 9. The compatible 9.39.5 release was selected instead of overriding peer requirements. npm marks ESLint 9 as no longer supported upstream: upgrading to ESLint 10 should wait for compatible bundled plugins/config, and lint must be rerun at that time.

## Actual Context7 calls

`resolve-library-id` was called for Next.js, Tailwind CSS and Motion, followed by `query-docs` for each resolved ID:

| Library ID | Material retrieved and applied |
|---|---|
| `/vercel/next.js` | App Router root layout, async params, server components and static params |
| `/tailwindlabs/tailwindcss.com` | v4 installation, `@tailwindcss/postcss`, `@import "tailwindcss"` |
| `/websites/motion_dev` | Scroll-linked transforms and useReducedMotion patterns |

Some Context7 Next examples pointed to the canary branch, and the indexed version list stopped before the published 16.3.5. That was **not** treated as release verification. The registry and current official docs were consulted separately. The installed `node_modules/next/dist/docs/` documentation was also read. Its Image docs deprecate `priority` and recommend `loading="eager"` for relevant above-fold imagery; this code uses eager/lazy loading accordingly.

## Primary references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
- [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image)
- [Tailwind + Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Motion scroll animation](https://motion.dev/docs/react-scroll-animations)
- [Motion accessibility](https://motion.dev/docs/react-accessibility)
- [TypeScript ESLint dependency support](https://typescript-eslint.io/users/dependency-versions/)
- [ESLint version support](https://eslint.org/version-support/)
- [Official npm registry](https://registry.npmjs.org/next/latest) (corresponding endpoints queried for all core dependencies)

## Assets

Two local reference photos were downloaded from Unsplash image delivery URLs. No stock UI screenshots or paid assets were used. Interface previews are original HTML/CSS with local images; business geometry is CSS.

- Coffee: https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=85
- Interior: https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85
- [Unsplash license](https://unsplash.com/license)

Fontsource packages include their upstream font licenses. Arabic and Latin subsets are bundled locally and use `font-display: swap` with Next's local font loading.
