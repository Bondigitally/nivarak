"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { EnergyIcon } from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardIconButton } from "./DashboardIconButton";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export function HomeGreeting({
  name,
  subtitle,
}: {
  name: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className={typo.headingXxl}>Good Morning, {name}</h1>
        <p className={typo.bodyL}>{subtitle}</p>
      </div>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DashboardIconButton
              type="button"
              aria-label="Quick menu"
              className="text-primary"
            >
              <HugeiconsIcon
                icon={EnergyIcon}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color="currentColor"
              absoluteStrokeWidth />
            </DashboardIconButton>
          </TooltipTrigger>
          <TooltipContent side="bottom">Quick menu</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
