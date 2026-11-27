import type { Metadata, Viewport } from 'next';
import { Archivo, Dela_Gothic_One } from 'next/font/google';
import type { ReactNode } from 'react';
import 'lenis/dist/lenis.css';
import './base.css';
import './hero.css';
import './sections.css';
import './cursor.css';

const dela = Dela_Gothic_One({ weight: '400', subsets: ['latin'], variable: '--font-dela' });
const archivo = Archivo({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-archivo' });

export const metadata: Metadata = {
  title: 'Gelato Lab | Artisan gelato on a marble wheel',
  description: 'Artisan gelato churned in small batches. Five flavours, hand-built tubs and boxes of four.',
};

export const viewport: Viewport = { themeColor: '#9C8FD0', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dela.variable} ${archivo.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
