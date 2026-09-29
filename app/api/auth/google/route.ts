import {
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  adminEmail,
  googleAuthConfigured,
  googleCredentials,
  googleRedirectUri,
  temporaryAuthCookie,
} from "@/app/admin-auth";

function randomValue(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function GET(request: Request) {
  if (!googleAuthConfigured()) {
    return Response.redirect(new URL("/admin/login?error=not_configured", request.url));
  }

  const state = randomValue();
  const verifier = randomValue(48);
  const challenge = base64Url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))),
  );
  const { clientId } = googleCredentials();
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
    login_hint: adminEmail(),
  }).toString();

  const headers = new Headers({ location: authorizationUrl.toString(), "cache-control": "no-store" });
  headers.append("set-cookie", temporaryAuthCookie(GOOGLE_STATE_COOKIE, state, request));
  headers.append("set-cookie", temporaryAuthCookie(GOOGLE_VERIFIER_COOKIE, verifier, request));
  return new Response(null, { status: 302, headers });
}
