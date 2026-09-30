import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { imageSizes: [32, 48, 64, 96, 128, 256, 384, 480] },
  // The lab page at /[locale]/lab/cut-studio presents Cut Studio and opens it.
  async redirects() {
    return [
      // Cut Studio moved to its own site, with a page for every tool.
      { source: "/tools", destination: "https://cutstudio.omardeek.tech/ar", permanent: true },
      { source: "/tools/:path*", destination: "https://cutstudio.omardeek.tech/ar", permanent: true },
      { source: "/cut-studio", destination: "/ar/lab/cut-studio", permanent: true },
      // The factory grew into a set of systems and took a name that says so.
      { source: "/:locale(ar|en)/lab/shorts-factory", destination: "/:locale/lab/ai-automation", permanent: true },
    ];
  },
};
export default config;
