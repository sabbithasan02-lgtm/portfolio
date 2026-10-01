import { env } from "cloudflare:workers";

export const ADMIN_SESSION_COOKIE = "portfolio_google_admin";
export const GOOGLE_STATE_COOKIE = "portfolio_google_state";
export const GOOGLE_VERIFIER_COOKIE = "portfolio_google_verifier";
export const DEFAULT_ADMIN_EMAIL = "sabbitgpt@gmail.com";

type AuthEnvironment = {
  ADMIN_EMAIL?: string;
  AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
};

export type AdminSession = {
  sub: string;
  email: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
};

function settings() {
  return env as unknown as AuthEnvironment;
}

export function adminEmail() {
  return (settings().ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export function googleAuthConfigured() {
  const values = settings();
  return Boolean(
    values.GOOGLE_CLIENT_ID?.trim() &&
      values.GOOGLE_CLIENT_SECRET?.trim() &&
      values.AUTH_SECRET &&
      values.AUTH_SECRET.length >= 32,
  );
}

export function googleCredentials() {
  if (!googleAuthConfigured()) throw new Error("Google admin login is not configured.");
  const values = settings();
  return {
    clientId: values.GOOGLE_CLIENT_ID!.trim(),
    clientSecret: values.GOOGLE_CLIENT_SECRET!.trim(),
    redirectUri: values.GOOGLE_REDIRECT_URI?.trim(),
  };
}

export function googleRedirectUri(request: Request) {
  return googleCredentials().redirectUri || new URL("/api/auth/google/callback", request.url).toString();
}

export function isLocalRequest(request: Request) {
  return ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname);
}

function cookieValue(request: Request, name: string) {
  const match = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return new Uint8Array(Array.from(binary, (character) => character.charCodeAt(0)));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function signature(payload: string) {
  const secret = settings().AUTH_SECRET || "";
  if (secret.length < 32) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

function cookie(
  name: string,
  value: string,
  request: Request,
  maxAge: number,
  sameSite: "Lax" | "Strict" = "Lax",
) {
  const secure = isLocalRequest(request) ? "" : "; Secure";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}${secure}`;
}

export function temporaryAuthCookie(name: string, value: string, request: Request) {
  return cookie(name, value, request, 600);
}

export function clearCookie(name: string, request: Request) {
  return cookie(name, "", request, 0);
}

export function authCookieValue(request: Request, name: string) {
  return cookieValue(request, name);
}

export async function createAdminSessionCookie(
  user: { sub: string; email: string; name?: string },
  request: Request,
) {
  const now = Math.floor(Date.now() / 1000);
  const session: AdminSession = {
    sub: user.sub,
    email: user.email.toLowerCase(),
    name: user.name || user.email,
    issuedAt: now,
    expiresAt: now + 8 * 60 * 60,
  };
  const payload = base64Url(new TextEncoder().encode(JSON.stringify(session)));
  // OAuth returns through a cross-site top-level redirect. Lax allows the
  // new session on that redirect while excluding cross-site POST requests.
  return cookie(ADMIN_SESSION_COOKIE, `${payload}.${await signature(payload)}`, request, 8 * 60 * 60, "Lax");
}

export async function getAdminSession(request: Request): Promise<AdminSession | null> {
  const value = cookieValue(request, ADMIN_SESSION_COOKIE);
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  const expectedSignature = await signature(payload);
  if (!expectedSignature || !constantTimeEqual(suppliedSignature, expectedSignature)) return null;
  try {
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    if (!session.sub || !session.email || session.expiresAt <= now || session.issuedAt > now + 60) return null;
    if (session.email.toLowerCase() !== adminEmail()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function hasAdminAccess(request: Request) {
  return isLocalRequest(request) || Boolean(await getAdminSession(request));
}
