# Split-pill calls to action

Reusable JSX: `app/split-pill.tsx`. Custom CSS: `app/split-pill.css` (imported by the component).

```tsx
import { ArrowUpRight, Menu, Plus } from 'lucide-react';
import SplitPill from '@/app/split-pill';

<SplitPill href="#work" variant="primary" icon={<ArrowUpRight />}>
  Explore My Work
</SplitPill>

<SplitPill href="#contact" icon={<Plus />}>
  Get in Touch
</SplitPill>

<SplitPill onClick={toggleMenu} aria-expanded={menuOpen}
  aria-controls="main-navigation" icon={<Menu />}>
  Menu
</SplitPill>
```

The shared markup is a `.split-pill` link or button containing `.split-pill__label` and `.split-pill__badge`. Use `variant="primary"` for lime with a plum badge; the default `glass` variant uses a translucent dark capsule with a lime badge. Native link/button attributes are forwarded.

Colors are scoped custom properties (`--pill-lime`, `--pill-plum`). Transitions use 300ms `cubic-bezier(0.16, 1, 0.3, 1)`. Hover-capable devices get a 2px lift, 45-degree badge rotation, and glow. Keyboard focus has a visible lime outline; reduced-motion preferences disable transforms and transitions. The dark fallback fill remains usable without backdrop-filter support.
