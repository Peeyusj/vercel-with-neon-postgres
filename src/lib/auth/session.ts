import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
  });
  if (!userProfile || userProfile.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return { session, profile: userProfile };
}

export async function getOrCreateProfile(userId: string) {
  let userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });
  if (!userProfile) {
    const id = crypto.randomUUID();
    const [created] = await db
      .insert(profile)
      .values({
        id,
        userId,
        role: "USER",
        walletBalance: "100.00",
        lostMoney: "0.00",
        isVerified: false,
      })
      .returning();
    userProfile = created;
  }
  return userProfile;
}
