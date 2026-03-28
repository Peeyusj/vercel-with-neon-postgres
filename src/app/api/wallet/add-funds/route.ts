import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profile, transaction } from "@/lib/db/schema";
import { requireSession, getOrCreateProfile } from "@/lib/auth/session";
import { eq, sql } from "drizzle-orm";

// POST /api/wallet/add-funds - Add funds to wallet
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const userProfile = await getOrCreateProfile(session.user.id);
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Add to wallet
    await db
      .update(profile)
      .set({
        walletBalance: sql`${profile.walletBalance}::numeric + ${String(amount)}::numeric`,
      })
      .where(eq(profile.id, userProfile.id));

    // Create transaction
    await db.insert(transaction).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      amount: String(amount),
      type: "CREDIT",
      reason: "ADD_FUNDS",
      referenceId: null,
    });

    const updated = await db.query.profile.findFirst({
      where: eq(profile.id, userProfile.id),
    });

    return NextResponse.json({
      success: true,
      data: { balance: updated?.walletBalance || "0.00" },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
