import { Hanken_Grotesk } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Nivarak',
  description: 'Elderly independence assessment and care management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={hanken.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
