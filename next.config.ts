import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { imageSizes: [32, 48, 64, 96, 128, 256, 384, 480] },
  // Cut Studio keeps its own app shell and stylesheet at /tools; importing that
  // stylesheet into the site would leak html/body and .button rules everywhere.
  // The lab page at /[locale]/lab/cut-studio presents it and opens it.
  async redirects() {
    return [
      { source: "/cut-studio", destination: "/ar/lab/cut-studio", permanent: true },
      // The factory grew into a set of systems and took a name that says so.
      { source: "/:locale(ar|en)/lab/shorts-factory", destination: "/:locale/lab/ai-automation", permanent: true },
    ];
  },
};
export default config;
