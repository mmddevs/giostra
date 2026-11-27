'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { cart } from '@/lib/cart';
import { FLAVOURS, type PropKey } from '@/lib/data';
import { flyToCart } from '@/lib/fly';
import { gsap, useGSAP } from '@/lib/gsap';
import { Sprite } from './Sprite';

const GARNISH: PropKey[] = ['rasp', 'cone', 'spoonL', 'spoonR', 'blue'];

export function Flavours() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const pin = root.current!.querySelector<HTMLElement>('.flavour-pin')!;
      const track = pin.querySelector<HTMLElement>('.flavour-track')!;
      const panels = gsap.utils.toArray<HTMLElement>('.panel');
      const mm = gsap.matchMedia();

      // Wide screens: the section pins and the five panels pass sideways.
      mm.add('(min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)', () => {
        pin.classList.add('is-horizontal');
        const distance = () => track.scrollWidth - pin.clientWidth;
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            pin: true,
            scrub: 0.6,
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            snap: { snapTo: 1 / (panels.length - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.12, ease: 'power2.inOut' },
            onUpdate: (self) => setActive(Math.round(self.progress * (panels.length - 1))),
          },
        });

        panels.forEach((panel, i) => {
          const q = gsap.utils.selector(panel);
          const passing = () => ({ trigger: panel, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true });
          gsap.fromTo(q('.panel-art img'), { rotation: -140 }, { rotation: 140, ease: 'none', scrollTrigger: passing() });
          gsap.timeline({ scrollTrigger: passing() })
            .fromTo(q('.panel-art'), { scale: 0.62 }, { scale: 1, ease: 'sine.out' })
            .to(q('.panel-art'), { scale: 0.62, ease: 'sine.in' });
          gsap.fromTo(q('.sprite'), { x: 240, rotation: 70 }, { x: -240, rotation: -70, ease: 'none', scrollTrigger: passing() });
          if (i > 0) {
            gsap.from(q('.line > span'), {
              yPercent: 110, duration: 0.8, ease: 'power4.out', stagger: 0.08,
              scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left 60%', toggleActions: 'play none none reverse' },
            });
          }
        });

        // Keyboard users: focusing an off-screen panel scrolls the page to it.
        const onFocus = (event: FocusEvent) => {
          const index = panels.findIndex((p) => p.contains(event.target as Node));
          const st = slide.scrollTrigger!;
          if (index >= 0 && (event.target as Element).matches(':focus-visible')) {
            // After the browser's own focus scrolling, which cannot see a pinned track.
            requestAnimationFrame(() => window.scrollTo(0, st.start + (index / (panels.length - 1)) * (st.end - st.start)));
          }
        };
        pin.addEventListener('focusin', onFocus);

        return () => {
          pin.removeEventListener('focusin', onFocus);
          pin.classList.remove('is-horizontal');
        };
      });

      // Narrow screens: panels stack and each bowl turns as it passes.
      mm.add('((max-width: 899px) or (max-height: 559px)) and (prefers-reduced-motion: no-preference)', () => {
        panels.forEach((panel) => {
          const q = gsap.utils.selector(panel);
          gsap.fromTo(q('.panel-art img'), { rotation: -90 }, { rotation: 90, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true } });
          gsap.from(q('.line > span'), { yPercent: 110, duration: 0.7, ease: 'power4.out', stagger: 0.08, scrollTrigger: { trigger: panel, start: 'top 70%' } });
        });
      });
    },
    { scope: root },
  );

  const add = (i: number, event: MouseEvent<HTMLButtonElement>) => {
    const f = FLAVOURS[i];
    const bowl = event.currentTarget.closest('.panel')!.querySelector('.panel-art img')!;
    flyToCart(f.img, bowl.getBoundingClientRect());
    cart.add({ id: `tub-${i}`, title: f.label, detail: '500 ml tub', price: f.price, img: f.img });
  };

  return (
    <section ref={root} className="flavours" id="flavours" aria-labelledby="flavours-title">
      <h2 className="sr-only" id="flavours-title">The five flavours</h2>
      {/* GSAP pins this inner node, so React keeps ownership of the section. */}
      <div className="flavour-pin">
        <div className="flavour-track">
          {FLAVOURS.map((f, i) => (
            <article key={f.label} className="panel" style={{ '--bg': f.bg, '--ink': f.ink } as CSSProperties}>
              <div className="panel-copy">
                <h3>
                  <span className="line"><span>{f.name[0].replace(' /', '')}</span></span>
                  <span className="line"><span>{f.name[1]}</span></span>
                </h3>
                <p className="panel-line">{f.line}</p>
                <ul className="chips">{f.scoops.map((s) => <li key={s}>{s}</li>)}</ul>
                <p className="panel-note">Served in: {f.bowl.toLowerCase()}</p>
                <button className="btn btn-solid" type="button" onClick={(e) => add(i, e)}>Add a 500 ml tub, €{f.price}</button>
              </div>
              <div className="panel-visual">
                <div className="panel-art">
                  <img src={f.img} alt={`${f.label} gelato bowl seen from above`} loading="lazy" />
                </div>
                <Sprite name={GARNISH[i]} className="panel-garnish" />
              </div>
            </article>
          ))}
        </div>
        <ol className="flavour-dots" aria-hidden="true">
          {FLAVOURS.map((f, i) => <li key={f.label} className={i === active ? 'on' : ''} />)}
        </ol>
      </div>
    </section>
  );
}
