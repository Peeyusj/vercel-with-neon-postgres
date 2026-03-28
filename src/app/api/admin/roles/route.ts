import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { role } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";

// GET /api/admin/roles - List all roles
export async function GET() {
  try {
    await requireAdmin();
    const roles = await db.select().from(role);
    return NextResponse.json({ success: true, data: roles });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message === "Forbidden"
        ? "Forbidden"
        : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}

// POST /api/admin/roles - Create a role
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { roleName, description } = body;

    if (!roleName) {
      return NextResponse.json(
        { success: false, message: "roleName is required" },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const [created] = await db
      .insert(role)
      .values({ id, roleName, description })
      .returning();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message === "Forbidden"
        ? "Forbidden"
        : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}
