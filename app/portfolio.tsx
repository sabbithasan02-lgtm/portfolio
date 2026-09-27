'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowUpRight, ArrowDown, ArrowRight, Workflow, Menu, X,
  GitBranch, Radio, MapPin, Sparkles, Braces, Webhook, Cog, Database,
  FlaskConical, Check, Plus, Cpu, Zap, Link2, Target, Users, BarChart3, MessageSquare
} from 'lucide-react';
import Network from './network';
import SplitPill from './split-pill';
import SmartNavbar from './smart-navbar';
import ContactForm from './contact-form';
import ProjectDetail from './project-detail';
import { profile } from '@/data/profile';
import { primarySkills, skillGroups } from '@/data/skills';
import { experience } from '@/data/experience';
import { projects, type Project } from '@/data/projects';
import { radyan, radyanWorkflows } from '@/data/radyan';
import { categories, changelog } from '@/data/changelog';
import { lab, labInterests } from '@/data/lab';

const skillIcons = [Workflow, Sparkles, GitBranch, Braces, Webhook, Cog, Database, Cpu];

const steps = [
  ['Discover', 'Understand the business process and identify automation opportunities.'],
  ['Architect', 'Design the workflow, APIs, logic and data structure.'],
  ['Build', 'Develop, integrate and test the automation system.'],
  ['Optimize', 'Monitor performance and continuously improve reliability.']
];

const services = [
  {
    num: '01',
    icon: Workflow,
    title: 'n8n Workflow Automation',
    desc: 'Automate repetitive business processes using robust n8n workflows.'
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'AI Agent Development',
    desc: 'Build intelligent AI agents capable of reasoning, retrieving information and executing actions.'
  },
  {
    num: '03',
    icon: Link2,
    title: 'API Integration',
    desc: 'Connect SaaS platforms, CRMs, databases, APIs and internal tools.'
  },
  {
    num: '04',
    icon: Target,
    title: 'Business Automation',
    desc: 'Transform repetitive operational tasks into scalable automated systems.'
  },
  {
    num: '05',
    icon: Users,
    title: 'Lead Generation Systems',
    desc: 'Automated lead capture, enrichment, qualification and outreach workflows.'
  },
  {
    num: '06',
    icon: BarChart3,
    title: 'Custom AI Tools',
    desc: 'Develop custom AI-powered internal tools and lightweight applications.'
  }
];

const tools = [
  'n8n', 'OpenAI', 'Claude', 'Supabase', 'PostgreSQL', 'Google Sheets',
  'Notion', 'Slack', 'Gmail', 'Webhooks', 'REST APIs', 'JavaScript',
  'TypeScript', 'Next.js', 'Python'
];

const marqueeBrands = ['n8n', 'OpenAI', 'Claude', 'Supabase', 'PostgreSQL', 'Google Sheets', 'Notion', 'Slack', 'Gmail', 'Python', 'Next.js'];

const brandLogos: Record<string, string> = {
  'n8n': '/brands/n8n.svg',
  'OpenAI': '/brands/openai.svg',
  'Claude': '/brands/claude.svg',
  'Supabase': '/brands/supabase.svg',
  'PostgreSQL': '/brands/postgresql.svg',
  'Google Sheets': '/brands/googlesheets.svg',
  'Notion': '/brands/notion.svg',
  'Slack': '/brands/slack.svg',
  'Gmail': '/brands/gmail.svg',
  'JavaScript': '/brands/javascript.svg',
  'TypeScript': '/brands/typescript.svg',
  'Next.js': '/brands/nextjs.svg',
  'Python': '/brands/python.svg',
  'LinkedIn': '/brands/linkedin.svg',
  'Fiverr': '/brands/fiverr.svg'
};

