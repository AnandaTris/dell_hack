import { NextRequest, NextResponse } from "next/server";
import { MOCK_TURNS, MOCK_PATHWAY } from "@/lib/mock-data";
import type { CareProfile, Pathway } from "@/lib/types";

interface AgentResponse {
  response: string;
  profileUpdate: Partial<CareProfile>;
  requiresEscalation: boolean;
  escalationReason?: string;
  safetyFlag?: boolean;
  _fallback?: boolean;
}

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  profile: Partial<CareProfile>;
  sessionId: string;
  turnNumber: number;
}

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL ?? "http://localhost:3002";
const PROFILE_SERVICE_URL =
  process.env.PROFILE_SERVICE_URL ?? "http://localhost:3003";

const MOCK_MODE =
  process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

async function callAgentService(body: ChatRequestBody): Promise<AgentResponse> {
  const res = await fetch(`${AGENT_SERVICE_URL}/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: body.messages,
      profile: body.profile,
      sessionId: body.sessionId,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`agent-service returned ${res.status}`);
  return res.json() as Promise<AgentResponse>;
}

async function saveProfileUpdate(
  sessionId: string,
  update: Partial<CareProfile>
) {
  try {
    await fetch(`${PROFILE_SERVICE_URL}/profiles/session/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Non-critical — profile is also kept in client state
  }
}

function getMockResponse(turnNumber: number): {
  response: string;
  profileUpdate: Partial<CareProfile>;
  requiresEscalation: boolean;
  pathway: Pathway | null;
} {
  const turn = MOCK_TURNS[turnNumber];
  if (!turn) {
    return {
      response:
        "Thank you for all that information. If you have any more questions, I'm here to help. You can also request a Care Corner coordinator at any time.",
      profileUpdate: {},
      requiresEscalation: false,
      pathway: null,
    };
  }
  const isPathwayTurn = turn.triggerStage === "pathway";
  return {
    response: turn.message,
    profileUpdate: turn.profileUpdate as Partial<CareProfile>,
    requiresEscalation: isPathwayTurn,
    pathway: isPathwayTurn ? MOCK_PATHWAY : null,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json() as ChatRequestBody;
  const { messages, profile, sessionId, turnNumber } = body;

  // If in mock mode OR agent-service unavailable, use scripted mock
  if (MOCK_MODE) {
    const mock = getMockResponse(turnNumber);
    return NextResponse.json(mock);
  }

  // Try live agent-service
  try {
    const agentResult = await callAgentService({ messages, profile, sessionId, turnNumber });

    // Persist profile update (non-blocking)
    if (Object.keys(agentResult.profileUpdate).length > 0) {
      void saveProfileUpdate(sessionId, agentResult.profileUpdate);
    }

    // After 4+ meaningful profile fields, check if pathway should be generated
    const completeness = computeCompleteness(profile);
    const pathway = completeness >= 75 ? MOCK_PATHWAY : null;

    return NextResponse.json({
      response: agentResult.response,
      profileUpdate: agentResult.profileUpdate,
      requiresEscalation: agentResult.requiresEscalation,
      safetyFlag: agentResult.safetyFlag,
      pathway,
    });
  } catch (err) {
    console.warn("[api/chat] agent-service unavailable, falling back to mock:", err);
    const mock = getMockResponse(turnNumber);
    return NextResponse.json({ ...mock, _fallback: true });
  }
}

// Mirrors the shared util (kept local to avoid cross-package TS complexity in Phase 2)
function computeCompleteness(profile: Partial<CareProfile>): number {
  let score = 0;
  if (profile.mode) score += 5;
  if (profile.senior?.name) score += 10;
  if (profile.senior?.age) score += 10;
  if (profile.senior?.livingArrangement) score += 10;
  if (profile.careNeeds?.recentHospitalDischarge !== undefined) score += 10;
  if (profile.careNeeds?.mobility) score += 10;
  if (profile.careNeeds?.chronicConditions?.length) score += 10;
  if (profile.caregiverContext) score += 10;
  if (profile.financial) score += 15;
  return Math.min(100, score);
}
