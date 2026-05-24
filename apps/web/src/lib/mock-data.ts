import type { CareProfile, ChatMessage, Pathway, CareBrief } from "./types";

export type MockTurn = {
  message: string;
  profileUpdate: Partial<CareProfile>;
  triggerStage?: import("./types").AppStage;
};

export const MOCK_TURNS: MockTurn[] = [
  {
    message:
      "I hear you — a recent hospital discharge after a fall is one of the most important moments to get the right support in place quickly.\n\nTo help me understand Mdm Tan's situation better:\n- **Does she live alone**, or is there family at home with her?\n- **Is she able to move around on her own**, or does she need help getting around?\n\nTake your time — there's no rush.",
    profileUpdate: {
      senior: { name: "Mdm Tan", age: 78 },
      careNeeds: {
        recentHospitalDischarge: true,
        primaryDiagnosis: "fall with reduced mobility",
      },
      transitionFlags: {
        recentHospitalDischarge: true,
        careTransitionNeeded: true,
        urgency: "urgent",
      },
    },
  },
  {
    message:
      "Living alone after a fall — that's exactly the situation where having the right care makes a real difference. I've noted that.\n\nA couple more things to complete the picture:\n- **Does she have any ongoing health conditions?** For example, high blood pressure, diabetes, or memory issues?\n- **How are you managing as a caregiver** — are you her main source of support, and how much time can you give day-to-day?",
    profileUpdate: {
      senior: {
        name: "Mdm Tan",
        age: 78,
        livingArrangement: "alone",
      },
      careNeeds: {
        recentHospitalDischarge: true,
        primaryDiagnosis: "fall with reduced mobility",
        mobility: "assisted",
      },
    },
  },
  {
    message:
      "Hypertension and needing help with walking — I've got that. And it's clear you're the main caregiver while balancing a lot.\n\nOne last area I want to cover, because it directly affects which subsidies Mdm Tan qualifies for:\n- **Is she a Singapore Citizen or Permanent Resident?**\n- **Roughly, what is the household per-capita monthly income?** Under $1,200, under $3,200, or above $3,200?\n\nThis is confidential and only used to match her with the right financial support.",
    profileUpdate: {
      careNeeds: {
        recentHospitalDischarge: true,
        primaryDiagnosis: "fall with reduced mobility",
        mobility: "assisted",
        chronicConditions: ["hypertension"],
      },
      caregiverContext: {
        hasCaregiver: true,
        caregiverRelationship: "daughter",
        caregiverStressLevel: "high",
      },
    },
  },
  {
    message:
      "Thank you, Wei Ling. I now have a clear picture of Mdm Tan's situation.\n\nShe's a **Singapore Citizen with low household income**, which means she qualifies for maximum subsidies across all care services.\n\nI'm now putting together her **personalised care pathway** — this isn't a list of random services. Each one is chosen because of her specific situation: *recent fall, lives alone, needs walking support, hypertension, and eligible for full subsidies.*\n\n⏳ Generating personalised pathway...",
    profileUpdate: {
      financial: {
        citizenshipStatus: "citizen",
        estimatedIncome: "low",
      },
    },
    triggerStage: "pathway",
  },
];

