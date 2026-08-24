import Link from 'next/link';
import { authType } from '@/lib/auth/typography';

export type AuthFooterVariant = 'invite' | 'contact-admin' | 'signup';

interface AuthFooterProps {
  variant: AuthFooterVariant;
}

export function AuthFooter({ variant }: AuthFooterProps) {
  if (variant === 'signup') {
    return (
      <div className="flex items-center justify-center gap-1.5 text-center">
        <span className={authType.bodyM}>Don&apos;t have an account?</span>
        <Link href="/register" className={authType.link}>
          Sign Up
        </Link>
      </div>
    );
  }

  if (variant === 'invite') {
    return (
      <div className="flex items-center justify-center gap-1.5 text-center">
        <span className={authType.bodyM}>Have an invitation?</span>
        <Link href="/invite/accept" className={authType.link}>
          Open your invite link
        </Link>
      </div>
    );
  }

  return (
    <p className={`text-center ${authType.bodyM}`}>
      Trouble logging in?{' '}
      <span className={authType.link}>Contact your administrator.</span>
    </p>
  );
}
