import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { validAdminCookie } from '@/app/admin-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from './admin-dashboard';

const OWNER_EMAIL = 'sabbitgpt@gmail.com';

export default async function AdminPage() {
  const user = await getChatGPTUser();
  const requestHeaders = await headers();
  const hostHeader = requestHeaders.get('host') || '';
  const host = hostHeader.split(':')[0];
  const local = host === 'localhost' || host === '127.0.0.1';
  const request = new Request(`${requestHeaders.get('x-forwarded-proto') || 'https'}://${hostHeader}/admin`, { headers: requestHeaders });
  const masterSession = await validAdminCookie(request);
  if (!local && !user && !masterSession) redirect('/admin/login');
  const isOwner = local || masterSession || user?.email.toLowerCase() === OWNER_EMAIL;

  if (!isOwner) {
    return <main className="admin-gate"><h1>Owner access only</h1><p>This dashboard is restricted to the portfolio owner.</p><a href={chatGPTSignOutPath('/admin')}>Sign out</a></main>;
  }

  return <AdminDashboard userEmail={user?.email || 'Local development'} signInUrl={chatGPTSignInPath('/admin')} signOutUrl={chatGPTSignOutPath('/')} />;
}
