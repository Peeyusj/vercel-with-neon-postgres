import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { match, prediction, transaction, profile } from "@/lib/db/schema";
import { user } from "@/lib/auth/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq, count, sql } from "drizzle-orm";

// GET /api/admin/dashboard - Dashboard analytics
export async function GET() {
  try {
    await requireAdmin();

    const [
      usersResult,
      activeMatchesResult,
      completedMatchesResult,
      predictionsResult,
      revenueResult,
      payoutsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db
        .select({ count: count() })
        .from(match)
        .where(eq(match.status, "UPCOMING")),
      db
        .select({ count: count() })
        .from(match)
        .where(eq(match.status, "COMPLETED")),
      db.select({ count: count() }).from(prediction),
      db
        .select({
          total: sql<string>`COALESCE(SUM(${transaction.amount}::numeric), 0)`,
        })
        .from(transaction)
        .where(eq(transaction.type, "DEBIT")),
      db
        .select({
          total: sql<string>`COALESCE(SUM(${transaction.amount}::numeric), 0)`,
        })
        .from(transaction)
        .where(eq(transaction.reason, "PREDICTION_WIN")),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: usersResult[0].count,
        activeMatches: activeMatchesResult[0].count,
        completedMatches: completedMatchesResult[0].count,
        totalPredictions: predictionsResult[0].count,
        platformRevenue: revenueResult[0].total || "0.00",
        totalPayouts: payoutsResult[0].total || "0.00",
      },
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
