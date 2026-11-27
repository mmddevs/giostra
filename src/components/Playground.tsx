'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, type CSSProperties } from 'react';
import { FLAVOURS, type PropKey } from '@/lib/data';
import { Draggable, gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { SplitHeading } from './SplitHeading';
import { Sprite } from './Sprite';

/** Resting places: [left %, top %] wide, then narrow. The middle stays clear for the copy. */
const TOYS: { item: PropKey | number; at: [number, number, number, number] }[] = [
  { item: 0, at: [3, 6, -6, 1] },
  { item: 2, at: [78, 4, 66, 2] },
  { item: 4, at: [80, 62, 62, 81] },
  { item: 1, at: [5, 62, -8, 80] },
  { item: 'cone', at: [22, 70, 32, 85] },
  { item: 'rasp', at: [64, 74, 38, 57] },
  { item: 'blue', at: [20, 7, 30, 1] },
  { item: 'spoonL', at: [65, 10, 2, 66] },
  { item: 'spoonR', at: [86, 36, 66, 68] },
  { item: 3, at: [3, 33, 26, 70] },
];

export function Playground() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const toys = gsap.utils.toArray<HTMLElement>('.toy');
      const faces = gsap.utils.toArray<HTMLElement>('.toy > *');
      Draggable.create(toys, {
        type: 'x,y',
        bounds: root.current!,
        inertia: !reduced,
        edgeResistance: 0.75,
        allowContextMenu: true,
        onPress() { gsap.to(this.target, { scale: 1.1, duration: 0.2 }); },
        onDrag() { gsap.to(this.target.firstElementChild, { rotation: `+=${this.deltaX * 0.6}`, duration: 0.2, overwrite: 'auto' }); },
        onRelease() { gsap.to(this.target, { scale: 1, duration: 0.3 }); },
      });

      const reset = () => gsap.set(toys, { x: 0, y: 0 });
      window.addEventListener('resize', reset);

      // One entrance: everything drops onto the table.
      if (!reduced) {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 65%',
          once: true,
          onEnter: () => {
            gsap.fromTo(faces, { scale: 1.9, opacity: 0, rotation: () => gsap.utils.random(-90, 90) }, {
              scale: 1, opacity: 1, rotation: 0, duration: 0.9, ease: 'bounce.out', stagger: { each: 0.07, from: 'random' },
            });
          },
        });
      }
      return () => window.removeEventListener('resize', reset);
    },
    { scope: root },
  );

  const move = (scatter: boolean) => {
    const area = root.current!;
    const reduced = prefersReducedMotion();
    area.querySelectorAll<HTMLElement>('.toy').forEach((toy, i) => {
      const x = scatter ? gsap.utils.random(-toy.offsetLeft, area.clientWidth - toy.offsetWidth - toy.offsetLeft) : 0;
      const y = scatter ? gsap.utils.random(-toy.offsetTop, area.clientHeight - toy.offsetHeight - toy.offsetTop) : 0;
      const delay = reduced ? 0 : i * 0.025;
      gsap.to(toy, { x, y, duration: reduced ? 0 : 0.9, delay, ease: scatter ? 'back.out(1.2)' : 'power3.inOut', overwrite: true });
      gsap.to(toy.firstElementChild, { rotation: scatter ? gsap.utils.random(-300, 300) : 0, duration: reduced ? 0 : 0.9, delay, overwrite: true });
    });
  };

  return (
    <section ref={root} className="table" aria-labelledby="table-title">
      <div className="table-copy">
        <SplitHeading id="table-title">Jouez avec la nourriture</SplitHeading>
        <p>Tout ce qui est sur cette table se lance. Allez-y.</p>
        <div className="table-actions">
          <button className="btn btn-solid" type="button" onClick={() => move(true)}>Éparpiller</button>
          <button className="btn" type="button" onClick={() => move(false)}>Ranger</button>
        </div>
      </div>
      <div aria-hidden="true">
        {TOYS.map(({ item, at }) => (
          <div
            key={item}
            data-cursor="Lancer"
            className={`toy ${typeof item === 'number' ? 'toy-bowl' : ''}`}
            style={{ '--x': `${at[0]}%`, '--y': `${at[1]}%`, '--mx': `${at[2]}%`, '--my': `${at[3]}%` } as CSSProperties}
          >
            {typeof item === 'number' ? <img src={FLAVOURS[item].img} alt="" loading="lazy" draggable={false} /> : <Sprite name={item} />}
          </div>
        ))}
      </div>
    </section>
  );
}
