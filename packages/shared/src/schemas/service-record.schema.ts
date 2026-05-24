import { z } from "zod";

export const ServiceCategorySchema = z.enum([
  "home_based",
  "centre_based",
  "financial",
  "linkage",
]);

export const ServiceRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: ServiceCategorySchema,
  subcategory: z.string(),
  description: z.string(),
  eligibility: z.string(),
  costGuide: z.string(),
  howToAccess: z.string(),
  providerType: z.string(),
  transitionRelevance: z.boolean(),
  source: z.string(),
  contactInfo: z.string().optional(),
  keywords: z.array(z.string()),
});
