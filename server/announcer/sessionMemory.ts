/**
 * AI Voice Announcer System - Session Memory
 * 
 * Tracks game session context for personalized, contextual humor:
 * - Player win tracking
 * - Host behavior patterns
 * - Cards revealed
 * - Jokes told (avoid repetition)
 * - Timing and delays
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, and } from 'drizzle-orm';
import { announcerSessionMemory } from '../../drizzle/schema-announcer';
import type { SessionContext, SessionMemoryEvent } from './types';

const DATABASE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/bingo.db';

// Initialize database connection
const sqlite = new Database(DATABASE_PATH);
const db = drizzle(sqlite);

// In-memory session cache for fast access
const sessionCache = new Map<string, SessionContext>();

/**
 * Start a new game session
 */
export async function startSession(sessionId: string): Promise<SessionContext> {
  const context: SessionContext = {
    sessionId,
    gameStartTime: Date.now(),
    playerWins: new Map(),
    cardsRevealed: [],
    jokesTold: [],
    hostDelayCount: 0,
    lastActivityTime: Date.now(),
  };

  // Save to cache
  sessionCache.set(sessionId, context);

  // Log to database
  await logEvent(sessionId, 'game_start', {
    startTime: context.gameStartTime,
  });

  return context;
}

/**
 * End a game session
 */
export async function endSession(sessionId: string): Promise<void> {
  const context = sessionCache.get(sessionId);
  
  if (context) {
    await logEvent(sessionId, 'game_end', {
      duration: Date.now() - context.gameStartTime,
      cardsRevealed: context.cardsRevealed.length,
      totalWins: Array.from(context.playerWins.values()).reduce((sum, count) => sum + count, 0),
    });
    
    sessionCache.delete(sessionId);
  }
}

/**
 * Get session context
 */
export function getSession(sessionId: string): SessionContext | null {
  return sessionCache.get(sessionId) || null;
}

/**
 * Log a card reveal event
 */
export async function logCardReveal(sessionId: string, imageId: number): Promise<void> {
  const context = sessionCache.get(sessionId);
  
  if (context) {
    context.cardsRevealed.push(imageId);
    context.lastActivityTime = Date.now();
    
    await logEvent(sessionId, 'card_reveal', {
      imageId,
      totalRevealed: context.cardsRevealed.length,
    });
  }
}

/**
 * Log a player win event
 */
export async function logPlayerWin(sessionId: string, playerName: string): Promise<number> {
  const context = sessionCache.get(sessionId);
  
  if (!context) {
    return 0;
  }

  const currentWins = context.playerWins.get(playerName) || 0;
  const newWins = currentWins + 1;
  context.playerWins.set(playerName, newWins);
  context.lastActivityTime = Date.now();

  await logEvent(sessionId, 'player_win', {
    playerName,
    winCount: newWins,
  });

  return newWins;
}

/**
 * Log a host delay event (for nudging)
 */
export async function logHostDelay(sessionId: string, delaySeconds: number): Promise<number> {
  const context = sessionCache.get(sessionId);
  
  if (!context) {
    return 0;
  }

  context.hostDelayCount++;
  context.lastActivityTime = Date.now();

  await logEvent(sessionId, 'host_delay', {
    delaySeconds,
    totalDelays: context.hostDelayCount,
  });

  return context.hostDelayCount;
}

/**
 * Log a joke told (to avoid repetition)
 */
export async function logJokeTold(sessionId: string, jokeText: string): Promise<void> {
  const context = sessionCache.get(sessionId);
  
  if (context) {
    context.jokesTold.push(jokeText);
    context.lastActivityTime = Date.now();
    
    await logEvent(sessionId, 'joke_told', {
      joke: jokeText,
      totalJokes: context.jokesTold.length,
    });
  }
}

/**
 * Check if a joke was already told in this session
 */
export function wasJokeTold(sessionId: string, jokeText: string): boolean {
  const context = sessionCache.get(sessionId);
  return context ? context.jokesTold.includes(jokeText) : false;
}

/**
 * Get player win count
 */
export function getPlayerWins(sessionId: string, playerName: string): number {
  const context = sessionCache.get(sessionId);
  return context ? (context.playerWins.get(playerName) || 0) : 0;
}

/**
 * Get time since last activity (for host nudging)
 */
export function getTimeSinceLastActivity(sessionId: string): number {
  const context = sessionCache.get(sessionId);
  return context ? Date.now() - context.lastActivityTime : 0;
}

/**
 * Get session statistics
 */
export function getSessionStats(sessionId: string): {
  duration: number;
  cardsRevealed: number;
  totalWins: number;
  uniqueWinners: number;
  hostDelays: number;
  jokesTold: number;
} | null {
  const context = sessionCache.get(sessionId);
  
  if (!context) {
    return null;
  }

  const totalWins = Array.from(context.playerWins.values()).reduce((sum, count) => sum + count, 0);

  return {
    duration: Date.now() - context.gameStartTime,
    cardsRevealed: context.cardsRevealed.length,
    totalWins,
    uniqueWinners: context.playerWins.size,
    hostDelays: context.hostDelayCount,
    jokesTold: context.jokesTold.length,
  };
}

/**
 * Log an event to the database
 */
async function logEvent(
  sessionId: string,
  eventType: SessionMemoryEvent['eventType'],
  eventData?: any
): Promise<void> {
  try {
    await db.insert(announcerSessionMemory).values({
      sessionId,
      eventType,
      eventData: eventData ? JSON.stringify(eventData) : undefined,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log session event:', error);
  }
}

/**
 * Get session history from database
 */
export async function getSessionHistory(sessionId: string): Promise<SessionMemoryEvent[]> {
  try {
    const events = await db
      .select()
      .from(announcerSessionMemory)
      .where(eq(announcerSessionMemory.sessionId, sessionId))
      .orderBy(announcerSessionMemory.timestamp);
    
    return events;
  } catch (error) {
    console.error('Failed to get session history:', error);
    return [];
  }
}

/**
 * Clean up old session data (older than 7 days)
 */
export async function cleanupOldSessions(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await db
      .delete(announcerSessionMemory)
      .where(eq(announcerSessionMemory.timestamp, sevenDaysAgo));
    
    console.log(`Cleaned up old session data`);
    return 0; // SQLite doesn't return affected rows easily
  } catch (error) {
    console.error('Failed to cleanup old sessions:', error);
    return 0;
  }
}

/**
 * Get leaderboard for current session
 */
export function getSessionLeaderboard(sessionId: string): Array<{ playerName: string; wins: number }> {
  const context = sessionCache.get(sessionId);
  
  if (!context) {
    return [];
  }

  return Array.from(context.playerWins.entries())
    .map(([playerName, wins]) => ({ playerName, wins }))
    .sort((a, b) => b.wins - a.wins);
}
