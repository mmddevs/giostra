'use client';

import { useState } from 'react';
import { SplitHeading } from './SplitHeading';

const QUESTIONS = [
  ['Combien de temps se garde un pot ?', 'Trois semaines au congélateur. Sortez-le dix minutes avant de servir pour qu’il s’assouplisse.'],
  ['Quels parfums contiennent des fruits à coque ?', 'Pistache / Crème et Choco noir / Noisette en contiennent. Les cinq sont faits dans le même labo : des traces sont possibles dans chaque pot.'],
  ['Avez-vous une option sans lait ?', 'Demandez au comptoir le sorbet mangue et passion. Le reste de la gamme contient du lait frais et de la crème.'],
  ['Livrez-vous ?', 'Les coffrets de quatre voyagent en vélo cargo dans la ville, sur de la glace. Vous choisissez le jour à la commande.'],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <SplitHeading id="faq-title">Avant de commander</SplitHeading>
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
