'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { defaultSiteContent, type SiteContent } from '@/data/site-content';
import type { Project } from '@/data/projects';
import CaseStudyManager from '@/app/case-study-manager';

export default function AdminDashboard({ userEmail, signInUrl, signOutUrl }: { userEmail: string; signInUrl: string; signOutUrl: string }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [status, setStatus] = useState('Loading saved content…');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch('/api/site-content').then(async r => await r.json() as { content?: SiteContent }).then(data => {
      if (data.content) setContent(data.content);
      setStatus('Ready');
    }).catch(() => setStatus('Could not load saved content.'));
  }, []);

  useEffect(() => {
    fetch('/api/projects?admin=1').then(async r => await r.json() as { projects?: Project[] }).then(data => setProjects(data.projects || [])).catch(() => undefined);
  }, []);

  async function save() {
    setStatus('Saving…');
    const response = await fetch('/api/site-content', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(content) });
    const data = await response.json() as { error?: string };
    setStatus(response.ok ? 'Saved. The public website has been updated.' : data.error || 'Save failed.');
  }

  return (
    <main className="admin-dashboard">
      <header><div><span>PORTFOLIO ADMIN</span><h1>Content & SEO dashboard</h1><p>Signed in as {userEmail}</p></div><nav><Link href="/">View website</Link>{userEmail === 'Local development' ? <a href={signInUrl}>Test owner login</a> : <a href={signOutUrl}>Sign out</a>}</nav></header>

      <section><h2>Work</h2><label>Section heading<input value={content.work.heading} onChange={e => setContent({ ...content, work: { ...content.work, heading: e.target.value } })} /></label><label>Introduction<textarea rows={3} value={content.work.intro} onChange={e => setContent({ ...content, work: { ...content.work, intro: e.target.value } })} /></label><CaseStudyManager onCreated={project => setProjects(current => [project, ...current])} />{projects.map((project, index) => <ProjectEditor key={project.id} project={project} onChange={next => setProjects(current => current.map((item, i) => i === index ? next : item))} onDelete={() => setProjects(current => current.filter(item => item.id !== project.id))} />)}</section>

      <section><h2>About</h2><label>Heading<input value={content.about.heading} onChange={e => setContent({ ...content, about: { ...content.about, heading: e.target.value } })} /></label><label>Highlighted line<input value={content.about.highlight} onChange={e => setContent({ ...content, about: { ...content.about, highlight: e.target.value } })} /></label><label>Biography<textarea rows={5} value={content.about.body} onChange={e => setContent({ ...content, about: { ...content.about, body: e.target.value } })} /></label><h3>About metrics</h3>{(content.about.metrics || []).map((metric, index) => <div className="admin-repeat" key={index}><label>Number<input value={metric.value} onChange={e => { const metrics=[...content.about.metrics]; metrics[index]={...metric,value:e.target.value}; setContent({...content,about:{...content.about,metrics}}); }} /></label><label>Label<input value={metric.label} onChange={e => { const metrics=[...content.about.metrics]; metrics[index]={...metric,label:e.target.value}; setContent({...content,about:{...content.about,metrics}}); }} /></label></div>)}</section>

      <section><h2>Services</h2>{content.services.map((service, index) => <div className="admin-repeat" key={index}><label>Service title<input value={service.title} onChange={e => { const services = [...content.services]; services[index] = { ...service, title: e.target.value }; setContent({ ...content, services }); }} /></label><label>Short description<textarea rows={2} value={service.description} onChange={e => { const services = [...content.services]; services[index] = { ...service, description: e.target.value }; setContent({ ...content, services }); }} /></label><label>Viewer details<textarea rows={4} value={service.details || ''} onChange={e => { const services = [...content.services]; services[index] = { ...service, details: e.target.value }; setContent({ ...content, services }); }} /></label><button type="button" onClick={() => setContent({ ...content, services: content.services.filter((_, i) => i !== index) })}>Remove</button></div>)}<button type="button" onClick={() => setContent({ ...content, services: [...content.services, { title: 'New service', description: '', details: '' }] })}>Add service</button></section>

      <section><h2>Experience</h2><label>Section heading<input value={content.experience.heading} onChange={e => setContent({ ...content, experience: { ...content.experience, heading: e.target.value } })} /></label>{content.experience.items.map((item, index) => <div className="admin-repeat" key={index}>{(['company','role','period','status'] as const).map(field => <label key={field}>{field}<input value={item[field]} onChange={e => { const items = [...content.experience.items]; items[index] = { ...item, [field]: e.target.value }; setContent({ ...content, experience: { ...content.experience, items } }); }} /></label>)}<label>Description<textarea rows={3} value={item.description} onChange={e => { const items = [...content.experience.items]; items[index] = { ...item, description: e.target.value }; setContent({ ...content, experience: { ...content.experience, items } }); }} /></label><label>Skills (comma separated)<input value={item.skills.join(', ')} onChange={e => { const items = [...content.experience.items]; items[index] = { ...item, skills: e.target.value.split(',').map(x => x.trim()).filter(Boolean) }; setContent({ ...content, experience: { ...content.experience, items } }); }} /></label><button type="button" onClick={() => setContent({ ...content, experience: { ...content.experience, items: content.experience.items.filter((_, i) => i !== index) } })}>Remove</button></div>)}<button type="button" onClick={() => setContent({ ...content, experience: { ...content.experience, items: [...content.experience.items, { company: '', role: '', period: '', status: 'Ongoing', description: '', skills: [] }] } })}>Add experience</button></section>

      <section><h2>SEO</h2><label>Page title<input value={content.seo.title} maxLength={70} onChange={e => setContent({ ...content, seo: { ...content.seo, title: e.target.value } })} /></label><label>Meta description<textarea rows={3} maxLength={170} value={content.seo.description} onChange={e => setContent({ ...content, seo: { ...content.seo, description: e.target.value } })} /></label><label>Keywords<input value={content.seo.keywords} onChange={e => setContent({ ...content, seo: { ...content.seo, keywords: e.target.value } })} /></label><label>Canonical URL<input type="url" placeholder="https://your-domain.com" value={content.seo.canonicalUrl} onChange={e => setContent({ ...content, seo: { ...content.seo, canonicalUrl: e.target.value } })} /></label><label>Social image path or URL<input value={content.seo.ogImage} onChange={e => setContent({ ...content, seo: { ...content.seo, ogImage: e.target.value } })} /></label></section>

      <footer><span aria-live="polite">{status}</span><button className="admin-save" type="button" onClick={save}>Save all changes</button></footer>
    </main>
  );
}

