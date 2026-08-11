import { authType } from '@/lib/auth/typography';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className={authType.headingXxl}>{title}</h1>
      <p className={authType.bodyL}>{subtitle}</p>
    </div>
  );
}
