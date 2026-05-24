import Anthropic from "@anthropic-ai/sdk";
import type { CareProfile } from "../types.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export interface NavigatorResult {
  groups: PathwayGroup[];
  escalationRecommended: boolean;
  escalationReason?: string | undefined;
  confidence: "high" | "medium" | "low";
}

interface ScoredService {
  service: {
    id: string;
    name: string;
    category: string;
    description: string;
    eligibility: string;
    costGuide: string;
    howToAccess: string;
    source: string;
    contactInfo: string;
    keywords: string[];
  };
  score: number;
  matchReasons: string[];
}

const BUILD_PATHWAY_TOOL: Anthropic.Tool = {
  name: "build_care_pathway",
  description:
    "Build a personalised care pathway grouped into logical phases. Each item must explain WHY it's relevant for this specific person — not generic descriptions. Order groups by urgency: immediate first, then short-term, then ongoing.",
  input_schema: {
    type: "object" as const,
    required: ["groups", "escalationRecommended", "confidence"],
    properties: {
      groups: {
        type: "array",
        description: "2-4 logical groups, ordered from most urgent to least",
        items: {
          type: "object",
          required: ["groupName", "groupDescription", "items"],
          properties: {
            groupName: {
              type: "string",
              description: "e.g. 'Step 1: Urgent post-discharge support', 'Step 2: Daily care at home', 'Step 3: Caregiver support'",
            },
            groupDescription: {
              type: "string",
              description: "1–2 sentence explanation of why this group matters for this person",
            },
            items: {
              type: "array",
              description: "1-4 services in this group",
              items: {
                type: "object",
                required: ["serviceId", "serviceName", "category", "rationale", "urgency", "nextStep", "profileFactors", "source"],
                properties: {
                  serviceId: { type: "string", description: "ID from the services list" },
                  serviceName: { type: "string" },
                  category: { type: "string", description: "e.g. home_based, centre_based, financial, coordination" },
                  rationale: {
                    type: "string",
                    description: "1-2 sentences explaining WHY this service fits THIS specific person's situation. Be personal and specific.",
                  },
                  urgency: {
                    type: "string",
                    enum: ["immediate", "short_term", "ongoing"],
                    description: "immediate = this week; short_term = within a month; ongoing = long-term support",
                  },
                  nextStep: {
                    type: "string",
                    description: "Concrete first action, e.g. 'Call AIC at 1800-650-6060 and mention you were just discharged from hospital'",
                  },
                  profileFactors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Short phrases of why this matched, e.g. ['post-fall discharge', 'lives alone', 'Pioneer Generation']",
                  },
                  source: { type: "string", description: "Source organisation, e.g. 'Agency for Integrated Care (AIC)'" },
                },
              },
            },
          },
        },
      },
      escalationRecommended: {
        type: "boolean",
        description: "True if this case is complex enough that a human Care Corner coordinator should follow up proactively",
      },
      escalationReason: {
        type: "string",
        description: "If escalationRecommended, briefly explain why (e.g. 'Recent discharge + lives alone + multiple conditions')",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "high = profile complete enough for precise matching; medium = some gaps; low = very little info",
      },
    },
  },
};

