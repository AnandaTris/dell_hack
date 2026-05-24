export type Mode = "self" | "caregiver";
export type Language = "en" | "zh" | "ms" | "ta";
export type DigitalReadiness = "low" | "medium" | "high";
export type Urgency = "routine" | "urgent" | "critical";
export type Mobility = "independent" | "assisted" | "wheelchair" | "bedbound";
export type AppStage =
  | "landing"
  | "chatting"
  | "pathway"
  | "escalation"
  | "handover";

export interface SeniorInfo {
  name?: string;
  age?: number;
  livingArrangement?: "alone" | "with_family" | "with_caregiver" | "other";
  primaryLanguage?: string;
}

export interface CareNeeds {
  mobility?: Mobility;
  chronicConditions?: string[];
  recentHospitalDischarge?: boolean;
  dischargeDate?: string;
  primaryDiagnosis?: string;
  adlSupport?: string[];
}

export interface CaregiverContext {
  hasCaregiver: boolean;
  caregiverRelationship?: string;
  caregiverStressLevel?: "low" | "medium" | "high";
}

export interface FinancialInfo {
  citizenshipStatus?: "citizen" | "pr" | "foreigner";
  pioneerGeneration?: boolean;
  estimatedIncome?: "low" | "medium" | "high";
}

export interface TransitionFlags {
  recentHospitalDischarge: boolean;
  careTransitionNeeded: boolean;
  urgency?: Urgency;
}

export interface CareProfile {
  id: string;
  sessionId: string;
  mode: Mode;
  language: Language;
  digitalReadiness: DigitalReadiness;
  senior: SeniorInfo;
  careNeeds: CareNeeds;
  functionalLimitations?: string[];
  caregiverContext?: CaregiverContext;
  financial?: FinancialInfo;
  transitionFlags: TransitionFlags;
  updatedAt: string;
  completeness: number;
}

export interface PathwayItem {
  serviceId: string;
  serviceName: string;
  category: string;
  rationale: string;
  urgency: "immediate" | "short_term" | "ongoing";
  nextStep: string;
  profileFactors: string[];
  source: string;
}

export interface PathwayGroup {
  groupName: string;
  groupDescription: string;
  items: PathwayItem[];
}

export interface Pathway {
  id: string;
  profileId: string;
  groups: PathwayGroup[];
  escalationRecommended: boolean;
  escalationReason?: string;
  generatedAt: string;
  confidence: "high" | "medium" | "low";
}

export interface CareBrief {
  id: string;
  profileId: string;
  pathwayId: string;
  summary: string;
  seniorDetails: {
    name?: string;
    age?: number;
    situation: string;
  };
  keyNeeds: string[];
  recommendedServices: string[];
  urgencyLevel: "routine" | "urgent" | "critical";
  caregiverInfo?: string;
  financialConsiderations?: string;
  recentTransition?: string;
  handoverNotes: string;
  generatedAt: string;
  status: "pending" | "accepted" | "in_progress" | "resolved";
  callbackTime?: string;
  coordinatorNotes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  profileUpdate?: Partial<CareProfile>;
  timestamp: Date;
  triggerStage?: AppStage;
}
