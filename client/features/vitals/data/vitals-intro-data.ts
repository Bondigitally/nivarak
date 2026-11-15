import type { VitalMetricId } from "@/features/vitals/components/VitalsSummaryCards";

export type VitalIntroContent = {
  id: VitalMetricId;
  title: string;
  subtitle: string;
  /** Local public path — Figma anatomy illustration for this vital. */
  imageSrc: string;
  /** Figma node id on Doctor Module page. */
  figmaNodeId: string;
};

/**
 * Vitals intro copy + anatomy art keyed by metric id.
 * Figma nodes: BP (`2455:2442`), SpO₂ (`2455:2455`), Blood Glucose (`2455:2468`),
 * Temperature (`2455:2481`), Heart Rate (`2455:2508`).
 */
export const VITALS_INTRO: Record<VitalMetricId, VitalIntroContent> = {
  bp: {
    id: "bp",
    title: "Blood Pressure",
    subtitle:
      "Measures the force of blood against artery walls, helping assess cardiovascular health.",
    imageSrc: "/images/vitals/bp-anatomy.png",
    figmaNodeId: "2455:2442",
  },
  spo2: {
    id: "spo2",
    title: "SpO₂",
    subtitle:
      "Measures blood oxygen saturation to assess how effectively oxygen is being carried to body.",
    imageSrc: "/images/vitals/spo2-anatomy.png",
    figmaNodeId: "2455:2455",
  },
  glucose: {
    id: "glucose",
    title: "Blood Glucose",
    subtitle:
      "Measures blood sugar levels to monitor glucose regulation and metabolic health.",
    imageSrc: "/images/vitals/glucose-anatomy.png",
    figmaNodeId: "2455:2468",
  },
  temp: {
    id: "temp",
    title: "Temperature",
    subtitle:
      "Measures body temperature to help identify fever and changes in thermal regulation.",
    imageSrc: "/images/vitals/temp-anatomy.png",
    figmaNodeId: "2455:2481",
  },
  hr: {
    id: "hr",
    title: "Heart Rate",
    subtitle:
      "Tracks the number of heartbeats per minute to monitor heart function and rhythm.",
    imageSrc: "/images/vitals/heart-anatomy.png",
    figmaNodeId: "2455:2508",
  },
};

export function getVitalIntro(id: VitalMetricId): VitalIntroContent {
  return VITALS_INTRO[id];
}
