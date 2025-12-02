import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "./db";
import { generateBingoCard, serializeCard, checkBingo, getStandardPatterns } from "../core/gameEngine";
import { broadcastToSession, sendToHost } from "./websocket";
import imageCatalog from "../shared/imageCatalog.json";
import type { WinningPattern } from "../shared/gameTypes";

/**
 * Game operations router
 */
export const gameRouter = router({
  // ============ Host Operations ============

  /**
   * Create a new game session (host only)
   */
  createSession: protectedProcedure
    .input(
      z.object({
        pattern: z
          .object({
            type: z.enum(["line", "diagonal", "blackout", "custom"]),
            name: z.string(),
            positions: z.array(z.tuple([z.number(), z.number()])).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sessionCode = nanoid(8).toUpperCase();

      const sessionId = await db.createGameSession({
        hostId: ctx.user.id,
        sessionCode,
        status: "waiting",
        currentRound: 0,
        winningPattern: input.pattern || { type: "line", name: "Any Line" },
      });

      return {
        sessionId,
        sessionCode,
      };
    }),

  /**
   * Get session details
   */
  getSession: publicProcedure
    .input(z.object({ sessionCode: z.string() }))
    .query(async ({ input }) => {
      const session = await db.getGameSessionByCode(input.sessionCode);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }
      return session;
    }),

  /**
   * Start a new round
   */
  startRound: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await db.getGameSessionById(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      if (session.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not the host" });
      }

      const newRound = session.currentRound + 1;

      // Update session
      await db.updateGameSession(input.sessionId, {
        status: "active",
        currentRound: newRound,
      });

      // Generate cards for all players
      const players = await db.getSessionPlayers(input.sessionId);
      const availableImageIds = imageCatalog.map((img) => img.id);

      for (const player of players) {
        const card = generateBingoCard(availableImageIds, player.playerUuid);
        const serialized = serializeCard(card);

        await db.createBingoCard({
          playerId: player.id,
          sessionId: input.sessionId,
          roundNumber: newRound,
          cardData: serialized.imageIds,
          markedTiles: serialized.marked,
        });
      }

      // Broadcast round started
      broadcastToSession(session.sessionCode, "round_started", {
        roundNumber: newRound,
      });

      return { success: true, roundNumber: newRound };
    }),

  /**
   * Call an image
   */
  callImage: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        imageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await db.getGameSessionById(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (session.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Get current called images to determine order
      const calledImages = await db.getCalledImages(
        input.sessionId,
        session.currentRound
      );

      await db.addCalledImage({
        sessionId: input.sessionId,
        roundNumber: session.currentRound,
        imageId: input.imageId,
        calledOrder: calledImages.length + 1,
      });

      // Broadcast to all players
      const imageInfo = imageCatalog.find((img) => img.id === input.imageId);
      broadcastToSession(session.sessionCode, "image_called", {
        imageId: input.imageId,
        description: imageInfo?.description,
        order: calledImages.length + 1,
      });

      return { success: true };
    }),

  /**
   * Get called images for a round
   */
  getCalledImages: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        roundNumber: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await db.getCalledImages(input.sessionId, input.roundNumber);
    }),

  /**
   * End round
   */
  endRound: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await db.getGameSessionById(input.sessionId);
      if (!session || session.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.updateGameSession(input.sessionId, { status: "paused" });

      broadcastToSession(session.sessionCode, "round_ended", {
        roundNumber: session.currentRound,
      });

      return { success: true };
    }),

  /**
   * Reset game
   */
  resetGame: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await db.getGameSessionById(input.sessionId);
      if (!session || session.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.updateGameSession(input.sessionId, {
        status: "waiting",
        currentRound: 0,
      });

      broadcastToSession(session.sessionCode, "game_reset", {});

      return { success: true };
    }),

  /**
   * Get available winning patterns
   */
  getPatterns: publicProcedure.query(() => {
    return getStandardPatterns();
  }),

  /**
   * Update winning pattern
   */
  updatePattern: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        pattern: z.object({
          type: z.enum(["line", "diagonal", "blackout", "custom"]),
          name: z.string(),
          positions: z.array(z.tuple([z.number(), z.number()])).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await db.getGameSessionById(input.sessionId);
      if (!session || session.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.updateGameSession(input.sessionId, {
        winningPattern: input.pattern as WinningPattern,
      });

      return { success: true };
    }),

  // ============ Player Operations ============

  /**
   * Join game session as player
   */
  joinSession: publicProcedure
    .input(
      z.object({
        sessionCode: z.string(),
        playerName: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const session = await db.getGameSessionByCode(input.sessionCode);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      const playerUuid = nanoid(16);

      const playerId = await db.createPlayer({
        sessionId: session.id,
        playerUuid,
        playerName: input.playerName,
        score: 0,
        totalBingos: 0,
        isActive: true,
      });

      // Broadcast player joined
      broadcastToSession(session.sessionCode, "player_joined", {
        playerId,
        playerName: input.playerName,
      });

      return {
        playerUuid,
        playerId,
        sessionId: session.id,
      };
    }),

  /**
   * Get player's bingo card
   */
  getMyCard: publicProcedure
    .input(
      z.object({
        playerUuid: z.string(),
        roundNumber: z.number(),
      })
    )
    .query(async ({ input }) => {
      const player = await db.getPlayerByUuid(input.playerUuid);
      if (!player) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Player not found" });
      }

      const card = await db.getPlayerCard(player.id, input.roundNumber);
      return card;
    }),

  /**
   * Mark a tile on player's card (with anti-cheat validation)
   */
  markTile: publicProcedure
    .input(
      z.object({
        playerUuid: z.string(),
        row: z.number().min(0).max(4),
        col: z.number().min(0).max(4),
      })
    )
    .mutation(async ({ input }) => {
      const player = await db.getPlayerByUuid(input.playerUuid);
      if (!player) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const session = await db.getGameSessionById(player.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const card = await db.getPlayerCard(player.id, session.currentRound);
      if (!card) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }

      // Get called images
      const calledImages = await db.getCalledImages(
        player.sessionId,
        session.currentRound
      );
      const calledImageIds = calledImages.map((ci) => ci.imageId);

      // Check if tile can be marked (anti-cheat)
      const tileImageId = card.cardData[input.row][input.col];
      if (
        tileImageId !== -1 &&
        !calledImageIds.includes(tileImageId)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not called yet",
        });
      }

      // Mark the tile
      const markedTiles = card.markedTiles as boolean[][];
      markedTiles[input.row][input.col] = true;

      await db.updateBingoCard(card.id, markedTiles);

      // Broadcast tile marked
      broadcastToSession(session.sessionCode, "tile_marked", {
        playerId: player.id,
        playerName: player.playerName,
        row: input.row,
        col: input.col,
      });

      return { success: true };
    }),

  /**
   * Claim bingo
   */
  claimBingo: publicProcedure
    .input(z.object({ playerUuid: z.string() }))
    .mutation(async ({ input }) => {
      const player = await db.getPlayerByUuid(input.playerUuid);
      if (!player) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const session = await db.getGameSessionById(player.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const card = await db.getPlayerCard(player.id, session.currentRound);
      if (!card) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const claimId = await db.createBingoClaim({
        sessionId: player.sessionId,
        playerId: player.id,
        roundNumber: session.currentRound,
        cardId: card.id,
        claimType: session.winningPattern?.type || "line",
        verified: false,
      });

      // Send to host for verification
      sendToHost(session.sessionCode, "bingo_claimed", {
        claimId,
        playerId: player.id,
        playerName: player.playerName,
      });

      return { success: true, claimId };
    }),

  /**
   * Verify bingo claim (host only)
   */
  verifyBingo: protectedProcedure
    .input(
      z.object({
        claimId: z.number(),
        approved: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.approved) {
        await db.verifyBingoClaim(input.claimId);
      }

      return { success: true };
    }),

  /**
   * Get scoreboard
   */
  getScoreboard: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const players = await db.getSessionPlayers(input.sessionId);
      return players.sort((a, b) => b.score - a.score);
    }),

  /**
   * Get image catalog
   */
  getImageCatalog: publicProcedure.query(() => {
    return imageCatalog;
  }),
});
