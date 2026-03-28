"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Trophy,
  CheckCircle,
  Target,
  DollarSign,
  CreditCard,
  Loader2,
} from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
