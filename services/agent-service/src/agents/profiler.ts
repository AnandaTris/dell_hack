import Anthropic from "@anthropic-ai/sdk";
import type { CareProfile, ConversationMessage, IntakeResponse } from "../types.js";
import { runGuardian } from "./guardian.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EXTRACT_PROFILE_TOOL: Anthropic.Tool = {
  name: "extract_profile_update",
  description:
    "Extract NEW care profile information the user just shared. Only include fields that are newly learned or changed — leave out anything already known. Call this after every user message, even if the update is small.",
  input_schema: {
    type: "object" as const,
    properties: {
      senior: {
        type: "object",
        description: "Information about the care recipient",
        properties: {
          name: { type: "string", description: "First name or how they refer to the person" },
          age: { type: "number" },
          livingArrangement: {
            type: "string",
            enum: ["alone", "with_family", "with_caregiver", "other"],
          },
          primaryLanguage: { type: "string", description: "e.g. Mandarin, English, Hokkien" },
        },
      },
      careNeeds: {
        type: "object",
        properties: {
          recentHospitalDischarge: { type: "boolean" },
          primaryDiagnosis: { type: "string", description: "Reason for hospital stay or main health event" },
          mobility: {
            type: "string",
            enum: ["independent", "assisted", "wheelchair", "bedbound"],
          },
          chronicConditions: {
            type: "array",
            items: { type: "string" },
            description: "e.g. hypertension, diabetes, dementia, heart disease",
          },
          adlSupport: {
            type: "array",
            items: { type: "string" },
            description: "Activities of daily living they need help with, e.g. bathing, dressing",
          },
        },
      },
      caregiverContext: {
        type: "object",
        properties: {
          hasCaregiver: { type: "boolean" },
          caregiverRelationship: { type: "string", description: "e.g. daughter, son, foreign domestic worker" },
          caregiverStressLevel: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Infer from context: 'exhausted', 'overwhelmed', 'managing fine'",
          },
        },
      },
      financial: {
        type: "object",
        properties: {
          citizenshipStatus: {
            type: "string",
            enum: ["citizen", "pr", "foreigner"],
          },
          estimatedIncome: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "low = below $1,200/mth per capita; medium = $1,200–$3,200; high = above $3,200",
          },
          pioneerGeneration: {
            type: "boolean",
            description: "Born on or before 31 Dec 1949 AND served NS or contributed to SG before 1988",
          },
        },
      },
      transitionFlags: {
        type: "object",
        properties: {
          recentHospitalDischarge: { type: "boolean" },
          careTransitionNeeded: {
            type: "boolean",
            description: "True if there is a major change in care situation requiring coordination",
          },
          urgency: {
            type: "string",
            enum: ["routine", "urgent", "critical"],
          },
        },
      },
      digitalReadiness: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Infer from how the user describes the senior's comfort with technology",
      },
    },
  },
};

function buildProfileSummary(profile: Partial<CareProfile>): string {
  const parts: string[] = [];

  if (profile.senior?.name || profile.senior?.age) {
    parts.push(
      `Senior: ${profile.senior.name ?? "unnamed"}, ${profile.senior.age ?? "age unknown"}`
    );
  }
  if (profile.senior?.livingArrangement) {
    parts.push(`Living: ${profile.senior.livingArrangement}`);
  }
  if (profile.careNeeds?.recentHospitalDischarge) {
    parts.push(
      `Recent hospital discharge: YES${profile.careNeeds.primaryDiagnosis ? ` (${profile.careNeeds.primaryDiagnosis})` : ""}`
    );
  }
  if (profile.careNeeds?.mobility) {
    parts.push(`Mobility: ${profile.careNeeds.mobility}`);
  }
  if (profile.careNeeds?.chronicConditions?.length) {
    parts.push(`Conditions: ${profile.careNeeds.chronicConditions.join(", ")}`);
  }
  if (profile.caregiverContext) {
    parts.push(
      `Caregiver: ${profile.caregiverContext.hasCaregiver ? profile.caregiverContext.caregiverRelationship ?? "yes" : "none"}`
    );
  }
  if (profile.financial?.citizenshipStatus) {
    parts.push(`Citizenship: ${profile.financial.citizenshipStatus}`);
  }
  if (profile.financial?.estimatedIncome) {
    parts.push(`Income tier: ${profile.financial.estimatedIncome}`);
  }

  return parts.length > 0
    ? parts.join(" | ")
    : "Nothing known yet — this is the start of the conversation.";
}

