import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    const adminUsers = await db.query.user.findMany({
      where: eq(user.email, "admin@gmail.com"),
    });

    if (adminUsers.length === 0) {
      return NextResponse.json({ message: "No admin found" });
    }

    const adminUserId = adminUsers[0].id;

    // Delete in order
    await db.delete(profile).where(eq(profile.userId, adminUserId));
    await db.delete(account).where(eq(account.userId, adminUserId));
    await db.delete(user).where(eq(user.id, adminUserId));

    return NextResponse.json({ message: "Admin deleted", userId: adminUserId });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
