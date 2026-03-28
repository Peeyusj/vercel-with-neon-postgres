"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Wallet, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { useWallet } from "@/hooks/use-profile";
import type { MatchResponse, LeaderboardEntry } from "@/lib/types";

export default function DashboardPage() {
  const { wallet } = useWallet();
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [predictionCount, setPredictionCount] = useState(0);

  useEffect(() => {
    // Fetch upcoming matches
    fetch("/api/matches?status=UPCOMING&size=5")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMatches(d.data.content);
      })
      .catch(() => {});

    // Fetch leaderboard top 5
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLeaderboard(d.data.slice(0, 5));
      })
      .catch(() => {});

    // Fetch prediction count
    fetch("/api/predictions?size=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPredictionCount(d.data.totalElements);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your prediction overview and quick stats.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${wallet ? parseFloat(wallet.balance).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Winnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${wallet ? parseFloat(wallet.totalWinnings).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Predictions Made
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictionCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Matches
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Matches</CardTitle>
              <Link href="/dashboard/matches">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Place your predictions before cutoff</CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming matches right now.
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {m.teamA} vs {m.teamB}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.matchStartTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">${m.entryFee}</Badge>
                      {m.isVotingOpen ? (
                        <Badge variant="success">Open</Badge>
                      ) : (
                        <Badge variant="warning">Closed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Predictors</CardTitle>
              <Link href="/dashboard/leaderboard">
                <Button variant="ghost" size="sm">
                  Full Board <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Top 5 on the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No leaderboard data yet.
              </p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {entry.rank}
                      </span>
                      <span className="text-sm font-medium">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      ${parseFloat(entry.totalWinnings).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
