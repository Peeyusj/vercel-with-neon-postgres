"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Trophy,
  CheckCircle,
  Target,
  DollarSign,
  CreditCard,
  Loader2,
  Vote,
} from "lucide-react";
import type { DashboardStats } from "@/lib/types";

interface TodayVote {
  predictionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  match: string;
  matchType: string;
  matchStartTime: string;
  matchStatus: string;
  selectedTeam: string;
  amount: string;
  predictionStatus: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [todayVotes, setTodayVotes] = useState<TodayVote[]>([]);
  const [votesLoading, setVotesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    fetch("/api/admin/today-votes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTodayVotes(d.data);
      })
      .catch(() => {})
      .finally(() => setVotesLoading(false));
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Matches",
      value: stats?.activeMatches ?? 0,
      icon: Trophy,
      color: "text-green-500",
    },
    {
      title: "Completed Matches",
      value: stats?.completedMatches ?? 0,
      icon: CheckCircle,
      color: "text-purple-500",
    },
    {
      title: "Total Predictions",
      value: stats?.totalPredictions ?? 0,
      icon: Target,
      color: "text-orange-500",
    },
    {
      title: "Platform Revenue",
      value: `$${stats ? parseFloat(stats.platformRevenue).toFixed(2) : "0.00"}`,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      title: "Total Payouts",
      value: `$${stats ? parseFloat(stats.totalPayouts).toFixed(2) : "0.00"}`,
      icon: CreditCard,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and key metrics.
        </p>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Today's Votes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-blue-500" />
            <CardTitle>Today&apos;s Votes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {votesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : todayVotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No votes placed today yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Voted For</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Amount
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayVotes.map((v) => (
                    <TableRow key={v.predictionId}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{v.userName}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {v.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{v.match}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.matchType}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-semibold text-xs"
                        >
                          {v.selectedTeam}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        ${parseFloat(v.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={
                            v.predictionStatus === "WON"
                              ? "success"
                              : v.predictionStatus === "LOST"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {v.predictionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(v.createdAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {todayVotes.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Total: <strong>{todayVotes.length}</strong> vote(s) today
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
