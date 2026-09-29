/*
 * Native Next.js deployments do not provide Cloudflare Worker bindings.
 * The webpack alias in next.config.ts maps `cloudflare:workers` here for
 * Vercel builds, while Vinext continues to use the real Cloudflare module.
 */
export const env = new Proxy<Record<string, unknown>>({}, {
  get(_target, property) {
    if (typeof property !== "string") return undefined;
    return process.env[property];
  },
});
