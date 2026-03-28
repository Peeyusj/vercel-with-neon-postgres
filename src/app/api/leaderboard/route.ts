import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { prediction, transaction, profile } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { sql, eq, and, desc } from "drizzle-orm";
import { user } from "@/lib/auth/schema";

// GET /api/leaderboard - Top 100 users by total winnings
export async function GET() {
  try {
    await requireSession();

    const leaderboard = await db
      .select({
        userId: prediction.userId,
        name: user.name,
        totalWinnings: sql<string>`COALESCE(SUM(CASE WHEN ${prediction.status} = 'WON' THEN ${prediction.amount}::numeric * 2 ELSE 0 END), 0)`,
        totalPredictions: sql<number>`COUNT(${prediction.id})::int`,
      })
      .from(prediction)
      .innerJoin(user, eq(prediction.userId, user.id))
      .groupBy(prediction.userId, user.name)
      .orderBy(
        desc(
          sql`COALESCE(SUM(CASE WHEN ${prediction.status} = 'WON' THEN ${prediction.amount}::numeric * 2 ELSE 0 END), 0)`
        )
      )
      .limit(100);

    const content = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      name: entry.name,
      totalWinnings: entry.totalWinnings,
      totalPredictions: entry.totalPredictions,
    }));

    return NextResponse.json({ success: true, data: content });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
