'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { setPanel, subscribePanel } from '@/lib/ui';

/** Lenis driven by the GSAP ticker, plus in-page links and the scroll lock for dialogs. */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = prefersReducedMotion() ? null : new Lenis({ lerp: 0.11 });
    const tick = (time: number) => lenis?.raf(time * 1000);
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const unsubscribe = subscribePanel((open) => {
      document.documentElement.classList.toggle('locked', open);
      if (open) lenis?.stop();
      else lenis?.start();
    });

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector<HTMLElement>(link.getAttribute('href')!);
      if (!target) return;
      event.preventDefault();
      setPanel(null);
      // Wait a frame so the lock is released before scrolling.
      requestAnimationFrame(() => {
        if (lenis) lenis.scrollTo(target, { duration: 1.4, force: true });
        else target.scrollIntoView();
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    };
    document.addEventListener('click', onClick);

    // Pinned sections change page height once fonts and images settle.
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      unsubscribe();
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
