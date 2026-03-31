import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { account } from "@/lib/auth/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// POST /api/admin/users/[id]/reset-password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { newPassword } = body;

    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Find the credential account for this user
    const credAccount = await db.query.account.findFirst({
      where: and(eq(account.userId, id), eq(account.providerId, "credential")),
    });

    if (!credAccount) {
      return NextResponse.json(
        {
          success: false,
          message: "No credential account found for this user",
        },
        { status: 404 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db
      .update(account)
      .set({ password: hashed })
      .where(and(eq(account.userId, id), eq(account.providerId, "credential")));

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
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
