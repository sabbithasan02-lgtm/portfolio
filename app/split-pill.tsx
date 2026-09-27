import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import './split-pill.css';

type Shared = { children: ReactNode; icon: ReactNode; variant?: 'primary' | 'glass'; className?: string };
type Props = Shared & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export default function SplitPill({ children, icon, variant = 'glass', className = '', ...props }: Props) {
  const classes = `split-pill split-pill--${variant} ${className}`.trim();
  const content = <><span className="split-pill__label">{children}</span><span className="split-pill__badge" aria-hidden="true">{icon}</span></>;
  if (typeof props.href === 'string') return <a {...props as AnchorHTMLAttributes<HTMLAnchorElement>} className={classes}>{content}</a>;
  return <button type="button" {...props as ButtonHTMLAttributes<HTMLButtonElement>} className={classes}>{content}</button>;
}
