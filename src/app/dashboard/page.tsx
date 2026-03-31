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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Trophy,
  TrendingUp,
  Clock,
  ArrowRight,
  KeyRound,
  Loader2,
  TrendingDown,
} from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import type { MatchResponse, LeaderboardEntry } from "@/lib/types";

export default function DashboardPage() {
  const { profile } = useProfile();
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [predictionCount, setPredictionCount] = useState(0);

  // Change password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/matches?status=UPCOMING&size=5")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMatches(d.data.content);
      })
      .catch(() => {});

    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLeaderboard(d.data.slice(0, 5));
      })
      .catch(() => {});

    fetch("/api/predictions?size=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPredictionCount(d.data.totalElements);
        }
      })
      .catch(() => {});
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setPwdFeedback({ ok: false, msg: "Passwords do not match." });
      return;
    }
    if (newPwd.length < 6) {
      setPwdFeedback({
        ok: false,
        msg: "Password must be at least 6 characters.",
      });
      return;
    }
    setPwdLoading(true);
    setPwdFeedback(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPwdFeedback({ ok: true, msg: "Password updated successfully!" });
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        setPwdFeedback({
          ok: false,
          msg: data.message || "Failed to update password.",
        });
      }
    } catch {
      setPwdFeedback({ ok: false, msg: "Network error." });
    } finally {
      setPwdLoading(false);
    }
  };

  const lostMoney = profile?.lostMoney ? parseFloat(profile.lostMoney) : 0;
  const wonMoney = profile?.wonMoney ? parseFloat(profile.wonMoney) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Your prediction overview and quick stats.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
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
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${wonMoney.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Losses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${lostMoney.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
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
            <CardDescription>
              Place your predictions before cutoff
            </CardDescription>
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
                    className="flex items-center justify-between rounded-lg border p-3 gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.teamA} vs {m.teamB}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.matchStartTime).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
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
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
                        {entry.rank}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-600 shrink-0">
                      ${parseFloat(entry.totalWinnings).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your account password for security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <PasswordInput
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Current password"
                required
                disabled={pwdLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <PasswordInput
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min. 6 characters"
                required
                disabled={pwdLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <PasswordInput
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={pwdLoading}
              />
            </div>
            {pwdFeedback && (
              <p
                className={`text-sm ${pwdFeedback.ok ? "text-green-600" : "text-red-500"}`}
              >
                {pwdFeedback.msg}
              </p>
            )}
            <Button type="submit" disabled={pwdLoading}>
              {pwdLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
