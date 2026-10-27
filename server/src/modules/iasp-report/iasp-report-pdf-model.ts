import type { IaspAboutYouValues } from "./data/iasp-about-you-data.js";
import { getIaspLivingSituationDisplay } from "./data/iasp-about-you-data.js";
import type { IaspAnswerId } from "./data/iasp-questionnaire-data.js";
import type { IaspRedFlagId } from "./data/iasp-red-flags-data.js";
import {
  IASP_DOMAIN_REPORT_LABELS,
  IASP_RED_FLAG_GUIDANCE,
  buildAssessorGuidance,
  buildIaspScoreReport,
  getDomainBarLevel,
  type IaspScoreReportBlock,
} from "./data/iasp-report-content.js";
import {
  IASP_MAX_SCORE,
  calculateIaspPercentage,
  calculateIaspRawScore,
  formatIaspAssessmentDate,
  getIaspBand,
  getIaspSectionBreakdown,
  getSelectedRedFlagOptions,
} from "./data/iasp-scoring.js";

export type IaspReportPdfInput = {
  answers: Record<string, IaspAnswerId | undefined>;
  redFlags: readonly IaspRedFlagId[];
  aboutYou: IaspAboutYouValues;
  fullName?: string | null;
  completedAt?: string | null;
  rawScore?: number | null;
  maxScore?: number | null;
  iasPercentage?: number | null;
};

export function cleanReportCopy(text: string): string {
  return text
    // Keep comma with the following word so lines never start with ",".
    .replace(/\s*\u2014\s*/g, ",\u00A0")
    .replace(/\u2013/g, "-")
    .replace(/,\s+,/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function partitionBlocks(blocks: readonly IaspScoreReportBlock[]) {
  let insight: string | null = null;
  const focusLists: string[][] = [];
  let recommends: string[] = [];
  let action: Extract<IaspScoreReportBlock, { type: "action" }> | null = null;

  for (const block of blocks) {
    const heading = block.heading.toLowerCase();
    if (block.type === "text" && heading.includes("what the score")) {
      insight = block.body;
    } else if (block.type === "list") {
      if (heading.includes("nivarak recommend")) {
        recommends = [...block.items];
      } else {
        focusLists.push([...block.items]);
      }
    } else if (block.type === "action") {
      action = block;
    }
  }

  return {
    insight,
    focusItems: focusLists.flat(),
    recommends,
    action,
  };
}

export type IaspReportPdfModel = {
  percentage: number;
  rawScore: number;
  maxScore: number;
  bandLabel: string;
  patientName: string;
  age: string;
  relationship: string;
  location: string;
  assessedOn: string;
  livingLine: string | null;
  visitLine: string | null;
  headline: string;
  subheadline: string;
  insight: string | null;
  focusItems: string[];
  recommends: string[];
  action: {
    heading: string;
    body: string;
    actionLabel: string;
    actionUrl: string;
  } | null;
  domains: {
    id: string;
    label: string;
    raw: number;
    max: number;
    percentage: number;
    level: ReturnType<typeof getDomainBarLevel>;
  }[];
  flags: { id: string; label: string; guidance: string }[];
};

export function buildIaspReportPdfModel(input: IaspReportPdfInput): IaspReportPdfModel {
  const rawScore = input.rawScore ?? calculateIaspRawScore(input.answers);
  const maxScore = input.maxScore ?? IASP_MAX_SCORE;
  const percentage =
    input.iasPercentage != null
      ? Math.round(input.iasPercentage)
      : calculateIaspPercentage(rawScore);
  const band = getIaspBand(percentage);
  const scoreReport = buildIaspScoreReport({
    percentage,
    aboutYou: input.aboutYou,
    completedAt: input.completedAt,
  });
  const { insight, focusItems, recommends, action } = partitionBlocks(
    scoreReport.blocks,
  );
  const sections = getIaspSectionBreakdown(input.answers);
  const selectedFlags = getSelectedRedFlagOptions(input.redFlags);
  const assessedOn = formatIaspAssessmentDate(
    input.completedAt ? new Date(input.completedAt) : undefined,
  );
  const living = getIaspLivingSituationDisplay(input.aboutYou);

  return {
    percentage,
    rawScore,
    maxScore,
    bandLabel: cleanReportCopy(band.label),
    patientName: input.fullName?.trim() || "Your parent",
    age: input.aboutYou.age?.trim() || "n/a",
    relationship:
      input.aboutYou.relationship?.replace(/\s*\/\s*/g, "/").toLowerCase() ||
      "family member",
    location: input.aboutYou.location?.trim() || "Location not specified",
    assessedOn,
    livingLine: living
      ? `Lives ${living === "Alone" ? "alone" : living.toLowerCase()}`
      : null,
    visitLine: input.aboutYou.visitFrequency
      ? `Visits ${input.aboutYou.visitFrequency.toLowerCase()}`
      : null,
    headline: cleanReportCopy(scoreReport.headline),
    subheadline: cleanReportCopy(scoreReport.subheadline),
    insight: insight ? cleanReportCopy(insight) : null,
    focusItems: focusItems.map(cleanReportCopy),
    recommends: recommends.map(cleanReportCopy),
    action: action
      ? {
          heading: cleanReportCopy(action.heading),
          body: cleanReportCopy(action.body),
          actionLabel: action.actionLabel,
          actionUrl: action.actionUrl,
        }
      : null,
    domains: sections.map((section) => ({
      id: section.id,
      label: IASP_DOMAIN_REPORT_LABELS[section.id] ?? section.title,
      raw: section.raw,
      max: section.max,
      percentage: section.percentage,
      level: getDomainBarLevel(section.percentage),
    })),
    flags: selectedFlags.map((flag) => ({
      id: flag.id,
      label: cleanReportCopy(flag.label),
      guidance: cleanReportCopy(IASP_RED_FLAG_GUIDANCE[flag.id]),
    })),
  };
}

export function buildAssessorGuidanceCopy(
  model: Pick<IaspReportPdfModel, "percentage" | "bandLabel" | "flags">,
): string {
  return cleanReportCopy(
    buildAssessorGuidance({
      percentage: model.percentage,
      bandLabel: model.bandLabel,
      redFlagIds: model.flags.map((f) => f.id as IaspRedFlagId),
    }),
  );
}
