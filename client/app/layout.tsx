import type { Metadata } from 'next';
import { hanken, roundedElegance } from '@/lib/fonts';
import './globals.css';
import { ConfigureAmplify } from '@/features/auth/lib/amplify';

export const metadata: Metadata = {
  title: 'Nivarak - Unifying Eldercare',
  description:
    'Nivarak is an eldercare platform for independence assessment, daily care tasks, vitals, medications, and coordinated support between patients, families, and care teams.',
  icons: {
    icon: '/images/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${roundedElegance.variable} ${hanken.className}`}
    >
      <body className="min-h-screen font-sans antialiased">
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
