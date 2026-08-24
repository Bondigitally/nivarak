'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { AUTH_LOGO } from '@/features/auth/lib/assets';
import { useAuthPreload } from '@/features/auth/components/AuthPreload';
import { roundedElegance } from '@/lib/fonts';
import { typo } from '@/lib/tokens/typography';
import { cn } from '@/lib/utils';

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
      className="flex shrink-0 flex-col items-start gap-0"
      role="img"
      aria-label={AUTH_LOGO.alt}
    >
      <div className="relative h-10 w-auto shrink-0 aspect-1380/803">
        <Image
          src={AUTH_LOGO.src}
          alt=""
          width={AUTH_LOGO.width}
          height={AUTH_LOGO.height}
          sizes="(max-width: 1024px) 28vw, 5.5rem"
          quality={AUTH_LOGO.quality}
          preload
          className="size-full object-contain object-left"
          onLoad={markReady}
          onError={markReady}
        />
      </div>
      <span
        className={cn(
          roundedElegance.className,
          typo.logo,
          'text-2xl leading-8 tracking-[0.08em]',
        )}
        aria-hidden
      >
        nivarak
      </span>
    </div>
  );
}
