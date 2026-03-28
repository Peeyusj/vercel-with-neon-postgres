import { db } from "@/lib/db/client";
import { user } from "@/lib/auth/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminUser = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@gmail.com"),
    });

    if (!adminUser) {
      return NextResponse.json(
        {
          message: "Admin user not found in database",
          email: "admin@gmail.com",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Admin user exists",
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          emailVerified: adminUser.emailVerified,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking admin:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
