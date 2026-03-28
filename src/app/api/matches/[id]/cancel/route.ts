import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { match, prediction, transaction, profile } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, sql } from "drizzle-orm";

// POST /api/matches/[id]/cancel - Cancel a match (admin only)
export async function POST(
  _request: NextRequest,
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
        { success: false, message: "Only upcoming matches can be cancelled" },
        { status: 400 }
      );
    }

    // Update match status
    await db
      .update(match)
      .set({ status: "CANCELLED" })
      .where(eq(match.id, id));

    // Refund all predictions
    const predictions = await db
      .select()
      .from(prediction)
      .where(eq(prediction.matchId, id));

    for (const pred of predictions) {
      // Refund wallet
      await db
        .update(profile)
        .set({
          walletBalance: sql`${profile.walletBalance}::numeric + ${pred.amount}::numeric`,
        })
        .where(eq(profile.userId, pred.userId));

      // Create refund transaction
      await db.insert(transaction).values({
        id: crypto.randomUUID(),
        userId: pred.userId,
        amount: pred.amount,
        type: "CREDIT",
        reason: "REFUND",
        referenceId: pred.matchId,
      });

      // Mark prediction as lost (refunded)
      await db
        .update(prediction)
        .set({ status: "LOST", isWinner: false })
        .where(eq(prediction.id, pred.id));
    }

    return NextResponse.json({
      success: true,
      message: `Match cancelled. ${predictions.length} prediction(s) refunded.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
