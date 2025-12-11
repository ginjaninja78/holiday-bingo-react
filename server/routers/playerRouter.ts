import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { managedPlayers, playerCards, generatedCards } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const playerRouter = router({
  /**
   * Create a new managed player
   */
  create: publicProcedure
    .input(
      z.object({
        playerName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const playerUuid = uuidv4();
      
      await db.insert(managedPlayers).values({
        playerUuid,
        playerName: input.playerName || null,
      });

      return { playerUuid, playerName: input.playerName || null };
    }),

  /**
   * Get all managed players with card counts
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const players = await db.select().from(managedPlayers);
    
    // Get card counts for each player
    const playersWithCounts = await Promise.all(
      players.map(async (player: typeof managedPlayers.$inferSelect) => {
        const cards = await db
          .select()
          .from(playerCards)
          .where(eq(playerCards.playerUuid, player.playerUuid));
        
        return {
          ...player,
          cardCount: cards.length,
          activeCardCount: cards.filter((c: typeof playerCards.$inferSelect) => !c.isPlayed).length,
        };
      })
    );

    return playersWithCounts;
  }),

  /**
   * Update player name
   */
  update: publicProcedure
    .input(
      z.object({
        playerUuid: z.string(),
        playerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(managedPlayers)
        .set({ playerName: input.playerName })
        .where(eq(managedPlayers.playerUuid, input.playerUuid));

      return { playerUuid: input.playerUuid, playerName: input.playerName };
    }),

  /**
   * Delete a managed player and their cards
   */
  delete: publicProcedure
    .input(
      z.object({
        playerUuid: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Delete player cards first
      await db
        .delete(playerCards)
        .where(eq(playerCards.playerUuid, input.playerUuid));

      // Delete player
      await db
        .delete(managedPlayers)
        .where(eq(managedPlayers.playerUuid, input.playerUuid));

      return { success: true };
    }),

  /**
   * Import players from CSV data
   */
  importCSV: publicProcedure
    .input(
      z.object({
        csvData: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const lines = input.csvData.trim().split("\n");
      const header = lines[0];
      
      if (!header.includes("player_uuid") || !header.includes("name")) {
        throw new Error("Invalid CSV format. Expected headers: player_uuid,name,card_ids");
      }

      const imported: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(",");
        const playerUuid = parts[0];
        const playerName = parts[1] || null;
        const cardIds = parts[2] ? parts[2].split("|") : [];

        // Create or update player
        const existing = await db
          .select()
          .from(managedPlayers)
          .where(eq(managedPlayers.playerUuid, playerUuid))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(managedPlayers).values({
            playerUuid,
            playerName,
          });
        } else {
          await db
            .update(managedPlayers)
            .set({ playerName })
            .where(eq(managedPlayers.playerUuid, playerUuid));
        }

        // Link cards
        for (const cardId of cardIds) {
          const cardExists = await db
            .select()
            .from(generatedCards)
            .where(eq(generatedCards.cardId, cardId))
            .limit(1);

          if (cardExists.length > 0) {
            const linkExists = await db
              .select()
              .from(playerCards)
              .where(
                and(
                  eq(playerCards.playerUuid, playerUuid),
                  eq(playerCards.cardId, cardId)
                )
              )
              .limit(1);

            if (linkExists.length === 0) {
              await db.insert(playerCards).values({
                playerUuid,
                cardId,
                isPlayed: false,
              });
            }
          }
        }

        imported.push({ playerUuid, playerName, cardCount: cardIds.length });
      }

      return {
        success: true,
        imported: imported.length,
        players: imported,
      };
    }),

  /**
   * Export players to CSV format
   */
  exportCSV: publicProcedure
    .input(
      z.object({
        playerUuids: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const csvLines = ["player_uuid,name,card_ids"];

      for (const playerUuid of input.playerUuids) {
        const [player] = await db
          .select()
          .from(managedPlayers)
          .where(eq(managedPlayers.playerUuid, playerUuid))
          .limit(1);

        if (!player) continue;

        const cards = await db
          .select()
          .from(playerCards)
          .where(eq(playerCards.playerUuid, playerUuid));

        const cardIds = cards.map((c: typeof playerCards.$inferSelect) => c.cardId).join("|");
        const name = player.playerName || "";

        csvLines.push(`${playerUuid},${name},${cardIds}`);
      }

      return {
        csvData: csvLines.join("\n"),
        playerCount: input.playerUuids.length,
      };
    }),

  /**
   * Link cards to a player
   */
  linkCards: publicProcedure
    .input(
      z.object({
        playerUuid: z.string(),
        cardIds: z.array(z.string()),
        gameId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const linked = [];

      for (const cardId of input.cardIds) {
        await db.insert(playerCards).values({
          playerUuid: input.playerUuid,
          cardId,
          gameId: input.gameId || null,
          isPlayed: false,
        });

        linked.push({ playerUuid: input.playerUuid, cardId });
      }

      return {
        success: true,
        linked: linked.length,
      };
    }),

  /**
   * Mark cards as played
   */
  markCardsAsPlayed: publicProcedure
    .input(
      z.object({
        cardIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      for (const cardId of input.cardIds) {
        await db
          .update(playerCards)
          .set({ isPlayed: true })
          .where(eq(playerCards.cardId, cardId));
      }

      return { success: true };
    }),

  /**
   * Get cards for a specific player
   */
  getPlayerCards: publicProcedure
    .input(
      z.object({
        playerUuid: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const cards = await db
        .select()
        .from(playerCards)
        .where(eq(playerCards.playerUuid, input.playerUuid));

      return cards;
    }),
});
