'use client';

/* eslint-disable @next/next/no-img-element */
import { animate } from 'motion';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cart } from '@/lib/cart';
import { FLAVOURS, RING_IMG } from '@/lib/data';
import { flyToCart } from '@/lib/fly';
import { Draggable, gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { SplitHeading } from './SplitHeading';

const SIZE = 4;
const DISCOUNT = 0.9;
const EMPTY: (number | null)[] = Array(SIZE).fill(null);

interface Arrival { slot: number; from: DOMRect; delay: number }

export function BoxBuilder() {
  const root = useRef<HTMLElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const slots = useRef<(HTMLButtonElement | null)[]>([]);
  const arrivals = useRef<Arrival[]>([]);
  const dragged = useRef(false);
  const shownPrice = useRef(0);
  const priceRef = useRef<HTMLElement>(null);
  const [contents, setContents] = useState(EMPTY);
  // Mirrors state so two quick taps cannot claim the same slot.
  const live = useRef(contents);

  const filled = contents.filter((c): c is number => c !== null);
  const full = filled.length === SIZE;
  const sum = filled.reduce((n, c) => n + FLAVOURS[c].price, 0);
  const total = full ? Math.round(sum * DISCOUNT) : sum;

  useGSAP(
    () => {
      Draggable.create(spin.current, { type: 'rotation', inertia: !prefersReducedMotion(), allowContextMenu: true, dragClickables: true, minimumMovement: 6 });
    },
    { scope: root },
  );

  const commit = (next: (number | null)[]) => {
    live.current = next;
    setContents(next);
  };

  const place = (flavour: number, from: DOMRect) => {
    const slot = live.current.indexOf(null);
    if (slot < 0) {
      if (!prefersReducedMotion()) animate(wheel.current!, { x: [0, -10, 9, -5, 0] }, { duration: 0.35 });
      return;
    }
    arrivals.current.push({ slot, from, delay: 0 });
    commit(live.current.map((c, i) => (i === slot ? flavour : c)));
  };

  // FLIP: each new bowl starts where it was picked up and springs into its slot.
  useLayoutEffect(() => {
    const pending = arrivals.current.splice(0);
    if (prefersReducedMotion()) return;
    pending.forEach(({ slot, from, delay }) => {
      const img = slots.current[slot]?.querySelector('img');
      const to = slots.current[slot]?.getBoundingClientRect();
      if (!img || !to) return;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      // The wheel may be rotated: express the offset in its own coordinates.
      const turn = (-Number(gsap.getProperty(spin.current, 'rotation')) * Math.PI) / 180;
      animate(
        img,
        { x: [dx * Math.cos(turn) - dy * Math.sin(turn), 0], y: [dx * Math.sin(turn) + dy * Math.cos(turn), 0], scale: [from.width / to.width, 1], rotate: [-160, 0] },
        { type: 'spring', duration: 0.8, bounce: 0.22, delay },
      );
    });
  }, [contents]);

  useEffect(() => {
    const controls = animate(shownPrice.current, total, {
      duration: prefersReducedMotion() ? 0 : 0.5,
      ease: 'easeOut',
      onUpdate: (v) => {
        shownPrice.current = v;
        if (priceRef.current) priceRef.current.textContent = `€${Math.round(v)}`;
      },
    });
    return () => controls.stop();
  }, [total]);

  const surprise = () => {
    const from = hub.current!.getBoundingClientRect();
    arrivals.current = Array.from({ length: SIZE }, (_, slot) => ({ slot, from, delay: slot * 0.07 }));
    commit(Array.from({ length: SIZE }, () => Math.floor(Math.random() * FLAVOURS.length)));
    if (!prefersReducedMotion()) gsap.to(spin.current, { rotation: '+=360', duration: 1.3, ease: 'power3.inOut' });
  };

  const addBox = () => {
    if (!full) return;
    const sorted = [...filled].sort();
    flyToCart(FLAVOURS[filled[0]].img, wheel.current!.getBoundingClientRect());
    cart.add({
      id: `box-${sorted.join('')}`,
      title: 'Box of four',
      detail: [...new Set(sorted)].map((c) => `${sorted.filter((v) => v === c).length} × ${FLAVOURS[c].label}`).join(', '),
      price: total,
      img: FLAVOURS[filled[0]].img,
    });
    commit(EMPTY);
  };

  // Mouse users can also drag a copy of the bowl onto the wheel.
  const startDrag = (flavour: number, down: ReactPointerEvent) => {
    dragged.current = false;
    if (down.pointerType === 'touch' || down.button !== 0) return;
    const { clientX, clientY } = down;
    let ghost: HTMLImageElement | null = null;
    const over = (e: PointerEvent) => wheel.current!.contains(document.elementFromPoint(e.clientX, e.clientY));
    const move = (e: PointerEvent) => {
      if (!ghost) {
        if (Math.hypot(e.clientX - clientX, e.clientY - clientY) < 6) return;
        dragged.current = true;
        ghost = document.createElement('img');
        ghost.className = 'ghost-bowl is-dragged';
        ghost.src = FLAVOURS[flavour].img;
        ghost.alt = '';
        document.body.append(ghost);
      }
      ghost.style.transform = `translate(${e.clientX - 60}px, ${e.clientY - 60}px) rotate(${e.clientX / 3}deg)`;
      wheel.current!.classList.toggle('is-target', over(e));
    };
    const up = (e: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      wheel.current?.classList.remove('is-target');
      if (!ghost) return;
      const rect = ghost.getBoundingClientRect();
      ghost.remove();
      if (e.type === 'pointerup' && over(e)) place(flavour, rect);
      setTimeout(() => (dragged.current = false));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  return (
    <section ref={root} className="box" id="box" aria-labelledby="box-title">
      <div className="wrap box-grid">
        <div className="box-copy">
          <SplitHeading id="box-title">Fill your own wheel</SplitHeading>
          <p>Choose four tubs. Tap a bowl or drag it onto the marble. Grab the ring to spin it.</p>
          <div className="picker" role="group" aria-label="Choose flavours">
            {FLAVOURS.map((f, i) => (
              <button
                key={f.label}
                className="pick"
                data-cursor="Add"
                type="button"
                onPointerDown={(e) => startDrag(i, e)}
                onClick={(e) => !dragged.current && place(i, e.currentTarget.querySelector('img')!.getBoundingClientRect())}
              >
                <img src={f.img} alt="" loading="lazy" draggable={false} />
                <span>{f.label}</span>
                <em>€{f.price}</em>
              </button>
            ))}
          </div>
          <div className="box-total">
            <span aria-live="polite">{full ? `4 of 4 tubs, 10% off €${sum}` : `${filled.length} of ${SIZE} tubs`}</span>
            <strong ref={priceRef}>€0</strong>
          </div>
          <div className="box-actions">
            <button className="btn btn-solid" type="button" disabled={!full} onClick={addBox}>Add box to cart</button>
            <button className="btn" type="button" onClick={surprise}>Surprise me</button>
            <button className="btn btn-text" type="button" onClick={() => commit(EMPTY)}>Empty wheel</button>
          </div>
        </div>
        <div className="wheel" ref={wheel}>
          <div className="wheel-spin" ref={spin} data-cursor="Spin">
            <div className="marble" style={{ backgroundImage: `url("${RING_IMG}")` }} />
            {contents.map((c, i) => {
              const angle = (i / SIZE) * Math.PI * 2 + Math.PI / 4;
              return (
                <button
                  key={i}
                  ref={(node) => void (slots.current[i] = node)}
                  className="slot"
                  data-cursor={c === null ? undefined : 'Remove'}
                  type="button"
                  disabled={c === null}
                  aria-label={c === null ? `Empty place ${i + 1}` : `Remove ${FLAVOURS[c].label}`}
                  style={{ left: `${(50 + Math.cos(angle) * 38.5).toFixed(2)}%`, top: `${(50 + Math.sin(angle) * 38.5).toFixed(2)}%` }}
                  onClick={() => commit(live.current.map((v, n) => (n === i ? null : v)))}
                >
                  {c !== null && <img src={FLAVOURS[c].img} alt="" draggable={false} />}
                </button>
              );
            })}
          </div>
          <div className="wheel-hub" ref={hub} aria-hidden="true">
            <span className="wheel-hub-count">{full ? '✓' : SIZE - filled.length}</span>
            <span>{full ? 'box full' : 'to go'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
