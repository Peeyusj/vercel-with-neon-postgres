import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    // Find and delete broken admin account
    const adminUsers = await db.query.user.findMany({
      where: eq(user.email, "admin@gmail.com"),
    });

    if (adminUsers.length > 0) {
      const adminUserId = adminUsers[0].id;

      // Delete profile first
      await db.delete(profile).where(eq(profile.userId, adminUserId));

      // Delete accounts
      await db.delete(account).where(eq(account.userId, adminUserId));

      // Delete user
      await db.delete(user).where(eq(user.id, adminUserId));

      return NextResponse.json({
        message: "Broken admin account deleted",
        userId: adminUserId,
      });
    }

    return NextResponse.json({ message: "No admin account found" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.toString() },
      { status: 500 },
    );
  }
}
