/**
 * IAS-P v2.0 — Independent Ageing Score (pure calculation).
 * No I/O. Safe to import from tests and the scoring service.
 */

export interface IASDomain {
  key: string;
  label: string;
  parameters: string[];
}

export const IAS_DOMAINS: IASDomain[] = [
  {
    key: 'basic_self_care',
    label: 'Section A — Basic Self-Care',
    parameters: ['bathing', 'dressing', 'toileting', 'feeding'],
  },
  {
    key: 'daily_life_function',
    label: 'Section B — Daily Life Function',
    parameters: ['phone_communication', 'daily_home_tasks', 'simple_purchases', 'organizing_essentials'],
  },
  {
    key: 'mobility',
    label: 'Section C — Mobility',
    parameters: ['moving_inside_house', 'getting_up', 'walking_outside', 'falls_6_months'],
  },
  {
    key: 'thinking_decision',
    label: 'Section D — Thinking & Decision-Making',
    parameters: ['remembering_routine', 'understanding_instructions', 'safe_decisions'],
  },
  {
    key: 'health_management',
    label: 'Section E — Health Management',
    parameters: ['taking_medicines', 'understanding_health', 'following_appointments'],
  },
  {
    key: 'nutrition_continence',
    label: 'Section F — Nutrition & Continence',
    parameters: ['eating_drinking', 'weight_appetite', 'bladder_bowel'],
  },
  {
    key: 'social_function',
    label: 'Section G — Social Function',
    parameters: ['communicating_needs', 'social_contact'],
  },
  {
    key: 'safety_support',
    label: 'Section H — Safety & Support',
    parameters: ['emergency_help'],
  },
];

export const ALL_IAS_PARAMETERS = IAS_DOMAINS.flatMap((d) => d.parameters);

export const RED_FLAGS = [
  'two_or_more_falls',
  'missed_incorrect_medicines',
  'unsafe_decisions',
  'significant_weight_loss',
  'social_isolation',
  'recurrent_hospital_admissions',
  'caregiver_struggling',
  'no_emergency_response',
] as const;

export type RedFlag = (typeof RED_FLAGS)[number];

export function calculateIASBand(iasPercentage: number): { riskBand: string; recommendedPathway: string } {
  if (iasPercentage >= 85) return { riskBand: 'strong_independent', recommendedPathway: 'home_care' };
  if (iasPercentage >= 70) return { riskBand: 'independent_vulnerable', recommendedPathway: 'home_care' };
  if (iasPercentage >= 55) return { riskBand: 'supported_independence', recommendedPathway: 'hybrid' };
  if (iasPercentage >= 40) return { riskBand: 'limited_independence', recommendedPathway: 'clinic' };
  return { riskBand: 'high_dependence', recommendedPathway: 'high_dependency' };
}

export function evaluateRedFlagUrgency(flagCount: number): string {
  if (flagCount === 0) return 'routine_monitoring';
  if (flagCount <= 2) return 'review_needed';
  return 'urgent_care_planning';
}

export interface IASDomainScore {
  raw: number;
  max: number;
  percentage: number;
}

export interface IASResult {
  rawScore: number;
  maxScore: number;
  iasPercentage: number;
  domainScores: Record<string, IASDomainScore>;
  riskBand: string;
  recommendedPathway: string;
}

export function calculateIAS(parameters: Record<string, number>): IASResult {
  const domainScores: Record<string, IASDomainScore> = {};
  let totalRaw = 0;

  for (const domain of IAS_DOMAINS) {
    let domainSum = 0;
    for (const param of domain.parameters) {
      const val = parameters[param];
      if (val !== undefined && val !== null) {
        domainSum += Math.min(Math.max(val, 0), 2);
      }
    }
    const domainMax = domain.parameters.length * 2;
    domainScores[domain.key] = {
      raw: domainSum,
      max: domainMax,
      percentage: domainMax > 0 ? Math.round((domainSum / domainMax) * 100) : 0,
    };
    totalRaw += domainSum;
  }

  const maxScore = 48;
  const iasPercentage = Math.round((totalRaw / maxScore) * 100 * 100) / 100;
  const { riskBand, recommendedPathway } = calculateIASBand(iasPercentage);

  return { rawScore: totalRaw, maxScore, iasPercentage, domainScores, riskBand, recommendedPathway };
}
