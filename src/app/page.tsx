import { BoxBuilder } from '@/components/BoxBuilder';
import { Chrome } from '@/components/Chrome';
import { Cursor } from '@/components/Cursor';
import { Counters } from '@/components/Counters';
import { Faq } from '@/components/Faq';
import { Flavours } from '@/components/Flavours';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Lab } from '@/components/Lab';
import { Manifesto, Marquee } from '@/components/Marquee';
import { Playground } from '@/components/Playground';
import { SmoothScroll } from '@/components/SmoothScroll';

export default function Page() {
  return (
    <>
      <a className="skip" href="#flavours">Aller aux parfums</a>
      <SmoothScroll />
      <Hero />
      <Chrome />
      <main>
        <Marquee />
        <Manifesto />
        <Flavours />
        <Lab />
        <BoxBuilder />
        <Playground />
        <Counters />
        <Faq />
      </main>
      <Footer />
      <Cursor />
    </>
  );
}