function buildNavigatorPrompt(profile: Partial<CareProfile>, services: ScoredService[]): string {
  const senior = profile.senior;
  const careNeeds = profile.careNeeds;
  const caregiver = profile.caregiverContext;
  const financial = profile.financial;
  const flags = profile.transitionFlags;
  const lang = profile.language ?? "en";

  const languageNote =
    lang === "zh" ? "The user's preferred language is Chinese — keep service names in English but you may note this for the coordinator."
    : lang === "ms" ? "The user's preferred language is Malay."
    : lang === "ta" ? "The user's preferred language is Tamil."
    : "";

  const profileDesc = [
    senior?.name ? `Senior: ${senior.name}, ${senior.age ?? "age unknown"}` : `Senior: ${senior?.age ?? "age unknown"}`,
    senior?.livingArrangement ? `Living arrangement: ${senior.livingArrangement.replace("_", " ")}` : "",
    flags?.recentHospitalDischarge ? `RECENTLY DISCHARGED from hospital${careNeeds?.primaryDiagnosis ? ` (${careNeeds.primaryDiagnosis})` : ""}` : "",
    careNeeds?.mobility ? `Mobility: ${careNeeds.mobility}` : "",
    careNeeds?.chronicConditions?.length ? `Chronic conditions: ${careNeeds.chronicConditions.join(", ")}` : "",
    careNeeds?.adlSupport?.length ? `Needs help with: ${careNeeds.adlSupport.join(", ")}` : "",
    caregiver?.hasCaregiver
      ? `Caregiver: ${caregiver.caregiverRelationship ?? "yes"}${caregiver.caregiverStressLevel ? ` (stress: ${caregiver.caregiverStressLevel})` : ""}`
      : "No caregiver",
    financial?.citizenshipStatus ? `Citizenship: ${financial.citizenshipStatus}` : "",
    financial?.estimatedIncome ? `Income tier: ${financial.estimatedIncome}` : "",
    financial?.pioneerGeneration ? "Pioneer Generation member" : "",
    flags?.urgency ? `Urgency: ${flags.urgency}` : "",
  ].filter(Boolean).join("\n");

  const servicesDesc = services
    .map(
      (s, i) =>
        `${i + 1}. [${s.service.id}] ${s.service.name} (score: ${s.score})\n   Why matched: ${s.matchReasons.join(", ")}\n   Description: ${s.service.description}\n   How to access: ${s.service.howToAccess}\n   Cost: ${s.service.costGuide}\n   Source: ${s.service.source}`
    )
    .join("\n\n");

  return `You are the CareKaki Navigator — a Singapore care system expert who creates personalised care pathways for seniors and caregivers.

## Your task
Given a care profile and a list of relevant services (pre-scored for relevance), create a personalised grouped pathway. Use the build_care_pathway tool.

## Key principles
- Every item's rationale MUST be personal and specific to THIS person's situation. Not "Home Nursing provides wound care." Instead: "Since Mdm Tan was just discharged after a fall and lives alone, home nursing visits will monitor her recovery without her needing to travel."
- Group logically: immediate post-discharge needs first, then daily ongoing support, then financial/caregiver support.
- Prefer fewer, more relevant services over an exhaustive list. Quality > quantity.
- If the situation looks complex (multiple conditions + lives alone + recent discharge), recommend escalation to Care Corner.
- Use plain language in rationale and nextStep — caregivers/seniors should understand immediately.
${languageNote}

## Care profile
${profileDesc}

## Pre-matched services to consider (use the ones most relevant, you don't need to include all)
${servicesDesc}

Now build the personalised care pathway using the build_care_pathway tool.`;
}

