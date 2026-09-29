import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export const OWNER_EMAIL = 'sabbitgpt@gmail.com';
export const ADMIN_COOKIE = 'portfolio_admin';

function secrets() { return env as unknown as { ADMIN_MASTER_KEY?: string }; }
export function isLocalRequest(request: Request) { return ['localhost','127.0.0.1'].includes(new URL(request.url).hostname); }

async function tokenFor(key: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`portfolio-admin:${key}`));
  return Array.from(new Uint8Array(bytes)).map(value => value.toString(16).padStart(2,'0')).join('');
}

function cookieValue(request: Request, name: string) {
  const match = request.headers.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

function equalConstantTime(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0; for (let index=0; index<a.length; index++) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
}

export async function masterKeyConfigured() { return Boolean(secrets().ADMIN_MASTER_KEY && secrets().ADMIN_MASTER_KEY!.length >= 16); }
export async function verifyMasterKey(value: string) {
  const key = secrets().ADMIN_MASTER_KEY || '';
  return key.length >= 16 && equalConstantTime(await tokenFor(value), await tokenFor(key));
}
export async function validAdminCookie(request: Request) {
  const key = secrets().ADMIN_MASTER_KEY || '';
  if (key.length < 16) return false;
  return equalConstantTime(cookieValue(request, ADMIN_COOKIE), await tokenFor(key));
}
export async function hasAdminAccess(request: Request) {
  if (isLocalRequest(request)) return true;
  const user = await getChatGPTUser();
  return user?.email.toLowerCase() === OWNER_EMAIL || await validAdminCookie(request);
}
export async function createAdminCookie(request: Request) {
  const key = secrets().ADMIN_MASTER_KEY || '';
  const secure = isLocalRequest(request) ? '' : '; Secure';
  return `${ADMIN_COOKIE}=${encodeURIComponent(await tokenFor(key))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}`;
}