const techIcons: { [key: string]: React.ReactNode } = {
  'n8n': <Workflow size={24} />,
  'OpenAI': <Sparkles size={24} />,
  'Claude': <MessageSquare size={24} />,
  'Supabase': <Database size={24} />,
  'PostgreSQL': <Database size={24} />,
  'Google Sheets': <BarChart3 size={24} />,
  'Notion': <Cog size={24} />,
  'Slack': <MessageSquare size={24} />,
  'Gmail': <Mail size={24} />,
  'Webhooks': <Link2 size={24} />,
  'REST APIs': <Link2 size={24} />,
  'JavaScript': <Braces size={24} />,
  'TypeScript': <Braces size={24} />,
  'Next.js': <Zap size={24} />,
  'Python': <Cpu size={24} />
};

function Mail({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function BrandLogo({ name, size = 24 }: { name: string; size?: number }) {
  const src = brandLogos[name];
  if (!src) return null;

  return (
    <Image
      className="brand-logo"
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
    />
  );
}

export default function Portfolio() {
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [detail, setDetail] = useState<Project | null>(null);

  const filtered = changelog.filter(x => filter === 'ALL' || x.categories.includes(filter));

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('.reveal-target'));
    let revealObserver: IntersectionObserver | undefined;

    if (!reducedMotion) {
      document.documentElement.classList.add('motion-ready');
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.style.setProperty('--reveal-opacity', '1');
          target.style.setProperty('--reveal-offset', '0px');
          revealObserver?.unobserve(entry.target);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -8% 0px' });

      revealTargets.forEach(target => {
        const rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
          target.style.setProperty('--reveal-opacity', '1');
          target.style.setProperty('--reveal-offset', '0px');
        } else revealObserver?.observe(target);
      });
    }

    if (reducedMotion || !window.matchMedia('(hover: hover)').matches) {
      return () => {
        revealObserver?.disconnect();
        document.documentElement.classList.remove('motion-ready');
      };
    }

    const hero = document.querySelector<HTMLElement>('.hero-light');
    const moveHero = (event: PointerEvent) => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      hero.style.setProperty('--hero-x', `${x}px`);
      hero.style.setProperty('--hero-y', `${y}px`);
      hero.style.setProperty('--hero-parallax-x', `${((x / rect.width) - .5) * 10}px`);
      hero.style.setProperty('--hero-parallax-y', `${((y / rect.height) - .5) * 7}px`);
    };
    const resetHero = () => {
      hero?.style.setProperty('--hero-parallax-x', '0px');
      hero?.style.setProperty('--hero-parallax-y', '0px');
    };
    hero?.addEventListener('pointermove', moveHero);
    hero?.addEventListener('pointerleave', resetHero);

    const selector = '.glass-card,.project-card,.skill-card,.radyan-feature,.lab-space,.documentation,.tech-item,.log-row,.process-grid>article';
    const cards = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const handlers = cards.map(card => {
      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
      };
      card.addEventListener('pointermove', move);
      return { card, move };
    });
    return () => {
      handlers.forEach(({ card, move }) => card.removeEventListener('pointermove', move));
      hero?.removeEventListener('pointermove', moveHero);
      hero?.removeEventListener('pointerleave', resetHero);
      revealObserver?.disconnect();
      document.documentElement.classList.remove('motion-ready');
    };
  }, []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      <SmartNavbar menu={menu} setMenu={setMenu} />

      <main id="main">

        {/* ===== HERO SECTION ===== */}
        <section className="hero hero-light personal-hero" id="home">
          <div className="hero-top">
            <span className="eyebrow">
              <i /> SABBIT AHAMED · AI AUTOMATION · N8N · VIBE CODING
            </span>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <h1>
                <span className="hero-line-mask"><span>I Build Intelligent Systems</span></span>
                <span className="hero-line-mask"><span>That Automate Real Work.</span></span>
              </h1>
              <p>
                I design AI-powered automation systems, n8n workflows, integrations, and digital experiences that remove repetitive work and help businesses operate more efficiently.
              </p>
              <div className="hero-actions">
                <SplitPill href="#work" variant="primary" icon={<ArrowUpRight />}>View My Work</SplitPill>
                <SplitPill href="#contact" icon={<ArrowRight />}>Let’s Talk</SplitPill>
              </div>
              <div className="current-status">
                <span className="status-dot" /> Available for selected projects
              </div>
            </div>

            <div className="network-shell">
              <div className="network-caption">
                <span><Radio size={12} /> LIVE AUTOMATION ARCHITECTURE</span>
                <span>INTELLIGENT ORCHESTRATION</span>
              </div>
              <Network />
              <div className="network-bottom">
                <span><i /> DATA FLOW ACTIVE</span>
                <span>HOVER OR TAP A MODULE ↗</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TECH MARQUEE ===== */}
        <div className="tool-strip reveal-target" aria-label="AI and automation tools">
          <div className="tool-strip-track">
            {[0, 1].map(copy => (
              <div className="tool-strip-group" aria-hidden={copy === 1} key={copy}>
                <span className="tool-strip-intro">TURNING COMPLEXITY INTO FLOW</span>
                {marqueeBrands.map(name => (
                  <span className="tool-strip-brand" key={`${copy}-${name}`}><BrandLogo name={name} size={20} />{name}</span>
                ))}
                <span className="tool-strip-text">AI AGENTS</span>
                <span className="tool-strip-text">API INTEGRATIONS</span>
                <span className="tool-strip-text">INTELLIGENT WORKFLOWS</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ABOUT SECTION ===== */}
        <section className="wrap section intro about-section reveal-target" id="about">
          <div className="section-label">01 / THE ENGINEER</div>
          <figure className="about-portrait">
            <Image
              className="about-portrait-image"
              src="/sabbit-ahamed-profile.png"
              alt="Sabbit Ahamed, Automation Engineer"
              width={1229}
              height={1536}
              sizes="(max-width: 760px) 100vw, (max-width: 1100px) 42vw, 28vw"
            />
            <figcaption>
              <span><i className="status-dot" /> SABBIT AHAMED</span>
              <small>AUTOMATION ENGINEER</small>
            </figcaption>
          </figure>
          <div className="about-copy">
            <h2>I don't just automate tasks.<br /><span className="coral">I build systems.</span></h2>
            <p className="large-copy">
              I turn repetitive work into<br />
              <span>automated systems.</span>
            </p>
            <p className="body-copy">
              I'm an Automation Engineer specializing in n8n, AI agents and API-driven workflows.
              I focus on understanding business processes, identifying repetitive work and
              designing reliable systems that automate those operations.
            </p>
            <div className="about-stats">
              <div>
                <strong>50+</strong>
                <span>Automation Projects</span>
              </div>
              <div>
                <strong>200+</strong>
                <span>Workflows Built</span>
              </div>
              <div>
                <strong>1000+</strong>
                <span>Hours Automated</span>
              </div>
              <div>
                <strong>50+</strong>
                <span>Tools Integrated</span>
              </div>
            </div>
            <a className="text-button" href="#radyan">
              See what I'm building <ArrowUpRight size={18} />
            </a>
          </div>
        </section>

        {/* ===== SERVICES SECTION ===== */}
        <section className="wrap section reveal-target" id="services">
          <div className="section-label">02 / SERVICES</div>
          <h2>What I can build<br />for you<span className="coral">.</span></h2>
          <div className="services-grid">
            {services.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="glass-card service-card">
                  <span className="service-number">{s.num}</span>
                  <div className="service-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <ArrowUpRight size={18} className="service-arrow" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== RADYAN SECTION ===== */}
        <section className="wrap section reveal-target" id="radyan">
          <div className="section-head">
            <div>
              <div className="section-label">03 / CURRENTLY BUILDING</div>
              <h2>Inside my work at <span className="coral">Radyan</span></h2>
            </div>
            <span className="status-badge"><span className="status-dot" /> ACTIVE & ONGOING</span>
          </div>
          <div className="radyan-feature">
            <div className="radyan-wordmark">
              <Image
                className="radyan-logo"
                src="/brands/radyan.png"
                alt="Radyan"
                width={400}
                height={121}
              />
              <small>BUSINESS AUTOMATION / E-COMMERCE OPERATIONS</small>
            </div>
            <div className="radyan-content">
              <div className="tiny-label">MY CURRENT ROLE</div>
              <h3>Automation Engineer</h3>
              <p>{radyan.description}</p>
              <p>{radyan.details}</p>
              <div className="radyan-links">
                <button className="text-button" onClick={() => setDetail(projects.find(p => p.id === 'radyan') || null)}>
                  See What I'm Building <ArrowUpRight size={17} />
                </button>
                <a href={radyan.url} target="_blank" rel="noreferrer" className="muted-link">radyanbd.com ↗</a>
              </div>
            </div>
          </div>
          <div className="subsection-heading">
            <h3>What I'm Building at Radyan</h3>
            <span className="tiny-label">AN ONGOING AUTOMATION CASE STUDY</span>
          </div>
          {radyanWorkflows.length > 0 ? (
            <div className="project-grid">{radyanWorkflows.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onOpen={setDetail} />)}</div>
          ) : (
            <div className="documentation">
              <GitBranch size={21} />
              <div>
                <h4>Work in progress. Documentation, too.</h4>
                <p>I'm building and improving real operational workflows. Individual systems, architecture and approved screenshots will appear here as I document the work.</p>
              </div>
              <span className="tag">ONGOING</span>
            </div>
          )}
          <div className="metrics-row">
            {profile.metrics.some(x => x.verified) ? (
              profile.metrics.filter(x => x.verified).map(x => (
                <div key={x.label}>
                  <strong>{x.value}</strong>
                  <span>{x.label}</span>
                </div>
              ))
            ) : (
              <>
                <div>
                  <span className="tiny-label">WORKFLOWS & INTEGRATIONS</span>
                  <p>Real systems. Measured outcomes.</p>
                </div>
                <div className="metrics-note">
                  <span className="status-dot" /> Tracking in progress
                  <span>Verified results will be published as they're measured.</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ===== FEATURED WORK ===== */}
        <section className="wrap section reveal-target" id="work">
          <div className="section-head">
            <div>
              <div className="section-label">04 / SELECTED WORK</div>
              <h2>Selected Automations<span className="coral">.</span></h2>
            </div>
            <p className="section-aside">
              My automation systems.<br />The problems behind lequed.
            </p>
          </div>
          <div className="project-grid">{projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onOpen={setDetail} />)}</div>
        </section>

        {/* ===== AUTOMATION WORKFLOW ===== */}
        <section className="wrap section workflow-section reveal-target">
          <div className="section-label">05 / HOW AUTOMATION WORKS</div>
          <h2>From trigger to <span className="coral">result</span></h2>
          <div className="workflow-diagram">
            {['Trigger', 'Process', 'AI', 'Decision', 'Action', 'Result'].map((step, i) => (
              <div key={step} className="workflow-step">
                <div className="workflow-node">{step}</div>
                {i < 5 && <div className="workflow-connector" />}
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW I WORK ===== */}
        <section className="wrap section reveal-target" id="process">
          <div className="section-head">
            <div>
              <div className="section-label">06 / HOW I WORK</div>
              <h2>A clear process.<br /><span className="coral">A reliable system.</span></h2>
            </div>
            <p className="section-aside">
              Understand the work first.<br />Then make it work better.
            </p>
          </div>
          <div className="process-grid">
            {steps.map(([title, desc], i) => (
              <article key={title}>
                <span className="process-index">{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="process-step-connector" />
              </article>
            ))}
          </div>
        </section>

        {/* ===== TECH STACK ===== */}
        <section className="wrap section reveal-target" id="stack">
          <div className="section-head">
            <div>
              <div className="section-label">07 / TECH STACK</div>
              <h2>Tools I work with<span className="coral">.</span></h2>
            </div>
          </div>
          <div className="tech-grid">
            {tools.map(tool => (
              <div key={tool} className="tech-item">
                {brandLogos[tool] ? <BrandLogo name={tool} /> : (techIcons[tool] || <Cog size={24} />)}
                <span>{tool}</span>
              </div>
            ))}
          </div>
          <div className="toolkit">
            <div>
              <div className="section-label">THE TOOLS BEHIND THE WORK</div>
              <h2>Different tools.<br />One working system.</h2>
              <p className="body-copy">
                I connect the right tools for the process. Each integration becomes part
                of a bigger, more useful workflow.
              </p>
              <div className="skill-groups">
                {skillGroups.map(x => (
                  <div key={x.title}>
                    <h4>{x.title}</h4>
                    <p>{x.tools.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== EXPERIENCE ===== */}
        <section className="wrap section experience-section reveal-target" id="experience">
          <div className="section-label">08 / EXPERIENCE</div>
          <h2>Building in the real world<span className="coral">.</span></h2>
          {experience.map(x => (
            <article className="experience" key={x.company}>
              <div>
                <span className="status-dot" /> {x.period}
                <span className="experience-company">{x.company}</span>
              </div>
              <div>
                <h3>{x.role}</h3>
                <p className="body-copy">{x.description}</p>
                <div className="tags">{x.skills.map(s => <span key={s}>{s}</span>)}</div>
                <a href="#radyan" className="text-button">View Radyan Work <ArrowUpRight size={16} /></a>
              </div>
              <span className="tag">{x.status.toUpperCase()}</span>
            </article>
          ))}
        </section>

        {/* ===== WHY AUTOMATION ===== */}
        <section className="wrap section why-automation reveal-target">
          <h2>
            Manual work doesn't scale.<br />
            <span className="coral">Systems do.</span>
          </h2>
          <div className="why-grid">
            <div className="glass-card">
              <Check size={24} />
              <h3>Save Time</h3>
              <p>Automate repetitive tasks and free up hours every week.</p>
            </div>
            <div className="glass-card">
              <Check size={24} />
              <h3>Reduce Errors</h3>
              <p>Eliminate human mistakes from your business processes.</p>
            </div>
            <div className="glass-card">
              <Check size={24} />
              <h3>Scale Operations</h3>
              <p>Grow your business without proportionally growing your team.</p>
            </div>
          </div>
        </section>

        {/* ===== BUILDING LOG ===== */}
        <section className="wrap section reveal-target" id="building">
          <div className="section-head">
            <div>
              <div className="section-label">09 / THE BUILDING LOG</div>
              <h2>What I'm Building<span className="coral">.</span></h2>
            </div>
            <span className="tiny-label">A LIVING ENGINEERING CHANGELOG</span>
          </div>
          <div className="filters" aria-label="Filter building log">
            {categories.map(x => (
              <button key={x} aria-pressed={filter === x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)}>{x}</button>
            ))}
          </div>
          <div className="log" aria-live="polite">
            {filtered.length > 0 ? filtered.map(x => (
              <article className="log-row" key={x.id}>
                <time>{x.date}</time>
                <div>
                  <h3>{x.project}</h3>
                  <p>{x.update}</p>
                  <div className="tags">{x.technology.map(t => <span key={t}>{t}</span>)}</div>
                </div>
                <span className="status-badge"><span className="status-dot" />{x.status}</span>
              </article>
            )) : (
              <div className="filter-empty">
                <GitBranch size={25} />
                <h3>No published updates yet.</h3>
                <p>New {filter.toLowerCase()} updates will appear here as I document them.</p>
                <button onClick={() => setFilter('ALL')} className="text-button">View all updates <ArrowRight size={15} /></button>
              </div>
            )}
          </div>
        </section>

        {/* ===== AUTOMATION LAB ===== */}
        <section className="wrap section reveal-target" id="lab">
          <div className="section-head">
            <div>
              <div className="section-label">10 / EXPLORATION</div>
              <h2>Automation Lab<span className="coral">.</span></h2>
            </div>
            <FlaskConical size={32} className="coral" />
          </div>
          <p className="body-copy">A space for experiments, prototypes and ideas that could become useful systems.</p>
          {lab.length > 0 ? (
            <div className="project-grid">{lab.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onOpen={setDetail} />)}</div>
          ) : (
            <div className="lab-space">
              <div className="tiny-label">AREAS I'M EXPLORING</div>
              <div className="lab-topics">
                {labInterests.map((x, i) => (
                  <span key={x}>
                    <span className="lab-index">{String(i + 1).padStart(2, '0')}</span>
                    {x}
                    <Plus size={13} />
                  </span>
                ))}
              </div>
              <p className="lab-note">Experiments will be published here with their actual status and findings.</p>
            </div>
          )}
        </section>

        {/* ===== CONTACT CTA ===== */}
        <section className="wrap section contact-cta reveal-target">
          <h2>
            Have a process that<br />
            shouldn't be manual?<br />
            <span className="coral">Let's turn it into a system.</span>
          </h2>
          <a href="#contact" className="button primary cta-button">
            Start a Conversation <ArrowUpRight size={18} />
          </a>
        </section>

        {/* ===== CONTACT SECTION ===== */}
        <section className="wrap section contact-section reveal-target" id="contact">
          <div className="contact-copy">
            <div className="section-label">LET'S CONNECT</div>
            <h2>Let's automate<br /><span className="coral">something useful.</span></h2>
            <p className="body-copy">
              If you have a repetitive process, disconnected tools or a workflow that takes
              too much manual effort, I can help turn it into an automated system.
            </p>
            <div className="contact-availability">
              <span className="status-dot" /> Available for remote projects
              <span>Based in {profile.location} · Working globally</span>
            </div>
            <div className="social-links">
              {profile.links.map(x => (
                <a key={x.label} href={x.url} target="_blank" rel="noreferrer"><BrandLogo name={x.label} size={18} />{x.label} <ArrowUpRight size={15} /></a>
              ))}
              {profile.email && <a href={'mailto:' + profile.email}>Email <ArrowUpRight size={15} /></a>}
            </div>
          </div>
          <ContactForm />
        </section>

      </main>

      {/* ===== FOOTER ===== */}
      <footer className="wrap footer">
        <div className="footer-top">
          <a className="brand" href="#home">SABBIT AHAMED<span className="brand-dot">.</span></a>
          <p>Automation Engineer building intelligent systems for modern businesses.</p>
          <span>Building systems that<br />remove repetitive work.</span>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Sabbit Ahamed · Built with automation in mind.</span>
          <div className="footer-links">
            {profile.links.map(x => (
              <a key={x.label} href={x.url} target="_blank" rel="noreferrer"><BrandLogo name={x.label} size={14} />{x.label} ↗</a>
            ))}
            <a href="#home">Back to top ↑</a>
          </div>
        </div>
      </footer>

      <ProjectDetail project={detail} onClose={() => setDetail(null)} />
    </>
  );
}

function ProjectCard({ project: p, index, onOpen }: { project: Project; index: number; onOpen: (p: Project) => void }) {
  return (
    <button className="project-card" onClick={() => onOpen(p)}>
      <div className="project-art">
        <div className="tiny-label">SYSTEM {String(index + 1).padStart(2, '0')} / {p.company || 'INDEPENDENT'}</div>
        <div className="architecture-preview">
          <span><Webhook size={20} />Trigger</span>
          <i />
          <span className="architecture-core"><Workflow size={26} />n8n</span>
          <i />
          <span><Braces size={20} />Integration</span>
          <i />
          <span><Check size={20} />Action</span>
        </div>
        <div className="project-art-bottom">
          <span>WORKFLOW ARCHITECTURE</span>
          <span>CONCEPTUAL OVERVIEW</span>
        </div>
      </div>
      <div className="project-info">
        <div className="project-title-line">
          <h3>{p.title}</h3>
          <ArrowUpRight size={22} />
        </div>
        <p>{p.summary}</p>
        <div className="project-meta">
          <span>{p.company} / {p.role}</span>
          <span className="status-badge"><span className="status-dot" />{p.status}</span>
        </div>
        <div className="tags">{p.technologies.map(x => <span key={x}>{x}</span>)}</div>
      </div>
    </button>
  );
}
