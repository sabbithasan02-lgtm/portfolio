'use client';
import { useEffect, useRef, useState } from 'react';

const heroNodes = [
  { label: 'n8n', x: 0.13, y: 0.20, symbol: '⌁' },
  { label: 'AI Agents', x: 0.36, y: 0.10, symbol: '◇' },
  { label: 'API', x: 0.87, y: 0.20, symbol: '{ }' },
  { label: 'CRM', x: 0.92, y: 0.53, symbol: '◎' },
  { label: 'Webhooks', x: 0.08, y: 0.53, symbol: '⬡' },
  { label: 'Email', x: 0.82, y: 0.82, symbol: '✉' },
  { label: 'OpenAI', x: 0.65, y: 0.10, symbol: '✦' },
  { label: 'Database', x: 0.18, y: 0.82, symbol: '⬢' },
  { label: 'WhatsApp', x: 0.36, y: 0.91, symbol: '◉' },
  { label: 'Web Apps', x: 0.64, y: 0.91, symbol: '▣' },
  { label: 'Lead Automation', x: 0.23, y: 0.49, symbol: '↗' },
  { label: 'Data Processing', x: 0.77, y: 0.49, symbol: '▦' }
];

const toolkitNodes = [
  { label: 'Webhooks', x: 0.18, y: 0.22, symbol: '⬡' },
  { label: 'OpenAI', x: 0.52, y: 0.08, symbol: '◈' },
  { label: 'Supabase', x: 0.84, y: 0.25, symbol: '⬢' },
  { label: 'APIs', x: 0.08, y: 0.52, symbol: '{ }' },
  { label: 'Slack', x: 0.92, y: 0.52, symbol: '◇' },
  { label: 'JavaScript', x: 0.18, y: 0.78, symbol: '✉' },
  { label: 'PostgreSQL', x: 0.60, y: 0.82, symbol: '✦' },
  { label: 'Google Sheets', x: 0.78, y: 0.68, symbol: '▦' },
  { label: 'Telegram', x: 0.38, y: 0.88, symbol: '➤' },
  { label: 'n8n', x: 0.34, y: 0.32, symbol: '▥' }
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

        const dark = toolkit;
        const orbitColor = dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(86, 107, 138, 0.10)';
        const restingLine = dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(106, 121, 145, 0.20)';

        // Draw orbital rings (very subtle)
        ctx.beginPath();
        ctx.arc(cx, cy, width * 0.28, 0, Math.PI * 2);
        ctx.strokeStyle = orbitColor;
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
            signal.addColorStop(1, '#796BFF');
            ctx.strokeStyle = lit && cable === 0 ? signal : restingLine;
            ctx.globalAlpha = lit && cable === 0 ? .74 : (.38 + connection * .18);
            ctx.lineWidth = lit && cable === 0 ? 1.65 : .7;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          // Only selected routes carry energy at any moment.
          if (!lit && activeRef.current !== j) continue;
          const p = reduced ? 0.5 : ((t / (activeRef.current === j ? 1250 : 2200) + j * 0.13) % 1);
          const inv = 1 - p;
          const px = inv * inv * inv * cx + 3 * inv * inv * p * (cx + (nx - cx) * 0.5) + 3 * inv * p * p * nx + p * p * p * nx;
          const py = inv * inv * inv * cy + 3 * inv * inv * p * cy + 3 * inv * p * p * (cy + (ny - cy) * 0.5) + p * p * p * ny;

          ctx.beginPath();
          ctx.arc(px, py, lit ? 3 : 2.5, 0, Math.PI * 2);
          const pulseColors = ['#087BFF', '#39E6FF', '#796BFF'];
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
    <div className={`network ${toolkit ? 'toolkit-network' : 'hero-network'}`} ref={box}>
      <canvas ref={ref} aria-hidden="true" />

      {/* Central n8n Node */}
      <button
        className={`core-node ${active >= 0 ? 'core-active' : ''}`}
        onClick={() => { setSelected(-1); setHovered(-1); }}
        aria-label="Show all workflow connections"
      >
        <span className="core-symbol">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </span>
        <strong>{toolkit ? 'Sabbit' : 'CoAgent'}</strong>
        <small>{toolkit ? 'AUTOMATION ENGINEER' : 'AI AUTOMATION CORE'}</small>
      </button>

      {/* External Nodes */}
      {nodes.map((n, i) => (
        <button
          key={n.label}
          className={`flow-node ${active === i ? 'active' : ''} ${n.label === 'Analytics' ? 'analytics-active' : ''}`}
          style={{ left: n.x * 100 + '%', top: n.y * 100 + '%', '--node-delay': `${.5 + i * .055}s` } as React.CSSProperties}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(-1)}
          onFocus={() => setHovered(i)}
          onBlur={() => setHovered(-1)}
          onClick={() => setSelected(i)}
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
            {nodes[active].label} → {toolkit ? 'Sabbit' : 'CoAgent'} → Automated workflow
          </>
        ) : (
          <>
            <span className="status-dot" /> Connected tools → intelligent automation → business action
          </>
        )}
      </div>
    </div>
  );
}