async function getMockPathway(profile: Partial<CareProfile>): Promise<NavigatorResult> {
  const isPostDischarge = profile.transitionFlags?.recentHospitalDischarge;
  const livesAlone = profile.senior?.livingArrangement === "alone";
  const seniorName = profile.senior?.name ?? "your loved one";

  return {
    escalationRecommended: !!(isPostDischarge && livesAlone),
    escalationReason: isPostDischarge && livesAlone
      ? "Recent discharge + lives alone — needs proactive coordination"
      : undefined,
    confidence: "medium",
    groups: [
      {
        groupName: "Step 1: Immediate post-discharge support",
        groupDescription: `${seniorName} has just come home from hospital and needs medical monitoring and daily help to stay safe.`,
        items: [
          {
            serviceId: "home-nursing",
            serviceName: "Home Nursing Service",
            category: "home_based",
            rationale: `Since ${seniorName} was recently discharged and is recovering at home, a nurse visiting regularly will monitor recovery and manage any wound care or medication needs — without requiring travel to a clinic.`,
            urgency: "immediate",
            nextStep: "Call AIC at 1800-650-6060 and mention you were just discharged from hospital — they will fast-track a referral.",
            profileFactors: ["recent hospital discharge", livesAlone ? "lives alone" : "at home"],
            source: "Agency for Integrated Care (AIC)",
          },
          {
            serviceId: "home-therapy",
            serviceName: "Home Therapy Service",
            category: "home_based",
            rationale: `Physiotherapy at home will help ${seniorName} regain strength and balance after the fall, reducing the risk of another fall.`,
            urgency: "immediate",
            nextStep: "Ask your hospital discharge planner or Medical Social Worker to refer for Home Therapy before discharge, or call AIC at 1800-650-6060.",
            profileFactors: ["post-fall rehabilitation", "mobility issues"],
            source: "Agency for Integrated Care (AIC)",
          },
        ],
      },
      {
        groupName: "Step 2: Daily care and safety at home",
        groupDescription: `Ongoing support so ${seniorName} can live safely and comfortably at home.`,
        items: [
          {
            serviceId: "home-personal-care",
            serviceName: "Home Personal Care",
            category: "home_based",
            rationale: `A trained care worker can assist with bathing, grooming, and mobility each day — providing both practical support and a daily safety check.`,
            urgency: "short_term",
            nextStep: "Contact AIC at 1800-650-6060 to arrange a needs assessment. Subsidies available based on income.",
            profileFactors: ["needs ADL support", "mobility assistance"],
            source: "Agency for Integrated Care (AIC)",
          },
          {
            serviceId: "meals-on-wheels",
            serviceName: "Meals on Wheels",
            category: "home_based",
            rationale: `Nutritious meals delivered to the door are important for recovery — and each delivery is also a daily welfare check.`,
            urgency: "short_term",
            nextStep: "Call AIC at 1800-650-6060 or ask your nearest Senior Activity Centre to refer.",
            profileFactors: [livesAlone ? "lives alone" : "limited mobility", "nutrition during recovery"],
            source: "Agency for Integrated Care (AIC)",
          },
        ],
      },
      {
        groupName: "Step 3: Financial support",
        groupDescription: "Singapore has generous subsidies — make sure to apply for what your family is entitled to.",
        items: [
          {
            serviceId: "home-caregiving-grant",
            serviceName: "Home Caregiving Grant",
            category: "financial",
            rationale: `As a caregiver supporting a family member with functional limitations, you may qualify for $200–$400/month — this can offset the cost of home care services.`,
            urgency: "short_term",
            nextStep: "Apply online at cpf.gov.sg or ask a Medical Social Worker at the hospital to help you apply before discharge.",
            profileFactors: ["caregiver support", "income-based subsidy"],
            source: "Agency for Integrated Care (AIC)",
          },
        ],
      },
    ],
  };
}

export async function runNavigatorAgent(input: {
  profile: Partial<CareProfile>;
  services: ScoredService[];
}): Promise<NavigatorResult> {
  const isMockMode = process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

  if (isMockMode || input.services.length === 0) {
    console.log("[navigator] MOCK_MODE or no services — returning mock pathway");
    return getMockPathway(input.profile);
  }

  try {
    const systemPrompt = buildNavigatorPrompt(input.profile, input.services);

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL ?? "claude-opus-4-7",
      max_tokens: 2000,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [BUILD_PATHWAY_TOOL],
      tool_choice: { type: "tool", name: "build_care_pathway" },
      messages: [
        {
          role: "user",
          content: "Please build the care pathway for this person.",
        },
      ],
    });

    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === "build_care_pathway") {
        const result = block.input as NavigatorResult;
        return result;
      }
    }

    // If tool was not called (shouldn't happen with tool_choice: tool)
    console.warn("[navigator] Claude did not call build_care_pathway, falling back to mock");
    return getMockPathway(input.profile);
  } catch (err) {
    console.error("[navigator] Claude call failed:", err);
    return getMockPathway(input.profile);
  }
}
