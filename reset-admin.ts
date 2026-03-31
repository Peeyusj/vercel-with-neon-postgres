import { db } from "@/lib/db/client";
import { user, account, profile } from "@/lib/auth/schema";
import { eq } from "drizzle-orm";

async function resetAdmin() {
  try {
    console.log("🔧 Resetting admin account...\n");

    // Find user
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, "admin@gmail.com"),
    });

    if (existingUser) {
      console.log(`✅ Found user: ${existingUser.id}`);

      // Delete profile
      await db.delete(profile).where(eq(profile.userId, existingUser.id));
      console.log("✅ Deleted profile");

      // Delete account
      await db.delete(account).where(eq(account.userId, existingUser.id));
      console.log("✅ Deleted account");

      // Delete user
      await db.delete(user).where(eq(user.id, existingUser.id));
      console.log("✅ Deleted user");
    }

    console.log("\n✅✅✅ Admin account deleted!");
    console.log("📝 Now signup at http://localhost:3000/sign-up");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Password: Admin@123");
    console.log("(After signup, update role to ADMIN in database)\n");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

resetAdmin();
