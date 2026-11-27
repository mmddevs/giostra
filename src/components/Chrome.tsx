'use client';

/* eslint-disable @next/next/no-img-element */
import { animate, stagger } from 'motion';
import { useEffect, useRef, useState } from 'react';
import { cart, useCart } from '@/lib/cart';
import { FLAVOURS, NAV } from '@/lib/data';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { setPanel, usePanel } from '@/lib/ui';
import { CartIcon, CloseIcon, MenuIcon } from './Icons';

function TopBar() {
  const { count } = useCart();
  const [visible, setVisible] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom 72px',
      onEnter: () => setVisible(true),
      onLeaveBack: () => setVisible(false),
    });
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  });

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <header className={`topbar ${visible ? 'is-visible' : ''}`} inert={!visible}>
        <a className="logo" href="#hero">Gelato Lab</a>
        <nav aria-label="Principale">
          {NAV.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="topbar-actions">
          <button className="icon-btn" type="button" aria-label="Ouvrir le menu" onClick={() => setPanel('menu')}><MenuIcon /></button>
          <button className="icon-btn js-cart" type="button" aria-label="Panier" onClick={() => setPanel('cart')}>
            <CartIcon />
            {count > 0 && <span key={count} className="badge">{count}</span>}
          </button>
        </div>
      </header>
    </>
  );
}

/** Opens and closes a native dialog around a Motion enter and exit. */
function useDialog(open: boolean, enter: (d: HTMLDialogElement) => void, exit: (d: HTMLDialogElement) => Promise<unknown>) {
  const ref = useRef<HTMLDialogElement>(null);
  const handlers = useRef({ enter, exit });
  handlers.current = { enter, exit };

  useEffect(() => {
    const dialog = ref.current!;
    let cancelled = false;
    if (open) {
      // Also replays the entrance when reopened in the middle of an exit.
      if (!dialog.open) dialog.showModal();
      if (!prefersReducedMotion()) handlers.current.enter(dialog);
    } else if (dialog.open) {
      if (prefersReducedMotion()) dialog.close();
      else void handlers.current.exit(dialog).then(() => !cancelled && dialog.close());
    }
    return () => {
      cancelled = true;
    };
  }, [open]);

  return ref;
}

const CIRCLE = (r: string) => `circle(${r} at 40px 40px)`;

function Menu({ open }: { open: boolean }) {
  const [bowl, setBowl] = useState(0);
  const ref = useDialog(
    open,
    (d) => {
      animate(d, { clipPath: [CIRCLE('0%'), CIRCLE('150%')] }, { duration: 0.6, ease: [0.77, 0, 0.175, 1] });
      animate(d.querySelectorAll('nav a'), { opacity: [0, 1], y: [60, 0] }, { delay: stagger(0.06, { startDelay: 0.18 }), duration: 0.55, ease: [0.23, 1, 0.32, 1] });
      animate(d.querySelector('.menu-bowl')!, { rotate: [-140, 0], scale: [0.7, 1] }, { type: 'spring', duration: 1.1, bounce: 0.2 });
    },
    (d) => animate(d, { clipPath: CIRCLE('0%') }, { duration: 0.35, ease: [0.77, 0, 0.175, 1] }).finished,
  );

  return (
    <dialog ref={ref} className="menu" aria-label="Menu" onCancel={(e) => { e.preventDefault(); setPanel(null); }}>
      <button className="icon-btn menu-close" type="button" aria-label="Fermer le menu" onClick={() => setPanel(null)}><CloseIcon /></button>
      <nav aria-label="Menu">
        {NAV.map(([href, label], i) => (
          <a key={href} href={href} onPointerEnter={() => setBowl(i)} onFocus={() => setBowl(i)}>{label}</a>
        ))}
      </nav>
      <img className="menu-bowl" src={FLAVOURS[bowl % FLAVOURS.length].img} alt="" />
    </dialog>
  );
}

function CartDrawer({ open }: { open: boolean }) {
  const { lines, total } = useCart();
  const [note, setNote] = useState(false);
  const ref = useDialog(
    open,
    (d) => {
      setNote(false);
      animate(d.querySelector('.drawer-panel')!, { x: ['100%', '0%'] }, { type: 'spring', duration: 0.45, bounce: 0 });
    },
    (d) => animate(d.querySelector('.drawer-panel')!, { x: '100%' }, { duration: 0.25, ease: [0.32, 0.72, 0, 1] }).finished,
  );

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="cart-title"
      onCancel={(e) => { e.preventDefault(); setPanel(null); }}
      onClick={(e) => e.target === e.currentTarget && setPanel(null)}
    >
      <div className="drawer-panel" data-lenis-prevent>
        <div className="drawer-head">
          <h2 id="cart-title">Votre panier</h2>
          <button className="icon-btn" type="button" aria-label="Fermer le panier" onClick={() => setPanel(null)}><CloseIcon /></button>
        </div>
        {lines.length === 0 ? (
          <div className="cart-empty">
            <p>Rien ici pour l’instant.</p>
            <a className="btn btn-solid" href="#flavours">Choisir un parfum</a>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map((line) => (
                <li key={line.id} className="cart-line">
                  <img src={line.img} alt="" />
                  <div>
                    <p className="cart-name">{line.title}</p>
                    <p className="cart-detail">{line.detail}, {line.price} €</p>
                  </div>
                  <div className="qty">
                    <button type="button" aria-label={`Retirer un ${line.title}`} onClick={() => cart.change(line.id, -1)}>−</button>
                    <span>{line.qty}</span>
                    <button type="button" aria-label={`Ajouter un ${line.title}`} onClick={() => cart.change(line.id, 1)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-foot">
              <div className="cart-sum"><span>Total</span><strong>{total} €</strong></div>
              <button className="btn btn-solid" type="button" onClick={() => setNote(true)}>Commander</button>
              <p className="cart-note" role="status">{note ? 'Ceci est une démo : aucune commande n’est passée et rien n’est débité.' : ''}</p>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

export function Chrome() {
  const panel = usePanel();
  return (
    <>
      <TopBar />
      <Menu open={panel === 'menu'} />
      <CartDrawer open={panel === 'cart'} />
    </>
  );
}
