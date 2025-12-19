/**
 * AI Voice Announcer System - Main Service
 * 
 * Orchestrates all announcer components:
 * - ElevenLabs TTS generation
 * - Audio caching
 * - Session memory
 * - Humor engine
 * - Settings management
 * 
 * This is the primary interface for the announcer system.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { announcerSettings } from '../../drizzle/schema-announcer';
import type { AnnouncerSettings, AnnouncementRequest, AnnouncementResponse } from './types';
import * as elevenlabs from './elevenlabs';
import * as audioCache from './audioCache';
import * as sessionMemory from './sessionMemory';
import * as humorEngine from './humorEngine';

const DATABASE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/bingo.db';

// Initialize database connection
const sqlite = new Database(DATABASE_PATH);
const db = drizzle(sqlite);

/**
 * Get announcer settings
 */
export async function getSettings(): Promise<AnnouncerSettings> {
  try {
    const settings = await db
      .select()
      .from(announcerSettings)
      .limit(1);
    
    if (settings.length === 0) {
      // Return default settings
      return {
        enabled: true,
        gameIntro: true,
        cardAnnouncements: true,
        hostNudging: true,
        winnerAnnouncements: true,
        backgroundMusic: true,
        musicVolume: 30,
        voiceVolume: 80,
        humorLevel: 'sparky',
        nudgeDelay: 10,
      };
    }

    return settings[0];
  } catch (error) {
    console.error('Failed to get announcer settings:', error);
    throw error;
  }
}

/**
 * Update announcer settings
 */
export async function updateSettings(updates: Partial<AnnouncerSettings>): Promise<AnnouncerSettings> {
  try {
    const current = await getSettings();
    
    if (current.id) {
      // Update existing settings
      await db
        .update(announcerSettings)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(announcerSettings.id, current.id));
    } else {
      // Insert new settings
      await db.insert(announcerSettings).values({
        ...current,
        ...updates,
      });
    }

    return await getSettings();
  } catch (error) {
    console.error('Failed to update announcer settings:', error);
    throw error;
  }
}

/**
 * Generate announcement audio
 */
export async function generateAnnouncement(
  request: AnnouncementRequest
): Promise<AnnouncementResponse> {
  try {
    const settings = await getSettings();

    // Check if announcer is enabled
    if (!settings.enabled) {
      return {
        success: false,
        error: 'Announcer is disabled',
      };
    }

    // Check if ElevenLabs is configured
    if (!elevenlabs.isElevenLabsConfigured()) {
      return {
        success: false,
        error: 'ElevenLabs API key not configured',
      };
    }

    // Generate announcement text based on type
    let text: string;
    
    switch (request.type) {
      case 'intro':
        if (!settings.gameIntro) {
          return { success: false, error: 'Game intro disabled' };
        }
        text = humorEngine.generateGameIntro(settings.humorLevel);
        break;

      case 'card':
        if (!settings.cardAnnouncements || !request.imageId) {
          return { success: false, error: 'Card announcements disabled or missing imageId' };
        }
        // Get image name from database (would need to query gallery_images table)
        const imageName = `Image ${request.imageId}`;
        text = await humorEngine.generateCardAnnouncement(
          request.imageId,
          imageName,
          settings.humorLevel,
          request.sessionId,
          true
        );
        
        // Log card reveal
        if (request.sessionId) {
          await sessionMemory.logCardReveal(request.sessionId, request.imageId);
        }
        break;

      case 'winner':
        if (!settings.winnerAnnouncements || !request.playerName || !request.sessionId) {
          return { success: false, error: 'Winner announcements disabled or missing data' };
        }
        const winCount = await sessionMemory.logPlayerWin(request.sessionId, request.playerName);
        text = humorEngine.generateWinnerAnnouncement(
          request.playerName,
          winCount,
          settings.humorLevel,
          request.sessionId
        );
        break;

      case 'nudge':
        if (!settings.hostNudging || !request.sessionId) {
          return { success: false, error: 'Host nudging disabled or missing sessionId' };
        }
        const delaySeconds = sessionMemory.getTimeSinceLastActivity(request.sessionId) / 1000;
        const delayCount = await sessionMemory.logHostDelay(request.sessionId, delaySeconds);
        text = humorEngine.generateHostNudge(delayCount, delaySeconds, settings.humorLevel);
        break;

      case 'custom':
        if (!request.customText) {
          return { success: false, error: 'Custom text required' };
        }
        text = request.customText;
        break;

      default:
        return { success: false, error: 'Invalid announcement type' };
    }

    // Log joke if in session
    if (request.sessionId) {
      await sessionMemory.logJokeTold(request.sessionId, text);
    }

    // Get voice ID
    const voiceId = settings.voiceId || elevenlabs.getRecommendedVoice(settings.humorLevel);

    // Check cache first
    const cached = await audioCache.getCachedAudio(text, voiceId);
    if (cached) {
      return {
        success: true,
        audioPath: cached.filePath,
        audioUrl: `/api/announcer/audio/${audioCache.generateCacheKey(text, voiceId)}`,
        text,
        cached: true,
      };
    }

    // Generate new audio
    const result = await elevenlabs.generateSpeech(text, voiceId);
    
    // Save to cache
    const audioPath = await audioCache.saveToCache(text, voiceId, result.audio);

    return {
      success: true,
      audioPath,
      audioUrl: `/api/announcer/audio/${audioCache.generateCacheKey(text, voiceId)}`,
      text,
      cached: false,
    };
  } catch (error) {
    console.error('Failed to generate announcement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Start a new game session
 */
export async function startGameSession(sessionId: string): Promise<void> {
  await sessionMemory.startSession(sessionId);
}

/**
 * End a game session
 */
export async function endGameSession(sessionId: string): Promise<void> {
  await sessionMemory.endSession(sessionId);
}

/**
 * Check if host needs nudging
 */
export function shouldNudgeHost(sessionId: string): boolean {
  const settings = getSettings();
  const timeSinceActivity = sessionMemory.getTimeSinceLastActivity(sessionId);
  
  // Convert settings to promise and check
  return settings.then(s => {
    if (!s.hostNudging || s.nudgeDelay === 0) {
      return false;
    }
    
    return timeSinceActivity >= s.nudgeDelay * 1000;
  }).catch(() => false);
}

/**
 * Get session leaderboard
 */
export function getSessionLeaderboard(sessionId: string) {
  return sessionMemory.getSessionLeaderboard(sessionId);
}

/**
 * Get cache statistics
 */
export async function getCacheStatistics() {
  return await audioCache.getCacheStats();
}

/**
 * Test announcer system
 */
export async function testSystem(): Promise<{
  elevenlabsConnected: boolean;
  settingsLoaded: boolean;
  cacheWorking: boolean;
  error?: string;
}> {
  try {
    const elevenlabsConnected = await elevenlabs.testConnection();
    const settings = await getSettings();
    const settingsLoaded = !!settings;
    const cacheStats = await audioCache.getCacheStats();
    const cacheWorking = cacheStats.totalEntries >= 0;

    return {
      elevenlabsConnected,
      settingsLoaded,
      cacheWorking,
    };
  } catch (error) {
    return {
      elevenlabsConnected: false,
      settingsLoaded: false,
      cacheWorking: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
