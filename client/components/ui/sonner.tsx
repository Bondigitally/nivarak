"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import {
  Alert02Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function ToastIcon({
  icon,
  className,
}: {
  icon: typeof CheckmarkCircle02Icon;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={BADGE_ICON_SIZE}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth
      className={className}
    />
  );
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      icons={{
        success: (
          <ToastIcon
            icon={CheckmarkCircle02Icon}
            className="h-4 w-4 text-success"
          />
        ),
        info: (
          <ToastIcon
            icon={InformationCircleIcon}
            className="h-4 w-4 text-info"
          />
        ),
        warning: (
          <ToastIcon icon={Alert02Icon} className="h-4 w-4 text-warning" />
        ),
        error: (
          <ToastIcon
            icon={CancelCircleIcon}
            className="h-4 w-4 text-destructive"
          />
        ),
        loading: (
          <ToastIcon
            icon={Loading03Icon}
            className="h-4 w-4 animate-spin text-muted-foreground"
          />
        ),
      }}
      {...props}
    />
  );
};

export { Toaster };
