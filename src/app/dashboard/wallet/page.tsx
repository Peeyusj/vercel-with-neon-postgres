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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useWallet } from "@/hooks/use-profile";
import type { TransactionResponse } from "@/lib/types";

export default function WalletPage() {
  const { wallet, refetch: refetchWallet } = useWallet();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/transactions?page=${page}&size=10`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.content);
        setTotalPages(data.data.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddFunds = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;
    setAdding(true);
    try {
      const res = await fetch("/api/wallet/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(fundAmount) }),
      });
      const data = await res.json();
      if (data.success) {
        refetchWallet();
        fetchTransactions();
        setShowAddFunds(false);
        setFundAmount("");
      }
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your balance and view transactions.
          </p>
        </div>
        <Button onClick={() => setShowAddFunds(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Funds
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Losses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${wallet ? parseFloat(wallet.totalLosses).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.type === "CREDIT" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <ArrowUpRight className="h-4 w-4" />
                          Credit
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <ArrowDownRight className="h-4 w-4" />
                          Debit
                        </div>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        t.type === "CREDIT"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {t.type === "CREDIT" ? "+" : "-"}$
                      {parseFloat(t.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t.reason.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
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

      {/* Add Funds Dialog */}
      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fund-amount">Amount ($)</Label>
            <Input
              id="fund-amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="100.00"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddFunds(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddFunds} disabled={adding || !fundAmount}>
            {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Funds
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
