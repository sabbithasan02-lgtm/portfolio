import type { Metadata } from 'next';
import './globals.css';
import './futuristic-theme.css';
export const metadata: Metadata = {title:'Sabbit Ahamed — Automation Engineer',description:'I build n8n workflows, AI agents and API integrations that turn repetitive work into reliable systems.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
