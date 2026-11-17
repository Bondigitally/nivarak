"use client";

import { Toaster as Sonner } from "sonner";
import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  SpamIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";

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
      size={ICON_SIZE}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth
      className={cn("size-5 shrink-0", className)}
    />
  );
}

/** Figma toast banners — height matches Review Mode control (`h-11`). */
const toastShell = cn(
  "group toast pointer-events-auto !box-border !flex !h-11 !min-h-11 !w-(--width) !max-w-(--width) !items-center !gap-3",
  "!rounded-md !border !border-solid !px-[17px] !py-0 !pr-11",
  "!shadow-[0_1px_2px_0_rgba(17,24,39,0.04)]",
  "font-sans text-sm font-medium leading-5",
);

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      expand
      visibleToasts={5}
      gap={12}
      offset={20}
      mobileOffset={16}
      style={
        {
          "--width": "min(71rem, calc(100vw - 2rem))",
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "0.5rem",
          "--toast-close-button-transform": "translateY(-50%)",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 4200,
        classNames: {
          toast: cn(
            toastShell,
            "group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border",
          ),
          title:
            "whitespace-normal break-words text-sm font-medium leading-5",
          description:
            "mt-0.5 whitespace-normal break-words text-xs font-normal leading-4 opacity-90",
          content: "min-w-0 flex-1 overflow-visible",
          icon: "!mt-0 !flex !size-5 shrink-0 !items-center !justify-center",
          closeButton: cn(
            "!absolute !right-1.5 !top-1/2 !left-auto !z-10",
            "!flex !size-8 !items-center !justify-center !rounded-full",
            "!border-0 !bg-transparent !p-0 !shadow-none",
            "!text-current",
            "hover:!bg-black/5",
            "focus-visible:!ring-2 focus-visible:!ring-current/30",
            "transition-colors",
          ),
          actionButton: cn(
            "!h-8 !shrink-0 !rounded-full !border !border-current !bg-transparent",
            "!px-3.5 !text-[13.5px] !font-semibold !leading-5 !text-current !shadow-none",
            "hover:!bg-black/5",
          ),
          cancelButton: cn(
            "!h-8 !rounded-full !bg-transparent !px-3 !text-[13.5px] !font-medium !text-current",
            "hover:!bg-black/5",
          ),
          success: cn(
            "!border-[#a7f3d0]",
            "![background-image:linear-gradient(175deg,#ecfdf5_13%,#ffffff_87%)]",
            "!text-success",
            "[&_[data-title]]:!text-success [&_[data-description]]:!text-success/80 [&_[data-icon]]:!text-success",
          ),
          error: cn(
            "!border-[#fecaca]",
            "![background-image:linear-gradient(175deg,#ffe1e1_13%,#ffffff_87%)]",
            "!text-[#dc2626]",
            "[&_[data-title]]:!text-[#dc2626] [&_[data-description]]:!text-[#dc2626]/80 [&_[data-icon]]:!text-[#dc2626]",
          ),
          warning: cn(
            "!border-[#f0e2aa]",
            "![background-image:linear-gradient(175deg,#fff8e1_13%,#ffffff_87%)]",
            "!text-[#92400e]",
            "[&_[data-title]]:!text-[#92400e] [&_[data-description]]:!text-[#92400e]/80 [&_[data-icon]]:!text-[#92400e]",
          ),
          info: cn(
            "!border-[#bfdbfe]",
            "![background-image:linear-gradient(175deg,#e1eeff_13%,#ffffff_87%)]",
            "!text-[#2563eb]",
            "[&_[data-title]]:!text-[#2563eb] [&_[data-description]]:!text-[#2563eb]/80 [&_[data-icon]]:!text-[#2563eb]",
          ),
        },
      }}
      icons={{
        success: (
          <ToastIcon icon={CheckmarkCircle02Icon} className="text-success" />
        ),
        info: (
          <ToastIcon icon={InformationCircleIcon} className="text-[#2563eb]" />
        ),
        warning: <ToastIcon icon={Alert02Icon} className="text-[#92400e]" />,
        error: <ToastIcon icon={SpamIcon} className="text-[#dc2626]" />,
        loading: (
          <ToastIcon
            icon={Loading03Icon}
            className="animate-spin text-muted-foreground"
          />
        ),
        close: (
          <ToastIcon icon={Cancel01Icon} className="size-5 text-current" />
        ),
      }}
      {...props}
    />
  );
};

export { Toaster };
