import { z } from "zod";

export const CareBriefStatusSchema = z.enum([
  "pending",
  "accepted",
  "in_progress",
  "resolved",
]);

export const CareBriefSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  pathwayId: z.string().uuid(),
  summary: z.string(),
  seniorDetails: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    situation: z.string(),
  }),
  keyNeeds: z.array(z.string()),
  recommendedServices: z.array(z.string()),
  urgencyLevel: z.enum(["routine", "urgent", "critical"]),
  caregiverInfo: z.string().optional(),
  financialConsiderations: z.string().optional(),
  recentTransition: z.string().optional(),
  handoverNotes: z.string(),
  generatedAt: z.string().datetime(),
  status: CareBriefStatusSchema,
  callbackTime: z.string().optional(),
  coordinatorNotes: z.string().optional(),
});
