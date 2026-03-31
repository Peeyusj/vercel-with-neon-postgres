"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
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

function parseCSV(text: string): ParsedMatch[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];
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
  return matches;
}

function parseExcel(buffer: ArrayBuffer): ParsedMatch[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rows.length < 2) return [];
  const matches: ParsedMatch[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;
    const teamA = String(row[0] || "").trim();
    const teamB = String(row[1] || "").trim();
    const matchType = String(row[2] || "NORMAL").trim();
    let startTime = String(row[3] || "").trim();

    // Excel may give serial date numbers – convert them
    if (!isNaN(Number(startTime)) && Number(startTime) > 0) {
      const date = XLSX.SSF.parse_date_code(Number(startTime));
      if (date) {
        const pad = (n: number) => String(n).padStart(2, "0");
        startTime = `${date.y}-${pad(date.m)}-${pad(date.d)}T${pad(date.H)}:${pad(date.M)}:${pad(date.S)}`;
      }
    }

    if (!teamA || !teamB) continue;
    matches.push({ teamA, teamB, matchType, matchStartTime: startTime });
  }
  return matches;
}

export default function AdminBulkUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedMatch[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [parseError, setParseError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    setResults(null);
    setFileName(file.name);

    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type.includes("spreadsheetml") ||
      file.type.includes("ms-excel");

    try {
      let matches: ParsedMatch[] = [];

      if (isExcel) {
        const buffer = await file.arrayBuffer();
        matches = parseExcel(buffer);
      } else {
        const text = await file.text();
        matches = parseCSV(text);
      }

      if (matches.length === 0) {
        setParseError(
          "No valid match data found in file. Ensure header row + data rows with 4 columns.",
        );
        return;
      }
      setParsedData(matches);
    } catch (err) {
      console.error(err);
      setParseError("Failed to parse file. Check that format is correct.");
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
      } else {
        setParseError(data.message || "Upload failed.");
      }
    } catch {
      setParseError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadCSV = () => {
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

  const handleDownloadExcel = () => {
    const data = [
      ["Team A", "Team B", "Match Type", "Start Time"],
      [
        "Mumbai Indians",
        "Chennai Super Kings",
        "NORMAL",
        "2026-04-01T19:30:00",
      ],
      [
        "Royal Challengers Bengaluru",
        "Kolkata Knight Riders",
        "NORMAL",
        "2026-04-02T15:30:00",
      ],
      [
        "Delhi Capitals",
        "Rajasthan Royals",
        "QUARTERFINAL",
        "2026-04-05T19:30:00",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matches");
    XLSX.writeFile(wb, "matches_template.xlsx");
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Upload</h1>
          <p className="text-muted-foreground">
            Import multiple matches from a CSV or Excel file.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            <CardTitle>Upload Matches</CardTitle>
          </div>
          <CardDescription>
            Supports <strong>.csv</strong> and <strong>.xlsx / .xls</strong>{" "}
            files. Columns: Team A, Team B, Match Type
            (NORMAL/QUARTERFINAL/FINAL), Start Time (ISO: YYYY-MM-DDTHH:MM:SS).
            Team names support abbreviations (MI, CSK, RCB, etc).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="w-full h-20 border-dashed"
            >
              <Upload className="mr-2 h-5 w-5" />
              {fileName
                ? `Selected: ${fileName}`
                : "Click to select CSV or Excel file"}
            </Button>
          </div>

          {parseError && <p className="text-sm text-red-500">{parseError}</p>}

          {parsedData.length > 0 && !results && (
            <>
              <div className="text-sm text-muted-foreground">
                {parsedData.length} match(es) parsed from file:
              </div>
              <div className="overflow-x-auto">
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
              </div>
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
              <div className="overflow-x-auto">
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
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setParsedData([]);
                  setResults(null);
                  setFileName("");
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
