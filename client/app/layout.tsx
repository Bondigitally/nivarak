import type { Metadata } from 'next';
import { hanken, roundedElegance } from '@/lib/fonts';
import './globals.css';
import { ConfigureAmplify } from '@/features/auth/lib/amplify';
import { SIDEBAR_THEME_BOOTSTRAP_SCRIPT } from '@/lib/sidebar-theme';

import { GoogleAnalytics } from '@/components/google-analytics';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking — must run before first paint; do not defer via next/script. */}
        <script
          dangerouslySetInnerHTML={{ __html: SIDEBAR_THEME_BOOTSTRAP_SCRIPT }}
        />
        <GoogleAnalytics />
      </head>
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
