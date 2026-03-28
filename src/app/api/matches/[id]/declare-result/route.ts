import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { match, prediction, transaction, profile } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, and, sql } from "drizzle-orm";

// POST /api/matches/[id]/declare-result - Declare match result (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
    });
    if (!userProfile || userProfile.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { winner } = body;

    if (!winner) {
      return NextResponse.json(
        { success: false, message: "Winner is required" },
        { status: 400 }
      );
    }

    // Get the match
    const existingMatch = await db.query.match.findFirst({
      where: eq(match.id, id),
    });
    if (!existingMatch) {
      return NextResponse.json(
        { success: false, message: "Match not found" },
        { status: 404 }
      );
    }
    if (existingMatch.status !== "UPCOMING") {
      return NextResponse.json(
        { success: false, message: "Match result already declared or cancelled" },
        { status: 400 }
      );
    }
    if (winner !== existingMatch.teamA && winner !== existingMatch.teamB) {
      return NextResponse.json(
        { success: false, message: "Winner must be one of the two teams" },
        { status: 400 }
      );
    }

    // Update match status
    await db
      .update(match)
      .set({ status: "COMPLETED", winner })
      .where(eq(match.id, id));

    // Get all predictions for this match
    const predictions = await db
      .select()
      .from(prediction)
      .where(eq(prediction.matchId, id));

    let winnersCount = 0;

    for (const pred of predictions) {
      if (pred.selectedTeam === winner) {
        // Winner: mark as won, credit wallet
        winnersCount++;
        const winnings = String(parseFloat(pred.amount) * 2);

        await db
          .update(prediction)
          .set({ status: "WON", isWinner: true })
          .where(eq(prediction.id, pred.id));

        // Credit winnings to user wallet
        await db
          .update(profile)
          .set({
            walletBalance: sql`${profile.walletBalance}::numeric + ${winnings}::numeric`,
          })
          .where(eq(profile.userId, pred.userId));

        // Create credit transaction
        await db.insert(transaction).values({
          id: crypto.randomUUID(),
          userId: pred.userId,
          amount: winnings,
          type: "CREDIT",
          reason: "PREDICTION_WIN",
          referenceId: pred.id,
        });
      } else {
        // Loser: mark as lost, update lost_money
        await db
          .update(prediction)
          .set({ status: "LOST", isWinner: false })
          .where(eq(prediction.id, pred.id));

        await db
          .update(profile)
          .set({
            lostMoney: sql`${profile.lostMoney}::numeric + ${pred.amount}::numeric`,
          })
          .where(eq(profile.userId, pred.userId));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Match result declared. ${winnersCount} winner(s) out of ${predictions.length} predictions.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
