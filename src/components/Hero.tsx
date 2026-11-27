'use client';

import { useRef } from 'react';
import { FLAVOURS, PROPS_SHEET, PROP_BOXES, RING_IMG, type PropKey } from '@/lib/data';
import { cubicBezier } from '@/lib/bezier';
import { mix } from '@/lib/color';
import { cart, useCart } from '@/lib/cart';
import { flyToCart } from '@/lib/fly';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { setPanel, subscribePanel } from '@/lib/ui';
import { CartIcon, MenuIcon } from './Icons';

const COUPE_FILL = 0.985;
const BAND = (462.5 + 354) / 2 / 462.5;
const N = FLAVOURS.length;
const PROP_KEYS = Object.keys(PROP_BOXES) as PropKey[];
const ease = cubicBezier(0.42, 0, 0.58, 1);

interface Layout { u: number; cx: number; cy: number; R: number; big: number; small: number }
type Placement = [x: number, y: number, width: number, rotation: number];

const loadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // A failed asset must not leave the page blank.
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const front = useRef(0);
  const { count } = useCart();

  useGSAP(
    (_context, contextSafe) => {
      const hero = root.current!;
      const q = <T extends Element = HTMLElement>(sel: string) => hero.querySelector<T>(sel)!;
      const all = <T extends Element = HTMLElement>(sel: string) => Array.from(hero.querySelectorAll<T>(sel));
      const ring = q('.ring');
      const ringShadow = q('.ring-shadow');
      const title = q('.title');
      const flavourName = q('.flavour');
      const coupes = all('.coupe');
      const shadows = all('.coupe-shadow');
      const props = all('.prop');

      const reduced = prefersReducedMotion();
      const HOLD = reduced ? 3000 : 1400;
      const TURN = reduced ? 1 : 500;

      let L: Layout;
      let current = 0;
      let shownName = -1;

      const layout = () => {
        const W = hero.clientWidth;
        const H = hero.clientHeight;
        const portrait = W / H < 0.9;
        const u = portrait ? Math.min(W / 390, H / 760) : Math.min(W / 1440, H / (H < 560 ? 770 : 900));
        const sh = H / u;
        const R = portrait ? 222 : 430;
        const big = portrait ? 262 : 470;
        const small = portrait ? 158 : 292;
        let bowlY = 418;
        let copyTop = 0;
        let titleTop = 632;

        if (portrait) {
          const stackH = big + 22 + 138 + 20 + 50;
          const top = 82;
          const avail = sh - 70 - top;
          bowlY = top + Math.max(0, (avail - stackH) * 0.45) + big / 2;
          copyTop = bowlY + big / 2 + 22;
          titleTop = copyTop + 158;
        }

        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--u', `${u}px`);
        rootStyle.setProperty('--hs', String(sh));
        rootStyle.setProperty('--copy-top', String(copyTop));
        rootStyle.setProperty('--title-top', String(titleTop));
        document.body.classList.toggle('portrait', portrait);
        L = { u, cx: (portrait ? 390 : 1440) / 2, cy: bowlY - R, R, big, small };

        // Ring and its shadow
        const D = (2 * R) / BAND;
        const k = D / (2 * 462.5);
        const ri = (D / 2) * (354 / 462.5) * u;
        const ro = (D / 2) * u;
        ring.style.width = ring.style.height = ringShadow.style.width = ringShadow.style.height = `${D * u}px`;
        ring.style.backgroundSize = `${1024 * k * u}px ${1024 * k * u}px`;
        ring.style.backgroundPosition = `${(D / 2 - 507.5 * k) * u}px ${(D / 2 - 502.5 * k) * u}px`;
        const mask = `radial-gradient(circle closest-side, transparent ${ri - 1}px, #000 ${ri + 0.5}px, #000 ${ro - 1.5}px, transparent ${ro}px)`;
        ring.style.maskImage = mask;
        ring.style.setProperty('-webkit-mask-image', mask);
        ringShadow.style.background = `radial-gradient(circle closest-side, transparent ${ri - 10 * u}px, rgba(25,12,45,.16) ${ri + 6 * u}px, rgba(25,12,45,.16) ${ro - 4 * u}px, transparent ${ro + 14 * u}px)`;
        ringShadow.style.transform = `translate(${(L.cx - D / 2) * u}px, ${(L.cy - D / 2 + 10) * u}px)`;

        coupes.forEach((img, i) => {
          img.style.width = img.style.height = `${(big / COUPE_FILL) * u}px`;
          shadows[i].style.width = shadows[i].style.height = `${1.12 * big * u}px`;
        });

        const c = bowlY;
        const t = Math.max(titleTop, sh - 170);
        const places: Record<PropKey, Placement> = portrait
          ? { cone: [-50, c + 150, 104, -14], rasp: [-26, c + 250, 70, 0], blue: [312, c + 170, 96, 0], spoonL: [-44, t + 62, 150, 0], spoonR: [284, t + 62, 150, 0] }
          : { cone: [-34, 168, 190, -14], rasp: [34, 340, 118, 0], blue: [1238, 360, 168, 0], spoonL: [86, 760, 210, 0], spoonR: [1146, 760, 210, 0] };

        props.forEach((node, i) => {
          const key = PROP_KEYS[i];
          const [x, y, w, rot] = places[key];
          const [bx, by, bw, bh] = PROP_BOXES[key];
          const s = (w / bw) * u;
          node.style.width = `${w * u}px`;
          node.style.height = `${bh * s}px`;
          node.style.backgroundSize = `${1024 * s}px ${688 * s}px`;
          node.style.backgroundPosition = `${-bx * s}px ${-by * s}px`;
          node.style.transform = `translate(${x * u}px, ${y * u}px) rotate(${rot}deg)`;
        });

        title.style.fontSize = '100px';
        const measured = title.offsetWidth;
        title.style.fontSize = `${(100 * (portrait ? 350 : 1062) * u) / measured}px`;
      };

      const render = (p: number) => {
        current = p;
        front.current = Math.round(p) % N;
        const { u, cx, cy, R, big, small } = L;
        const D = (2 * R) / BAND;
        ring.style.transform = `translate(${(cx - D / 2) * u}px, ${(cy - D / 2) * u}px) rotate(${p * 72}deg)`;

        coupes.forEach((img, i) => {
          const shadow = shadows[i];
          let diff = (((i - p) % N) + N) % N;
          if (diff >= 2.5) diff -= N;
          const angle = ((90 - diff * 72) * Math.PI) / 180;
          const x = cx + R * Math.cos(angle);
          const y = cy + R * Math.sin(angle);
          const ad = Math.abs(diff);
          const scale = ad <= 1 ? 1 + (small / big - 1) * ad : small / big - (ad - 1) * 0.08;
          const z = 4 + Math.round(100 - ad * 20);
          const size = big / COUPE_FILL;
          const shadowSize = 1.12 * big;
          img.style.zIndex = String(z);
          img.style.transform = `translate(${(x - size / 2) * u}px, ${(y - size / 2) * u}px) scale(${scale}) rotate(${(p - i) * 72}deg)`;
          shadow.style.zIndex = String(z - 1);
          shadow.style.transform = `translate(${(x - shadowSize / 2) * u}px, ${(y + 0.05 * big * scale - shadowSize / 2) * u}px) scale(${scale})`;
        });

        const from = Math.floor(p) % N;
        const to = (from + 1) % N;
        const t = p - Math.floor(p);
        const bg = mix(FLAVOURS[from].bg, FLAVOURS[to].bg, t);
        const ink = mix(FLAVOURS[from].ink, FLAVOURS[to].ink, t);
        document.body.style.background = bg;
        hero.style.setProperty('--bg', bg);
        hero.style.setProperty('--ink', ink);

        const nameIndex = t < 0.5 ? from : to;
        if (nameIndex !== shownName) {
          shownName = nameIndex;
          flavourName.innerHTML = FLAVOURS[nameIndex].name.join('<br>');
        }
        flavourName.style.opacity = String(t < 0.5 ? 1 - 2 * t : 1 - 2 * (1 - t));
        flavourName.style.transform = `translateY(${(t < 0.5 ? -2 * t * 8 : 2 * (1 - t) * 8) * u}px)`;
      };

      // One rAF loop, paused while the hero is off screen or covered by a dialog.
      let step = 0;
      let phaseStart = 0;
      let last = 0;
      let raf = 0;
      let onScreen = true;
      let covered = false;
      let ready = false;
      let disposed = false;

      const frame = (now: number) => {
        if (!last) phaseStart = last = now;
        if (now - last > 250) phaseStart += now - last;
        last = now;
        const e = now - phaseStart;
        let p: number;
        if (e < HOLD) p = step;
        else if (e < HOLD + TURN) p = step + ease((e - HOLD) / TURN);
        else {
          step = (step + 1) % N;
          phaseStart += HOLD + TURN;
          p = step;
        }
        render(p);
        raf = requestAnimationFrame(frame);
      };

      const sync = () => {
        const shouldRun = ready && onScreen && !covered;
        if (shouldRun && !raf) raf = requestAnimationFrame(frame);
        if (!shouldRun && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };

      const onResize = () => {
        if (!ready) return;
        layout();
        render(current);
      };

      const observer = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      observer.observe(hero);
      const unsubscribe = subscribePanel((open) => {
        covered = open;
        sync();
      });
      window.addEventListener('resize', onResize);

      const start = contextSafe!(async () => {
        const family = getComputedStyle(title).fontFamily;
        await Promise.all([
          ...FLAVOURS.map((f) => loadImage(f.img)),
          loadImage(RING_IMG),
          loadImage(PROPS_SHEET),
          document.fonts.load(`400 100px ${family}`).catch(() => []),
          document.fonts.ready,
        ]);
        if (disposed) return;
        ring.style.backgroundImage = `url("${RING_IMG}")`;
        props.forEach((node) => (node.style.backgroundImage = `url("${PROPS_SHEET}")`));
        ready = true;
        layout();
        render(0);
        hero.classList.add('ready');
        sync();
      });
      void start();

      // Leaving the hero: the table drifts down slower than the page. At rest nothing changes.
      if (!reduced) {
        gsap.to(q('.drift'), {
          yPercent: 22,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        });
      }

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        observer.disconnect();
        unsubscribe();
        window.removeEventListener('resize', onResize);
      };
    },
    { scope: root },
  );

  const buy = () => {
    const i = front.current;
    const f = FLAVOURS[i];
    const bowl = root.current!.querySelectorAll('.coupe')[i];
    flyToCart(f.img, bowl.getBoundingClientRect());
    cart.add({ id: `tub-${i}`, title: f.label, detail: 'Pot de 500 ml', price: f.price, img: f.img });
  };

  return (
    <section ref={root} className="hero" id="hero" aria-label="Gelato Lab">
      <div className="waves" />
      <div className="drift">
        <div className="stage">
          <div className="ring-shadow" />
          <div className="ring" />
          <h1 className="title">GELATO LAB</h1>
          {FLAVOURS.map((f) => (
            <div key={f.label}>
              <div className="coupe-shadow" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="coupe" src={f.img} crossOrigin="anonymous" alt="" draggable={false} />
            </div>
          ))}
          {PROP_KEYS.map((key) => (
            <div key={key} className="prop" />
          ))}
          <div className="eyebrow">ARTISAN</div>
          <p className="flavour">FRUITS ROUGES /<br />ROSE</p>
          <button className="buy" type="button" onClick={buy}>ACHETER</button>
        </div>
      </div>
      <div className="vignette" />
      <button className="nav-btn nav-menu" type="button" aria-label="Ouvrir le menu" onClick={() => setPanel('menu')}>
        <MenuIcon />
      </button>
      <button className="nav-btn nav-cart" type="button" aria-label="Panier" onClick={() => setPanel('cart')}>
        <CartIcon />
        {count > 0 && <span key={count} className="badge">{count}</span>}
      </button>
    </section>
  );
}
