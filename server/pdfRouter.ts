/**
 * PDF Router
 * Handles PDF generation for bingo cards
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  generateSingleCardPDF,
  generateMultipleCardsPDF,
  generatePDFsForCards,
} from "./pdfGenerator";
import { getDb } from "./db";
import { managedPlayers, playerCards } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";

export const pdfRouter = router({
  /**
   * Generate PDF for a single card by Card ID
   */
  generateSingleCard: publicProcedure
    .input(
      z.object({
        cardId: z.string().length(5).toUpperCase(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateSingleCardPDF(input.cardId);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate PDF");
      }

      // Convert buffer to base64 for transmission
      const base64 = result.pdfBuffer!.toString("base64");

      return {
        success: true,
        fileName: result.fileName,
        pdfData: base64,
        cardIds: result.cardIds,
        totalPages: result.totalPages,
      };
    }),

  /**
   * Generate multiple cards in a single PDF
   */
  generateMultipleCards: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(1000),
        gamesPerPlayer: z.number().min(1).max(10).default(1),
        playerName: z.string().optional(),
        createPlayer: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateMultipleCardsPDF({
        count: input.count,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to generate PDF");
      }

      // Auto-create player and link cards if requested
      let playerUuid: string | null = null;
      if (input.createPlayer && result.cardIds) {
        const db = await getDb();
        if (db) {
          playerUuid = uuidv4();
          
          // Create managed player
          await db.insert(managedPlayers).values({
            playerUuid,
            playerName: input.playerName || null,
          });

          // Link all cards to this player
          for (const cardId of result.cardIds) {
            await db.insert(playerCards).values({
              playerUuid,
              cardId,
              isPlayed: false,
            });
          }
        }
      }

      // Convert buffer to base64 for transmission
      const base64 = result.pdfBuffer!.toString("base64");

      return {
        success: true,
        fileName: result.fileName,
        pdfData: base64,
        cardIds: result.cardIds,
        totalPages: result.totalPages,
        playerUuid,
        message: playerUuid 
          ? `Generated ${input.count} cards and created player ${playerUuid}`
          : `Generated ${input.count} cards successfully`,
      };
    }),

  /**
   * Generate PDFs for existing card IDs
   */
  generateForExistingCards: publicProcedure
    .input(
      z.object({
        cardIds: z.array(z.string().length(5)).min(1).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generatePDFsForCards(input.cardIds);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate PDF");
      }

      // Convert buffer to base64 for transmission
      const base64 = result.pdfBuffer!.toString("base64");

      return {
        success: true,
        fileName: result.fileName,
        pdfData: base64,
        cardIds: result.cardIds,
        totalPages: result.totalPages,
      };
    }),
});
