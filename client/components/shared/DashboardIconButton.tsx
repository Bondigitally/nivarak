import { Button, type ButtonProps } from "@/components/ui/button";
import { cardShadowClass } from "@/lib/tokens/elevation";
import { cn } from "@/lib/utils";

export function DashboardIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        cardShadowClass,
        "transition-shadow duration-150 active:shadow-none",
        className,
      )}
      {...props}
    />
  );
}
