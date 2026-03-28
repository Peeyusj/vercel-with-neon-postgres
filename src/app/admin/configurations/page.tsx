"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, Edit } from "lucide-react";
import type { ConfigurationResponse, MatchType, RefundType, CostBearer } from "@/lib/types";

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<ConfigurationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ConfigurationResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    matchType: "NORMAL" as MatchType,
    entryFee: "20",
    refundType: "FULL" as RefundType,
    refundPercent: "100",
    costBearer: "PLATFORM" as CostBearer,
    cutoffBufferMins: "5",
    autoLock: true,
  });

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/admin/configurations");
      const data = await res.json();
      if (data.success) setConfigs(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleEdit = (config: ConfigurationResponse) => {
    setEditing(config);
    setForm({
      matchType: config.matchType,
      entryFee: config.entryFee,
      refundType: config.refundType,
      refundPercent: config.refundPercent,
      costBearer: config.costBearer,
      cutoffBufferMins: String(config.cutoffBufferMins),
      autoLock: config.autoLock,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchType: form.matchType,
          entryFee: parseFloat(form.entryFee),
          refundType: form.refundType,
          refundPercent: parseFloat(form.refundPercent),
          costBearer: form.costBearer,
          cutoffBufferMins: parseInt(form.cutoffBufferMins),
          autoLock: form.autoLock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditing(null);
        fetchConfigs();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDefault = async (type: MatchType) => {
    const defaults: Record<MatchType, { fee: number; buffer: number }> = {
      NORMAL: { fee: 20, buffer: 5 },
      QUARTERFINAL: { fee: 50, buffer: 10 },
      FINAL: { fee: 100, buffer: 15 },
    };
    const d = defaults[type];
    try {
      await fetch("/api/admin/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchType: type,
          entryFee: d.fee,
          refundType: "FULL",
          refundPercent: 100,
          costBearer: "PLATFORM",
          cutoffBufferMins: d.buffer,
          autoLock: true,
        }),
      });
      fetchConfigs();
    } catch {
      // ignore
    }
  };

  const allTypes: MatchType[] = ["NORMAL", "QUARTERFINAL", "FINAL"];
  const missingTypes = allTypes.filter(
    (t) => !configs.find((c) => c.matchType === t)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Manage entry fees, refund policies, and voting cutoffs per match type.
        </p>
      </div>

      {missingTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Initialize Missing Configurations</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {missingTypes.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => handleCreateDefault(type)}
              >
                Create {type}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Match Type Configurations</CardTitle>
          </div>
          <CardDescription>Current settings for each match type</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : configs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No configurations yet. Create default configurations above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match Type</TableHead>
                  <TableHead>Entry Fee</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead>Cost Bearer</TableHead>
                  <TableHead>Cutoff (min)</TableHead>
                  <TableHead>Auto Lock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Badge variant="outline">{c.matchType}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${parseFloat(c.entryFee).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {c.refundType} ({c.refundPercent}%)
                    </TableCell>
                    <TableCell>{c.costBearer}</TableCell>
                    <TableCell>{c.cutoffBufferMins}</TableCell>
                    <TableCell>
                      <Badge variant={c.autoLock ? "success" : "secondary"}>
                        {c.autoLock ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogHeader>
          <DialogTitle>Edit Configuration: {form.matchType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Entry Fee ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.entryFee}
              onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Refund Type</Label>
            <Select
              value={form.refundType}
              onChange={(e) => setForm({ ...form, refundType: e.target.value as RefundType })}
            >
              <option value="FULL">Full</option>
              <option value="PARTIAL">Partial</option>
              <option value="NONE">None</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Refund Percent</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={form.refundPercent}
              onChange={(e) => setForm({ ...form, refundPercent: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cost Bearer</Label>
            <Select
              value={form.costBearer}
              onChange={(e) => setForm({ ...form, costBearer: e.target.value as CostBearer })}
            >
              <option value="PLATFORM">Platform</option>
              <option value="POOL">Pool</option>
              <option value="NONE">None</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cutoff Buffer (minutes)</Label>
            <Input
              type="number"
              min="1"
              value={form.cutoffBufferMins}
              onChange={(e) => setForm({ ...form, cutoffBufferMins: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoLock"
              checked={form.autoLock}
              onChange={(e) => setForm({ ...form, autoLock: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="autoLock">Auto-lock voting at cutoff</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
