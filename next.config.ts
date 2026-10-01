import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: {
    // Static export: photos are pre-generated as WebP by scripts/optimize-images.mjs.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [640, 1280, 1920],
    imageSizes: [320],
  },
};

export default nextConfig;
