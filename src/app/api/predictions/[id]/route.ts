import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { prediction, match } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";

// PATCH /api/predictions/[id] - Change vote (before cutoff)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await request.json();
    const { selectedTeam } = body;

    if (!selectedTeam) {
      return NextResponse.json(
        { success: false, message: "selectedTeam is required" },
        { status: 400 },
      );
    }

    // Find the prediction
    const existingPrediction = await db.query.prediction.findFirst({
      where: and(eq(prediction.id, id), eq(prediction.userId, session.user.id)),
    });

    if (!existingPrediction) {
      return NextResponse.json(
        { success: false, message: "Prediction not found" },
        { status: 404 },
      );
    }

    if (existingPrediction.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot change vote for a completed prediction",
        },
        { status: 400 },
      );
    }

    // Get the match
    const existingMatch = await db.query.match.findFirst({
      where: eq(match.id, existingPrediction.matchId),
    });

    if (!existingMatch) {
      return NextResponse.json(
        { success: false, message: "Match not found" },
        { status: 404 },
      );
    }

    // Check voting is still open (before votingCutoffTime)
    const now = new Date();
    const cutoff = new Date(existingMatch.votingCutoffTime);
    if (existingMatch.status !== "UPCOMING" || now >= cutoff) {
      return NextResponse.json(
        {
          success: false,
          message: "Voting is closed. You can no longer change your vote.",
        },
        { status: 400 },
      );
    }

    // Validate the selected team
    const specialOptions = ["DRAW", "RAIN", "CANCELLED"];
    if (
      selectedTeam !== existingMatch.teamA &&
      selectedTeam !== existingMatch.teamB &&
      !specialOptions.includes(selectedTeam)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid selection" },
        { status: 400 },
      );
    }

    if (selectedTeam === existingPrediction.selectedTeam) {
      return NextResponse.json(
        { success: false, message: "You already voted for this team" },
        { status: 400 },
      );
    }

    // Update the prediction
    const [updated] = await db
      .update(prediction)
      .set({ selectedTeam })
      .where(eq(prediction.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        selectedTeam: updated.selectedTeam,
        amount: updated.amount,
        status: updated.status,
      },
      message: "Vote changed successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
