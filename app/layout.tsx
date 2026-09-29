import type { Metadata } from 'next';
import { env } from 'cloudflare:workers';
import { defaultSiteContent, type SiteContent } from '@/data/site-content';
import './globals.css';
import './futuristic-theme.css';

export async function generateMetadata(): Promise<Metadata> {
  let seo = defaultSiteContent.seo;
  try {
    const row = await env.DB?.prepare("SELECT value FROM site_settings WHERE key = 'site-content'").first<{ value: string }>();
    if (row?.value) seo = (JSON.parse(row.value) as SiteContent).seo || seo;
  } catch { /* Use safe defaults before the settings migration is applied. */ }
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(',').map(value => value.trim()).filter(Boolean),
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: { title: seo.title, description: seo.description, images: seo.ogImage ? [seo.ogImage] : undefined, url: seo.canonicalUrl || undefined, type: 'website' },
    icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  };
}
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
