/**
 * Bingo Router
 * Handles card generation and BINGO verification
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { generatedCards, hostGameState, galleryImages } from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { generateBingoCards, type BingoCard } from "../shared/cardGenerator";
import { verifyBingo, type PatternType, getPatternName } from "../shared/patternDetector";

export const bingoRouter = router({
  /**
   * Generate bingo cards for a game
   */
  generateCards: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(1000),
        gameId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all active gallery images
      const images = await db
        .select()
        .from(galleryImages)
        .where(isNull(galleryImages.deletedAt));

      if (images.length < 24) {
        throw new Error(
          `Need at least 24 images to generate cards. Currently have ${images.length}`
        );
      }

      // Generate cards using the card generator
      const imageIds = images.map((img) => img.id);
      const cards = generateBingoCards(input.count, imageIds);

      // Save cards to database
      const savedCards = [];
      for (const card of cards) {
        const [saved] = await db.insert(generatedCards).values({
          cardId: card.cardId,
          gameId: input.gameId,
          imageIds: card.imageIds,
        });

        savedCards.push({
          id: saved.insertId,
          cardId: card.cardId,
          imageIds: card.imageIds,
        });
      }

      return {
        success: true,
        count: savedCards.length,
        cards: savedCards,
      };
    }),

  /**
   * Get a card by Card ID
   */
  getCard: publicProcedure
    .input(
      z.object({
        cardId: z.string().length(5).toUpperCase(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [card] = await db
        .select()
        .from(generatedCards)
        .where(eq(generatedCards.cardId, input.cardId))
        .limit(1);

      if (!card) {
        return null;
      }

      // Get image details for the card
      const imageIds = card.imageIds as number[];
      const images = await db
        .select()
        .from(galleryImages)
        .where(isNull(galleryImages.deletedAt));

      const imageMap = new Map(images.map((img) => [img.id, img]));

      return {
        cardId: card.cardId,
        imageIds: card.imageIds,
        images: imageIds.map((id) => {
          if (id === -1) {
            return { id: -1, url: "", label: "FREE", source: "ai_generated" };
          }
          const img = imageMap.get(id);
          return img
            ? { id: img.id, url: img.url, label: img.label, source: img.source }
            : null;
        }),
      };
    }),

  /**
   * Verify a BINGO claim
   */
  verifyBingo: publicProcedure
    .input(
      z.object({
        cardId: z.string().length(5).toUpperCase(),
        gameId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the card
      const [card] = await db
        .select()
        .from(generatedCards)
        .where(eq(generatedCards.cardId, input.cardId))
        .limit(1);

      if (!card) {
        return {
          success: false,
          error: "Invalid Card ID. Please check and try again.",
        };
      }

      // Get the game state
      const [game] = await db
        .select()
        .from(hostGameState)
        .where(eq(hostGameState.id, input.gameId))
        .limit(1);

      if (!game) {
        return {
          success: false,
          error: "Game not found.",
        };
      }

      // Get played images from game state
      const playedImages = (game.playedImages || []) as Array<{
        imageId: string;
        imageUrl: string;
        imageLabel: string;
        playedAt: number;
        orderIndex: number;
      }>;

      const playedImageIds = playedImages.map((img) => parseInt(img.imageId));

      // Get the required patterns for this round
      // For now, we'll accept any standard pattern
      // TODO: Get patterns from game config
      const requiredPatterns: PatternType[] = [
        "LINE",
        "DIAGONAL",
        "FOUR_CORNERS",
        "X_PATTERN",
        "BLACKOUT",
      ];

      // Verify the BINGO
      const cardImageIds = card.imageIds as number[];
      const result = verifyBingo(cardImageIds, playedImageIds, requiredPatterns);

      if (result.isWin) {
        return {
          success: true,
          isWin: true,
          matchedPattern: result.matchedPattern,
          patternName: result.matchedPattern
            ? getPatternName(result.matchedPattern)
            : "",
          matchedPositions: result.matchedPositions,
          message: `🎉 BINGO! Valid ${result.matchedPattern} pattern detected!`,
        };
      } else {
        return {
          success: true,
          isWin: false,
          message:
            "No winning pattern found. Keep playing and try again when more images are called!",
        };
      }
    }),

  /**
   * Get all generated cards (for debugging/admin)
   */
  getAllCards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const cards = await db.select().from(generatedCards).limit(100);

    return {
      cards: cards.map((card: typeof generatedCards.$inferSelect) => ({
        id: card.id,
        cardId: card.cardId,
        gameId: card.gameId,
        imageCount: (card.imageIds as number[]).length,
        createdAt: card.createdAt,
      })),
    };
  }),
});
