'use client';
import { useEffect, type Dispatch, type SetStateAction } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import SplitPill from './split-pill';
import { useScrollState } from './use-scroll-state';

const links = [
  ['Work', '#work'],
  ['About', '#about'],
  ['Services', '#services'],
  ['Experience', '#experience']
];

export default function SmartNavbar({ menu, setMenu }: { menu: boolean; setMenu: Dispatch<SetStateAction<boolean>> }) {
  const { isAtTop, isScrolling, scrollDirection } = useScrollState();
  const compact = !isAtTop && isScrolling && scrollDirection === 'down' && !menu;

  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu, setMenu]);

  return (
    <header className={`header smart-header ${isAtTop ? 'at-top' : 'away-from-top'} ${compact ? 'is-compact' : ''} ${menu ? 'menu-open' : ''}`}>
      <a href="#home" className="brand" aria-label="Sabbit Ahamed, home">
        <Image className="brand-photo" src="/sabbit-ahamed-profile.png" alt="" aria-hidden="true" width={40} height={40} priority />
        <span className="brand-name"><span className="brand-full">SABBIT AHAMED</span><span className="brand-short">SABBIT</span><span className="brand-dot">.</span></span>
      </a>
      <nav aria-label="Main navigation" className={menu ? 'nav open' : 'nav'}>
        {links.map(([label, href]) => (
          <a onClick={() => setMenu(false)} href={href} key={label}>{label}</a>
        ))}
      </nav>
      <SplitPill href="#contact" className="split-pill--header smart-contact" icon={<ArrowUpRight />}>Contact</SplitPill>
      <SplitPill className="split-pill--menu" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)} icon={menu ? <X /> : <Menu />}>{menu ? 'Close' : 'Menu'}</SplitPill>
    </header>
  );
}
