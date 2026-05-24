import Anthropic from "@anthropic-ai/sdk";
import type { CareProfile } from "../types.js";
import type { PathwayGroup } from "./navigator.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CareBriefPayload {
  summary: string;
  seniorDetails: {
    name?: string | undefined;
    age?: number | undefined;
    situation: string;
  };
  keyNeeds: string[];
  recommendedServices: string[];
  urgencyLevel: "routine" | "urgent" | "critical";
  caregiverInfo?: string | undefined;
  financialConsiderations?: string | undefined;
  recentTransition?: string | undefined;
  handoverNotes: string;
}

const CREATE_BRIEF_TOOL: Anthropic.Tool = {
  name: "create_care_brief",
  description:
    "Create a structured Care Brief for a human care coordinator to receive before calling the family. This brief must be complete, actionable, and save the coordinator from needing to ask the family the same questions again.",
  input_schema: {
    type: "object" as const,
    required: ["summary", "seniorDetails", "keyNeeds", "recommendedServices", "urgencyLevel", "handoverNotes"],
    properties: {
      summary: {
        type: "string",
        description:
          "2-3 sentence executive summary of the full care situation. Should cover: who, what happened, living situation, key needs, financial eligibility.",
      },
      seniorDetails: {
        type: "object",
        required: ["situation"],
        properties: {
          name: { type: "string", description: "Senior's name if known" },
          age: { type: "number" },
          situation: {
            type: "string",
            description:
              "1-2 sentence description: what happened, functional status, living situation",
          },
        },
      },
      keyNeeds: {
        type: "array",
        items: { type: "string" },
        description: "5-8 bullet-point needs, ordered by urgency. Be specific and actionable.",
      },
      recommendedServices: {
        type: "array",
        items: { type: "string" },
        description: "Service names from the care pathway, in priority order",
      },
      urgencyLevel: {
        type: "string",
        enum: ["routine", "urgent", "critical"],
        description: "routine = days to weeks; urgent = within 24-48h; critical = today",
      },
      caregiverInfo: {
        type: "string",
        description:
          "Caregiver's relationship, capacity, stress level, and what support they need. Include language preference if known.",
      },
      financialConsiderations: {
        type: "string",
        description:
          "Citizenship status, income tier, and which specific grants/subsidies they qualify for. Include amounts where known.",
      },
      recentTransition: {
        type: "string",
        description: "If recently discharged: what happened, when, and what was the discharge situation.",
      },
      handoverNotes: {
        type: "string",
        description:
          "Notes to the coordinator: tone of family (worried? overwhelmed?), what they expressed needing most, any context that'll help the coordinator's first call land well.",
      },
    },
  },
};

function buildHandoverPrompt(profile: Partial<CareProfile>, groups: PathwayGroup[]): string {
  const senior = profile.senior;
  const careNeeds = profile.careNeeds;
  const caregiver = profile.caregiverContext;
  const financial = profile.financial;
  const flags = profile.transitionFlags;

  const profileDesc = [
    senior?.name ? `Senior name: ${senior.name}, age: ${senior.age ?? "unknown"}` : `Senior age: ${senior?.age ?? "unknown"}`,
    senior?.livingArrangement ? `Living arrangement: ${senior.livingArrangement.replace("_", " ")}` : "",
    flags?.recentHospitalDischarge ? `RECENTLY DISCHARGED from hospital${careNeeds?.primaryDiagnosis ? ` after: ${careNeeds.primaryDiagnosis}` : ""}` : "",
    careNeeds?.mobility ? `Mobility: ${careNeeds.mobility}` : "",
    careNeeds?.chronicConditions?.length ? `Chronic conditions: ${careNeeds.chronicConditions.join(", ")}` : "",
    careNeeds?.adlSupport?.length ? `ADL needs: ${careNeeds.adlSupport.join(", ")}` : "",
    caregiver?.hasCaregiver
      ? `Caregiver: ${caregiver.caregiverRelationship ?? "yes"} — stress: ${caregiver.caregiverStressLevel ?? "unknown"}`
      : "No caregiver identified",
    financial?.citizenshipStatus ? `Citizenship: ${financial.citizenshipStatus}` : "",
    financial?.estimatedIncome ? `Estimated income tier: ${financial.estimatedIncome}` : "",
    financial?.pioneerGeneration ? "Pioneer Generation status: YES" : "",
    flags?.urgency ? `Overall urgency: ${flags.urgency}` : "",
    profile.mode === "caregiver" ? "Mode: caregiver is making the enquiry on behalf of the senior" : "Mode: senior is self-enquiring",
    profile.language && profile.language !== "en" ? `Language preference: ${profile.language}` : "",
  ].filter(Boolean).join("\n");

  const pathwayDesc = groups
    .map(
      (g) =>
        `Group: ${g.groupName}\n` +
        g.items
          .map((i) => `  - [${i.urgency.toUpperCase()}] ${i.serviceName}: ${i.rationale.slice(0, 120)}... → ${i.nextStep}`)
          .join("\n")
    )
    .join("\n\n");

  return `You are the CareKaki Handover Agent. You are preparing a Care Brief for a human Care Corner care coordinator who will call this family.

## Your task
Use the care profile and the personalised pathway below to create a complete, professional Care Brief that:
1. Saves the coordinator from asking the family to repeat themselves
2. Gives full context on urgency, living situation, financial eligibility, and caregiver stress
3. Includes warm handover notes — tone, what the family is worried about, how to open the first call

Use the create_care_brief tool.

## Care Profile
${profileDesc}

## Personalised Pathway
${pathwayDesc}

Create the Care Brief now.`;
}

