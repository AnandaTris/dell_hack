import { z } from "zod";

export const PathwayItemSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  category: z.string(),
  rationale: z.string(),
  urgency: z.enum(["immediate", "short_term", "ongoing"]),
  nextStep: z.string(),
  profileFactors: z.array(z.string()),
  source: z.string(),
});

export const PathwayGroupSchema = z.object({
  groupName: z.string(),
  groupDescription: z.string(),
  items: z.array(PathwayItemSchema),
});

export const PathwaySchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  groups: z.array(PathwayGroupSchema),
  escalationRecommended: z.boolean(),
  escalationReason: z.string().optional(),
  generatedAt: z.string().datetime(),
  confidence: z.enum(["high", "medium", "low"]),
});
