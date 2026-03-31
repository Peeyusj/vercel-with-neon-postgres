import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { user } from "@/lib/auth/schema";

export async function POST(request: NextRequest) {
  try {
    // Find admin user
    const adminUser = await db.query.user.findFirst({
      where: eq(user.email, "admin@gmail.com"),
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 },
      );
    }

    // Update profile role to ADMIN
    await db
      .update(profile)
      .set({ role: "ADMIN" })
      .where(eq(profile.userId, adminUser.id));

    return NextResponse.json({
      message: "Admin role assigned",
      userId: adminUser.id,
      email: adminUser.email,
      role: "ADMIN",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
