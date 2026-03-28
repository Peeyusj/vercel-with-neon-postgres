import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { transaction, profile, prediction } from "@/lib/db/schema";
import { requireSession, getOrCreateProfile } from "@/lib/auth/session";
import { eq, desc, count, sql, and } from "drizzle-orm";

// GET /api/wallet - Get wallet balance & stats
export async function GET() {
  try {
    const session = await requireSession();
    const userProfile = await getOrCreateProfile(session.user.id);

    // Calculate total winnings
    const [winResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${transaction.amount}::numeric), 0)`,
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, session.user.id),
          eq(transaction.type, "CREDIT"),
          eq(transaction.reason, "PREDICTION_WIN")
        )
      );

    return NextResponse.json({
      success: true,
      data: {
        balance: userProfile.walletBalance,
        totalWinnings: winResult.total || "0.00",
        totalLosses: userProfile.lostMoney,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
