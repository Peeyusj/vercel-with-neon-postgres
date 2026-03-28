// ─── Match Types ────────────────────────────────────────────
export type MatchType = "NORMAL" | "QUARTERFINAL" | "FINAL";
export type MatchStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";
export type PredictionStatus = "PENDING" | "WON" | "LOST";
export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionReason =
  | "PREDICTION_BET"
  | "PREDICTION_WIN"
  | "REFUND"
  | "ADD_FUNDS";
export type UserRole = "USER" | "ADMIN";
export type RefundType = "FULL" | "PARTIAL" | "NONE";
export type CostBearer = "PLATFORM" | "POOL" | "NONE";

// ─── API Response ───────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

// ─── Match ──────────────────────────────────────────────────
export interface MatchResponse {
  id: string;
  teamA: string;
  teamB: string;
  matchType: MatchType;
  status: MatchStatus;
  entryFee: string;
  matchStartTime: string;
  votingCutoffTime: string;
  isVotingOpen: boolean;
  secondsUntilCutoff: number;
  winner: string | null;
  createdAt: string;
}

export interface CreateMatchInput {
  teamA: string;
  teamB: string;
  matchType: MatchType;
  matchStartTime: string;
}

export interface DeclareResultInput {
  winner: string;
}

// ─── Prediction ─────────────────────────────────────────────
export interface PredictionResponse {
  id: string;
  matchId: string;
  selectedTeam: string;
  amount: string;
  status: PredictionStatus;
  isWinner: boolean;
  createdAt: string;
  match?: MatchResponse;
}

export interface PlacePredictionInput {
  matchId: string;
  selectedTeam: string;
  amount: number;
}

// ─── Wallet ─────────────────────────────────────────────────
export interface WalletBalance {
  balance: string;
  totalWinnings: string;
  totalLosses: string;
}

export interface TransactionResponse {
  id: string;
  amount: string;
  type: TransactionType;
  reason: TransactionReason;
  referenceId: string | null;
  createdAt: string;
}

// ─── Profile ────────────────────────────────────────────────
export interface ProfileResponse {
  id: string;
  userId: string;
  phone: string | null;
  role: UserRole;
  walletBalance: string;
  lostMoney: string;
  isVerified: boolean;
  name: string;
  email: string;
  createdAt: string;
}

// ─── Configuration ──────────────────────────────────────────
export interface ConfigurationResponse {
  id: string;
  matchType: MatchType;
  entryFee: string;
  refundType: RefundType;
  refundPercent: string;
  costBearer: CostBearer;
  cutoffBufferMins: number;
  autoLock: boolean;
}

export interface UpdateConfigInput {
  matchType: MatchType;
  entryFee: number;
  refundType: RefundType;
  refundPercent: number;
  costBearer: CostBearer;
  cutoffBufferMins: number;
  autoLock: boolean;
}

// ─── Roles ──────────────────────────────────────────────────
export interface RoleResponse {
  id: string;
  roleName: string;
  description: string | null;
  createdAt: string;
}

// ─── Admin Dashboard ────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  activeMatches: number;
  completedMatches: number;
  totalPredictions: number;
  platformRevenue: string;
  totalPayouts: string;
}

// ─── Leaderboard ────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalWinnings: string;
  totalPredictions: number;
}

// ─── IPL Teams ──────────────────────────────────────────────
export const IPL_TEAMS: Record<string, string> = {
  MI: "Mumbai Indians",
  CSK: "Chennai Super Kings",
  RCB: "Royal Challengers Bengaluru",
  KKR: "Kolkata Knight Riders",
  DC: "Delhi Capitals",
  PBKS: "Punjab Kings",
  RR: "Rajasthan Royals",
  SRH: "Sunrisers Hyderabad",
  GT: "Gujarat Titans",
  LSG: "Lucknow Super Giants",
};

export function resolveTeamName(input: string): string {
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();
  if (IPL_TEAMS[upper]) return IPL_TEAMS[upper];
  // Check if it's already a full name
  const fullNames = Object.values(IPL_TEAMS);
  const found = fullNames.find(
    (name) => name.toLowerCase() === trimmed.toLowerCase(),
  );
  return found || trimmed;
}

// ─── Match Type Config Defaults ─────────────────────────────
export const MATCH_TYPE_DEFAULTS: Record<
  MatchType,
  { entryFee: number; cutoffBufferMins: number }
> = {
  NORMAL: { entryFee: 20, cutoffBufferMins: 5 },
  QUARTERFINAL: { entryFee: 50, cutoffBufferMins: 10 },
  FINAL: { entryFee: 100, cutoffBufferMins: 15 },
};
