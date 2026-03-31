"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

interface PredictionItem {
  id: string;
  matchId: string;
  selectedTeam: string;
  amount: string;
  status: string;
  isWinner: boolean;
  createdAt: string;
  match: {
    teamA: string;
    teamB: string;
    matchType: string;
    status: string;
    matchStartTime: string;
    votingCutoffTime: string;
    winner: string | null;
  };
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Change vote state
  const [changeTarget, setChangeTarget] = useState<PredictionItem | null>(null);
  const [newTeam, setNewTeam] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeFeedback, setChangeFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/predictions?page=${page}&size=10`);
      const data = await res.json();
      if (data.success) {
        setPredictions(data.data.content);
        setTotalPages(data.data.totalPages);
        setTotalElements(data.data.totalElements);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const canChangeVote = (p: PredictionItem) => {
    if (p.status !== "PENDING") return false;
    if (p.match.status !== "UPCOMING") return false;
    const cutoff = new Date(p.match.votingCutoffTime);
    return Date.now() < cutoff.getTime();
  };

  const openChangeModal = (p: PredictionItem) => {
    setChangeTarget(p);
    setNewTeam(p.selectedTeam);
    setChangeFeedback(null);
  };

  const handleChangeVote = async () => {
    if (!changeTarget || !newTeam) return;
    if (newTeam === changeTarget.selectedTeam) {
      setChangeFeedback({ ok: false, msg: "Please select a different team." });
      return;
    }
    setChanging(true);
    setChangeFeedback(null);
    try {
      const res = await fetch(`/api/predictions/${changeTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTeam: newTeam }),
      });
      const data = await res.json();
      if (data.success) {
        setChangeFeedback({ ok: true, msg: "Vote changed successfully!" });
        fetchPredictions();
        setTimeout(() => setChangeTarget(null), 1200);
      } else {
        setChangeFeedback({
          ok: false,
          msg: data.message || "Failed to change vote.",
        });
      }
    } catch {
      setChangeFeedback({ ok: false, msg: "Network error." });
    } finally {
      setChanging(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "WON":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "LOST":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "WON":
        return <Badge variant="success">WON</Badge>;
      case "LOST":
        return <Badge variant="destructive">LOST</Badge>;
      default:
        return <Badge variant="warning">PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Voting History</h1>
        <p className="text-muted-foreground text-sm">
          Track all your predictions and results.{" "}
          {totalElements > 0 && `(${totalElements} total)`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Predictions</CardTitle>
          <CardDescription>
            Complete history of your match predictions. You can change your vote
            for upcoming matches before voting closes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : predictions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              You haven&apos;t placed any predictions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Your Pick</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Amount
                    </TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Winner
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((p) => {
                    const changeable = canChangeVote(p);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {p.match.teamA} vs {p.match.teamB}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.match.matchType}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {p.selectedTeam}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          ${parseFloat(p.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {statusIcon(p.status)}
                            {statusBadge(p.status)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {p.match.winner || (
                            <span className="text-muted-foreground">TBD</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {changeable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openChangeModal(p)}
                            >
                              <RefreshCw className="h-3.5 w-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Change</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
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
        </CardContent>
      </Card>

      {/* Change Vote Modal */}
      <Dialog
        open={!!changeTarget}
        onOpenChange={(o) => !o && setChangeTarget(null)}
      >
        <DialogHeader>
          <DialogTitle>Change Your Vote</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <p className="text-sm text-muted-foreground">
            Match:{" "}
            <strong>
              {changeTarget?.match.teamA} vs {changeTarget?.match.teamB}
            </strong>
            <br />
            Current vote: <strong>{changeTarget?.selectedTeam}</strong>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={
                newTeam === changeTarget?.match.teamA ? "default" : "outline"
              }
              className="h-12 text-xs sm:text-sm"
              onClick={() => setNewTeam(changeTarget?.match.teamA || "")}
            >
              {changeTarget?.match.teamA}
            </Button>
            <Button
              type="button"
              variant={
                newTeam === changeTarget?.match.teamB ? "default" : "outline"
              }
              className="h-12 text-xs sm:text-sm"
              onClick={() => setNewTeam(changeTarget?.match.teamB || "")}
            >
              {changeTarget?.match.teamB}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            You can change your vote any time before voting closes. Your bet
            amount will remain the same.
          </p>
          {changeFeedback && (
            <p
              className={`text-sm font-medium ${
                changeFeedback.ok ? "text-green-600" : "text-red-500"
              }`}
            >
              {changeFeedback.msg}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setChangeTarget(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleChangeVote}
            disabled={
              changing || newTeam === changeTarget?.selectedTeam || !newTeam
            }
          >
            {changing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Vote
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
