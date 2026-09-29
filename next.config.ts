import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = process.env.VERCEL ? {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "cloudflare:workers": path.resolve(process.cwd(), "lib/vercel-cloudflare-shim.ts"),
    };
    return config;
  },
} : {};

export default nextConfig;
