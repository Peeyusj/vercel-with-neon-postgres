import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profile } from "@/lib/db/schema";
import { user } from "@/lib/auth/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

// PATCH /api/admin/users/[id] - Update user profile (role, phone)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 404 },
      );
    }

    const profileUpdates: Record<string, unknown> = {};
    if (body.role && (body.role === "USER" || body.role === "ADMIN")) {
      profileUpdates.role = body.role;
    }
    if (body.phone !== undefined) {
      profileUpdates.phone = body.phone || null;
    }
    if (body.walletBalance !== undefined) {
      profileUpdates.walletBalance = String(body.walletBalance);
    }

    // Update user name in the user table
    const userUpdates: Record<string, unknown> = {};
    if (body.name && typeof body.name === "string" && body.name.trim()) {
      userUpdates.name = body.name.trim();
    }

    if (
      Object.keys(profileUpdates).length === 0 &&
      Object.keys(userUpdates).length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    if (Object.keys(profileUpdates).length > 0) {
      await db
        .update(profile)
        .set(profileUpdates)
        .where(eq(profile.userId, id));
    }

    if (Object.keys(userUpdates).length > 0) {
      await db.update(user).set(userUpdates).where(eq(user.id, id));
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
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

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, id),
    });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Prevent deleting self - check could be done client-side too
    // CASCADE deletes handle profile, sessions, predictions, transactions
    await db.delete(user).where(eq(user.id, id));

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
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
