import "dotenv/config";
import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";

async function fixAdminPassword() {
  try {
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "Admin@123";

    console.log("🔧 Fixing admin password...\n");

    // Get the admin user
    const adminUser = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, ADMIN_EMAIL),
    });

    if (!adminUser) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("Found admin user:", adminUser.id);

    // Delete old account record
    await db.delete(account).where(eq(account.userId, adminUser.id));

    console.log("✅ Deleted old account record");

    // Hash password with bcrypt (using 10 salt rounds)
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    console.log("✅ Generated new password hash");

    // Create new account record with correct password hash
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: ADMIN_EMAIL,
      providerId: "credential",
      userId: adminUser.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Created new account record with password\n");

    // Verify profile has ADMIN role
    const adminProfile = await db.query.profile.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, adminUser.id),
    });

    if (!adminProfile) {
      console.log("⚠️  Creating admin profile...");
      await db.insert(profile).values({
        id: crypto.randomUUID(),
        userId: adminUser.id,
        role: "ADMIN",
        walletBalance: "10000.00",
        lostMoney: "0.00",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Created admin profile");
    } else if (adminProfile.role !== "ADMIN") {
      console.log("⚠️  Updating admin role...");
      await db
        .update(profile)
        .set({ role: "ADMIN" })
        .where(eq(profile.userId, adminUser.id));
      console.log("✅ Updated role to ADMIN");
    }

    console.log("\n✅ Admin Password Fixed!\n");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔐 Password: Admin@123");
    console.log("\nTry signing in now!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixAdminPassword();
