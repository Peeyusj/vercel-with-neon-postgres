import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { prediction, match } from "@/lib/db/schema";
import { user } from "@/lib/auth/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq, gte, desc } from "drizzle-orm";

// GET /api/admin/today-votes - Get all predictions placed today
export async function GET() {
  try {
    await requireAdmin();

    // Today's start (midnight local → UTC handled by DB)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const votes = await db
      .select({
        predictionId: prediction.id,
        userId: prediction.userId,
        userName: user.name,
        userEmail: user.email,
        matchId: prediction.matchId,
        teamA: match.teamA,
        teamB: match.teamB,
        matchType: match.matchType,
        matchStartTime: match.matchStartTime,
        matchStatus: match.status,
        selectedTeam: prediction.selectedTeam,
        amount: prediction.amount,
        predictionStatus: prediction.status,
        createdAt: prediction.createdAt,
      })
      .from(prediction)
      .innerJoin(user, eq(prediction.userId, user.id))
      .innerJoin(match, eq(prediction.matchId, match.id))
      .where(gte(prediction.createdAt, todayStart))
      .orderBy(desc(prediction.createdAt));

    return NextResponse.json({
      success: true,
      data: votes.map((v) => ({
        predictionId: v.predictionId,
        userId: v.userId,
        userName: v.userName,
        userEmail: v.userEmail,
        matchId: v.matchId,
        match: `${v.teamA} vs ${v.teamB}`,
        matchType: v.matchType,
        matchStartTime: v.matchStartTime.toISOString(),
        matchStatus: v.matchStatus,
        selectedTeam: v.selectedTeam,
        amount: v.amount,
        predictionStatus: v.predictionStatus,
        createdAt: v.createdAt.toISOString(),
      })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message === "Forbidden"
        ? "Forbidden"
        : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}
