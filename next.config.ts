import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = process.env.VERCEL ? {
  webpack(config, { webpack }) {
    // `cloudflare:workers` uses a URL-like scheme. Webpack rejects that scheme
    // before a normal resolve alias runs, so replace the module request itself.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^cloudflare:workers$/,
        path.resolve(process.cwd(), "lib/vercel-cloudflare-shim.ts"),
      ),
    );
    return config;
  },
} : {};

export default nextConfig;
