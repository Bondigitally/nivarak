import { cn } from '@/lib/utils';
import { authType } from '@/lib/auth/typography';

interface RoleBadgeProps {
  children: string;
  className?: string;
}

export function RoleBadge({ children, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit items-center rounded-full bg-[#F2EBF9] px-2 py-0.5 text-primary',
        authType.badge,
        className,
      )}
    >
      {children}
    </span>
  );
}