export const MOCK_PATHWAY: Pathway = {
  id: "mock-pathway-001",
  profileId: "mock-profile-001",
  groups: [
    {
      groupName: "Getting home safely — this week",
      groupDescription:
        "Immediate support for the care transition after discharge",
      items: [
        {
          serviceId: "interim-caregiver",
          serviceName: "Interim Caregiver Service",
          category: "Home-based",
          rationale:
            "Mdm Tan was just discharged after a fall and lives alone — she needs someone at home while you arrange longer-term care. This service is specifically designed for the first 1–3 months after hospital discharge.",
          urgency: "immediate",
          nextStep:
            "Ask the hospital Medical Social Worker before discharge, or call AIC at 1800-650-6060 today.",
          profileFactors: [
            "Recent hospital discharge",
            "Lives alone",
            "Singapore Citizen (full subsidy eligible)",
          ],
          source: "Agency for Integrated Care (AIC)",
        },
        {
          serviceId: "home-nursing",
          serviceName: "Home Nursing Service",
          category: "Home-based",
          rationale:
            "After a fall, Mdm Tan may need wound care, medication monitoring, and regular health checks at home. Home nurses visit her directly — no travel required.",
          urgency: "immediate",
          nextStep:
            "Hospital discharge planner can refer directly. Or call AIC at 1800-650-6060.",
          profileFactors: [
            "Recent hospital discharge",
            "Cannot travel independently",
            "Hypertension monitoring needed",
          ],
          source: "Agency for Integrated Care (AIC)",
        },
      ],
    },
    {
      groupName: "Ongoing care at home",
      groupDescription: "Regular support to help Mdm Tan age safely at home",
      items: [
        {
          serviceId: "home-personal-care",
          serviceName: "Home Personal Care",
          category: "Home-based",
          rationale:
            "Mdm Tan needs help with bathing, grooming, and moving around daily. Home personal care workers visit regularly — subsidised to as low as $3/session given her income level.",
          urgency: "short_term",
          nextStep: "Call AIC at 1800-650-6060 to arrange an assessment.",
          profileFactors: [
            "Needs walking assistance",
            "Lives alone",
            "Low income — full subsidy eligible",
          ],
          source: "Agency for Integrated Care (AIC)",
        },
        {
          serviceId: "home-therapy",
          serviceName: "Home Physiotherapy",
          category: "Home-based",
          rationale:
            "Physiotherapy at home helps Mdm Tan rebuild strength and balance after her fall, reducing the risk of falling again. Because she cannot travel to a rehab centre, home therapy is the right fit.",
          urgency: "short_term",
          nextStep:
            "Request a referral from the hospital discharge doctor or call AIC.",
          profileFactors: [
            "Post-fall recovery",
            "Assisted mobility",
            "Cannot travel independently",
          ],
          source: "Agency for Integrated Care (AIC)",
        },
      ],
    },
    {
      groupName: "Financial support she qualifies for",
      groupDescription: "Grants and subsidies to reduce the cost of care",
      items: [
        {
          serviceId: "home-caregiving-grant",
          serviceName: "Home Caregiving Grant (HCG)",
          category: "Financial",
          rationale:
            "As a Singapore Citizen with low household income caring for someone with disability at home, Mdm Tan qualifies for $400/month in cash — significantly reducing your family's out-of-pocket costs.",
          urgency: "immediate",
          nextStep:
            "Apply online at aic.sg or call AIC at 1800-650-6060. You'll need NRIC and income documents.",
          profileFactors: [
            "Singapore Citizen",
            "Per capita income ≤$1,200/month",
            "Reduced mobility qualifies as disability",
          ],
          source: "Agency for Integrated Care (AIC)",
        },
        {
          serviceId: "smf",
          serviceName: "Seniors' Mobility & Enabling Fund (SMF)",
          category: "Financial",
          rationale:
            "After a fall, Mdm Tan's home likely needs grab bars, non-slip mats, and a walking frame. SMF subsidises up to 90% of these costs for low-income seniors — making a safer home affordable.",
          urgency: "short_term",
          nextStep:
            "Ask the hospital occupational therapist, or contact AIC at 1800-650-6060.",
          profileFactors: [
            "Post-fall home safety",
            "Singapore Citizen",
            "Low income — up to 90% subsidy",
          ],
          source: "Agency for Integrated Care (AIC)",
        },
      ],
    },
    {
      groupName: "Coordinating everything together",
      groupDescription:
        "Care management to connect all the pieces — so you don't have to",
      items: [
        {
          serviceId: "care-corner-iccp",
          serviceName: "Care Corner ICCP Coordinator",
          category: "Coordination",
          rationale:
            "Mdm Tan has multiple needs across health and social care. Care Corner's integrated care coordinators take ownership — they bring all the services together and stay in touch with your family regularly.",
          urgency: "immediate",
          nextStep:
            "A coordinator can be assigned now. We'll send them a full Care Brief so you don't have to repeat everything.",
          profileFactors: [
            "Multiple overlapping care needs",
            "Care transition (hospital discharge)",
            "Caregiver with high stress",
          ],
          source: "Care Corner Singapore",
        },
      ],
    },
  ],
  escalationRecommended: true,
  escalationReason:
    "Mdm Tan has just been discharged from hospital with multiple overlapping care needs — home nursing, physiotherapy, personal care, home modifications, and financial grants all at once. A care transition like this is exactly when a dedicated coordinator prevents things from falling through the cracks and reduces the risk of re-hospitalisation.",
  generatedAt: new Date().toISOString(),
  confidence: "high",
};

