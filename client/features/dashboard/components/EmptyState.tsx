"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { ICON_STROKE, INFO_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedArrowIcon } from "./AnimatedArrowIcon";

export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  className,
}: {
  icon: IconSvgElement;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-1 flex-col items-center justify-center gap-3 px-5 py-6",
        className,
      )}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-sidebar-accent text-primary">
        <HugeiconsIcon icon={icon} size={32} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
      </span>
      <div className="flex max-w-dash-search flex-col items-center gap-1.5 text-center">
        <h3 className={cn(typo.headingL, "text-foreground")}>{title}</h3>
        <p className={typo.bodyM}>{body}</p>
      </div>
      {actionLabel ? (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function SectionInfoButton({ info }: { info: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Section info"
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-xs leading-none text-info outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-info/40"
          >
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={INFO_ICON_SIZE}
              strokeWidth={ICON_STROKE}
              absoluteStrokeWidth
              color="currentColor"
              className="block size-4"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-60 rounded-md px-3 py-2 text-left text-xs font-normal leading-snug whitespace-normal"
        >
          {info}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SectionTitle({
  children,
  info,
  className,
}: {
  children: ReactNode;
  info?: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        typo.headingXl,
        "flex min-w-0 flex-1 items-center gap-2 pr-2",
        className,
      )}
    >
      <span className="min-w-0 leading-[inherit]">{children}</span>
      {info ? <SectionInfoButton info={info} /> : null}
    </h2>
  );
}

export function ViewAllLink({ href }: { href?: string }) {
  const [hovered, setHovered] = useState(false);

  const className =
    "inline-flex h-7 shrink-0 items-center justify-end whitespace-nowrap text-primary";
  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };

  const content = (
    <span className={cn(typo.button, "inline-flex items-center gap-1 leading-5")}>
      <span className="border-b border-primary pb-0.5">View All</span>
      <AnimatedArrowIcon size={14} className="size-3.5" hovered={hovered} />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={className} {...hoverHandlers}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} {...hoverHandlers}>
      {content}
    </button>
  );
}
