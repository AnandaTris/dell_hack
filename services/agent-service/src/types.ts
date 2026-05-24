export type Mode = "self" | "caregiver";
export type Language = "en" | "zh" | "ms" | "ta";
export type DigitalReadiness = "low" | "medium" | "high";
export type Urgency = "routine" | "urgent" | "critical";
export type Mobility = "independent" | "assisted" | "wheelchair" | "bedbound";

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
  id?: string;
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

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IntakeRequest {
  messages: ConversationMessage[];
  profile: Partial<CareProfile>;
  sessionId: string;
}

export interface NavigateRequest {
  profile: Partial<CareProfile>;
  sessionId: string;
}

export interface HandoverRequest {
  profile: Partial<CareProfile>;
  pathway: { groups: unknown[] };
  sessionId: string;
}

export interface IntakeResponse {
  response: string;
  profileUpdate: Partial<CareProfile>;
  requiresEscalation: boolean;
  escalationReason?: string | undefined;
  safetyFlag?: boolean | undefined;
}
