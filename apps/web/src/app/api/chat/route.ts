import { NextRequest, NextResponse } from "next/server";
import { MOCK_TURNS, MOCK_PATHWAY } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { turnNumber } = await req.json() as { turnNumber: number };

  const turn = MOCK_TURNS[turnNumber];
  if (!turn) {
    return NextResponse.json({
      message:
        "Thank you for sharing all of this. If you have any other questions, I'm here to help. You can also request a coordinator at any time.",
      profileUpdate: {},
      pathway: null,
      triggerStage: null,
    });
  }

  const isPathwayTurn = turn.triggerStage === "pathway";

  return NextResponse.json({
    message: turn.message,
    profileUpdate: turn.profileUpdate,
    pathway: isPathwayTurn ? MOCK_PATHWAY : null,
    triggerStage: turn.triggerStage ?? null,
  });
}
