import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className={cn(typo.headingXl, "leading-[30px]")}>{title}</h1>
      <p className={typo.bodyM}>{subtitle}</p>
    </div>
  );
}
