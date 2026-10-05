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
    /*
     * suppressHydrationWarning is required because next-themes (dashboard only)
     * mutates the <html class> attribute client-side before React hydrates.
     */
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${hanken.variable} ${roundedElegance.variable} ${hanken.className} min-h-screen font-sans antialiased`}
      >
        {/* ConfigureAmplify must run client-side before any Amplify auth call. */}
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}
