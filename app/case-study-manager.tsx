'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import type { Project } from '@/data/projects';

export default function CaseStudyManager({ onCreated }: { onCreated: (project: Project) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/projects', { method: 'POST', body: new FormData(event.currentTarget) });
      const data = await response.json() as { project?: Project; error?: string };
      if (!response.ok || !data.project) throw new Error(data.error || 'Upload failed.');
      onCreated(data.project);
      formRef.current?.reset();
      setMessage('Case study published successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The case study could not be uploaded.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className="case-study-manager">
      <summary><ImagePlus size={18} /> Add a case study</summary>
      <form ref={formRef} onSubmit={submit} className="case-study-form">
        <div className="case-study-form-head">
          <div>
            <span className="section-label">OWNER WORKSPACE</span>
            <h3>Publish your automation work</h3>
          </div>
          <p>Add screenshots and the story behind the system. It appears in Selected Automations immediately.</p>
        </div>
        <div className="case-study-fields two-col">
          <label>Project title *<input name="title" required maxLength={140} placeholder="e.g. AI lead qualification workflow" /></label>
          <label>Company<input name="company" maxLength={100} placeholder="Personal Project or client name" /></label>
          <label>Your role<input name="role" maxLength={100} defaultValue="Automation Engineer" /></label>
          <label>Status<select name="status" defaultValue="LIVE"><option>LIVE</option><option>ACTIVE</option><option>BUILDING</option><option>TESTING</option><option>EXPERIMENT</option><option>PROTOTYPE</option></select></label>
          <label>Date<input name="date" maxLength={50} placeholder="2026 or Present" /></label>
          <label>Project type<input name="type" maxLength={120} placeholder="AI Agent / Business Automation" /></label>
        </div>
        <div className="case-study-fields">
          <label>Short summary *<textarea name="summary" required maxLength={700} rows={2} placeholder="What the automation does and who it helps." /></label>
          <label>Problem *<textarea name="problem" required maxLength={3000} rows={3} placeholder="Describe the manual process or business problem." /></label>
          <label>Solution *<textarea name="solution" required maxLength={4000} rows={4} placeholder="Explain what you built and how it works." /></label>
          <label>Workflow steps<textarea name="workflow" rows={3} placeholder={'Trigger\nProcess data\nAI decision\nAction'} /></label>
          <label>Technologies<input name="technologies" placeholder="n8n, OpenAI, Supabase, Webhooks" /></label>
          <label>Key learnings<textarea name="learnings" rows={2} placeholder="One learning per line" /></label>
          <label>Next improvements<textarea name="nextSteps" rows={2} placeholder="One improvement per line" /></label>
          <label className="case-study-upload"><Upload size={20} /><span><strong>Upload screenshots *</strong><small>JPG, PNG, WebP or GIF · up to 6 files · 5 MB each</small></span><input type="file" name="screenshots" accept="image/jpeg,image/png,image/webp,image/gif" multiple required /></label>
        </div>
        <button className="case-study-submit" type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish case study'}</button>
        <p className="case-study-message" aria-live="polite">{message}</p>
      </form>
    </details>
  );
}
