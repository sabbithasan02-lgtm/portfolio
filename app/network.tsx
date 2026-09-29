'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const nodeLogos: Record<string, string> = {
  OpenAI: '/brands/openai.svg',
  Claude: '/brands/claude.svg',
  Slack: '/brands/slack.svg',
  Email: '/brands/gmail.svg',
  Database: '/brands/postgresql.svg'
};

const nodeSlug = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

type NetworkNode = {
  label: string;
  x: number;
  y: number;
  mx?: number;
  my?: number;
  symbol: string;
  group?: 'input' | 'capability' | 'output' | 'action';
  mobileHidden?: boolean;
};

const heroNodes: NetworkNode[] = [
  { label: 'OpenAI', x: 0.10, y: 0.28, mx: 0.13, my: 0.32, symbol: '◈', group: 'input' },
  { label: 'Claude', x: 0.10, y: 0.50, mx: 0.13, my: 0.52, symbol: '✳', group: 'input' },
  { label: 'Gemini', x: 0.10, y: 0.72, mx: 0.13, my: 0.72, symbol: '✦', group: 'input' },
  { label: 'Memory', x: 0.36, y: 0.10, mx: 0.23, my: 0.10, symbol: '◉', group: 'capability' },
  { label: 'Tools', x: 0.50, y: 0.08, mx: 0.50, my: 0.08, symbol: '⚒', group: 'capability' },
  { label: 'Vector Store', x: 0.64, y: 0.10, mx: 0.77, my: 0.10, symbol: '▤', group: 'capability' },
  { label: 'Slack', x: 0.90, y: 0.20, mx: 0.87, my: 0.32, symbol: '⌗', group: 'output' },
  { label: 'CRM', x: 0.90, y: 0.35, mx: 0.87, my: 0.42, symbol: '◎', group: 'output', mobileHidden: true },
  { label: 'Database', x: 0.90, y: 0.50, mx: 0.87, my: 0.52, symbol: '⬢', group: 'output' },
  { label: 'Email', x: 0.90, y: 0.65, mx: 0.87, my: 0.72, symbol: '✉', group: 'output' },
  { label: 'API', x: 0.90, y: 0.80, mx: 0.87, my: 0.82, symbol: '{ }', group: 'output', mobileHidden: true },
  { label: 'Execute', x: 0.50, y: 0.91, mx: 0.50, my: 0.91, symbol: '↗', group: 'action' }
];

const toolkitNodes: NetworkNode[] = [
  { label: 'Webhooks', x: 0.18, y: 0.22, symbol: '⬡' },
  { label: 'OpenAI', x: 0.52, y: 0.08, symbol: '◈' },
  { label: 'Supabase', x: 0.84, y: 0.25, symbol: '⬢' },
  { label: 'APIs', x: 0.08, y: 0.52, symbol: '{ }' },
  { label: 'Slack', x: 0.92, y: 0.52, symbol: '◇' },
  { label: 'JavaScript', x: 0.18, y: 0.78, symbol: '✉' },
  { label: 'PostgreSQL', x: 0.60, y: 0.82, symbol: '✦' },
  { label: 'Google Sheets', x: 0.78, y: 0.68, symbol: '▦' },
  { label: 'Telegram', x: 0.38, y: 0.88, symbol: '➤' },
  { label: 'Automation', x: 0.34, y: 0.32, symbol: '▥' }
];

