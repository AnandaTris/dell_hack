import { NextRequest, NextResponse } from "next/server";
import { MOCK_CARE_BRIEF } from "@/lib/mock-data";
import type { CareProfile, CareBrief, Pathway } from "@/lib/types";

interface HandoverRequestBody {
  profile: Partial<CareProfile>;
  pathway: Pathway | null;
  sessionId: string;
}

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL ?? "http://localhost:3002";
const PROFILE_SERVICE_URL =
  process.env.PROFILE_SERVICE_URL ?? "http://localhost:3003";

const MOCK_MODE =
  process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

async function saveBrief(brief: CareBrief): Promise<void> {
  try {
    await fetch(`${PROFILE_SERVICE_URL}/care-briefs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Non-critical — coordinator will still see the brief via client state
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandoverRequestBody;
  const { profile, pathway, sessionId } = body;

  if (MOCK_MODE) {
    const brief: CareBrief = {
      ...MOCK_CARE_BRIEF,
      id: `brief-${sessionId}-mock`,
      profileId: sessionId,
      generatedAt: new Date().toISOString(),
      status: "pending",
    };
    void saveBrief(brief);
    return NextResponse.json(brief);
  }

  try {
    const res = await fetch(`${AGENT_SERVICE_URL}/handover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        pathway: pathway ?? { groups: [] },
        sessionId,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`agent-service /handover returned ${res.status}`);

    const briefPayload = (await res.json()) as Omit<CareBrief, "id" | "profileId" | "pathwayId" | "status">;

    const brief: CareBrief = {
      ...briefPayload,
      id: `brief-${sessionId}-${Date.now()}`,
      profileId: sessionId,
      pathwayId: pathway?.id ?? undefined,
      status: "pending",
    };

    void saveBrief(brief);
    return NextResponse.json(brief);
  } catch (err) {
    console.warn("[api/handover] agent-service unavailable, falling back to mock:", err);
    const brief: CareBrief = {
      ...MOCK_CARE_BRIEF,
      id: `brief-${sessionId}-fallback`,
      profileId: sessionId,
      generatedAt: new Date().toISOString(),
      status: "pending",
    };
    void saveBrief(brief);
    return NextResponse.json(brief);
  }
}
