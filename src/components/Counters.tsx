'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type CSSProperties } from 'react';
import { FLAVOURS } from '@/lib/data';
import { gsap, useGSAP } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion-prefs';
import { SplitHeading } from './SplitHeading';

const COUNTERS = [
  { name: 'Quartier du Canal', text: 'Le labo lui-même. Regardez turbiner à travers la vitre.', hours: 'Tous les jours, 11 h à 22 h', flavour: 0 },
  { name: 'Vieux Port', text: 'Un guichet sur la rue, en cornets ou en pots deux boules.', hours: 'Mer. à dim., 12 h à 21 h', flavour: 2 },
  { name: 'Butte du Marché', text: 'Des pots à emporter, au stand du samedi.', hours: 'Samedi, 9 h à 15 h', flavour: 4 },
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
        <SplitHeading id="counters-title">Trois comptoirs pour nous trouver</SplitHeading>
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
