"use client";

import {
  BloodPressureIcon,
  Cardiogram02Icon,
  LabsIcon,
  LungsIcon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type VitalStatus = "Normal" | "Low" | "Elevated";

interface VitalCardData {
  id: string;
  iconBg: string;
  iconColor: string;
  icon: IconSvgElement;
  label: string;
  value: string;
  unit: string;
  status: VitalStatus;
  unitColor?: string;
}

const statusConfig: Record<
  VitalStatus,
  { pillBg: string; pillText: string; dot: string }
> = {
  Normal: {
    pillBg: "bg-success-muted",
    pillText: "text-success",
    dot: "bg-success",
  },
  Low: {
    pillBg: "bg-warning-muted",
    pillText: "text-warning",
    dot: "bg-warning",
  },
  Elevated: {
    pillBg: "bg-destructive-muted",
    pillText: "text-destructive",
    dot: "bg-destructive",
  },
};

const VITALS: VitalCardData[] = [
  {
    id: "bp",
    iconBg: "bg-destructive-muted",
    iconColor: "var(--destructive)",
    icon: BloodPressureIcon,
    label: "BP",
    value: "120/80",
    unit: "mmHg",
    status: "Normal",
  },
  {
    id: "hr",
    iconBg: "bg-sidebar-accent",
    iconColor: "var(--chart-4)",
    icon: Cardiogram02Icon,
    label: "Heart Rate",
    value: "57",
    unit: "bpm",
    status: "Low",
  },
  {
    id: "glucose",
    iconBg: "bg-info-muted",
    iconColor: "var(--chart-6)",
    icon: LabsIcon,
    label: "Blood Glucose",
    value: "126",
    unit: "mg/dL",
    status: "Elevated",
  },
  {
    id: "spo2",
    iconBg: "bg-info-muted",
    iconColor: "var(--info)",
    icon: LungsIcon,
    label: "SpO₂",
    value: "98",
    unit: "%",
    status: "Normal",
  },
  {
    id: "temp",
    iconBg: "bg-warning-muted",
    iconColor: "var(--chart-7)",
    icon: TemperatureIcon,
    label: "Temp",
    value: "36.8",
    unit: "°C",
    status: "Normal",
    unitColor: "text-muted-foreground",
  },
];

function VitalCard({ vital }: { vital: VitalCardData }) {
  const { pillBg, pillText, dot } = statusConfig[vital.status];

  return (
    <div
      className="flex h-full min-h-38 w-full flex-col items-start justify-between gap-4 rounded-[14px] bg-card px-5 py-3"
      style={{ outline: "1px solid var(--border)", outlineOffset: "-1px" }}
    >
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
          <div className="pr-1 justify-start items-center gap-2 inline-flex">
            <div
              className={cn(
                "p-2.5 overflow-hidden rounded-[14px] flex flex-col justify-start items-start gap-2.5",
                vital.iconBg
              )}
            >
              <HugeiconsIcon
                icon={vital.icon}
                size={19}
                strokeWidth={1.75}
                color={vital.iconColor}
              />
            </div>
            <div className="text-muted-foreground text-base font-semibold leading-6 font-sans">
              {vital.label}
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="justify-start items-center gap-2.5 inline-flex">
            <div className="text-foreground text-[22px] font-bold leading-7 font-sans">
              {vital.value}
            </div>
            <div
              className={cn(
                "text-sm font-normal leading-5 font-sans",
                vital.unitColor || "text-foreground"
              )}
            >
              {vital.unit}
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch h-px bg-divider" />
      <div className="self-stretch flex-1 flex justify-between items-center">
        <div
          className={cn(
            "pl-2.5 pr-2.5 py-1 rounded-[9999px] justify-start items-center gap-1 flex",
            pillBg
          )}
        >
          <div className={cn("w-1.5 h-1.5 rounded-[9999px]", dot)} />
          <div
            className={cn(
              "text-xs font-semibold leading-4 font-sans",
              pillText
            )}
          >
            {vital.status}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VitalsSummaryCards() {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
      {VITALS.map((vital) => (
        <VitalCard key={vital.id} vital={vital} />
      ))}
    </div>
  );
}
