import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/auth/schema";

// ─── Profiles ───────────────────────────────────────────────
export const profile = pgTable(
  "profile",
  {
    id: text("id").primaryKey(), // same as user.id
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    phone: text("phone"),
    role: text("role").notNull().default("USER"), // USER | ADMIN
    walletBalance: numeric("wallet_balance", { precision: 12, scale: 2 })
      .notNull()
      .default("100.00"),
    lostMoney: numeric("lost_money", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("profile_userId_idx").on(table.userId)],
);

// ─── Matches ────────────────────────────────────────────────
export const match = pgTable(
  "match",
  {
    id: text("id").primaryKey(),
    teamA: text("team_a").notNull(),
    teamB: text("team_b").notNull(),
    matchType: text("match_type").notNull().default("NORMAL"), // NORMAL | QUARTERFINAL | FINAL
    matchStartTime: timestamp("match_start_time").notNull(),
    votingCutoffTime: timestamp("voting_cutoff_time").notNull(),
    status: text("status").notNull().default("UPCOMING"), // UPCOMING | COMPLETED | CANCELLED
    winner: text("winner"),
    entryFee: numeric("entry_fee", { precision: 10, scale: 2 })
      .notNull()
      .default("20.00"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("match_status_idx").on(table.status),
    index("match_start_time_idx").on(table.matchStartTime),
  ],
);

// ─── Predictions ────────────────────────────────────────────
export const prediction = pgTable(
  "prediction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    matchId: text("match_id")
      .notNull()
      .references(() => match.id, { onDelete: "cascade" }),
    selectedTeam: text("selected_team").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: text("status").notNull().default("PENDING"), // PENDING | WON | LOST
    isWinner: boolean("is_winner").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("prediction_userId_idx").on(table.userId),
    index("prediction_matchId_idx").on(table.matchId),
    uniqueIndex("prediction_user_match_idx").on(table.userId, table.matchId),
  ],
);

// ─── Transactions ───────────────────────────────────────────
export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    type: text("type").notNull(), // CREDIT | DEBIT
    reason: text("reason").notNull(), // PREDICTION_BET | PREDICTION_WIN | REFUND | ADD_FUNDS
    referenceId: text("reference_id"), // match or prediction id
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("transaction_userId_idx").on(table.userId)],
);

// ─── Configurations ─────────────────────────────────────────
export const configuration = pgTable("configuration", {
  id: text("id").primaryKey(),
  matchType: text("match_type").notNull().unique(), // NORMAL | QUARTERFINAL | FINAL
  entryFee: numeric("entry_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("20.00"),
  refundType: text("refund_type").notNull().default("FULL"), // FULL | PARTIAL | NONE
  refundPercent: numeric("refund_percent", { precision: 5, scale: 2 })
    .notNull()
    .default("100.00"),
  costBearer: text("cost_bearer").notNull().default("PLATFORM"), // PLATFORM | POOL | NONE
  cutoffBufferMins: integer("cutoff_buffer_mins").notNull().default(5),
  autoLock: boolean("auto_lock").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Roles ──────────────────────────────────────────────────
export const role = pgTable("role", {
  id: text("id").primaryKey(),
  roleName: text("role_name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Relations ──────────────────────────────────────────────
export const profileRelations = relations(profile, ({ one, many }) => ({
  user: one(user, { fields: [profile.userId], references: [user.id] }),
  predictions: many(prediction),
  transactions: many(transaction),
}));

export const matchRelations = relations(match, ({ many }) => ({
  predictions: many(prediction),
}));

export const predictionRelations = relations(prediction, ({ one }) => ({
  user: one(user, { fields: [prediction.userId], references: [user.id] }),
  match: one(match, { fields: [prediction.matchId], references: [match.id] }),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, { fields: [transaction.userId], references: [user.id] }),
}));
