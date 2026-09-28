import { env } from "cloudflare:workers";

export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  if (!env.BUCKET) return new Response("Media storage unavailable", { status: 503 });
  const { key } = await context.params;
  if (!/^[a-f0-9-]+-\d+\.(jpg|png|webp|gif)$/.test(key)) return new Response("Not found", { status: 404 });
  const object = await env.BUCKET.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
