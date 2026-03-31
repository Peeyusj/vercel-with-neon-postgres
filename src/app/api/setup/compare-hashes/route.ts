import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { account } from "@/lib/auth/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get both test user and admin user passwords to compare formats
    const testAccount = await db.query.account.findFirst({
      where: eq(account.providerId, "testuser123@example.com"),
    });

    const adminAccount = await db.query.account.findFirst({
      where: eq(account.providerId, "credential"),
    });

    const response: any = {
      testUser: null,
      adminUser: null,
    };

    if (testAccount) {
      response.testUser = {
        provider: testAccount.providerId,
        passwordHashLength: testAccount.password?.length,
        passwordHashFirst100: testAccount.password?.substring(0, 100),
        passwordHashFormat: testAccount.password?.substring(0, 30),
      };
    }

    if (adminAccount) {
      response.adminUser = {
        provider: adminAccount.providerId,
        passwordHashLength: adminAccount.password?.length,
        passwordHashFirst100: adminAccount.password?.substring(0, 100),
        passwordHashFormat: adminAccount.password?.substring(0, 30),
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
