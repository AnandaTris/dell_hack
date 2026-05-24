import { z } from "zod";

export const DigitalReadinessSchema = z.enum(["low", "medium", "high"]);
export const ModeSchema = z.enum(["self", "caregiver"]);
export const LanguageSchema = z.enum(["en", "zh", "ms", "ta"]);
export const UrgencySchema = z.enum(["routine", "urgent", "critical"]);
export const MobilitySchema = z.enum([
  "independent",
  "assisted",
  "wheelchair",
  "bedbound",
]);
export const CognitiveStatusSchema = z.enum([
  "intact",
  "mild_decline",
  "moderate_dementia",
  "severe_dementia",
]);
export const StressLevelSchema = z.enum(["low", "medium", "high"]);
export const CitizenshipSchema = z.enum(["citizen", "pr", "foreigner"]);
export const IncomeSchema = z.enum(["low", "medium", "high"]);

export const SeniorInfoSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().min(0).max(120).optional(),
  livingArrangement: z
    .enum(["alone", "with_family", "with_caregiver", "other"])
    .optional(),
  primaryLanguage: z.string().optional(),
  nationality: z.string().optional(),
});

export const CareNeedsSchema = z.object({
  mobility: MobilitySchema.optional(),
  cognitiveStatus: CognitiveStatusSchema.optional(),
  chronicConditions: z.array(z.string()).optional(),
  recentHospitalDischarge: z.boolean().optional(),
  dischargeDate: z.string().optional(),
  primaryDiagnosis: z.string().optional(),
  adlSupport: z.array(z.string()).optional(),
});

export const CaregiverContextSchema = z.object({
  hasCaregiver: z.boolean(),
  caregiverRelationship: z.string().optional(),
  caregiverAvailability: z.string().optional(),
  caregiverStressLevel: StressLevelSchema.optional(),
});

export const FinancialInfoSchema = z.object({
  citizenshipStatus: CitizenshipSchema.optional(),
  pioneerGeneration: z.boolean().optional(),
  merdekGeneration: z.boolean().optional(),
  estimatedIncome: IncomeSchema.optional(),
  hasActiveCareShield: z.boolean().optional(),
});

export const TransitionFlagsSchema = z.object({
  recentHospitalDischarge: z.boolean(),
  careTransitionNeeded: z.boolean(),
  urgency: UrgencySchema.optional(),
});

export const CareProfileSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string(),
  mode: ModeSchema,
  language: LanguageSchema,
  digitalReadiness: DigitalReadinessSchema,
  senior: SeniorInfoSchema,
  careNeeds: CareNeedsSchema,
  functionalLimitations: z.array(z.string()).optional(),
  caregiverContext: CaregiverContextSchema.optional(),
  financial: FinancialInfoSchema.optional(),
  transitionFlags: TransitionFlagsSchema,
  updatedAt: z.string().datetime(),
  completeness: z.number().min(0).max(100),
});

export const CreateCareProfileSchema = CareProfileSchema.omit({
  id: true,
  updatedAt: true,
  completeness: true,
}).partial({
  transitionFlags: true,
});
