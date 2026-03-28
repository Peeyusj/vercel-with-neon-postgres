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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  Trophy,
  Ban,
  CheckCircle,
} from "lucide-react";
import type { MatchResponse, MatchType } from "@/lib/types";
import { IPL_TEAMS } from "@/lib/types";

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create match
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    teamA: "",
    teamB: "",
    matchType: "NORMAL" as MatchType,
    matchStartTime: "",
  });

  // Declare result
  const [declareMatch, setDeclareMatch] = useState<MatchResponse | null>(null);
  const [declareWinner, setDeclareWinner] = useState("");
  const [declaring, setDeclaring] = useState(false);

  // Cancel
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches?page=${page}&size=20`);
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
  }, [page]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setCreateForm({ teamA: "", teamB: "", matchType: "NORMAL", matchStartTime: "" });
        fetchMatches();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleDeclareResult = async () => {
    if (!declareMatch || !declareWinner) return;
    setDeclaring(true);
    try {
      const res = await fetch(`/api/matches/${declareMatch.id}/declare-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winner: declareWinner }),
      });
      const data = await res.json();
      if (data.success) {
        setDeclareMatch(null);
        setDeclareWinner("");
        fetchMatches();
      }
    } catch {
      // ignore
    } finally {
      setDeclaring(false);
    }
  };

  const handleCancel = async (matchId: string) => {
    setCancelling(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) fetchMatches();
    } catch {
      // ignore
    } finally {
      setCancelling(null);
    }
  };

  const teamOptions = Object.values(IPL_TEAMS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Matches</h1>
          <p className="text-muted-foreground">Create, declare results, and manage matches.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Match
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : matches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No matches found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teams</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.teamA} vs {m.teamB}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.matchType}</Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.matchStartTime).toLocaleString()}
                    </TableCell>
                    <TableCell>${m.entryFee}</TableCell>
                    <TableCell>{m.winner || "-"}</TableCell>
                    <TableCell>
                      {m.status === "UPCOMING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeclareMatch(m);
                              setDeclareWinner("");
                            }}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Result
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            disabled={cancelling === m.id}
                            onClick={() => handleCancel(m.id)}
                          >
                            {cancelling === m.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Ban className="mr-1 h-3 w-3" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Match Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
          <DialogDescription>Set up a new IPL match for predictions.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Team A</Label>
            <Select
              value={createForm.teamA}
              onChange={(e) => setCreateForm({ ...createForm, teamA: e.target.value })}
            >
              <option value="">Select team...</option>
              {teamOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Team B</Label>
            <Select
              value={createForm.teamB}
              onChange={(e) => setCreateForm({ ...createForm, teamB: e.target.value })}
            >
              <option value="">Select team...</option>
              {teamOptions.filter((t) => t !== createForm.teamA).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Match Type</Label>
            <Select
              value={createForm.matchType}
              onChange={(e) => setCreateForm({ ...createForm, matchType: e.target.value as MatchType })}
            >
              <option value="NORMAL">Normal ($20)</option>
              <option value="QUARTERFINAL">Quarterfinal ($50)</option>
              <option value="FINAL">Final ($100)</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Match Start Time</Label>
            <Input
              type="datetime-local"
              value={createForm.matchStartTime}
              onChange={(e) => setCreateForm({ ...createForm, matchStartTime: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !createForm.teamA || !createForm.teamB || !createForm.matchStartTime}
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Match
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Declare Result Dialog */}
      <Dialog open={!!declareMatch} onOpenChange={(open) => !open && setDeclareMatch(null)}>
        <DialogHeader>
          <DialogTitle>Declare Match Result</DialogTitle>
          <DialogDescription>
            {declareMatch?.teamA} vs {declareMatch?.teamB}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Label>Select Winner</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={declareWinner === declareMatch?.teamA ? "default" : "outline"}
              className="h-12"
              onClick={() => setDeclareWinner(declareMatch?.teamA || "")}
            >
              <Trophy className="mr-2 h-4 w-4" />
              {declareMatch?.teamA}
            </Button>
            <Button
              type="button"
              variant={declareWinner === declareMatch?.teamB ? "default" : "outline"}
              className="h-12"
              onClick={() => setDeclareWinner(declareMatch?.teamB || "")}
            >
              <Trophy className="mr-2 h-4 w-4" />
              {declareMatch?.teamB}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeclareMatch(null)}>Cancel</Button>
          <Button onClick={handleDeclareResult} disabled={declaring || !declareWinner}>
            {declaring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Declare Result
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
