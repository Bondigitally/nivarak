import Link from 'next/link';
import { typo } from '@/lib/tokens/typography';

export type AuthFooterVariant = 'invite' | 'contact-admin' | 'signup' | 'login';

interface AuthFooterProps {
  variant: AuthFooterVariant;
}

export function AuthFooter({ variant }: AuthFooterProps) {
  if (variant === 'signup') {
    return (
      <div className="flex items-center justify-center gap-1.5 text-center">
        <span className={typo.bodyM}>Don&apos;t have an account?</span>
        <Link href="/register" className={typo.link}>
          Sign Up
        </Link>
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div className="flex items-center justify-center gap-1.5 text-center">
        <span className={typo.bodyM}>Already have an account?</span>
        <Link href="/login" className={typo.link}>
          Log In
        </Link>
      </div>
    );
  }

  if (variant === 'invite') {
    return (
      <div className="flex items-center justify-center gap-1.5 text-center">
        <span className={typo.bodyM}>Have an invitation?</span>
        <Link href="/invite/accept" className={typo.link}>
          Open your invite link
        </Link>
      </div>
    );
  }

  return (
    <p className={`text-center ${typo.bodyM}`}>
      Trouble logging in?{' '}
      <span className={typo.link}>Contact your administrator.</span>
    </p>
  );
}
