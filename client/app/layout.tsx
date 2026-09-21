import type { Metadata } from 'next';
import { hanken, roundedElegance } from '@/lib/fonts';
import './globals.css';
import { ConfigureAmplify } from '@/features/auth/lib/amplify';
import { ThemeProvider } from '@/components/theme-provider';

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
     * suppressHydrationWarning is required because next-themes mutates the
     * <html class> attribute client-side before React hydrates, which would
     * otherwise produce a hydration mismatch warning.
     */
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${hanken.variable} ${roundedElegance.variable} ${hanken.className} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          /*
           * Prevents a flash of CSS transitions when the user switches theme —
           * without this, every element that has a transition would animate from
           * the previous theme colors immediately on mount.
           */
          disableTransitionOnChange
        >
          {/* ConfigureAmplify must run client-side before any Amplify auth call. */}
          <ConfigureAmplify />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
