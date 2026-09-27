'use client';
import { useEffect, useRef, useState } from 'react';

const heroNodes = [
  { label: 'Webhook', x: 0.18, y: 0.22, symbol: '⬡' },
  { label: 'AI Agent', x: 0.52, y: 0.08, symbol: '◈' },
  { label: 'Database', x: 0.84, y: 0.25, symbol: '⬢' },
  { label: 'API', x: 0.08, y: 0.52, symbol: '{ }' },
  { label: 'CRM', x: 0.92, y: 0.52, symbol: '◇' },
  { label: 'Email', x: 0.18, y: 0.78, symbol: '✉' },
  { label: 'OpenAI', x: 0.60, y: 0.82, symbol: '✦' },
  { label: 'Google Sheets', x: 0.78, y: 0.68, symbol: '▦' },
  { label: 'Telegram', x: 0.38, y: 0.88, symbol: '➤' },
  { label: 'Analytics', x: 0.34, y: 0.32, symbol: '▥' }
];

export default function Network({ toolkit = false }: { toolkit?: boolean }) {
  const nodes = toolkit
    ? heroNodes.map((n, i) => ({ ...n, label: ['Webhooks', 'OpenAI', 'Supabase', 'APIs', 'Slack', 'JavaScript', 'PostgreSQL', 'Google Sheets', 'Telegram', 'n8n'][i] }))
    : heroNodes;

  const ref = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
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

        // Draw orbital rings (very subtle)
        ctx.beginPath();
        ctx.arc(cx, cy, width * 0.28, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, width * 0.42, 0, Math.PI * 2);
        ctx.stroke();

        // Draw connections
        for (let j = 0; j < nodes.length; j++) {
          const n = nodes[j];
          const nx = width * n.x;
          const ny = height * n.y;
          const lit = activeRef.current === j;

          // Curved connection line
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.bezierCurveTo(
            cx + (nx - cx) * 0.5, cy,
            nx, cy + (ny - cy) * 0.5, nx, ny
          );
          ctx.strokeStyle = lit ? 'rgba(34, 211, 238, 0.5)' : `rgba(255, 255, 255, ${0.06 + connection * 0.08})`;
          ctx.lineWidth = lit ? 1.5 : 1;
          ctx.stroke();

          // Data particles
          const p = reduced ? 0.5 : ((t / 5000 + j * 0.11) % 1);
          const inv = 1 - p;
          const px = inv * inv * inv * cx + 3 * inv * inv * p * (cx + (nx - cx) * 0.5) + 3 * inv * p * p * nx + p * p * p * nx;
          const py = inv * inv * inv * cy + 3 * inv * inv * p * cy + 3 * inv * p * p * (cy + (ny - cy) * 0.5) + p * p * p * ny;

          ctx.beginPath();
          ctx.arc(px, py, lit ? 3 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = lit ? '#22D3EE' : '#00AEEF';
          ctx.shadowBlur = lit ? 12 : 6;
          ctx.shadowColor = '#00AEEF';
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
    <div className="network" ref={box}>
      <canvas ref={ref} aria-hidden="true" />

      {/* Central n8n Node */}
      <button
        className="core-node"
        onClick={() => setActive(-1)}
        aria-label="Show all workflow connections"
      >
        <span className="core-symbol">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </span>
        <strong>{toolkit ? 'Sabbit' : 'n8n'}</strong>
        <small>{toolkit ? 'AUTOMATION ENGINEER' : 'WORKFLOW ENGINE'}</small>
      </button>

      {/* External Nodes */}
      {nodes.map((n, i) => (
        <button
          key={n.label}
          className={`flow-node ${active === i ? 'active' : ''} ${n.label === 'Analytics' ? 'analytics-active' : ''}`}
          style={{ left: n.x * 100 + '%', top: n.y * 100 + '%' }}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(-1)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(-1)}
          aria-label={`Explore ${n.label} connection`}
        >
          <span>{n.symbol}</span>
          <small>{n.label}</small>
        </button>
      ))}

      {/* Node Legend */}
      <div className="node-readout" aria-live="polite">
        {active >= 0 ? (
          <>
            <span className="status-dot" />
            {nodes[active].label} → {toolkit ? 'Sabbit' : 'n8n'} → Automated workflow
          </>
        ) : (
          <>
            <span className="status-dot" /> Analytics ↔ n8n → Automated workflow
          </>
        )}
      </div>
    </div>
  );
}
