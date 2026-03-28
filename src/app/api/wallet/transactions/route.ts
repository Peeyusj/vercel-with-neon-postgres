import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { transaction } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, desc, count } from "drizzle-orm";

// GET /api/wallet/transactions - Get transaction history
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const size = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("size") || "10")),
    );
    const offset = (page - 1) * size;

    const [transactions, totalResult] = await Promise.all([
      db
        .select()
        .from(transaction)
        .where(eq(transaction.userId, session.user.id))
        .orderBy(desc(transaction.createdAt))
        .limit(size)
        .offset(offset),
      db
        .select({ count: count() })
        .from(transaction)
        .where(eq(transaction.userId, session.user.id)),
    ]);

    const totalElements = totalResult[0].count;

    return NextResponse.json({
      success: true,
      data: {
        content: transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          reason: t.reason,
          referenceId: t.referenceId,
          createdAt: t.createdAt.toISOString(),
        })),
        totalPages: Math.ceil(totalElements / size),
        totalElements,
        currentPage: page,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
