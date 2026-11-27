import { animate } from 'motion';
import { prefersReducedMotion } from './motion-prefs';

/** Sends a copy of a bowl from where it sits into whichever cart button is on screen, on an arc. */
export const flyToCart = (src: string, from: DOMRect): void => {
  if (prefersReducedMotion()) return;
  const target =
    document.querySelector<HTMLElement>('.topbar.is-visible .js-cart') ?? document.querySelector<HTMLElement>('.nav-cart');
  if (!target) return;
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, 220);
  const ghost = document.createElement('img');
  ghost.className = 'ghost-bowl';
  ghost.src = src;
  ghost.alt = '';
  ghost.style.width = ghost.style.height = `${size}px`;
  ghost.style.left = `${from.left + from.width / 2 - size / 2}px`;
  ghost.style.top = `${from.top + from.height / 2 - size / 2}px`;
  document.body.append(ghost);

  const x = to.left + to.width / 2 - (from.left + from.width / 2);
  const y = to.top + to.height / 2 - (from.top + from.height / 2);

  // Different curves on x and y make the arc.
  animate(
    ghost,
    { x, y, scale: 0.12, rotate: 220 },
    { duration: 0.75, x: { duration: 0.75, ease: [0.45, 0, 0.75, 0.4] }, y: { duration: 0.75, ease: [0.2, 0.7, 0.3, 1] } },
  ).then(() => {
    ghost.remove();
    animate(target, { scale: [1, 1.18, 1] }, { duration: 0.35 });
  });
};
