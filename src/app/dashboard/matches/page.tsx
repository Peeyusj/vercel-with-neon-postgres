"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock, Trophy, Loader2, CheckCircle, XCircle } from "lucide-react";
import type { MatchResponse, MatchStatus } from "@/lib/types";

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
      setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
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

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Prediction modal state
  const [selectedMatch, setSelectedMatch] = useState<MatchResponse | null>(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [amount, setAmount] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), size: "10" });
    if (statusFilter !== "ALL") params.set("status", statusFilter);
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
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handlePredict = async () => {
    if (!selectedMatch || !selectedTeam || !amount) return;
    setPredicting(true);
    setPredictionResult(null);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          selectedTeam,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPredictionResult({
          success: true,
          message: `Prediction placed! New balance: $${parseFloat(data.data.newWalletBalance).toFixed(2)}`,
        });
        fetchMatches();
      } else {
        setPredictionResult({ success: false, message: data.message });
      }
    } catch {
      setPredictionResult({ success: false, message: "Network error" });
    } finally {
      setPredicting(false);
    }
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setSelectedTeam("");
    setAmount("");
    setPredictionResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
          <p className="text-muted-foreground">
            Browse matches and place your predictions.
          </p>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-40"
        >
          <option value="ALL">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No matches found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
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
                  <Badge variant="outline">{m.matchType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4 text-center">
                  <div className="flex-1">
                    <p className="text-lg font-bold">{m.teamA}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">VS</span>
                    <span className="text-sm font-semibold mt-1">${m.entryFee}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold">{m.teamB}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(m.matchStartTime).toLocaleDateString()}</span>
                  </div>
                  {m.status === "UPCOMING" && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Voting:</span>
                      <CountdownTimer targetDate={m.votingCutoffTime} />
                    </div>
                  )}
                  {m.status === "COMPLETED" && m.winner && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Trophy className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">{m.winner}</span>
                    </div>
                  )}
                </div>

                {m.isVotingOpen && (
                  <Button
                    className="w-full"
                    onClick={() => setSelectedMatch(m)}
                  >
                    Place Prediction
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
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

      {/* Prediction Modal */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && closeModal()}>
        <DialogHeader>
          <DialogTitle>Place Your Prediction</DialogTitle>
          <DialogDescription>
            {selectedMatch?.teamA} vs {selectedMatch?.teamB} &middot; Entry fee: $
            {selectedMatch?.entryFee}
          </DialogDescription>
        </DialogHeader>

        {predictionResult ? (
          <div className="py-4 text-center space-y-3">
            {predictionResult.success ? (
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
            )}
            <p
              className={
                predictionResult.success ? "text-green-600" : "text-red-600"
              }
            >
              {predictionResult.message}
            </p>
            <Button onClick={closeModal}>Close</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Select Winner</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={
                      selectedTeam === selectedMatch?.teamA
                        ? "default"
                        : "outline"
                    }
                    className="h-12"
                    onClick={() =>
                      setSelectedTeam(selectedMatch?.teamA || "")
                    }
                  >
                    {selectedMatch?.teamA}
                  </Button>
                  <Button
                    type="button"
                    variant={
                      selectedTeam === selectedMatch?.teamB
                        ? "default"
                        : "outline"
                    }
                    className="h-12"
                    onClick={() =>
                      setSelectedTeam(selectedMatch?.teamB || "")
                    }
                  >
                    {selectedMatch?.teamB}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (min: ${selectedMatch?.entryFee})
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={selectedMatch?.entryFee}
                  step="0.01"
                  placeholder={`$${selectedMatch?.entryFee}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={handlePredict}
                disabled={!selectedTeam || !amount || predicting}
              >
                {predicting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Prediction
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
