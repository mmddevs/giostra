'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion-prefs';

/** A section heading whose words rise from behind a line mask, once. */
export function SplitHeading({ id, children }: { id: string; children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    SplitText.create(ref.current, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      onSplit: (split) =>
        gsap.from(split.words, {
          yPercent: 115, rotation: 4, duration: 0.9, ease: 'power4.out', stagger: 0.07,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        }),
    });
  });

  return <h2 ref={ref} id={id} className="display">{children}</h2>;
}
