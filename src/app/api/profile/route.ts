import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profile } from "@/lib/db/schema";
import { requireSession, getOrCreateProfile } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

// GET /api/profile - Get current user profile
export async function GET() {
  try {
    const session = await requireSession();
    const userProfile = await getOrCreateProfile(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        id: userProfile.id,
        userId: userProfile.userId,
        phone: userProfile.phone,
        role: userProfile.role,
        walletBalance: userProfile.walletBalance,
        lostMoney: userProfile.lostMoney,
        isVerified: userProfile.isVerified,
        name: session.user.name,
        email: session.user.email,
        createdAt: userProfile.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}

// PATCH /api/profile - Update profile (phone)
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const userProfile = await getOrCreateProfile(session.user.id);
    const body = await request.json();

    const [updated] = await db
      .update(profile)
      .set({ phone: body.phone })
      .where(eq(profile.id, userProfile.id))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
