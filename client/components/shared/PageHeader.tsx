import { typo } from "@/lib/tokens/typography";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className={typo.headingXxl}>{title}</h1>
      <p className={typo.bodyL}>{subtitle}</p>
    </div>
  );
}
