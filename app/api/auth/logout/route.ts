import { ADMIN_SESSION_COOKIE, clearCookie } from "@/app/admin-auth";

export async function GET(request: Request) {
  return new Response(null, {
    status: 302,
    headers: {
      location: new URL("/", request.url).toString(),
      "cache-control": "no-store",
      "set-cookie": clearCookie(ADMIN_SESSION_COOKIE, request),
    },
  });
}
