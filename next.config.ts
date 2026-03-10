import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    unoptimized: true,
  },
  // Disable automatic static optimization to prevent double renders
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