function ProjectEditor({ project, onChange, onDelete }: { project: Project; onChange: (project: Project) => void; onDelete: () => void }) {
  const [message, setMessage] = useState('');
  const field = (key: keyof Project, value: string | string[]) => onChange({ ...project, [key]: value });
  async function update() { setMessage('Saving…'); const response=await fetch('/api/projects',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(project)}); const data=await response.json() as {project?:Project;error?:string}; if(data.project) onChange(data.project); setMessage(response.ok?'Saved.':data.error||'Save failed.'); }
  async function remove() { if(!confirm('Delete this case study and its uploaded screenshots?')) return; const response=await fetch(`/api/projects?id=${encodeURIComponent(project.id)}`,{method:'DELETE'}); if(response.ok) onDelete(); else setMessage('Delete failed.'); }
  return <details className="admin-project"><summary>Edit: {project.title}</summary><div className="admin-repeat"><label>Title<input value={project.title} onChange={e=>field('title',e.target.value)} /></label><label>Company<input value={project.company} onChange={e=>field('company',e.target.value)} /></label><label>Role<input value={project.role} onChange={e=>field('role',e.target.value)} /></label><label>Status<select value={project.status} onChange={e=>field('status',e.target.value)}><option>LIVE</option><option>ACTIVE</option><option>BUILDING</option><option>TESTING</option><option>EXPERIMENT</option><option>PROTOTYPE</option></select></label><label>Summary<textarea value={project.summary} onChange={e=>field('summary',e.target.value)} /></label><label>Problem<textarea value={project.problem} onChange={e=>field('problem',e.target.value)} /></label><label>Solution<textarea value={project.solution} onChange={e=>field('solution',e.target.value)} /></label><label>Technologies<input value={project.technologies.join(', ')} onChange={e=>field('technologies',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))} /></label><div><button type="button" onClick={update}>Save project</button> <button type="button" onClick={remove}>Delete</button> <span>{message}</span></div></div></details>;
}
