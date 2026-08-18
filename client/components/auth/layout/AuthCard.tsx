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

/** Fluid card: width, padding, and section gap scale with the viewport */
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
        'flex w-full flex-col gap-auth-section rounded-large border border-border bg-card',
        'lg:max-w-auth-card',
        'px-auth-pad-x py-auth-pad-y shadow-[0_2px_8px_rgba(17,24,39,0.05)]',
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
