import "dotenv/config";
import { db } from "@/lib/db/client";
import { user, account } from "@/lib/auth/schema";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function verifyAdmin() {
  try {
    // Get the admin user
    const adminUser = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@gmail.com"),
    });

    console.log("👤 Admin User:", {
      id: adminUser?.id,
      email: adminUser?.email,
      name: adminUser?.name,
      emailVerified: adminUser?.emailVerified,
    });

    if (adminUser) {
      // Check the account
      const adminAccount = await db.query.account.findFirst({
        where: (accounts, { eq }) => eq(accounts.userId, adminUser.id),
      });

      console.log("🔐 Admin Account:", {
        id: adminAccount?.id,
        hasPassword: !!adminAccount?.password,
        accountId: adminAccount?.accountId,
        providerId: adminAccount?.providerId,
      });

      // Check the profile
      const adminProfile = await db.query.profile.findFirst({
        where: (profiles, { eq }) => eq(profiles.userId, adminUser.id),
      });

      console.log("👑 Admin Profile:", {
        id: adminProfile?.id,
        role: adminProfile?.role,
        walletBalance: adminProfile?.walletBalance,
        isVerified: adminProfile?.isVerified,
      });

      if (adminProfile?.role !== "ADMIN") {
        console.log("\n⚠️  Role is not ADMIN, updating...");
        await db
          .update(profile)
          .set({ role: "ADMIN" })
          .where(eq(profile.userId, adminUser.id));
        console.log("✅ Role updated to ADMIN");
      }
    }

    console.log("\n✅ Admin Credentials:");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔐 Password: Admin@123");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

verifyAdmin();
