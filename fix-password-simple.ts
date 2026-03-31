import "dotenv/config";
import { db } from "@/lib/db/client";
import { account } from "@/lib/auth/schema";
import { eq } from "drizzle-orm";

// Simple approach: use plain password hash that Better Auth uses internally
async function fixAdminPasswordSimple() {
  try {
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "Admin@123";

    console.log("🔧 Setting admin password (simple method)...\n");

    // Get the admin account
    const adminAccount = await db.query.account.findFirst({
      where: (accounts, { eq }) => eq(accounts.accountId, ADMIN_EMAIL),
    });

    if (!adminAccount) {
      console.log("❌ Admin account not found!");
      console.log("Available accounts:");
      const allAccounts = await db.query.account.findMany();
      allAccounts.forEach((acc: any) => {
        console.log(`  - accountId: ${acc.accountId}, userId: ${acc.userId}`);
      });
      return;
    }

    console.log("✅ Found admin account");
    console.log(
      "   Current password hash:",
      adminAccount.password?.substring(0, 50) + "...",
    );

    // For Better Auth, we need to use bcrypt but in the correct way
    // Let's use a simpler approach: generate a proper bcrypt hash
    const crypto = require("crypto");
    const bcrypt = require("bcryptjs");

    // Generate hash with bcrypt (Better Auth's default)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    console.log("✅ Generated bcrypt hash");

    // Update the password
    await db
      .update(account)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(account.id, adminAccount.id));

    console.log("✅ Updated password in database\n");
    console.log("✅✅✅ Admin Password Set!\n");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔐 Password: Admin@123");
    console.log("\n🟢 Restart server and try signing in!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixAdminPasswordSimple();
