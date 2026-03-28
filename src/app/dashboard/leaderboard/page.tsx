"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trophy, Medal } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLeaderboard(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rankStyle = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (rank === 2) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    if (rank === 3) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top 100 predictors ranked by total winnings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Top Predictors</CardTitle>
          </div>
          <CardDescription>
            Rankings based on cumulative winnings from correct predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No leaderboard data yet. Start predicting!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Predictions</TableHead>
                  <TableHead className="text-right">Total Winnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.userId} className={rankStyle(entry.rank)}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {entry.rank <= 3 && (
                          <Medal
                            className={`h-4 w-4 ${
                              entry.rank === 1
                                ? "text-yellow-500"
                                : entry.rank === 2
                                ? "text-gray-400"
                                : "text-orange-500"
                            }`}
                          />
                        )}
                        <span className="font-bold">{entry.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.totalPredictions}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ${parseFloat(entry.totalWinnings).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
