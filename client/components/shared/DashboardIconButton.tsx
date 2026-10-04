import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-shadow duration-150 active:shadow-none",
        className,
      )}
      {...props}
    />
  );
}
