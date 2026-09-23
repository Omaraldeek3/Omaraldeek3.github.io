import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { imageSizes: [32, 48, 64, 96, 128, 256, 384, 480] },
  async redirects() {
    return [
      { source: "/tools", destination: "/ar/lab/cut-studio", permanent: true },
      { source: "/tools/:path*", destination: "/ar/lab/cut-studio", permanent: true },
    ];
  },
};
export default config;
