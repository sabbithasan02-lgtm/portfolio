import { env } from 'cloudflare:workers';
import { hasAdminAccess } from '@/app/admin-auth';
import { defaultSiteContent, type SiteContent } from '@/data/site-content';

function normalize(value: Partial<SiteContent>): SiteContent {
  return {
    ...defaultSiteContent,
    ...value,
    work: { ...defaultSiteContent.work, ...value.work },
    about: { ...defaultSiteContent.about, ...value.about, metrics: value.about?.metrics || defaultSiteContent.about.metrics },
    services: (value.services || defaultSiteContent.services).map((service, index) => ({ ...defaultSiteContent.services[index], ...service, details: service.details || defaultSiteContent.services[index]?.details || '' })),
    experience: { ...defaultSiteContent.experience, ...value.experience, items: value.experience?.items || defaultSiteContent.experience.items },
    seo: { ...defaultSiteContent.seo, ...value.seo },
  };
}

export async function GET(request: Request) {
  let content = defaultSiteContent;
  try {
    const row = await env.DB?.prepare("SELECT value FROM site_settings WHERE key = 'site-content'").first<{ value: string }>();
    if (row?.value) content = normalize(JSON.parse(row.value) as Partial<SiteContent>);
  } catch (error) {
    console.error('Site content could not be loaded', error instanceof Error ? error.message : 'Storage error');
  }
  return Response.json({ content, canManage: await hasAdminAccess(request) });
}

export async function PUT(request: Request) {
  if (!(await hasAdminAccess(request))) return Response.json({ error: 'Owner access required.' }, { status: 403 });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!env.DB) return Response.json({ error: 'Site database unavailable.' }, { status: 503 });

  const content = await request.json() as SiteContent;
  if (!content?.about?.heading || !content?.work?.heading || !content?.seo?.title || !Array.isArray(content.services) || !Array.isArray(content.experience?.items)) {
    return Response.json({ error: 'Required content fields are missing.' }, { status: 400 });
  }
  const value = JSON.stringify(content).slice(0, 100_000);
  await env.DB.prepare("INSERT INTO site_settings (key,value,updated_at) VALUES ('site-content',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at")
    .bind(value, Date.now()).run();
  return Response.json({ content });
}
