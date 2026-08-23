import { authType } from '@/lib/auth/typography';

interface OrDividerProps {
  children?: React.ReactNode;
}

export function OrDivider({ children }: OrDividerProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className={`${authType.caption} uppercase tracking-[0.06em]`}>OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}
