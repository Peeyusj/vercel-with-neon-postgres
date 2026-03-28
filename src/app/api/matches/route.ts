import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { match, configuration } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, desc, and, sql, count } from "drizzle-orm";
import type { MatchStatus, MatchType } from "@/lib/types";
import { MATCH_TYPE_DEFAULTS } from "@/lib/types";

// GET /api/matches - List matches with pagination & filters
export async function GET(request: NextRequest) {
  try {
    await requireSession();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as MatchStatus | null;
    const matchType = searchParams.get("matchType") as MatchType | null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const size = Math.min(50, Math.max(1, parseInt(searchParams.get("size") || "10")));
    const offset = (page - 1) * size;

    const conditions = [];
    if (status) conditions.push(eq(match.status, status));
    if (matchType) conditions.push(eq(match.matchType, matchType));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [matches, totalResult] = await Promise.all([
      db
        .select()
        .from(match)
        .where(whereClause)
        .orderBy(desc(match.matchStartTime))
        .limit(size)
        .offset(offset),
      db.select({ count: count() }).from(match).where(whereClause),
    ]);

    const totalElements = totalResult[0].count;
    const now = new Date();

    const content = matches.map((m) => {
      const cutoff = new Date(m.votingCutoffTime);
      const secondsUntilCutoff = Math.max(
        0,
        Math.floor((cutoff.getTime() - now.getTime()) / 1000)
      );
      return {
        id: m.id,
        teamA: m.teamA,
        teamB: m.teamB,
        matchType: m.matchType,
        status: m.status,
        entryFee: m.entryFee,
        matchStartTime: m.matchStartTime.toISOString(),
        votingCutoffTime: m.votingCutoffTime.toISOString(),
        isVotingOpen: m.status === "UPCOMING" && now < cutoff,
        secondsUntilCutoff,
        winner: m.winner,
        createdAt: m.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        content,
        totalPages: Math.ceil(totalElements / size),
        totalElements,
        currentPage: page,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}

// POST /api/matches - Create a new match (admin only, checked in middleware-style)
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    // Import profile check inline
    const { profile: profileTable } = await import("@/lib/db/schema");
    const userProfile = await db.query.profile.findFirst({
      where: eq(profileTable.userId, session.user.id),
    });
    if (!userProfile || userProfile.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { teamA, teamB, matchType, matchStartTime } = body;

    if (!teamA || !teamB || !matchType || !matchStartTime) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Look up configuration for this match type
    const config = await db.query.configuration.findFirst({
      where: eq(configuration.matchType, matchType),
    });

    const defaults = MATCH_TYPE_DEFAULTS[matchType as MatchType] || MATCH_TYPE_DEFAULTS.NORMAL;
    const entryFee = config ? config.entryFee : String(defaults.entryFee);
    const cutoffMins = config ? config.cutoffBufferMins : defaults.cutoffBufferMins;

    const startTime = new Date(matchStartTime);
    const votingCutoffTime = new Date(startTime.getTime() - cutoffMins * 60 * 1000);

    const id = crypto.randomUUID();
    const [created] = await db
      .insert(match)
      .values({
        id,
        teamA,
        teamB,
        matchType,
        matchStartTime: startTime,
        votingCutoffTime,
        status: "UPCOMING",
        entryFee,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...created,
          matchStartTime: created.matchStartTime.toISOString(),
          votingCutoffTime: created.votingCutoffTime.toISOString(),
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
