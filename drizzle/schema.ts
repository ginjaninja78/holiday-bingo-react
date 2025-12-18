import { integer, text, sqliteTable, real } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Game sessions - each game has its own session
 */
export const gameSessions = sqliteTable("game_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostId: integer("host_id").notNull().references(() => users.id),
  sessionCode: text("session_code").notNull().unique(),
  status: text("status", { enum: ["waiting", "active", "paused", "ended"] }).default("waiting").notNull(),
  currentRound: integer("current_round").default(0).notNull(),
  winningPattern: text("winning_pattern", { mode: "json" }).$type<WinningPattern>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

/**
 * Players in a game session (legacy - for multiplayer mode)
 */
export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  playerUuid: text("player_uuid").notNull().unique(),
  playerName: text("player_name").notNull(),
  score: integer("score").default(0).notNull(),
  totalBingos: integer("total_bingos").default(0).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * Managed players (for host-only mode with CSV import/export)
 */
export const managedPlayers = sqliteTable("managed_players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerUuid: text("player_uuid").notNull().unique(),
  playerName: text("player_name"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ManagedPlayer = typeof managedPlayers.$inferSelect;
export type InsertManagedPlayer = typeof managedPlayers.$inferInsert;

/**
 * Player cards - links managed players to their bingo cards
 */
export const playerCards = sqliteTable("player_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerUuid: text("player_uuid").notNull().references(() => managedPlayers.playerUuid),
  cardId: text("card_id").notNull().references(() => generatedCards.cardId),
  gameId: integer("game_id").references(() => hostGameState.id),
  isPlayed: integer("is_played", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type PlayerCard = typeof playerCards.$inferSelect;
export type InsertPlayerCard = typeof playerCards.$inferInsert;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Bingo cards assigned to players
 */
export const bingoCards = sqliteTable("bingo_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerId: integer("player_id").notNull().references(() => players.id),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  roundNumber: integer("round_number").notNull(),
  cardData: text("card_data", { mode: "json" }).notNull().$type<number[][]>(), // 5x5 grid of image IDs
  markedTiles: text("marked_tiles", { mode: "json" }).notNull().$type<boolean[][]>(), // 5x5 grid of marked status
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type BingoCard = typeof bingoCards.$inferSelect;
export type InsertBingoCard = typeof bingoCards.$inferInsert;

/**
 * Called images during a round
 */
export const calledImages = sqliteTable("called_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  roundNumber: integer("round_number").notNull(),
  imageId: integer("image_id").notNull(),
  calledAt: integer("called_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  calledOrder: integer("called_order").notNull(),
});

export type CalledImage = typeof calledImages.$inferSelect;
export type InsertCalledImage = typeof calledImages.$inferInsert;

/**
 * Bingo claims and verifications
 */
export const bingoClaims = sqliteTable("bingo_claims", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => gameSessions.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  roundNumber: integer("round_number").notNull(),
  cardId: integer("card_id").notNull().references(() => bingoCards.id),
  claimType: text("claim_type").notNull(), // "line", "diagonal", "blackout", "custom"
  verified: integer("verified", { mode: "boolean" }).default(false).notNull(),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  claimedAt: integer("claimed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type BingoClaim = typeof bingoClaims.$inferSelect;
export type InsertBingoClaim = typeof bingoClaims.$inferInsert;

/**
 * Admin authentication sessions (for QR code login)
 */
export const adminSessions = sqliteTable("admin_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  qrCode: text("qr_code"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;

/**
 * Type definitions for JSON fields
 */
/**
 * Host game configurations (for host-only mode)
 */
export const hostGameConfigs = sqliteTable("host_game_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostId: integer("host_id").notNull().references(() => users.id),
  gameName: text("game_name").notNull(),
  totalRounds: integer("total_rounds").default(1).notNull(),
  winsPerRound: integer("wins_per_round").default(1).notNull(),
  roundPatterns: text("round_patterns", { mode: "json" }).notNull().$type<WinningPattern[]>(), // Array of patterns, one per round
  imagePool: text("image_pool", { mode: "json" }).notNull().$type<string[]>(), // Array of image IDs to use
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
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

/**
 * Gallery images for host-only mode
 */
export const galleryImages = sqliteTable("gallery_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  label: text("label").notNull(),
  source: text("source", { enum: ["ai_generated", "unsplash"] }).default("ai_generated").notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }), // Soft delete timestamp
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

/**
 * Host game state (for current active game)
 */
export const hostGameState = sqliteTable("host_game_state", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostId: integer("host_id").notNull().references(() => users.id),
  configId: integer("config_id").notNull().references(() => hostGameConfigs.id),
  currentRound: integer("current_round").default(1).notNull(),
  totalRounds: integer("total_rounds").notNull(),
  winsPerRound: integer("wins_per_round").notNull(),
  status: text("status", { enum: ["active", "paused", "ended"] }).default("active").notNull(),
  playedImages: text("played_images", { mode: "json" }).notNull().$type<PlayedImage[]>(),
  currentImageIndex: integer("current_image_index").default(-1).notNull(), // -1 means no image shown yet
  startedAt: integer("started_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type HostGameState = typeof hostGameState.$inferSelect;
export type InsertHostGameState = typeof hostGameState.$inferInsert;

export interface PlayedImage {
  imageId: string;
  imageUrl: string;
  imageLabel: string;
  playedAt: number; // Unix timestamp
  orderIndex: number;
}

/**
 * Unsplash settings
 */
export const unsplashSettings = sqliteTable("unsplash_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostId: integer("host_id").notNull().references(() => users.id).unique(),
  apiKey: text("api_key").notNull(),
  searchTags: text("search_tags").notNull(), // Space-separated tags
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type UnsplashSettings = typeof unsplashSettings.$inferSelect;
export type InsertUnsplashSettings = typeof unsplashSettings.$inferInsert;

/**
 * Generated bingo cards with Card IDs (for host-only mode)
 */
export const generatedCards = sqliteTable("generated_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: text("card_id").notNull().unique(), // 5-char alphanumeric
  batchId: text("batch_id"), // UUID for batch of cards generated together
  gameId: integer("game_id").references(() => hostGameState.id), // Optional: link to specific game
  imageIds: text("image_ids", { mode: "json" }).notNull().$type<number[]>(), // Flat array of 25 image IDs (-1 for FREE space)
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type GeneratedCard = typeof generatedCards.$inferSelect;
export type InsertGeneratedCard = typeof generatedCards.$inferInsert;

/**
 * Game history - archived completed games
 */
export const gameHistory = sqliteTable("game_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: text("game_id").notNull().unique(), // Format: MMDDYY-HHMM
  hostId: integer("host_id").notNull().references(() => users.id),
  gameName: text("game_name"),
  totalRounds: integer("total_rounds").notNull(),
  completedRounds: integer("completed_rounds").notNull(),
  patterns: text("patterns", { mode: "json" }).notNull().$type<WinningPattern[]>(),
  playedImages: text("played_images", { mode: "json" }).notNull().$type<PlayedImage[]>(),
  playerScores: text("player_scores", { mode: "json" }).notNull().$type<PlayerScore[]>(),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type GameHistory = typeof gameHistory.$inferSelect;
export type InsertGameHistory = typeof gameHistory.$inferInsert;

export interface PlayerScore {
  playerUuid: string;
  playerName: string;
  wins: number;
  patternsWon: string[];
  cardIds: string[];
}
