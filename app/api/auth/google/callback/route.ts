import {
  ADMIN_SESSION_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  adminEmail,
  authCookieValue,
  clearCookie,
  createAdminSessionCookie,
  googleAuthConfigured,
  googleCredentials,
  googleRedirectUri,
} from "@/app/admin-auth";

type GoogleTokenResponse = { access_token?: string; error?: string };
type GoogleUser = { sub?: string; email?: string; email_verified?: boolean; name?: string };

function sameValue(left: string, right: string) {
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function redirectWithClearedAuthCookies(request: Request, error?: string) {
  const url = new URL(error ? `/admin/login?error=${encodeURIComponent(error)}` : "/admin", request.url);
  const headers = new Headers({ location: url.toString(), "cache-control": "no-store" });
  headers.append("set-cookie", clearCookie(GOOGLE_STATE_COOKIE, request));
  headers.append("set-cookie", clearCookie(GOOGLE_VERIFIER_COOKIE, request));
  return headers;
}

export async function GET(request: Request) {
  const callbackUrl = new URL(request.url);
  const error = callbackUrl.searchParams.get("error");
  const code = callbackUrl.searchParams.get("code") || "";
  const state = callbackUrl.searchParams.get("state") || "";
  const expectedState = authCookieValue(request, GOOGLE_STATE_COOKIE);
  const verifier = authCookieValue(request, GOOGLE_VERIFIER_COOKIE);

  if (error) return new Response(null, { status: 302, headers: redirectWithClearedAuthCookies(request, "cancelled") });
  if (!googleAuthConfigured()) return Response.redirect(new URL("/admin/login?error=not_configured", request.url));
  if (!code || !verifier || !sameValue(state, expectedState)) {
    return new Response(null, { status: 302, headers: redirectWithClearedAuthCookies(request, "invalid_state") });
  }

  try {
    const { clientId, clientSecret } = googleCredentials();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        code_verifier: verifier,
        grant_type: "authorization_code",
        redirect_uri: googleRedirectUri(request),
      }),
      cache: "no-store",
    });
    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokens.access_token) throw new Error(tokens.error || "Token exchange failed.");

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    const user = (await userResponse.json()) as GoogleUser;
    if (!userResponse.ok || !user.sub || !user.email || user.email_verified !== true) {
      throw new Error("Google did not return a verified account.");
    }
    if (user.email.toLowerCase() !== adminEmail()) {
      return new Response(null, { status: 302, headers: redirectWithClearedAuthCookies(request, "forbidden") });
    }

    const headers = redirectWithClearedAuthCookies(request);
    headers.append("set-cookie", await createAdminSessionCookie({ sub: user.sub, email: user.email, name: user.name }, request));
    return new Response(null, { status: 302, headers });
  } catch (caught) {
    console.error("Google admin login failed", caught instanceof Error ? caught.message : "Authentication error");
    const headers = redirectWithClearedAuthCookies(request, "oauth_failed");
    headers.append("set-cookie", clearCookie(ADMIN_SESSION_COOKIE, request));
    return new Response(null, { status: 302, headers });
  }
}
