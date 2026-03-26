import { Manrope, Sora } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';

const displayFont = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display'
});

const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'Mission Control Dashboard',
  description: 'Local-first operator dashboard for OpenClaw workflows'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
