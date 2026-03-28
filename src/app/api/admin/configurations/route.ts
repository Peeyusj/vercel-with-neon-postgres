import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { configuration } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { MatchType } from "@/lib/types";

// GET /api/admin/configurations - List all configs
export async function GET() {
  try {
    await requireAdmin();
    const configs = await db.select().from(configuration);
    return NextResponse.json({ success: true, data: configs });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message === "Forbidden"
        ? "Forbidden"
        : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}

// POST /api/admin/configurations - Create or update configuration
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const {
      matchType,
      entryFee,
      refundType,
      refundPercent,
      costBearer,
      cutoffBufferMins,
      autoLock,
    } = body;

    if (!matchType) {
      return NextResponse.json(
        { success: false, message: "matchType is required" },
        { status: 400 },
      );
    }

    // Check if configuration exists
    const existing = await db.query.configuration.findFirst({
      where: eq(configuration.matchType, matchType),
    });

    if (existing) {
      // Update
      const [updated] = await db
        .update(configuration)
        .set({
          entryFee: String(entryFee ?? existing.entryFee),
          refundType: refundType ?? existing.refundType,
          refundPercent: String(refundPercent ?? existing.refundPercent),
          costBearer: costBearer ?? existing.costBearer,
          cutoffBufferMins: cutoffBufferMins ?? existing.cutoffBufferMins,
          autoLock: autoLock ?? existing.autoLock,
        })
        .where(eq(configuration.id, existing.id))
        .returning();

      return NextResponse.json({ success: true, data: updated });
    } else {
      // Create
      const id = crypto.randomUUID();
      const [created] = await db
        .insert(configuration)
        .values({
          id,
          matchType,
          entryFee: String(entryFee || 20),
          refundType: refundType || "FULL",
          refundPercent: String(refundPercent || 100),
          costBearer: costBearer || "PLATFORM",
          cutoffBufferMins: cutoffBufferMins || 5,
          autoLock: autoLock ?? true,
        })
        .returning();

      return NextResponse.json(
        { success: true, data: created },
        { status: 201 },
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message === "Forbidden"
        ? "Forbidden"
        : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}
