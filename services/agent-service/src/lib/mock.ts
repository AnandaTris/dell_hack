import type { CareProfile, IntakeResponse } from "../types.js";

const MOCK_TURNS = [
  {
    response:
      "I hear you — a hospital discharge after a fall is one of the most stressful moments for a family. You've done the right thing by reaching out early.\n\nTo help me understand Mdm Tan's situation:\n- **Does she live alone**, or is there family at home?\n- **Is she able to move around on her own**, or does she need help getting around?",
    profileUpdate: {
      senior: { name: "Mdm Tan", age: 78 },
      careNeeds: { recentHospitalDischarge: true, primaryDiagnosis: "fall with reduced mobility" },
      transitionFlags: { recentHospitalDischarge: true, careTransitionNeeded: true, urgency: "urgent" as const },
    },
    requiresEscalation: false,
  },
  {
    response:
      "Living alone after a fall — that combination is exactly when getting the right support in place quickly matters most. I've noted that.\n\nA couple more things to complete the picture:\n- **Does she have any ongoing conditions** like high blood pressure, diabetes, or memory issues?\n- **Are you her main caregiver** — and how much time can you give day-to-day while managing work?",
    profileUpdate: {
      senior: { livingArrangement: "alone" as const },
      careNeeds: { mobility: "assisted" as const },
    },
    requiresEscalation: false,
  },
  {
    response:
      "Hypertension and needing help walking — I've noted both. And it's clear you're carrying a lot as the main caregiver alongside everything else.\n\nOne last area — it directly affects which subsidies Mdm Tan qualifies for:\n- **Is she a Singapore Citizen or Permanent Resident?**\n- **Roughly, is the household per-capita monthly income** below $1,200, below $3,200, or above?",
    profileUpdate: {
      careNeeds: { chronicConditions: ["hypertension"] },
      caregiverContext: { hasCaregiver: true, caregiverRelationship: "daughter", caregiverStressLevel: "high" as const },
    },
    requiresEscalation: false,
  },
  {
    response:
      "Thank you. As a Singapore Citizen with low household income, Mdm Tan qualifies for maximum subsidies across all care services — that's important and good news.\n\nI now have a clear picture: *recent hospital discharge, lives alone, needs walking help, hypertension, full subsidy eligible*. I'm putting together her personalised care pathway now.\n\n⏳ Generating care pathway...",
    profileUpdate: {
      financial: { citizenshipStatus: "citizen" as const, estimatedIncome: "low" as const },
      transitionFlags: { recentHospitalDischarge: true, careTransitionNeeded: true, urgency: "urgent" as const },
    },
    requiresEscalation: true,
  },
];

let mockTurn = 0;

export function getMockResponse(profile: Partial<CareProfile>): IntakeResponse {
  const turn = MOCK_TURNS[mockTurn % MOCK_TURNS.length];
  mockTurn++;
  return {
    response: turn?.response ?? "Thank you for sharing. Is there anything else you'd like to add?",
    profileUpdate: (turn?.profileUpdate as Partial<CareProfile>) ?? {},
    requiresEscalation: turn?.requiresEscalation ?? false,
    safetyFlag: false,
  };
}

export function resetMockTurn() {
  mockTurn = 0;
}
