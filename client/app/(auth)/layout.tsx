import { headers } from 'next/headers';
import { AuthLayout } from '@/components/auth/layout/AuthLayout';
import { PORTALS } from '@/lib/auth/portals';
import type { Portal } from '@/types/auth';

/**
 * Shared shell for login / register / forgot-password / invite.
 * Keeps AuthLayout (hero + preload) mounted across soft navigations
 * so only the AuthCard content remounts.
 */
export default async function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const portal = (headerList.get('x-nivarak-portal') ?? 'consumer') as Portal;
  const variant = PORTALS[portal].layout;

  return <AuthLayout variant={variant}>{children}</AuthLayout>;
}
