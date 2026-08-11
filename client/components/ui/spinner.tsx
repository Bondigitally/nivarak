import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  /** Accessible label — defaults to "Loading" */
  label?: string;
}

/** Default monochrome ring spinner */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block size-8 shrink-0 animate-spin rounded-full',
        'border-2 border-neutral-300 border-t-neutral-800',
        className,
      )}
    />
  );
}