export const MOCK_CARE_BRIEF: CareBrief = {
  id: "brief-001",
  profileId: "mock-profile-001",
  pathwayId: "mock-pathway-001",
  summary:
    "Mdm Tan, 78, was discharged from hospital following a fall resulting in reduced mobility. She lives alone and has hypertension. Her daughter Wei Ling (45) is the primary caregiver but is balancing full-time work and two children. Mdm Tan requires immediate post-discharge support (interim caregiver + home nursing), followed by home physiotherapy, personal care, home modification, and financial assistance. She qualifies for maximum subsidies as a Singapore Citizen with low household per capita income.",
  seniorDetails: {
    name: "Mdm Tan",
    age: 78,
    situation:
      "Recent hospital discharge after a fall. Lives alone. Reduced mobility (needs walking assistance). Hypertension. Low digital confidence.",
  },
  keyNeeds: [
    "Immediate interim caregiver (post-discharge, lives alone)",
    "Home nursing for health monitoring and wound care",
    "Home physiotherapy for fall recovery and balance",
    "Daily home personal care (bathing, grooming, mobility)",
    "Home modification for fall prevention (grab bars, non-slip mats)",
    "Home Caregiving Grant application ($400/month)",
    "Seniors' Mobility & Enabling Fund (SMF) for equipment",
  ],
  recommendedServices: [
    "Interim Caregiver Service",
    "Home Nursing Service",
    "Home Physiotherapy",
    "Home Personal Care Service",
    "Home Caregiving Grant (HCG) — $400/month",
    "Seniors' Mobility & Enabling Fund (SMF)",
    "Community Case Management Service (CCMS)",
  ],
  urgencyLevel: "urgent",
  caregiverInfo:
    "Daughter (Wei Ling, 45) — works full-time, two school-age children. Self-identified as high stress. English-speaking. Expressed feeling overwhelmed by number of services to navigate. Would benefit from a single coordinator contact point.",
  financialConsiderations:
    "Singapore Citizen. Household per capita income ≤$1,200/month (maximum subsidy tier). Eligible for: HCG $400/month, SMF up to 90% subsidy on equipment/modification, full subsidies on home-based care services.",
  recentTransition: "Hospital discharge after fall — this week.",
  handoverNotes:
    "Client and caregiver completed CareKaki intake. Full care profile and pathway generated via AI navigator. Daughter is primary contact and speaks English. Would appreciate an introductory call to explain what happens next — she expressed uncertainty about the process.",
  generatedAt: new Date().toISOString(),
  status: "pending",
};

export function createWelcomeMessage(
  mode: import("./types").Mode
): ChatMessage {
  return {
    id: "msg-welcome",
    role: "assistant",
    content:
      mode === "caregiver"
        ? "Hi! I'm CareKaki, your care buddy 👋\n\nI'm here to help you find the right support for your loved one — not just a list of services, but a personalised plan based on their specific situation.\n\nCould you start by telling me a bit about who you're caring for? For example: who they are, how they're doing, and what's happened recently?"
        : "Hi! I'm CareKaki, your care buddy 👋\n\nI'm here to help you find the right community care support — personalised for your situation, not just a list of options.\n\nCould you tell me a bit about yourself and what kind of help you're looking for?",
    timestamp: new Date(),
  };
}
