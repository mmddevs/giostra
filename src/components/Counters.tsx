'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type CSSProperties } from 'react';
import { FLAVOURS } from '@/lib/data';
import { gsap, useGSAP } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion-prefs';
import { SplitHeading } from './SplitHeading';

const COUNTERS = [
  { name: 'Canal District', text: 'The lab itself. Watch the churn through the window.', hours: 'Daily, 11:00 to 22:00', flavour: 0 },
  { name: 'Old Harbour', text: 'A walk-up hatch with cones and two-scoop cups.', hours: 'Wed to Sun, 12:00 to 21:00', flavour: 2 },
  { name: 'Market Hill', text: 'Tubs to take home from the Saturday stall.', hours: 'Saturday, 09:00 to 15:00', flavour: 4 },
];

export function Counters() {
  const root = useRef<HTMLElement>(null);
  const [flavour, setFlavour] = useState(0);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.counter-list li', { y: 48, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.counter-list', start: 'top 80%', once: true } });
      if (!hasFinePointer()) return;

      // A bowl follows the pointer down the list.
      const list = root.current!.querySelector<HTMLElement>('.counter-list')!;
      const peek = root.current!.querySelector<HTMLElement>('.counter-peek')!;
      gsap.set(peek, { xPercent: -50, yPercent: -50, scale: 0.8, opacity: 0 });
      const x = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3' });
      const y = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3' });
      const r = gsap.quickTo(peek, 'rotation', { duration: 0.7, ease: 'power3' });
      const move = (e: PointerEvent) => {
        const base = peek.offsetParent!.getBoundingClientRect();
        x(e.clientX - base.left);
        y(e.clientY - base.top);
        r(e.clientX / 4);
      };
      const show = () => gsap.to(peek, { opacity: 1, scale: 1, duration: 0.25, overwrite: 'auto' });
      const hide = () => gsap.to(peek, { opacity: 0, scale: 0.8, duration: 0.2, overwrite: 'auto' });
      list.addEventListener('pointermove', move);
      list.addEventListener('pointerenter', show);
      list.addEventListener('pointerleave', hide);
      return () => {
        list.removeEventListener('pointermove', move);
        list.removeEventListener('pointerenter', show);
        list.removeEventListener('pointerleave', hide);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="counters" id="counters" aria-labelledby="counters-title">
      <div className="wrap">
        <SplitHeading id="counters-title">Three counters to find us</SplitHeading>
        <ul className="counter-list">
          {COUNTERS.map((c) => (
            <li key={c.name} style={{ '--tint': FLAVOURS[c.flavour].bg } as CSSProperties} onPointerEnter={() => setFlavour(c.flavour)}>
              <h3>{c.name}</h3>
              <p>{c.text}</p>
              <span>{c.hours}</span>
            </li>
          ))}
        </ul>
        <img className="counter-peek" src={FLAVOURS[flavour].img} alt="" aria-hidden="true" />
      </div>
    </section>
  );
}
