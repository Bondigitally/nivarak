import {
  BloodPressureIcon,
  Cardiogram02Icon,
  LabsIcon,
  LungsIcon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import {
  vitalIconGradient,
  type VitalIconGradient,
} from "@/lib/tokens/colors";
import type { VitalStatus } from "@/lib/tokens/status-badges";

/** Default sparkline axis labels for the 24h KPI cards. */
export const VITALS_CHART_START = "00.00";
export const VITALS_CHART_END = "24.00";

export type VitalChangeDirection = "up" | "down" | "flat";

export type VitalCardData = {
  id: string;
  icon: IconSvgElement;
  label: string;
  value: string;
  unit: string;
  status: VitalStatus;
  updatedAgo: string;
  sparkline: number[];
  chartStart: string;
  chartEnd: string;
  iconGradient: VitalIconGradient;
  /** Day-over-day delta shown in the card footer (e.g. "+5 mmHg"). */
  change: {
    direction: VitalChangeDirection;
    label: string;
    comparison: string;
  };
  /** Period high / low / average for the sparkline window. */
  stats: {
    high: string;
    low: string;
    avg: string;
  };
};

export const VITALS_SUMMARY: VitalCardData[] = [
  {
    id: "bp",
    icon: BloodPressureIcon,
    label: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    status: "Normal",
    updatedAgo: "3 hours ago",
    chartStart: VITALS_CHART_START,
    chartEnd: VITALS_CHART_END,
    sparkline: [115, 117, 118, 119, 120, 121, 122],
    iconGradient: vitalIconGradient.bp,
    change: {
      direction: "up",
      label: "+5 mmHg",
      comparison: "vs previous day",
    },
    stats: { high: "135/85", low: "110/70", avg: "120/78" },
  },
  {
    id: "hr",
    icon: Cardiogram02Icon,
    label: "Heart Rate",
    value: "57",
    unit: "bpm",
    status: "Low",
    updatedAgo: "2 hours ago",
    chartStart: VITALS_CHART_START,
    chartEnd: VITALS_CHART_END,
    sparkline: [62, 60, 58, 57, 55, 54, 57],
    iconGradient: vitalIconGradient.heartRate,
    change: {
      direction: "down",
      label: "-3 bpm",
      comparison: "vs previous day",
    },
    stats: { high: "62", low: "54", avg: "57" },
  },
  {
    id: "spo2",
    icon: LungsIcon,
    label: "SpO₂",
    value: "98",
    unit: "%",
    status: "Normal",
    updatedAgo: "1 hour ago",
    chartStart: VITALS_CHART_START,
    chartEnd: VITALS_CHART_END,
    sparkline: [97, 98, 98, 98, 99, 98, 98],
    iconGradient: vitalIconGradient.spo2,
    change: {
      direction: "flat",
      label: "0%",
      comparison: "vs previous day",
    },
    stats: { high: "99", low: "97", avg: "98" },
  },
  {
    id: "glucose",
    icon: LabsIcon,
    label: "Blood Glucose",
    value: "102",
    unit: "mg/dL",
    status: "Elevated",
    updatedAgo: "4 hours ago",
    chartStart: VITALS_CHART_START,
    chartEnd: VITALS_CHART_END,
    sparkline: [96, 98, 112, 130, 102, 100, 98],
    iconGradient: vitalIconGradient.bloodGlucose,
    change: {
      direction: "up",
      label: "+8 mg/dL",
      comparison: "vs previous day",
    },
    stats: { high: "130", low: "96", avg: "105" },
  },
  {
    id: "temp",
    icon: TemperatureIcon,
    label: "Temperature",
    value: "36.8",
    unit: "°C",
    status: "Normal",
    updatedAgo: "5 hours ago",
    chartStart: VITALS_CHART_START,
    chartEnd: VITALS_CHART_END,
    sparkline: [36.6, 36.7, 36.8, 36.8, 36.7, 36.9, 36.8],
    iconGradient: vitalIconGradient.temperature,
    change: {
      direction: "flat",
      label: "0°C",
      comparison: "vs previous day",
    },
    stats: { high: "36.9", low: "36.6", avg: "36.8" },
  },
];
