import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Game sessions - each game has its own session
 */
export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  hostId: int("host_id").notNull().references(() => users.id),
  sessionCode: varchar("session_code", { length: 16 }).notNull().unique(),
  status: mysqlEnum("status", ["waiting", "active", "paused", "ended"]).default("waiting").notNull(),
  currentRound: int("current_round").default(0).notNull(),
  winningPattern: json("winning_pattern").$type<WinningPattern>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

/**
 * Players in a game session
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull().references(() => gameSessions.id),
  playerUuid: varchar("player_uuid", { length: 64 }).notNull().unique(),
  playerName: varchar("player_name", { length: 100 }).notNull(),
  score: int("score").default(0).notNull(),
  totalBingos: int("total_bingos").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Bingo cards assigned to players
 */
export const bingoCards = mysqlTable("bingo_cards", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("player_id").notNull().references(() => players.id),
  sessionId: int("session_id").notNull().references(() => gameSessions.id),
  roundNumber: int("round_number").notNull(),
  cardData: json("card_data").notNull().$type<number[][]>(), // 5x5 grid of image IDs
  markedTiles: json("marked_tiles").notNull().$type<boolean[][]>(), // 5x5 grid of marked status
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BingoCard = typeof bingoCards.$inferSelect;
export type InsertBingoCard = typeof bingoCards.$inferInsert;

/**
 * Called images during a round
 */
export const calledImages = mysqlTable("called_images", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull().references(() => gameSessions.id),
  roundNumber: int("round_number").notNull(),
  imageId: int("image_id").notNull(),
  calledAt: timestamp("called_at").defaultNow().notNull(),
  calledOrder: int("called_order").notNull(),
});

export type CalledImage = typeof calledImages.$inferSelect;
export type InsertCalledImage = typeof calledImages.$inferInsert;

/**
 * Bingo claims and verifications
 */
export const bingoClaims = mysqlTable("bingo_claims", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull().references(() => gameSessions.id),
  playerId: int("player_id").notNull().references(() => players.id),
  roundNumber: int("round_number").notNull(),
  cardId: int("card_id").notNull().references(() => bingoCards.id),
  claimType: varchar("claim_type", { length: 50 }).notNull(), // "line", "diagonal", "blackout", "custom"
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

export type BingoClaim = typeof bingoClaims.$inferSelect;
export type InsertBingoClaim = typeof bingoClaims.$inferInsert;

/**
 * Admin authentication sessions (for QR code login)
 */
export const adminSessions = mysqlTable("admin_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  sessionToken: varchar("session_token", { length: 128 }).notNull().unique(),
  qrCode: text("qr_code"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;

/**
 * Type definitions for JSON fields
 */
/**
 * Host game configurations (for host-only mode)
 */
export const hostGameConfigs = mysqlTable("host_game_configs", {
  id: int("id").autoincrement().primaryKey(),
  hostId: int("host_id").notNull().references(() => users.id),
  gameName: varchar("game_name", { length: 200 }).notNull(),
  totalRounds: int("total_rounds").default(1).notNull(),
  winsPerRound: int("wins_per_round").default(1).notNull(),
  roundPatterns: json("round_patterns").notNull().$type<WinningPattern[]>(), // Array of patterns, one per round
  imagePool: json("image_pool").notNull().$type<string[]>(), // Array of image IDs to use
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type HostGameConfig = typeof hostGameConfigs.$inferSelect;
export type InsertHostGameConfig = typeof hostGameConfigs.$inferInsert;

/**
 * Type definitions for JSON fields
 */
export interface WinningPattern {
  type: "line" | "diagonal" | "blackout" | "custom" | "four_corners" | "x_pattern";
  name: string;
  positions?: [number, number][]; // For custom patterns: array of [row, col] positions
}
