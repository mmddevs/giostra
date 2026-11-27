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
  { title: 'Cueillir le fruit à point', text: 'Les fruits arrivent le matin même. Ce qui n’est pas mûr attend, ce qui est passé n’entre pas.', fact: 'Part de fruit dans le sorbet', count: 60, suffix: ' %', card: '#F5D4BA', ink: '#5A3216', art: ['rasp', 'blue'] },
  { title: 'Infuser toute la nuit', text: 'Pétales de rose, gousses de vanille, lavande et grains de café reposent dans le lait pendant que le labo dort.', fact: 'Heures de repos', count: 14, suffix: ' h', card: '#E8A0B4', ink: '#4A1F33', art: [1] },
  { title: 'Turbiner lentement, avec peu d’air', text: 'Une pale lente garde le gelato dense : le goût arrive avant le froid.', fact: 'Litres par tournée', count: 12, suffix: ' L', card: '#9C8FD0', ink: '#1f1633', art: ['spoonL', 'spoonR'] },
  { title: 'Servir souple, jamais dur', text: 'Assez tendre pour la spatule en un geste, assez froid pour tenir sur un cornet.', fact: 'Température du comptoir', count: -12, suffix: ' °C', card: '#EBD98A', ink: '#2D2F63', art: ['cone'] },
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
        <SplitHeading id="lab-title">Quatre étapes, du lait au bol</SplitHeading>
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
