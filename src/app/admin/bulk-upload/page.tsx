"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";

interface ParsedMatch {
  teamA: string;
  teamB: string;
  matchType: string;
  matchStartTime: string;
}

interface UploadResult {
  success: boolean;
  index: number;
  error?: string;
}

export default function AdminBulkUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedMatch[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [parseError, setParseError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    setResults(null);

    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        setParseError("File must have a header row and at least one data row.");
        return;
      }

      // Skip header row
      const matches: ParsedMatch[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length < 4) continue;
        matches.push({
          teamA: cols[0],
          teamB: cols[1],
          matchType: cols[2] || "NORMAL",
          matchStartTime: cols[3],
        });
      }

      if (matches.length === 0) {
        setParseError("No valid match data found in file.");
        return;
      }

      setParsedData(matches);
    } catch {
      setParseError("Failed to parse file. Ensure it's a CSV file.");
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setUploading(true);
    setResults(null);
    try {
      const res = await fetch("/api/admin/matches/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: parsedData }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch {
      setParseError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = `Team A,Team B,Match Type,Start Time
Mumbai Indians,Chennai Super Kings,NORMAL,2026-04-01T19:30:00
Royal Challengers Bengaluru,Kolkata Knight Riders,NORMAL,2026-04-02T15:30:00
Delhi Capitals,Rajasthan Royals,QUARTERFINAL,2026-04-05T19:30:00`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matches_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Upload</h1>
          <p className="text-muted-foreground">
            Import multiple matches from a CSV file.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            <CardTitle>Upload Matches</CardTitle>
          </div>
          <CardDescription>
            CSV format: Team A, Team B, Match Type (NORMAL/QUARTERFINAL/FINAL),
            Start Time (ISO format). Team names can use abbreviations (MI, CSK, etc).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="w-full h-20 border-dashed"
            >
              <Upload className="mr-2 h-5 w-5" />
              Click to select CSV file
            </Button>
          </div>

          {parseError && (
            <p className="text-sm text-red-500">{parseError}</p>
          )}

          {parsedData.length > 0 && !results && (
            <>
              <div className="text-sm text-muted-foreground">
                {parsedData.length} match(es) parsed from file:
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Team A</TableHead>
                    <TableHead>Team B</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{m.teamA}</TableCell>
                      <TableCell>{m.teamB}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.matchType}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.matchStartTime}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload {parsedData.length} Match(es)
              </Button>
            </>
          )}

          {results && (
            <div className="space-y-3">
              <div className="flex gap-4">
                <Badge variant="success">{successCount} succeeded</Badge>
                {failCount > 0 && (
                  <Badge variant="destructive">{failCount} failed</Badge>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.index}>
                      <TableCell>{r.index + 1}</TableCell>
                      <TableCell>
                        {parsedData[r.index]?.teamA} vs{" "}
                        {parsedData[r.index]?.teamB}
                      </TableCell>
                      <TableCell>
                        {r.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-red-500 text-sm">
                        {r.error || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                variant="outline"
                onClick={() => {
                  setParsedData([]);
                  setResults(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Upload Another File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
