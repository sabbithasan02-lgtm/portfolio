export type EditableService = { title: string; description: string; details: string };
export type EditableMetric = { value: string; label: string };
export type EditableExperience = { company: string; role: string; period: string; status: string; description: string; skills: string[] };

export type SiteContent = {
  work: { heading: string; intro: string };
  about: { heading: string; highlight: string; body: string; metrics: EditableMetric[] };
  services: EditableService[];
  experience: { heading: string; items: EditableExperience[] };
  seo: { title: string; description: string; keywords: string; canonicalUrl: string; ogImage: string };
};

export const defaultSiteContent: SiteContent = {
  work: { heading: 'Selected Automations.', intro: 'My automation systems. The work behind each system.' },
  about: {
    heading: "I don't just automate tasks.",
    highlight: 'I build systems.',
    body: "I'm an Automation Engineer specializing in workflow automation, AI agents and API-driven systems. I focus on understanding business processes, identifying repetitive work and designing reliable systems that automate those operations.",
    metrics: [{ value: '50+', label: 'Automation Projects' }, { value: '200+', label: 'Workflows Built' }, { value: '1000+', label: 'Hours Automated' }, { value: '50+', label: 'Tools Integrated' }],
  },
  services: [
    { title: 'Workflow Automation', description: 'Automate repetitive business processes with reliable, connected workflows.', details: 'I design reliable workflows around triggers, decisions, approvals, data movement and business actions.' },
    { title: 'AI Agent Development', description: 'Build intelligent AI agents capable of reasoning, retrieving information and executing actions.', details: 'Purpose-built agents can retrieve knowledge, reason over inputs and safely take action through connected tools.' },
    { title: 'API Integration', description: 'Connect SaaS platforms, CRMs, databases, APIs and internal tools.', details: 'I connect platforms through secure APIs, webhooks and structured data flows.' },
    { title: 'Business Automation', description: 'Transform repetitive operational tasks into scalable automated systems.', details: 'Operational processes are mapped, simplified and converted into maintainable automated systems.' },
    { title: 'Lead Generation Systems', description: 'Automated lead capture, enrichment, qualification and outreach workflows.', details: 'Lead systems can capture, enrich, qualify, route and follow up with prospects.' },
    { title: 'Custom AI Tools', description: 'Develop custom AI-powered internal tools and lightweight applications.', details: 'Focused internal applications combine AI with your data, APIs and team workflows.' },
  ],
  experience: {
    heading: 'Building in the real world.',
    items: [{ company: 'Radyan', role: 'Automation Engineer', period: 'Present', status: 'Ongoing', description: 'Designing and developing automation workflows that connect business tools, APIs, data and AI-powered processes.', skills: ['Workflow Automation', 'API Integration', 'Automation Architecture', 'AI Integration', 'Webhooks', 'Data Workflows', 'System Design'] }],
  },
  seo: {
    title: 'Sabbit Ahamed — Automation Engineer',
    description: 'I build automated workflows, AI agents and API integrations that turn repetitive work into reliable systems.',
    keywords: 'automation engineer, workflow automation, AI agents, API integration',
    canonicalUrl: '',
    ogImage: '/sabbit-ahamed-profile.png',
  },
};