function buildSystemPrompt(profile: Partial<CareProfile>): string {
  const profileSummary = buildProfileSummary(profile);
  const lang = profile.language ?? "en";
  const languageInstruction =
    lang === "zh"
      ? "Respond in Simplified Chinese (简体中文). Keep your Chinese warm and conversational."
      : lang === "ms"
      ? "Respond in Bahasa Melayu. Keep your Malay warm and conversational."
      : lang === "ta"
      ? "Respond in Tamil (தமிழ்). Keep your Tamil warm and conversational."
      : "Respond in English.";

  return `You are the CareKaki Profiler — a warm, empathetic AI care guide helping seniors and caregivers in Singapore navigate community care services.

## Your goal
Hold a natural conversation to understand the care situation and build a structured Care Profile. You are NOT listing services yet — you are gathering genuine understanding first. Think of yourself as a caring friend who happens to know the Singapore care system well.

## Language
${languageInstruction}

## Conversation principles
- Be warm and empathetic. People reaching out are often stressed, overwhelmed, or scared.
- Acknowledge what you hear emotionally before asking more questions.
- Ask at most 2 focused questions per response.
- NEVER re-ask about information you already have.
- Keep responses concise — 3-4 sentences of empathy/acknowledgment, then 1-2 questions.
- Use the person's name (or the senior's name) once you know it.

## What to learn (priority order — ask about what's still unknown)
1. Who is the care recipient — name, age?
2. What happened recently — hospital discharge? Fall? New diagnosis?
3. Living arrangement — alone or with family?
4. Mobility — can they walk independently, need help, wheelchair, or bedbound?
5. Chronic conditions (hypertension, diabetes, dementia, heart failure, etc.)
6. Caregiver context — is there a caregiver? Who? How much capacity? Stress level?
7. Financial/citizenship — Singapore Citizen/PR? Rough income tier? (to match subsidies)

## Safety rules (non-negotiable)
- NEVER provide medical diagnoses, treatment recommendations, or medication advice
- NEVER provide legal or financial advice
- If you detect signs of abuse, self-harm intent, domestic violence, or medical emergency → express deep empathy, then refer to crisis resources (AIC 1800-650-6060, Samaritans 1-767, 995 for emergencies)
- Always remind that "A real Care Corner coordinator is one click away"

## About Singapore's care system (your background knowledge)
You know Singapore's community care landscape well:
- AIC (Agency for Integrated Care): central navigation hub, 1800-650-6060
- Home-based services: Home Medical, Home Nursing, Home Personal Care, Home Therapy, Interim Caregiver Service, Meals on Wheels
- Centre-based: Senior Care Centre, Day Rehabilitation, Dementia Day Care, Active Ageing Centre
- Financial: Home Caregiving Grant ($200-400/month), Seniors' Mobility & Enabling Fund (up to 90% subsidy), CareShield Life, Caregivers Training Grant ($200/year), Pioneer/Merdeka Generation benefits
- Care Corner ICCP: integrated care coordination for complex cases

## Tool use
After generating your response text, ALWAYS call the extract_profile_update tool to capture any NEW information the user shared. Only include newly learned fields — not what you already know.

## Current profile state (already known — do NOT re-ask these)
${profileSummary}

Based on the current profile, focus your questions on what is still unknown.`;
}

function determineShouldEscalate(profile: Partial<CareProfile>): boolean {
  const hasMultipleNeeds =
    (profile.careNeeds?.chronicConditions?.length ?? 0) >= 2;
  const isTransition = profile.transitionFlags?.recentHospitalDischarge;
  const isComplex = profile.transitionFlags?.urgency === "urgent" || profile.transitionFlags?.urgency === "critical";
  const livesAlone = profile.senior?.livingArrangement === "alone";
  const highCaregiverStress = profile.caregiverContext?.caregiverStressLevel === "high";

  return !!(
    (isTransition && livesAlone) ||
    (isTransition && hasMultipleNeeds) ||
    isComplex ||
    (livesAlone && highCaregiverStress)
  );
}

export async function runProfilerAgent(input: {
  messages: ConversationMessage[];
  profile: Partial<CareProfile>;
}): Promise<IntakeResponse> {
  // Run guardian safety check first
  const guardianResult = runGuardian(input.messages);

  const systemPrompt = buildSystemPrompt(input.profile);

  const response = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL ?? "claude-opus-4-7",
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [EXTRACT_PROFILE_TOOL],
    tool_choice: { type: "auto" },
    messages: input.messages,
  });

  let responseText = "";
  let profileUpdate: Partial<CareProfile> = {};

  for (const block of response.content) {
    if (block.type === "text") {
      responseText += block.text;
    } else if (
      block.type === "tool_use" &&
      block.name === "extract_profile_update"
    ) {
      profileUpdate = block.input as Partial<CareProfile>;
    }
  }

  // Append any guardian safety note
  if (guardianResult.appendToResponse) {
    responseText += guardianResult.appendToResponse;
  }

  // Merge new profile info with existing to check escalation
  const mergedProfile = deepMerge(input.profile, profileUpdate);
  const requiresEscalation =
    guardianResult.requiresEscalation ||
    determineShouldEscalate(mergedProfile);

  return {
    response: responseText,
    profileUpdate,
    requiresEscalation,
    escalationReason: guardianResult.escalationReason,
    safetyFlag: guardianResult.safetyFlag,
  };
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sv = source[key];
    const tv = target[key];
    if (sv !== undefined) {
      if (
        sv !== null &&
        typeof sv === "object" &&
        !Array.isArray(sv) &&
        tv !== null &&
        typeof tv === "object" &&
        !Array.isArray(tv)
      ) {
        (result as Record<string, unknown>)[key as string] = deepMerge(
          tv as object,
          sv as object
        );
      } else {
        (result as Record<string, unknown>)[key as string] = sv;
      }
    }
  }
  return result;
}
