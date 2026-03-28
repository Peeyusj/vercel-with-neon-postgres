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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

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
    winner: string | null;
  };
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

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
        <p className="text-muted-foreground">
          Track all your predictions and results. {totalElements > 0 && `(${totalElements} total)`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Predictions</CardTitle>
          <CardDescription>Complete history of your match predictions</CardDescription>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Your Pick</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {p.match.teamA} vs {p.match.teamB}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.match.matchType}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.selectedTeam}
                    </TableCell>
                    <TableCell>${parseFloat(p.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusIcon(p.status)}
                        {statusBadge(p.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.match.winner || (
                        <span className="text-muted-foreground">TBD</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </div>
  );
}
