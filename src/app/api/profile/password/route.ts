import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { account } from "@/lib/auth/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// PATCH /api/profile/password - User changes own password
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "currentPassword and newPassword are required",
        },
        { status: 400 },
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    // Find credential account
    const credAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "credential"),
      ),
    });

    if (!credAccount || !credAccount.password) {
      return NextResponse.json(
        { success: false, message: "No password account found" },
        { status: 404 },
      );
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, credAccount.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db
      .update(account)
      .set({ password: hashed })
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, "credential"),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
