'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthPreload } from '@/components/auth/AuthPreload';
import { AuthLogo } from '@/components/auth/primitives/AuthLogo';
import { AuthFlowTransition } from '@/components/auth/primitives/AuthFlowTransition';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  showLogo?: boolean;
  /** When set, logo re-reveals with the same flow animation as the form */
  flowKey?: string;
}

/** Design: 720px · 20px radius · 64px pad · 32px section gap · soft Shadow/SM */
export function AuthCard({
  children,
  className,
  showLogo = true,
  flowKey,
}: AuthCardProps) {
  const preload = useAuthPreload();

  useEffect(() => {
    if (!showLogo) preload?.markCardReady();
  }, [showLogo, preload]);

  return (
    <div
      className={cn(
        'flex w-full max-w-180 flex-col gap-8 rounded-[20px] border border-border bg-card',
        'p-8 shadow-[0_2px_8px_rgba(17,24,39,0.05)]',
        'lg:gap-8 lg:p-16',
        className,
      )}
    >
      {showLogo &&
        (flowKey ? (
          <AuthFlowTransition flowKey={`logo-${flowKey}`} playInitial>
            <AuthLogo />
          </AuthFlowTransition>
        ) : (
          <AuthLogo />
        ))}
      {children}
    </div>
  );
}
