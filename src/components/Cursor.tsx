'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion-prefs';

const INTERACTIVE = 'a[href], button:not(:disabled), summary, label';
const TEXT_FIELD = 'input, textarea, select, [contenteditable="true"]';

/**
 * Desktop only: a dot on the pointer and a small marble wheel trailing it.
 * Add data-cursor="Word" to an element to turn the wheel into a labelled disc over it.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const node = root.current!;
      // No mouse, or no top-layer support (the cursor would vanish behind dialogs): keep the native one.
      if (!hasFinePointer() || !node.showPopover) return;

      const html = document.documentElement;
      const dot = node.querySelector<HTMLElement>('.cursor-dot')!;
      const wheel = node.querySelector<HTMLElement>('.cursor-wheel')!;
      const label = node.querySelector<HTMLElement>('.cursor-label')!;
      const lag = prefersReducedMotion() ? 0 : 0.32;

      const dotX = gsap.quickSetter(dot, 'x', 'px');
      const dotY = gsap.quickSetter(dot, 'y', 'px');
      const wheelX = gsap.quickTo(wheel, 'x', { duration: lag, ease: 'power3' });
      const wheelY = gsap.quickTo(wheel, 'y', { duration: lag, ease: 'power3' });
      let visible = false;
      let pressed = false;

      const hide = () => {
        visible = false;
        node.classList.remove('is-visible');
        html.classList.remove('has-cursor');
      };

      const read = (target: Element | null) => {
        const word = target?.closest<HTMLElement>('[data-cursor]');
        const text = word && !word.matches(':disabled') ? word.dataset.cursor! : '';
        if (text) label.textContent = text;
        node.dataset.state = target?.closest(TEXT_FIELD) ? 'text' : text ? 'label' : target?.closest(INTERACTIVE) ? 'hover' : 'idle';
      };

      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return hide();
        dotX(e.clientX);
        dotY(e.clientY);
        if (!visible) {
          // First sighting: jump there instead of flying in from the corner.
          visible = true;
          gsap.set(wheel, { x: e.clientX, y: e.clientY });
          wheelX(e.clientX, e.clientX);
          wheelY(e.clientY, e.clientY);
          node.classList.add('is-visible');
          html.classList.add('has-cursor');
          read(e.target as Element);
          return;
        }
        wheelX(e.clientX);
        wheelY(e.clientY);
      };
      // While a button is held (a drag), the state stays what it was on press.
      const over = (e: PointerEvent) => !pressed && read(e.target as Element);
      const down = () => {
        pressed = true;
        node.classList.add('is-pressed');
      };
      const up = (e: PointerEvent) => {
        pressed = false;
        node.classList.remove('is-pressed');
        read(document.elementFromPoint(e.clientX, e.clientY));
      };

      // Re-entering the top layer puts the cursor above a dialog that just opened.
      const raise = () => {
        if (node.matches(':popover-open')) node.hidePopover();
        node.showPopover();
      };
      raise();
      const dialogs = new MutationObserver(raise);
      dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });

      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerover', over, { passive: true });
      window.addEventListener('pointerdown', down, true);
      window.addEventListener('pointerup', up, true);
      window.addEventListener('pointercancel', up, true);
      window.addEventListener('blur', hide);
      html.addEventListener('pointerleave', hide);

      return () => {
        hide();
        dialogs.disconnect();
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerover', over);
        window.removeEventListener('pointerdown', down, true);
        window.removeEventListener('pointerup', up, true);
        window.removeEventListener('pointercancel', up, true);
        window.removeEventListener('blur', hide);
        html.removeEventListener('pointerleave', hide);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="cursor" popover="manual" aria-hidden="true" data-state="idle">
      <div className="cursor-wheel">
        <div className="cursor-ring">
          <i />
        </div>
        <div className="cursor-disc">
          <span className="cursor-label" />
        </div>
      </div>
      <div className="cursor-dot" />
    </div>
  );
}
