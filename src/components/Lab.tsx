'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, type CSSProperties } from 'react';
import { FLAVOURS, type PropKey } from '@/lib/data';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { SplitHeading } from './SplitHeading';
import { Sprite } from './Sprite';

interface Step {
  title: string;
  text: string;
  fact: string;
  count: number;
  suffix: string;
  card: string;
  ink: string;
  art: (PropKey | number)[];
}

const STEPS: Step[] = [
  { title: 'Pick the fruit ripe', text: 'Fruit comes in the morning it is used. What is not ripe waits, and what is past never gets in.', fact: 'Fruit share in sorbet', count: 60, suffix: '%', card: '#F5D4BA', ink: '#5A3216', art: ['rasp', 'blue'] },
  { title: 'Steep the base overnight', text: 'Rose petals, vanilla pods, lavender buds and coffee beans rest in the milk while the lab is closed.', fact: 'Hours of rest', count: 14, suffix: ' h', card: '#E8A0B4', ink: '#4A1F33', art: [1] },
  { title: 'Churn slowly, with little air', text: 'A slow paddle keeps the gelato dense, so the flavour lands before the cold does.', fact: 'Litres in one batch', count: 12, suffix: ' L', card: '#9C8FD0', ink: '#1f1633', art: ['spoonL', 'spoonR'] },
  { title: 'Serve it soft, not hard', text: 'Warm enough to scoop in one pass, cold enough to hold its shape in a cone.', fact: 'Counter temperature', count: -12, suffix: ' °C', card: '#EBD98A', ink: '#2D2F63', art: ['cone'] },
];

export function Lab() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const steps = gsap.utils.toArray<HTMLElement>('.step');
      steps.forEach((step, i) => {
        const q = gsap.utils.selector(step);
        const number = q('[data-count]')[0] as HTMLElement;
        const value = { n: 0 };
        number.textContent = `0${STEPS[i].suffix}`;
        gsap.to(value, {
          n: STEPS[i].count, duration: 1.4, ease: 'power2.out',
          onUpdate: () => void (number.textContent = `${Math.round(value.n)}${STEPS[i].suffix}`),
          scrollTrigger: { trigger: step, start: 'top 70%', once: true },
        });
        gsap.from(q('.step-art > *'), {
          scale: 0.6, rotation: -45, opacity: 0, duration: 1.1, ease: 'back.out(1.5)', stagger: 0.12,
          scrollTrigger: { trigger: step, start: 'top 70%', once: true },
        });
        gsap.to(q('.step-art'), { rotation: 24, ease: 'none', scrollTrigger: { trigger: step, start: 'top bottom', end: 'bottom top', scrub: true } });

        // Each card sinks back as the next one slides over it.
        if (steps[i + 1]) {
          // Explicit start: tweening from `filter: none` would begin at brightness 0.
          gsap.fromTo(step, { scale: 1, filter: 'brightness(1)' }, {
            scale: 0.9 + i * 0.025, filter: 'brightness(0.86)', ease: 'none', immediateRender: false,
            scrollTrigger: { trigger: steps[i + 1], start: 'top bottom', end: 'top 25%', scrub: true },
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="lab" id="lab" aria-labelledby="lab-title">
      <div className="wrap">
        <SplitHeading id="lab-title">Four steps from milk to bowl</SplitHeading>
        <div className="stack">
          {STEPS.map((s, i) => (
            <article key={s.title} className="step" style={{ '--card': s.card, '--card-ink': s.ink, '--i': i } as CSSProperties}>
              <span className="step-no">{i + 1}</span>
              <div className="step-copy">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <dl>
                  <dt>{s.fact}</dt>
                  <dd data-count>{s.count}{s.suffix}</dd>
                </dl>
              </div>
              <div className="step-art">
                {s.art.map((a) =>
                  typeof a === 'number' ? <img key={a} src={FLAVOURS[a].img} alt="" loading="lazy" /> : <Sprite key={a} name={a} />,
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
