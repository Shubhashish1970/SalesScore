import { NextResponse } from "next/server";
import { generateCommentary } from "@/gemini";
import type { ScorecardData } from "@/types/scorecard";

export const dynamic = "force-dynamic";

/**
 * POST /api/gemini/commentary
 * Body: ScorecardData (JSON). Returns Gemini commentary JSON.
 * Requires GEMINI_API_KEY or GOOGLE_API_KEY.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scorecard = body as ScorecardData;

    if (!scorecard?.role || !scorecard?.mobile) {
      return NextResponse.json(
        { error: "Invalid scorecard: role and mobile required." },
        { status: 400 }
      );
    }

    const commentary = await generateCommentary(scorecard);
    return NextResponse.json(commentary);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Commentary generation failed.";
    if (message.includes("API key")) {
      return NextResponse.json({ error: message }, { status: 501 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
