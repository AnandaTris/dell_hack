export * from "./schemas/index.js";

import type { z } from "zod";
import type {
  CareProfileSchema,
  ServiceRecordSchema,
  PathwaySchema,
  PathwayItemSchema,
  PathwayGroupSchema,
  CareBriefSchema,
} from "./schemas/index.js";

export type CareProfile = z.infer<typeof CareProfileSchema>;
export type ServiceRecord = z.infer<typeof ServiceRecordSchema>;
export type Pathway = z.infer<typeof PathwaySchema>;
export type PathwayItem = z.infer<typeof PathwayItemSchema>;
export type PathwayGroup = z.infer<typeof PathwayGroupSchema>;
export type CareBrief = z.infer<typeof CareBriefSchema>;
