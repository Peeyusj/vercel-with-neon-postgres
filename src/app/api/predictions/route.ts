import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { prediction, match, transaction, profile } from "@/lib/db/schema";
import { requireSession, getOrCreateProfile } from "@/lib/auth/session";
import { eq, and, desc, count, sql } from "drizzle-orm";

// GET /api/predictions - List user predictions
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

    const [predictions, totalResult] = await Promise.all([
      db
        .select({
          id: prediction.id,
          matchId: prediction.matchId,
          selectedTeam: prediction.selectedTeam,
          amount: prediction.amount,
          status: prediction.status,
          isWinner: prediction.isWinner,
          createdAt: prediction.createdAt,
          teamA: match.teamA,
          teamB: match.teamB,
          matchType: match.matchType,
          matchStatus: match.status,
          matchStartTime: match.matchStartTime,
          winner: match.winner,
        })
        .from(prediction)
        .innerJoin(match, eq(prediction.matchId, match.id))
        .where(eq(prediction.userId, session.user.id))
        .orderBy(desc(prediction.createdAt))
        .limit(size)
        .offset(offset),
      db
        .select({ count: count() })
        .from(prediction)
        .where(eq(prediction.userId, session.user.id)),
    ]);

    const totalElements = totalResult[0].count;

    return NextResponse.json({
      success: true,
      data: {
        content: predictions.map((p) => ({
          id: p.id,
          matchId: p.matchId,
          selectedTeam: p.selectedTeam,
          amount: p.amount,
          status: p.status,
          isWinner: p.isWinner,
          createdAt: p.createdAt.toISOString(),
          match: {
            teamA: p.teamA,
            teamB: p.teamB,
            matchType: p.matchType,
            status: p.matchStatus,
            matchStartTime: p.matchStartTime.toISOString(),
            winner: p.winner,
          },
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

// POST /api/predictions - Place a prediction
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const userProfile = await getOrCreateProfile(session.user.id);
    const body = await request.json();
    const { matchId, selectedTeam, amount } = body;

    if (!matchId || !selectedTeam || !amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "matchId, selectedTeam, and positive amount are required",
        },
        { status: 400 },
      );
    }

    // Get the match
    const existingMatch = await db.query.match.findFirst({
      where: eq(match.id, matchId),
    });
    if (!existingMatch) {
      return NextResponse.json(
        { success: false, message: "Match not found" },
        { status: 404 },
      );
    }

    // Check voting is open
    const now = new Date();
    const cutoff = new Date(existingMatch.votingCutoffTime);
    if (existingMatch.status !== "UPCOMING" || now >= cutoff) {
      return NextResponse.json(
        { success: false, message: "Voting is closed for this match" },
        { status: 400 },
      );
    }

    // Validate selected team
    if (
      selectedTeam !== existingMatch.teamA &&
      selectedTeam !== existingMatch.teamB
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected team must be one of the match teams",
        },
        { status: 400 },
      );
    }

    // Check minimum entry fee
    const entryFee = parseFloat(existingMatch.entryFee);
    if (amount < entryFee) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum prediction amount is $${entryFee}`,
        },
        { status: 400 },
      );
    }

    // Check wallet balance
    const walletBalance = parseFloat(userProfile.walletBalance);
    if (amount > walletBalance) {
      return NextResponse.json(
        { success: false, message: "Insufficient wallet balance" },
        { status: 400 },
      );
    }

    // Check duplicate prediction
    const existing = await db.query.prediction.findFirst({
      where: and(
        eq(prediction.userId, session.user.id),
        eq(prediction.matchId, matchId),
      ),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already predicted on this match" },
        { status: 400 },
      );
    }

    // Deduct from wallet
    await db
      .update(profile)
      .set({
        walletBalance: sql`${profile.walletBalance}::numeric - ${String(amount)}::numeric`,
      })
      .where(eq(profile.id, userProfile.id));

    // Create prediction
    const predId = crypto.randomUUID();
    const [created] = await db
      .insert(prediction)
      .values({
        id: predId,
        userId: session.user.id,
        matchId,
        selectedTeam,
        amount: String(amount),
        status: "PENDING",
      })
      .returning();

    // Create debit transaction
    await db.insert(transaction).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      amount: String(amount),
      type: "DEBIT",
      reason: "PREDICTION_BET",
      referenceId: matchId,
    });

    // Compute new wallet balance
    const updatedProfile = await db.query.profile.findFirst({
      where: eq(profile.id, userProfile.id),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          prediction: {
            id: created.id,
            matchId: created.matchId,
            selectedTeam: created.selectedTeam,
            amount: created.amount,
            status: created.status,
            createdAt: created.createdAt.toISOString(),
          },
          newWalletBalance: updatedProfile?.walletBalance || "0.00",
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
