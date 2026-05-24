import { NextResponse } from "next/server";

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL ?? "http://localhost:3002";

export async function POST() {
  try {
    await fetch(`${AGENT_SERVICE_URL}/reset-mock`, {
      method: "POST",
      signal: AbortSignal.timeout(3_000),
    });
  } catch {
    // Non-critical — mock turn resets client-side anyway
  }
  return NextResponse.json({ ok: true });
}
