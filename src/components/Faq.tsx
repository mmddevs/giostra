'use client';

import { useState } from 'react';
import { SplitHeading } from './SplitHeading';

const QUESTIONS = [
  ['How long does a tub keep?', 'Three weeks in a home freezer. Take it out ten minutes before serving so it softens.'],
  ['Which flavours contain nuts?', 'Pistachio / Cream and Dark Choc / Hazelnut contain tree nuts. All five are made in the same lab, so traces are possible in every tub.'],
  ['Is there a dairy-free option?', 'Ask at the counter for the mango and passion fruit sorbet. The rest of the range uses fresh milk and cream.'],
  ['Do you deliver?', 'Boxes of four travel by cargo bike inside the city, packed on ice. You choose the day at checkout.'],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <SplitHeading id="faq-title">Before you order</SplitHeading>
        <div>
          {QUESTIONS.map(([q, a], i) => (
            <div key={q} className={`faq-item ${open === i ? 'is-open' : ''}`}>
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                  {q}
                  <span aria-hidden="true" />
                </button>
              </h3>
              <div className="faq-body" id={`faq-${i}`}>
                <div><p>{a}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
