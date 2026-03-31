import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function deleteOldAdmin() {
  try {
    console.log("🗑️  Deleting old admin account...\n");

    // Test connection by querying users
    const users = await db.select().from(user).limit(1);
    console.log("✅ Database connection works, found", users.length, "users");

    // Find the admin user
    const adminUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, "admin@gmail.com"));

    if (adminUsers.length === 0) {
      console.log("ℹ️  No admin account found");
      return;
    }

    const adminUserId = adminUsers[0].id;
    console.log(`Found admin user: ${adminUserId}`);

    // Delete profile
    await db.delete(profile).where(eq(profile.userId, adminUserId));
    console.log("✅ Deleted profile");

    // Delete account
    await db.delete(account).where(eq(account.userId, adminUserId));
    console.log("✅ Deleted account");

    // Delete user
    await db.delete(user).where(eq(user.id, adminUserId));
    console.log("✅ Deleted user");

    console.log("\n✅✅✅ Old admin account removed!");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  }
}

deleteOldAdmin();
