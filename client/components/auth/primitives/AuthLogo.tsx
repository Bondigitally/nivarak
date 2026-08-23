'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { AUTH_LOGO } from '@/lib/auth/assets';
import { useAuthPreload } from '@/components/auth/AuthPreload';

export function AuthLogo() {
  const preload = useAuthPreload();
  const marked = useRef(false);

  function markReady() {
    if (marked.current) return;
    marked.current = true;
    preload?.markCardReady();
  }

  return (
    <div
      className="relative shrink-0"
      style={{ width: AUTH_LOGO.displayWidth, height: AUTH_LOGO.displayHeight }}
    >
      <Image
        src={AUTH_LOGO.src}
        alt={AUTH_LOGO.alt}
        width={AUTH_LOGO.width}
        height={AUTH_LOGO.height}
        sizes={`${AUTH_LOGO.displayWidth}px`}
        quality={AUTH_LOGO.quality}
        preload
        className="size-full object-contain object-left"
        onLoad={markReady}
        onError={markReady}
      />
    </div>
  );
}
