import "dotenv/config";
import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";

async function seedAdmin() {
  try {
    console.log("🔄 Starting admin seed...");

    // Check if admin already exists
    const existingAdmin = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, ADMIN_EMAIL),
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists!");
      return;
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

    console.log("✅ Admin user created:", ADMIN_EMAIL);

    // Create account with password
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: "email",
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
    });

    console.log("✅ Admin account created with password");

    // Create admin profile
    await db.insert(profile).values({
      id: crypto.randomUUID(),
      userId: userId,
      role: "ADMIN",
      walletBalance: "10000.00",
      lostMoney: "0.00",
      isVerified: true,
    });

    console.log("✅ Admin profile created with role: ADMIN");
    console.log("\n📧 Admin Credentials:");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("\n✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
