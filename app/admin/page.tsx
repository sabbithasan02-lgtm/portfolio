import { getAdminSession } from '@/app/admin-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from './admin-dashboard';

export default async function AdminPage() {
  const requestHeaders = await headers();
  const hostHeader = requestHeaders.get('host') || '';
  const host = hostHeader.split(':')[0];
  const local = host === 'localhost' || host === '127.0.0.1';
  const request = new Request(`${requestHeaders.get('x-forwarded-proto') || 'https'}://${hostHeader}/admin`, { headers: requestHeaders });
  const session = await getAdminSession(request);
  if (!local && !session) redirect('/admin/login');
  return <AdminDashboard userEmail={session?.email || 'Local development'} />;
}
