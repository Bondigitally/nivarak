import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  /** Accessible label — defaults to "Loading" */
  label?: string;
}

/** Brand ring spinner — used for full-page / route loaders */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block size-8 shrink-0 animate-spin rounded-full',
        'border-2 border-primary/20 border-t-primary',
        className,
      )}
    />
  );
}
