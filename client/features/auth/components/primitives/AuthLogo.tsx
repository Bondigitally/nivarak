'use client';

import { BrandLogo } from '@/components/shared/BrandLogo';
import { useAuthPreload } from '@/features/auth/components/AuthPreload';

/** Auth-shell logo — notifies preload when the mark finishes loading. */
export function AuthLogo() {
  const preload = useAuthPreload();

  return <BrandLogo onReady={() => preload?.markCardReady()} />;
}
