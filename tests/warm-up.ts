import { studies } from "../src/lab/design-studies/studies";
import { projects } from "../src/content/site";

/*
 * The dev server compiles each route on its first request. When two test
 * workers hit two uncompiled routes at once, Next.js 16's dev server now and
 * then answers one of them with a 500 ("Unexpected end of JSON input") while
 * it rewrites its manifests. Visiting one page of every route, one at a time,
 * before the tests start means they never compile side by side.
 *
 * Skipped when PORTFOLIO_TEST_URL points the tests at a deployed site.
 */
export default async function warmUp() {
  if (process.env.PORTFOLIO_TEST_URL) return;
  const base = "http://127.0.0.1:3100";
  const paths = [
    "/ar",
    "/ar/lab/design-studies",
    `/ar/studies/${studies[0].slug}`,
    `/ar/work/${projects[0].slug}`,
    `/ar/work/${projects[0].slug}/preview`,
    "/ar/no-such-page",
    "/sitemap.xml",
    "/robots.txt",
  ];
  for (const path of paths) await fetch(base + path).catch(() => undefined);
}
