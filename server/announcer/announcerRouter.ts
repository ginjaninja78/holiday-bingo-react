/**
 * AI Voice Announcer System - tRPC Router
 * 
 * tRPC endpoints for announcer functionality:
 * - Settings management
 * - Announcement generation  
 * - Session management
 * - Cache statistics
 * - System health checks
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import * as announcerService from './announcerService';
import * as audioCache from './audioCache';

// Input validation schemas
const announcementRequestSchema = z.object({
  type: z.enum(['intro', 'card', 'winner', 'nudge', 'custom']),
  imageId: z.number().optional(),
  playerName: z.string().optional(),
  customText: z.string().optional(),
  sessionId: z.string().optional(),
});

const settingsUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  gameIntro: z.boolean().optional(),
  cardAnnouncements: z.boolean().optional(),
  hostNudging: z.boolean().optional(),
  winnerAnnouncements: z.boolean().optional(),
  backgroundMusic: z.boolean().optional(),
  musicVolume: z.number().min(0).max(100).optional(),
  voiceVolume: z.number().min(0).max(100).optional(),
  humorLevel: z.enum(['professional', 'sparky', 'roast']).optional(),
  nudgeDelay: z.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)]).optional(),
  voiceId: z.string().optional(),
});

const sessionIdSchema = z.object({
  sessionId: z.string(),
});

export const announcerRouter = router({
  /**
   * Get current announcer settings
   */
  getSettings: publicProcedure.query(async () => {
    return await announcerService.getSettings();
  }),

  /**
   * Update announcer settings
   */
  updateSettings: publicProcedure
    .input(settingsUpdateSchema)
    .mutation(async ({ input }) => {
      return await announcerService.updateSettings(input);
    }),

  /**
   * Generate an announcement
   */
  announce: publicProcedure
    .input(announcementRequestSchema)
    .mutation(async ({ input }) => {
      return await announcerService.generateAnnouncement(input);
    }),

  /**
   * Start a new game session
   */
  startSession: publicProcedure
    .input(sessionIdSchema)
    .mutation(async ({ input }) => {
      await announcerService.startGameSession(input.sessionId);
      return { success: true, message: 'Session started' };
    }),

  /**
   * End a game session
   */
  endSession: publicProcedure
    .input(sessionIdSchema)
    .mutation(async ({ input }) => {
      await announcerService.endGameSession(input.sessionId);
      return { success: true, message: 'Session ended' };
    }),

  /**
   * Get session leaderboard
   */
  getLeaderboard: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      return announcerService.getSessionLeaderboard(input.sessionId);
    }),

  /**
   * Get cache statistics
   */
  getCacheStats: publicProcedure.query(async () => {
    return await announcerService.getCacheStatistics();
  }),

  /**
   * Clear audio cache
   */
  clearCache: publicProcedure.mutation(async () => {
    await audioCache.clearCache();
    return { success: true, message: 'Cache cleared' };
  }),

  /**
   * System health check
   */
  health: publicProcedure.query(async () => {
    return await announcerService.testSystem();
  }),
});

export type AnnouncerRouter = typeof announcerRouter;
