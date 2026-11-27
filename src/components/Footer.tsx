'use client';

import { animate } from 'motion';
import { useRef, useState, type FormEvent } from 'react';
import { NAV } from '@/lib/data';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      SplitText.create('.footer-word', {
        type: 'chars',
        onSplit: (split) =>
          gsap.from(split.chars, {
            yPercent: 100, rotation: () => gsap.utils.random(-25, 25), ease: 'none', stagger: 0.06,
            scrollTrigger: { trigger: '.footer-word', start: 'top bottom', end: 'bottom bottom', scrub: 0.4 },
          }),
      });
    },
    { scope: root },
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem('email') as HTMLInputElement;
    const ok = input.value.trim() !== '' && input.checkValidity();
    setStatus(ok ? 'ok' : 'error');
    if (!ok) {
      input.focus();
      if (!prefersReducedMotion()) animate(input, { x: [0, -8, 7, -4, 0] }, { duration: 0.3 });
    }
  };

  return (
    <footer ref={root} className="footer">
      <div className="wrap footer-top">
        <div>
          <h2>Hear about the sixth flavour first</h2>
          <form className="signup" noValidate onSubmit={submit}>
            <label htmlFor="email">Email address</label>
            <div className="signup-row">
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-invalid={status === 'error'} aria-describedby="signup-note" />
              <button className="btn btn-solid" type="submit">Join the list</button>
            </div>
            <p className="signup-note" id="signup-note" role="status">
              {status === 'ok' && 'This is a design demo, so your address was not sent or saved.'}
              {status === 'error' && 'Enter an email address like you@example.com.'}
            </p>
          </form>
        </div>
        <nav aria-label="Footer">
          {NAV.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          <a href="mailto:ciao@gelatolab.example">ciao@gelatolab.example</a>
        </nav>
      </div>
      <p className="footer-word" aria-hidden="true">GELATO LAB</p>
      <p className="footer-legal wrap">Gelato Lab is a fictional brand made for a design demo. Images generated with Higgsfield.</p>
    </footer>
  );
}
