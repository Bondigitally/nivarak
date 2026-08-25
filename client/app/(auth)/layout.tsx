import { AuthLayout } from '@/features/auth/components/layout/AuthLayout';

/**
 * Shared shell for login / register / forgot-password / invite.
 * Keeps AuthLayout (hero + preload) mounted across soft navigations
 * so only the AuthCard content remounts.
 */
export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
