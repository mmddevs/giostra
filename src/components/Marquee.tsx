'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react';
import { FLAVOURS } from '@/lib/data';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';

export function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>('.marquee-row');
      const tweens = rows.map((row, r) =>
        gsap.fromTo(row, { xPercent: r ? -50 : 0 }, { xPercent: r ? 0 : -50, duration: 38, ease: 'none', repeat: -1, paused: true }),
      );
      const bowls = gsap.to('.marquee-item img', { rotation: 360, duration: 12, ease: 'none', repeat: -1, paused: true });
      const skew = gsap.quickTo(rows, 'skewX', { duration: 0.4, ease: 'power3' });

      // Scrolling pushes the belt faster and leans the type; it settles when you stop.
      let boost = 0;
      const tick = () => {
        boost *= 0.93;
        tweens.forEach((t) => t.timeScale(1 + boost));
        if (boost < 0.05) skew(0);
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: ({ isActive }) => {
          [...tweens, bowls].forEach((t) => t.paused(!isActive));
          if (isActive) gsap.ticker.add(tick);
          else gsap.ticker.remove(tick);
        },
        onUpdate: (self) => {
          const v = self.getVelocity();
          boost = Math.min(6, Math.abs(v) / 250);
          skew(gsap.utils.clamp(-10, 10, v / -220));
        },
      });
      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="marquee" aria-hidden="true">
      {[FLAVOURS, [...FLAVOURS].reverse()].map((list, r) => (
        <div key={r} className="marquee-row">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-run">
              {list.map((f) => (
                <span key={f.label} className="marquee-item">
                  {f.label}
                  <img src={f.img} alt="" loading="lazy" />
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** The words ink themselves in as you read down. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      SplitText.create('.manifesto-text', {
        type: 'words',
        autoSplit: true,
        onSplit: (split) =>
          gsap.fromTo(split.words, { opacity: 0.14 }, {
            opacity: 1, stagger: 0.1, ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 70%', scrub: true },
          }),
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="manifesto wrap">
      <p className="manifesto-text">
        We churn five flavours in small batches, set each one in its own ceramic bowl, and put them on a marble wheel so you can turn to the next without asking.
      </p>
    </section>
  );
}
