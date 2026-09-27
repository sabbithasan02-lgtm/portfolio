'use client';
import { useEffect, useState } from 'react';

export type ScrollDirection = 'up' | 'down';

export function useScrollState(stopDelay = 420) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('down');

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    let stopTimer = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const atTop = y < 24;
      const direction: ScrollDirection = y > lastY ? 'down' : 'up';

      setIsAtTop(previous => previous === atTop ? previous : atTop);
      setScrollDirection(previous => previous === direction ? previous : direction);
      setIsScrolling(!atTop && direction === 'down');
      lastY = y;

      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => setIsScrolling(false), stopDelay);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(stopTimer);
    };
  }, [stopDelay]);

  return { isAtTop, isScrolling, scrollDirection };
}
