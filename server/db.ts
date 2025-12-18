import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as path from "path";
import {
  InsertUser,
  users,
  gameSessions,
  players,
  bingoCards,
  calledImages,
  bingoClaims,
  adminSessions,
  InsertGameSession,
  InsertPlayer,
  InsertBingoCard,
  InsertCalledImage,
  InsertBingoClaim,
  InsertAdminSession,
  WinningPattern,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: Database.Database | null = null;

export async function getDb() {
  if (!_db) {
    try {
      // Determine database path
      const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bingo.db");
      
      // Ensure data directory exists
      const fs = await import("fs");
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      console.log(`[Database] Connecting to SQLite at: ${dbPath}`);
      _sqlite = new Database(dbPath);
      _sqlite.pragma("journal_mode = WAL"); // Better performance
      _db = drizzle(_sqlite);
      console.log("[Database] SQLite connected successfully");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Operations ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Game Session Operations ============

export async function createGameSession(session: InsertGameSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(gameSessions).values(session).returning({ id: gameSessions.id });
  return result[0].id;
}

export async function getGameSessionByCode(sessionCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionCode, sessionCode))
    .limit(1);

  return result[0];
}

export async function getGameSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1);

  return result[0];
}

export async function updateGameSession(
  sessionId: number,
  updates: Partial<InsertGameSession>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(gameSessions).set(updates).where(eq(gameSessions.id, sessionId));
}

// ============ Player Operations ============

export async function createPlayer(player: InsertPlayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(players).values(player).returning({ id: players.id });
  return result[0].id;
}

export async function getPlayerByUuid(playerUuid: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(players)
    .where(eq(players.playerUuid, playerUuid))
    .limit(1);

  return result[0];
}

export async function getSessionPlayers(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(players)
    .where(eq(players.sessionId, sessionId));
}

export async function updatePlayer(playerId: number, updates: Partial<InsertPlayer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(players).set(updates).where(eq(players.id, playerId));
}

// ============ Bingo Card Operations ============

export async function createBingoCard(card: InsertBingoCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bingoCards).values(card).returning({ id: bingoCards.id });
  return result[0].id;
}

export async function getPlayerCard(playerId: number, roundNumber: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(bingoCards)
    .where(
      and(
        eq(bingoCards.playerId, playerId),
        eq(bingoCards.roundNumber, roundNumber)
      )
    )
    .limit(1);

  return result[0];
}

export async function updateBingoCard(
  cardId: number,
  markedTiles: boolean[][]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(bingoCards)
    .set({ markedTiles })
    .where(eq(bingoCards.id, cardId));
}

// ============ Called Images Operations ============

export async function addCalledImage(calledImage: InsertCalledImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(calledImages).values(calledImage).returning({ id: calledImages.id });
  return result[0].id;
}

export async function getCalledImages(sessionId: number, roundNumber: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(calledImages)
    .where(
      and(
        eq(calledImages.sessionId, sessionId),
        eq(calledImages.roundNumber, roundNumber)
      )
    )
    .orderBy(calledImages.calledOrder);
}

// ============ Bingo Claims Operations ============

export async function createBingoClaim(claim: InsertBingoClaim) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bingoClaims).values(claim).returning({ id: bingoClaims.id });
  return result[0].id;
}

export async function getPendingClaims(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bingoClaims)
    .where(
      and(
        eq(bingoClaims.sessionId, sessionId),
        eq(bingoClaims.verified, false)
      )
    )
    .orderBy(desc(bingoClaims.claimedAt));
}

export async function verifyBingoClaim(claimId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(bingoClaims)
    .set({ verified: true, verifiedAt: new Date() })
    .where(eq(bingoClaims.id, claimId));
}

// ============ Admin Session Operations ============

export async function createAdminSession(session: InsertAdminSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(adminSessions).values(session).returning({ id: adminSessions.id });
  return result[0].id;
}

export async function getAdminSessionByToken(sessionToken: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.sessionToken, sessionToken))
    .limit(1);

  return result[0];
}

export async function deleteExpiredAdminSessions() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  await db
    .delete(adminSessions)
    .where(eq(adminSessions.expiresAt, now));
}