function getMockBrief(profile: Partial<CareProfile>): CareBriefPayload {
  const name = profile.senior?.name ?? "the senior";
  const age = profile.senior?.age;
  const isDischarge = profile.transitionFlags?.recentHospitalDischarge;
  const livesAlone = profile.senior?.livingArrangement === "alone";
  const isCitizen = profile.financial?.citizenshipStatus === "citizen";
  const lowIncome = profile.financial?.estimatedIncome === "low";
  const hasCaregiver = profile.caregiverContext?.hasCaregiver;
  const caregiverRelationship = profile.caregiverContext?.caregiverRelationship;

  const situation = [
    isDischarge ? "Recent hospital discharge" : "",
    profile.careNeeds?.primaryDiagnosis ?? "",
    livesAlone ? "Lives alone" : "",
    profile.careNeeds?.mobility ? `Mobility: ${profile.careNeeds.mobility}` : "",
  ].filter(Boolean).join(". ");

  return {
    summary: `${name}${age ? `, ${age}` : ""}${isDischarge ? " was recently discharged from hospital" : " requires community care support"}${livesAlone ? " and lives alone" : ""}. ${profile.careNeeds?.chronicConditions?.length ? `Known conditions: ${profile.careNeeds.chronicConditions.join(", ")}.` : ""} ${isCitizen && lowIncome ? "Qualifies for maximum subsidies as a Singapore Citizen with low household income." : ""}`.trim(),
    seniorDetails: {
      name: profile.senior?.name,
      age: profile.senior?.age,
      situation: situation || "Community care support needed",
    },
    keyNeeds: [
      isDischarge ? "Post-discharge care coordination — urgent" : "Community care navigation support",
      livesAlone && isDischarge ? "Interim caregiver or daily check-in needed (lives alone)" : "",
      profile.careNeeds?.mobility !== "independent" ? "Home-based care services (nursing, personal care, therapy)" : "",
      hasCaregiver ? `Caregiver support for ${caregiverRelationship ?? "family member"} — high stress` : "",
      isCitizen && lowIncome ? "Financial grant applications (HCG, SMF, MediFund)" : "",
      "AIC referral for full needs assessment",
    ].filter(Boolean) as string[],
    recommendedServices: [
      isDischarge ? "Interim Caregiver Service" : "",
      isDischarge ? "Home Nursing Service" : "",
      profile.careNeeds?.mobility !== "independent" ? "Home Personal Care" : "",
      isDischarge ? "Home Therapy (Physiotherapy)" : "",
      isCitizen ? "Home Caregiving Grant (HCG)" : "",
      "AIC Navigation Support",
    ].filter(Boolean) as string[],
    urgencyLevel: (profile.transitionFlags?.urgency === "critical" ? "critical"
      : (isDischarge || profile.transitionFlags?.urgency === "urgent") ? "urgent"
      : "routine") as "routine" | "urgent" | "critical",
    caregiverInfo: hasCaregiver
      ? `${caregiverRelationship ?? "Family caregiver"} is the primary contact — caregiver stress level: ${profile.caregiverContext?.caregiverStressLevel ?? "unknown"}. May feel overwhelmed navigating multiple services simultaneously.`
      : "No dedicated caregiver identified — may need interim caregiver service.",
    financialConsiderations: isCitizen
      ? `Singapore Citizen${lowIncome ? " — per capita income ≤$1,200/month. Eligible for maximum subsidy tier: HCG up to $400/month, SMF up to 90% equipment subsidy, full subsidies on home-based services." : "."}${profile.financial?.pioneerGeneration ? " Pioneer Generation member — additional benefits apply." : ""}`
      : undefined,
    recentTransition: isDischarge
      ? `Hospital discharge${profile.careNeeds?.primaryDiagnosis ? ` following: ${profile.careNeeds.primaryDiagnosis}` : ""}. Family reached out immediately post-discharge — transition support needed urgently.`
      : undefined,
    handoverNotes:
      `Family completed CareKaki intake and requested coordinator contact. ${profile.caregiverContext?.caregiverStressLevel === "high" ? "Caregiver expressed feeling overwhelmed — open the call with reassurance that you'll take ownership of coordination." : "Family is looking for clarity on next steps."} Preferred language: ${profile.language ?? "English"}. ${isDischarge && livesAlone ? "PRIORITY: address the gap in home support given the senior lives alone post-discharge." : ""}`.trim(),
  };
}

export async function runHandoverAgent(input: {
  profile: Partial<CareProfile>;
  pathway: { groups: PathwayGroup[] };
}): Promise<CareBriefPayload> {
  const isMockMode = process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

  if (isMockMode) {
    console.log("[handover] MOCK_MODE — returning mock care brief");
    return getMockBrief(input.profile);
  }

  try {
    const systemPrompt = buildHandoverPrompt(input.profile, input.pathway.groups);

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL ?? "claude-opus-4-7",
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [CREATE_BRIEF_TOOL],
      tool_choice: { type: "tool", name: "create_care_brief" },
      messages: [
        {
          role: "user",
          content: "Please create the Care Brief for this family.",
        },
      ],
    });

    for (const block of response.content) {
      if (block.type === "tool_use" && block.name === "create_care_brief") {
        return block.input as CareBriefPayload;
      }
    }

    console.warn("[handover] Claude did not call create_care_brief, falling back to mock");
    return getMockBrief(input.profile);
  } catch (err) {
    console.error("[handover] Claude call failed:", err);
    return getMockBrief(input.profile);
  }
}
