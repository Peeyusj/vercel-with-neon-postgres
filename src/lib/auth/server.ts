import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db/client";
import { profile } from "@/lib/db/schema";
import crypto from "crypto";

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "http://localhost:3000";
};

const getTrustedOrigins = () => {
  const origins = ["http://localhost:3000", "http://localhost:3001"];

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  return origins;
};

export const auth = betterAuth({
  baseURL: getBaseURL(),
  trustedOrigins: getTrustedOrigins(),
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Auto-create profile with $100 wallet on signup
          try {
            await db
              .insert(profile)
              .values({
                id: crypto.randomUUID(),
                userId: user.id,
                role: "USER",
                walletBalance: "100.00",
                lostMoney: "0.00",
                isVerified: false,
              })
              .onConflictDoNothing();
          } catch (e) {
            console.error("Failed to create profile for user:", user.id, e);
          }
        },
      },
    },
  },
  plugins: [nextCookies()], // make sure this is the last plugin in the array
});
