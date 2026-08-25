import type { Metadata } from 'next';
import { hanken, roundedElegance } from '@/lib/fonts';
import './globals.css';
// Prewired in app-shell; enabled in restructure/auth-lib when features/auth/lib/amplify lands.
// import { ConfigureAmplify } from '@/features/auth/lib/amplify';

export const metadata: Metadata = {
  title: 'Nivarak',
  description: 'Elderly independence assessment and care management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${roundedElegance.variable} ${hanken.className}`}
    >
      <body className="min-h-screen font-sans antialiased">
        {/* <ConfigureAmplify /> */}
        {children}
      </body>
    </html>
  );
}
