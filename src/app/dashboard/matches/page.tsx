"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  Trophy,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  CalendarDays,
  History,
} from "lucide-react";
import type { MatchResponse } from "@/lib/types";
import { getTeamLogo } from "@/lib/team-logos";

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Closed");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className="font-mono text-sm">
      {timeLeft === "Closed" ? (
        <span className="text-red-500">{timeLeft}</span>
      ) : (
        <span className="text-green-500">{timeLeft}</span>
      )}
    </span>
  );
}

function TeamDisplay({
  name,
  isWinner,
  isVoted,
}: {
  name: string;
  isWinner?: boolean;
  isVoted?: boolean;
}) {
  const logo = getTeamLogo(name);
  return (
    <div
      className={`flex flex-col items-center gap-1.5 flex-1 min-w-0 rounded-lg px-2 py-2 transition-colors ${
        isWinner ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" : ""
      } ${isVoted && !isWinner ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" : ""}`}
    >
      {logo ? (
        <Image
          src={logo}
          alt={name}
          width={48}
          height={48}
          className="object-contain"
          unoptimized
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <p className="font-semibold text-xs sm:text-sm text-center leading-tight line-clamp-2">
        {name}
      </p>
      {isWinner && (
        <Badge variant="success" className="text-xs px-1.5 py-0">
          Winner
        </Badge>
      )}
      {isVoted && (
        <Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-400 text-blue-600 dark:text-blue-400">
          Your Vote
        </Badge>
      )}
    </div>
  );
}

type Tab = "today" | "history";
type ModalMode = "predict" | "change";

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>("today");
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state (shared for predict + change)
  const [selectedMatch, setSelectedMatch] = useState<MatchResponse | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("predict");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), size: "20" });
    params.set("dateFilter", tab);
    try {
      const res = await fetch(`/api/matches?${params}`);
      const data = await res.json();
      if (data.success) {
        setMatches(data.data.content);
        setTotalPages(data.data.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Reset page on tab change
  const switchTab = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

  const openPredictModal = (m: MatchResponse) => {
    setSelectedMatch(m);
    setModalMode("predict");
    setSelectedTeam("");
    setResult(null);
  };

  const openChangeModal = (m: MatchResponse) => {
    setSelectedMatch(m);
    setModalMode("change");
    setSelectedTeam(m.userPrediction?.selectedTeam || "");
    setResult(null);
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setSelectedTeam("");
    setResult(null);
  };

  const handlePredict = async () => {
    if (!selectedMatch || !selectedTeam) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          selectedTeam,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: `Vote placed for ${selectedTeam}!` });
        fetchMatches();
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeVote = async () => {
    if (!selectedMatch || !selectedTeam || !selectedMatch.userPrediction) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/predictions/${selectedMatch.userPrediction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTeam }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: `Vote changed to ${selectedTeam}!` });
        fetchMatches();
      } else {
        setResult({ success: false, message: data.message });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
        <p className="text-muted-foreground text-sm">
          Browse matches and place your predictions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => switchTab("today")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "today"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Today
        </button>
        <button
          onClick={() => switchTab("history")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "history"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-4 w-4" />
          History
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {tab === "today"
              ? "No matches scheduled for today."
              : "No match history yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {matches.map((m) => {
            const pred = m.userPrediction;
            const userVotedTeam = pred?.selectedTeam;
            const predStatus = pred?.status;

            return (
              <Card key={m.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <Badge
                      variant={
                        m.status === "UPCOMING"
                          ? "success"
                          : m.status === "COMPLETED"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {m.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{m.matchType}</Badge>
                      <Badge variant="secondary">${m.entryFee}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Team logos row */}
                  <div className="flex items-stretch gap-2">
                    <TeamDisplay
                      name={m.teamA}
                      isWinner={tab === "history" && m.winner === m.teamA}
                      isVoted={tab === "history" && userVotedTeam === m.teamA}
                    />
                    <div className="flex flex-col items-center justify-center shrink-0 px-1">
                      <span className="text-xs text-muted-foreground font-bold">VS</span>
                    </div>
                    <TeamDisplay
                      name={m.teamB}
                      isWinner={tab === "history" && m.winner === m.teamB}
                      isVoted={tab === "history" && userVotedTeam === m.teamB}
                    />
                  </div>

                  {/* Match time */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {new Date(m.matchStartTime).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Today tab: countdown */}
                    {tab === "today" && m.status === "UPCOMING" && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">Closes:</span>
                        <CountdownTimer targetDate={m.votingCutoffTime} />
                      </div>
                    )}

                    {/* History tab: winner label */}
                    {tab === "history" && m.status === "COMPLETED" && m.winner && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Trophy className="h-3.5 w-3.5" />
                        <span className="font-medium text-xs">{m.winner} won</span>
                      </div>
                    )}
                    {tab === "history" && m.status === "CANCELLED" && (
                      <Badge variant="destructive" className="text-xs">Cancelled</Badge>
                    )}
                  </div>

                  {/* Today tab: user vote + action buttons */}
                  {tab === "today" && (
                    <>
                      {pred && (
                        <div className="rounded-md bg-muted px-3 py-2 text-sm flex items-center justify-between">
                          <span className="text-muted-foreground">Your vote:</span>
                          <span className="font-semibold">{pred.selectedTeam}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {m.isVotingOpen && !pred && (
                          <Button className="flex-1" onClick={() => openPredictModal(m)}>
                            Place Prediction
                          </Button>
                        )}
                        {pred?.canChange && (
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => openChangeModal(m)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Change Vote
                          </Button>
                        )}
                        {!m.isVotingOpen && !pred && (
                          <p className="text-xs text-muted-foreground">Voting closed</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* History tab: user result */}
                  {tab === "history" && pred && (
                    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">You voted: </span>
                        <span className="font-semibold">{pred.selectedTeam}</span>
                      </div>
                      {predStatus === "WON" && (
                        <Badge variant="success">WON +${(parseFloat(pred.amount) * 2).toFixed(2)}</Badge>
                      )}
                      {predStatus === "LOST" && (
                        <Badge variant="destructive">LOST -${parseFloat(pred.amount).toFixed(2)}</Badge>
                      )}
                      {predStatus === "PENDING" && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  )}

                  {tab === "history" && !pred && m.status === "COMPLETED" && (
                    <p className="text-xs text-muted-foreground">You did not vote on this match.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Predict / Change Vote Modal */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && closeModal()}>
        <DialogHeader>
          <DialogTitle>
            {modalMode === "predict" ? "Place Your Prediction" : "Change Your Vote"}
          </DialogTitle>
          <DialogDescription>
            {selectedMatch?.teamA} vs {selectedMatch?.teamB}
            {modalMode === "predict" && ` · Entry fee: $${selectedMatch?.entryFee}`}
            {modalMode === "change" &&
              ` · Current vote: ${selectedMatch?.userPrediction?.selectedTeam}`}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-4 text-center space-y-3">
            {result.success ? (
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
            )}
            <p className={result.success ? "text-green-600" : "text-red-600"}>
              {result.message}
            </p>
            <Button onClick={closeModal}>Close</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>
                  {modalMode === "predict" ? "Select Your Prediction" : "Change Vote To"}
                </Label>
                {/* Team options */}
                <div className="grid grid-cols-2 gap-3">
                  {[selectedMatch?.teamA, selectedMatch?.teamB].map((team) => {
                    const logo = team ? getTeamLogo(team) : null;
                    return (
                      <button
                        key={team}
                        type="button"
                        onClick={() => setSelectedTeam(team || "")}
                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                          selectedTeam === team
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {logo ? (
                          <Image
                            src={logo}
                            alt={team || ""}
                            width={40}
                            height={40}
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {team?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                          {team}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Special options */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: "DRAW", label: "Draw", icon: "🤝" },
                    { value: "RAIN", label: "Rain / No Result", icon: "🌧️" },
                    { value: "CANCELLED", label: "Cancelled", icon: "❌" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedTeam(opt.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2.5 transition-colors ${
                        selectedTeam === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-xs font-medium text-center leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {modalMode === "predict"
                  ? `Entry fee: $${selectedMatch?.entryFee} will be deducted from your wallet.`
                  : "You can change your vote any time before the voting cutoff. Your bet amount stays the same."}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={modalMode === "predict" ? handlePredict : handleChangeVote}
                disabled={
                  !selectedTeam ||
                  submitting ||
                  (modalMode === "change" &&
                    selectedTeam === selectedMatch?.userPrediction?.selectedTeam)
                }
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {modalMode === "predict" ? "Confirm Prediction" : "Change Vote"}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
