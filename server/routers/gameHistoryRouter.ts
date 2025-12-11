/**
 * Game History Router
 * Handles archiving and retrieval of completed games
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { gameHistory, type PlayerScore } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const gameHistoryRouter = router({
  /**
   * Archive a completed game
   */
  archive: publicProcedure
    .input(
      z.object({
        hostId: z.number(),
        gameName: z.string().optional(),
        totalRounds: z.number(),
        completedRounds: z.number(),
        patterns: z.array(z.object({
          type: z.enum(["line", "diagonal", "blackout", "custom", "four_corners", "x_pattern"]),
          name: z.string(),
          positions: z.array(z.tuple([z.number(), z.number()])).optional(),
        })),
        playedImages: z.array(z.object({
          imageId: z.string(),
          imageUrl: z.string(),
          imageLabel: z.string(),
          playedAt: z.number(),
          orderIndex: z.number(),
        })),
        playerScores: z.array(z.object({
          playerUuid: z.string(),
          playerName: z.string(),
          wins: z.number(),
          patternsWon: z.array(z.string()),
          cardIds: z.array(z.string()),
        })),
        startedAt: z.number(), // Unix timestamp
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Generate game ID in format MMDDYY-HHMM
      const startDate = new Date(input.startedAt);
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const year = String(startDate.getFullYear()).slice(-2);
      const hours = String(startDate.getHours()).padStart(2, '0');
      const minutes = String(startDate.getMinutes()).padStart(2, '0');
      const gameId = `${month}${day}${year}-${hours}${minutes}`;

      await db.insert(gameHistory).values({
        gameId,
        hostId: input.hostId,
        gameName: input.gameName || null,
        totalRounds: input.totalRounds,
        completedRounds: input.completedRounds,
        patterns: input.patterns,
        playedImages: input.playedImages,
        playerScores: input.playerScores as PlayerScore[],
        startedAt: new Date(input.startedAt),
      });

      return { success: true, gameId };
    }),

  /**
   * Get all archived games
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const games = await db.select().from(gameHistory).orderBy(gameHistory.endedAt);
    return games;
  }),

  /**
   * Get a specific archived game by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [game] = await db
        .select()
        .from(gameHistory)
        .where(eq(gameHistory.id, input.gameId))
        .limit(1);

      return game || null;
    }),

  /**
   * Delete an archived game
   */
  delete: publicProcedure
    .input(
      z.object({
        gameId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(gameHistory).where(eq(gameHistory.id, input.gameId));

      return { success: true };
    }),
});
