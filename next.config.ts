import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // There is a package-lock.json here and another at the repo root, so Next
  // guesses the workspace root and warns. This site is self-contained; pin it.
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Disable automatic static optimization to prevent double renders
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // CSP is deferred: Next injects inline scripts, so a strict policy needs
  // nonces wired through the app before it can be turned on.
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      });
    }
    return [{ source: "/(.*)", headers }];
  },
  // /showcase was merged into /shop: it listed the same ten products from a
  // duplicate JSON file. Kept as a redirect so existing links still land.
  async redirects() {
    return [{ source: '/showcase', destination: '/shop', permanent: true }];
  },
};

export default nextConfig;
