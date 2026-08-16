import { z } from 'zod';
import { RED_FLAGS } from './ias-calculator.js';

const iasItemScore = z.number().int().min(0).max(2);

const iasParametersSchema = z.object({
  bathing: iasItemScore,
  dressing: iasItemScore,
  toileting: iasItemScore,
  feeding: iasItemScore,
  phone_communication: iasItemScore,
  daily_home_tasks: iasItemScore,
  simple_purchases: iasItemScore,
  organizing_essentials: iasItemScore,
  moving_inside_house: iasItemScore,
  getting_up: iasItemScore,
  walking_outside: iasItemScore,
  falls_6_months: iasItemScore,
  remembering_routine: iasItemScore,
  understanding_instructions: iasItemScore,
  safe_decisions: iasItemScore,
  taking_medicines: iasItemScore,
  understanding_health: iasItemScore,
  following_appointments: iasItemScore,
  eating_drinking: iasItemScore,
  weight_appetite: iasItemScore,
  bladder_bowel: iasItemScore,
  communicating_needs: iasItemScore,
  social_contact: iasItemScore,
  emergency_help: iasItemScore,
});

const redFlagsSchema = z.array(z.enum(RED_FLAGS)).default([]);

export const submitIASSchema = z.object({
  proxyRelationship: z.enum(['son', 'daughter', 'spouse', 'sibling', 'other_family']),
  proxyProximity: z.enum(['same_city', 'different_city', 'different_country']),
  visitFrequency: z.enum(['daily', 'several_times_week', 'weekly', 'less_than_weekly', 'phone_video_only']),
  parentAge: z.number().int().min(40).max(120),
  livingSituation: z.enum(['alone', 'with_spouse', 'with_family', 'with_caregiver', 'other']),
  livingSituationOther: z.string().max(100).optional(),
  parameters: iasParametersSchema,
  redFlags: redFlagsSchema,
  encounterId: z.string().uuid().optional(),
  pathwayOverride: z.string().optional(),
  overrideReason: z.string().optional(),
});

export const dryRunSchema = z.object({
  parameters: iasParametersSchema,
  redFlags: redFlagsSchema,
});

export type SubmitIASInput = z.infer<typeof submitIASSchema>;
