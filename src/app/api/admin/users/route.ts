import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profile } from "@/lib/db/schema";
import { user } from "@/lib/auth/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq, desc, count } from "drizzle-orm";

// GET /api/admin/users - List all users with profiles
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const size = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("size") || "20")),
    );
    const offset = (page - 1) * size;

    const [users, totalResult] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          role: profile.role,
          walletBalance: profile.walletBalance,
          lostMoney: profile.lostMoney,
          phone: profile.phone,
          isVerified: profile.isVerified,
        })
        .from(user)
        .leftJoin(profile, eq(user.id, profile.userId))
        .orderBy(desc(user.createdAt))
        .limit(size)
        .offset(offset),
      db.select({ count: count() }).from(user),
    ]);

    const totalElements = totalResult[0].count;

    return NextResponse.json({
      success: true,
      data: {
        content: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || "USER",
          walletBalance: u.walletBalance || "100.00",
          lostMoney: u.lostMoney || "0.00",
          phone: u.phone,
          isVerified: u.isVerified ?? false,
          createdAt: u.createdAt.toISOString(),
        })),
        totalPages: Math.ceil(totalElements / size),
        totalElements,
        currentPage: page,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message === "Forbidden"
        ? "Forbidden"
        : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }
}
