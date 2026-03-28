import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profile } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

// PATCH /api/admin/users/[id] - Update user role or wallet
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, id),
    });
    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: "User profile not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (body.role && (body.role === "USER" || body.role === "ADMIN")) {
      updates.role = body.role;
    }
    if (body.walletBalance !== undefined) {
      updates.walletBalance = String(body.walletBalance);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(profile)
      .set(updates)
      .where(eq(profile.userId, id))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message === "Forbidden"
        ? "Forbidden"
        : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}
