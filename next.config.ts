import type { NextConfig } from "next";

// GITHUB_PAGES=true builds a fully static site into out/ for GitHub Pages.
// Static hosting has no server, so the local CDR converter route is left out of that build.
const pages = process.env.GITHUB_PAGES === "true";

const config: NextConfig = {
  poweredByHeader: false,
  images: { imageSizes: [32, 48, 64, 96, 128, 256, 384, 480], ...(pages ? { unoptimized: true } : {}) },
  devIndicators: false,
  env: { NEXT_PUBLIC_STATIC_SITE: pages ? "true" : "" },
  ...(pages ? { output: "export" as const, trailingSlash: true } : {}),
};
export default config;