export default function Network({ toolkit = false }: { toolkit?: boolean }) {
  const nodes = toolkit ? toolkitNodes : heroNodes;

  const ref = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(-1);
  const [selected, setSelected] = useState(-1);
  const active = hovered >= 0 ? hovered : selected;
  const activeRef = useRef(-1);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !box.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, frame = 0;
    let visible = true;

    const resize = new ResizeObserver(entries => {
      width = entries[0].contentRect.width;
      height = entries[0].contentRect.height;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    resize.observe(box.current);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(box.current);

    function draw(t: number) {
      if (!ctx) return;
      if (visible) {
        ctx.clearRect(0, 0, width, height);

        const cx = width * 0.5;
        const cy = height * 0.5;
        const scroll = Math.min(1, window.scrollY / 600);
        const connection = 0.2 + scroll * 0.8;

        const dark = true;
        const restingLine = dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(106, 121, 145, 0.20)';

        // Draw connections
        for (let j = 0; j < nodes.length; j++) {
          const n = nodes[j];
          const mobile = width <= 760;
          if (mobile && n.mobileHidden) continue;
          const nx = width * (mobile ? n.mx ?? n.x : n.x);
          const ny = height * (mobile ? n.my ?? n.y : n.y);
          const automaticRoute = !reduced && (Math.floor(t / 2100) + j * 2) % 7 === 0;
          const lit = activeRef.current === j || automaticRoute;

          // Fine parallel cable lines create a physical data-bus feel.
          for (let cable = -1; cable <= 1; cable++) {
            ctx.beginPath();
            ctx.moveTo(cx + cable * 2, cy + cable * 1.5);
            ctx.bezierCurveTo(
              cx + (nx - cx) * 0.46, cy + cable * 4,
              nx + cable * 3, cy + (ny - cy) * 0.55,
              nx + cable * 1.5, ny
            );
            const signal = ctx.createLinearGradient(cx, cy, nx, ny);
            signal.addColorStop(0, '#087BFF');
            signal.addColorStop(.55, '#39E6FF');
            signal.addColorStop(1, '#7DD3FC');
            ctx.strokeStyle = lit && cable === 0 ? signal : restingLine;
            ctx.globalAlpha = lit && cable === 0 ? .74 : (.38 + connection * .18);
            ctx.lineWidth = lit && cable === 0 ? 1.65 : .7;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          // Only selected routes carry energy at any moment.
          if (!lit && activeRef.current !== j) continue;
          const phase = reduced ? 0.5 : ((t / (activeRef.current === j ? 1250 : 2200) + j * 0.13) % 1);
          const p = j % 3 === 0 ? phase : 1 - phase;
          const inv = 1 - p;
          const px = inv * inv * inv * cx + 3 * inv * inv * p * (cx + (nx - cx) * 0.5) + 3 * inv * p * p * nx + p * p * p * nx;
          const py = inv * inv * inv * cy + 3 * inv * inv * p * cy + 3 * inv * p * p * (cy + (ny - cy) * 0.5) + p * p * p * ny;

          ctx.beginPath();
          ctx.arc(px, py, lit ? 3 : 2.5, 0, Math.PI * 2);
          const pulseColors = ['#008CFF', '#39E6FF', '#7DD3FC'];
          ctx.fillStyle = pulseColors[j % pulseColors.length];
          ctx.shadowBlur = activeRef.current === j ? 16 : 10;
          ctx.shadowColor = pulseColors[j % pulseColors.length];
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className={`network hero-network ${toolkit ? 'toolkit-network' : ''}`} ref={box}>
      <canvas ref={ref} aria-hidden="true" />

      {/* Central automation node */}
      <button
        className={`core-node ${active >= 0 ? 'core-active' : ''}`}
        onClick={() => { setSelected(-1); setHovered(-1); }}
        aria-label="Show all workflow connections"
      >
        <span className="core-symbol">
          {toolkit ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          ) : (
            <svg className="automation-gears" aria-hidden="true" viewBox="6 0 56 56">
              <defs>
                <linearGradient id="steel-gear" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#d8f7ff" />
                  <stop offset=".5" stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#087bff" />
                </linearGradient>
                <linearGradient id="accent-gear" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e6fbff" />
                  <stop offset=".5" stopColor="#39e6ff" />
                  <stop offset="1" stopColor="#008cff" />
                </linearGradient>
              </defs>
              <g className="gear-large" fill="url(#steel-gear)">
                <path d="M31 7h6l1.2 5.2a20 20 0 0 1 4.7 2l4.5-2.9 4.2 4.2-2.8 4.5a20 20 0 0 1 2 4.8L56 26v6l-5.2 1.2a20 20 0 0 1-2 4.8l2.8 4.5-4.2 4.2-4.5-2.9a20 20 0 0 1-4.7 2L37 51h-6l-1.2-5.2a20 20 0 0 1-4.7-2l-4.5 2.9-4.2-4.2 2.8-4.5a20 20 0 0 1-2-4.8L12 32v-6l5.2-1.2a20 20 0 0 1 2-4.8l-2.8-4.5 4.2-4.2 4.5 2.9a20 20 0 0 1 4.7-2L31 7Zm3 12a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
              </g>
              <g className="gear-small" fill="url(#accent-gear)">
                <path d="M45 3h4l.8 3.2c1 .3 1.9.7 2.7 1.2l2.8-1.7 2.8 2.8-1.7 2.8c.5.8.9 1.7 1.2 2.7l3.2.8v4l-3.2.8c-.3 1-.7 1.9-1.2 2.7l1.7 2.8-2.8 2.8-2.8-1.7c-.8.5-1.7.9-2.7 1.2L49 30h-4l-.8-3.2c-1-.3-1.9-.7-2.7-1.2l-2.8 1.7-2.8-2.8 1.7-2.8a12 12 0 0 1-1.2-2.7l-3.2-.8v-4l3.2-.8c.3-1 .7-1.9 1.2-2.7l-1.7-2.8 2.8-2.8 2.8 1.7c.8-.5 1.7-.9 2.7-1.2L45 3Zm2 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
              </g>
            </svg>
          )}
        </span>
        {toolkit && <strong>Sabbit</strong>}
        <small>{toolkit ? 'AUTOMATION ENGINEER' : 'AI AGENT'}</small>
      </button>

      {/* External Nodes */}
      {nodes.map((n, i) => (
        <button
          key={n.label}
          className={`flow-node node-${nodeSlug(n.label)} ${n.group ? `node-${n.group}` : ''} ${n.mobileHidden ? 'node-mobile-hidden' : ''} ${active === i ? 'active' : ''} ${n.label === 'Analytics' ? 'analytics-active' : ''}`}
          style={{ left: n.x * 100 + '%', top: n.y * 100 + '%', '--mobile-left': `${(n.mx ?? n.x) * 100}%`, '--mobile-top': `${(n.my ?? n.y) * 100}%`, '--node-delay': `${.5 + i * .055}s` } as React.CSSProperties}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(-1)}
          onFocus={() => setHovered(i)}
          onBlur={() => setHovered(-1)}
          onClick={() => setSelected(i)}
          aria-label={`Explore ${n.label} connection`}
        >
          <span>{nodeLogos[n.label] ? <Image className="network-brand-icon" src={nodeLogos[n.label]} alt="" aria-hidden="true" width={24} height={24} /> : n.symbol}</span>
          <small>{n.label}</small>
        </button>
      ))}

      {/* Node Legend */}
      <div className="node-readout" aria-live="polite">
        {active >= 0 ? (
          <>
            <span className="status-dot" />
            {nodes[active].label} → {toolkit ? 'Sabbit' : 'AI Agent'} → Automated action
          </>
        ) : (
          <>
            <span className="status-dot" /> AI models → automation agent → connected business action
          </>
        )}
      </div>
    </div>
  );
}
