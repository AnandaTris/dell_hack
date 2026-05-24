import { NextRequest, NextResponse } from "next/server";
import { MOCK_PATHWAY } from "@/lib/mock-data";
import type { CareProfile, Pathway } from "@/lib/types";

interface NavigateRequestBody {
  profile: Partial<CareProfile>;
  sessionId: string;
}

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL ?? "http://localhost:3002";

const MOCK_MODE =
  process.env.MOCK_MODE === "true" || !process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as NavigateRequestBody;
  const { profile, sessionId } = body;

  if (MOCK_MODE) {
    return NextResponse.json({
      ...MOCK_PATHWAY,
      id: `pathway-${sessionId}-mock`,
      profileId: sessionId,
      generatedAt: new Date().toISOString(),
    });
  }

  try {
    const res = await fetch(`${AGENT_SERVICE_URL}/navigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, sessionId }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`agent-service /navigate returned ${res.status}`);
    }

    const pathway = (await res.json()) as Pathway;
    return NextResponse.json(pathway);
  } catch (err) {
    console.warn("[api/navigate] agent-service unavailable, falling back to mock:", err);
    return NextResponse.json({
      ...MOCK_PATHWAY,
      id: `pathway-${sessionId}-fallback`,
      profileId: sessionId,
      generatedAt: new Date().toISOString(),
      _fallback: true,
    });
  }
}
