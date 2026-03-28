import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "Admin@123";

    // Check if admin already exists
    const existingAdmin = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, ADMIN_EMAIL),
    });

    if (existingAdmin) {
      // User exists but might not have ADMIN role - update it
      const existingProfile = await db.query.profile.findFirst({
        where: (profiles, { eq }) => eq(profiles.userId, existingAdmin.id),
      });

      if (existingProfile?.role === "ADMIN") {
        return NextResponse.json(
          { message: "✅ Admin user already exists!", email: ADMIN_EMAIL },
          { status: 200 },
        );
      }

      // Update role to ADMIN
      if (existingProfile) {
        await db
          .update(profile)
          .set({ role: "ADMIN" })
          .where(eq(profile.userId, existingAdmin.id));
      }

      return NextResponse.json(
        {
          message: "✅ Admin role granted successfully!",
          email: ADMIN_EMAIL,
        },
        { status: 200 },
      );
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create user
    await db.insert(user).values({
      id: userId,
      email: ADMIN_EMAIL,
      name: "Admin",
      emailVerified: true,
    });

    // Create account with password using Better Auth's expected format
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: ADMIN_EMAIL,
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
    });

    // Create admin profile with high wallet balance
    await db.insert(profile).values({
      id: crypto.randomUUID(),
      userId: userId,
      role: "ADMIN",
      walletBalance: "10000.00",
      lostMoney: "0.00",
      isVerified: true,
    });

    return NextResponse.json(
      {
        message: "✅ Admin user created successfully!",
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        },
        note: "Password must be entered exactly as shown above",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin user", details: String(error) },
      { status: 500 },
    );
  }
}
