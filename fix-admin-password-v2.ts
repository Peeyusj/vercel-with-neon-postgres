import "dotenv/config";
import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Use Node's built-in crypto for password hashing (compatible with Better Auth)
import { scryptSync, randomBytes } from "crypto";

async function fixAdminPasswordV2() {
  try {
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "Admin@123";

    console.log("🔧 Fixing admin password (v2)...\n");

    // Get the admin user
    const adminUser = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, ADMIN_EMAIL),
    });

    if (!adminUser) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("✅ Found admin user:", adminUser.id);

    // Generate salt
    const salt = randomBytes(16).toString("hex");

    // Scrypt hash the password (faster than bcrypt and compatible with Better Auth)
    const hashedPassword = scryptSync(ADMIN_PASSWORD, salt, 32).toString("hex");

    // Better Auth format: salt + hash
    const betterAuthPassword = `${salt}:${hashedPassword}`;

    console.log("✅ Generated scrypt hash with salt");

    // Delete old account record
    const deleted = await db
      .delete(account)
      .where(eq(account.userId, adminUser.id));

    console.log("✅ Deleted old account record");

    // Create new account record with scrypt password
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: ADMIN_EMAIL,
      providerId: "credential",
      userId: adminUser.id,
      password: betterAuthPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Created new account with scrypt password\n");

    // Verify profile
    const adminProfile = await db.query.profile.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, adminUser.id),
    });

    if (!adminProfile) {
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
      await db
        .update(profile)
        .set({ role: "ADMIN" })
        .where(eq(profile.userId, adminUser.id));
      console.log("✅ Updated profile role to ADMIN");
    }

    console.log("\n✅✅✅ Admin Password Fixed!\n");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔐 Password: Admin@123");
    console.log("\n🟢 Try signing in now - it should work!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixAdminPasswordV2();
