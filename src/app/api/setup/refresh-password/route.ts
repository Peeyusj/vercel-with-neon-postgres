import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { account } from "@/lib/auth/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Find admin account
    const adminAccount = await db.query.account.findFirst({
      where: eq(account.providerId, "credential"),
    });

    if (!adminAccount) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 404 },
      );
    }

    // Generate new password hash
    const password = "Admin@123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    await db
      .update(account)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(account.id, adminAccount.id));

    return NextResponse.json({
      message: "Password updated",
      email: "admin@gmail.com",
      password: password,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
