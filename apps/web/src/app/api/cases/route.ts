import { NextResponse } from "next/server";
import { MOCK_CARE_BRIEF } from "@/lib/mock-data";

const PROFILE_SERVICE_URL =
  process.env.PROFILE_SERVICE_URL ?? "http://localhost:3003";

export async function GET() {
  try {
    const res = await fetch(`${PROFILE_SERVICE_URL}/care-briefs`, {
      signal: AbortSignal.timeout(5_000),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`profile-service returned ${res.status}`);
    const cases = await res.json();
    return NextResponse.json(cases);
  } catch {
    // Return mock data when profile-service is not reachable
    return NextResponse.json([MOCK_CARE_BRIEF]);
  }
}
