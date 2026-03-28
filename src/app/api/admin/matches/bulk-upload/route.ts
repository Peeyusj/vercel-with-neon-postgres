import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { match, configuration } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { resolveTeamName, MATCH_TYPE_DEFAULTS } from "@/lib/types";
import type { MatchType } from "@/lib/types";

// POST /api/admin/matches/bulk-upload - Bulk upload matches from parsed Excel data
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { matches } = body;

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "matches array is required and must not be empty",
        },
        { status: 400 },
      );
    }

    const results: { success: boolean; index: number; error?: string }[] = [];

    for (let i = 0; i < matches.length; i++) {
      const row = matches[i];
      try {
        const teamA = resolveTeamName(row.teamA || "");
        const teamB = resolveTeamName(row.teamB || "");
        const matchType = (
          row.matchType || "NORMAL"
        ).toUpperCase() as MatchType;
        const matchStartTime = new Date(row.matchStartTime);

        if (!teamA || !teamB || isNaN(matchStartTime.getTime())) {
          results.push({ success: false, index: i, error: "Invalid data" });
          continue;
        }

        const config = await db.query.configuration.findFirst({
          where: eq(configuration.matchType, matchType),
        });
        const defaults =
          MATCH_TYPE_DEFAULTS[matchType] || MATCH_TYPE_DEFAULTS.NORMAL;
        const entryFee = config ? config.entryFee : String(defaults.entryFee);
        const cutoffMins = config
          ? config.cutoffBufferMins
          : defaults.cutoffBufferMins;
        const votingCutoffTime = new Date(
          matchStartTime.getTime() - cutoffMins * 60 * 1000,
        );

        await db.insert(match).values({
          id: crypto.randomUUID(),
          teamA,
          teamB,
          matchType,
          matchStartTime,
          votingCutoffTime,
          status: "UPCOMING",
          entryFee,
        });

        results.push({ success: true, index: i });
      } catch (err) {
        results.push({
          success: false,
          index: i,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} match(es) imported, ${failCount} failed.`,
      data: results,
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
