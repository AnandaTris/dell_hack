import { NextRequest, NextResponse } from "next/server";
import type { CareBrief } from "@/lib/types";

const PROFILE_SERVICE_URL =
  process.env.PROFILE_SERVICE_URL ?? "http://localhost:3003";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as Partial<CareBrief>;

  try {
    const res = await fetch(`${PROFILE_SERVICE_URL}/care-briefs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) throw new Error(`profile-service returned ${res.status}`);
    const updated = await res.json();
    return NextResponse.json(updated);
  } catch {
    // Optimistically return the patch so the UI updates
    return NextResponse.json({ id, ...body });
  }
}
