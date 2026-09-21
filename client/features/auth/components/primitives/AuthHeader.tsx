import type { ReactNode } from 'react';
import { typo } from '@/lib/tokens/typography';
import { cn } from '@/lib/utils';

interface AuthHeaderProps {
  title: string;
  subtitle: ReactNode;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <h1 className={cn(typo.headingXxl, 'text-auth-title text-foreground')}>
        {title}
      </h1>
      <p className={cn(typo.bodyL, 'text-muted-foreground')}>{subtitle}</p>
    </div>
  );
}
