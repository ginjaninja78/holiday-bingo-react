/**
 * AI Voice Announcer System - Audio Caching System
 * 
 * Implements intelligent audio caching to minimize ElevenLabs API costs:
 * - MD5 hashing for cache keys
 * - Filesystem + database storage
 * - LRU cache eviction
 * - Cache statistics
 */

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { announcerCache } from '../../drizzle/schema-announcer';
import type { AudioCacheEntry } from './types';

const DATABASE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/bingo.db';
const CACHE_DIR = './data/audio-cache';

// Initialize database connection
const sqlite = new Database(DATABASE_PATH);
const db = drizzle(sqlite);

/**
 * Generate cache key from text and voice settings
 */
export function generateCacheKey(text: string, voiceId: string): string {
  const hash = createHash('md5');
  hash.update(`${text}:${voiceId}`);
  return hash.digest('hex');
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create cache directory:', error);
    throw error;
  }
}

/**
 * Get audio file path for cache entry
 */
function getAudioFilePath(cacheKey: string): string {
  return path.join(CACHE_DIR, `${cacheKey}.mp3`);
}

/**
 * Check if audio is cached
 */
export async function isCached(text: string, voiceId: string): Promise<boolean> {
  const cacheKey = generateCacheKey(text, voiceId);
  
  try {
    const entry = await db
      .select()
      .from(announcerCache)
      .where(eq(announcerCache.textHash, cacheKey))
      .limit(1);
    
    if (entry.length === 0) {
      return false;
    }

    // Verify file exists
    const filePath = getAudioFilePath(cacheKey);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      // File missing, remove from cache
      await db.delete(announcerCache).where(eq(announcerCache.textHash, cacheKey));
      return false;
    }
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
}

/**
 * Get cached audio
 */
export async function getCachedAudio(
  text: string,
  voiceId: string
): Promise<{ audio: Buffer; filePath: string } | null> {
  const cacheKey = generateCacheKey(text, voiceId);
  
  try {
    const entry = await db
      .select()
      .from(announcerCache)
      .where(eq(announcerCache.textHash, cacheKey))
      .limit(1);
    
    if (entry.length === 0) {
      return null;
    }

    const filePath = getAudioFilePath(cacheKey);
    
    try {
      const audio = await fs.readFile(filePath);
      
      // Update last used time and use count
      await db
        .update(announcerCache)
        .set({
          lastUsedAt: new Date(),
          useCount: entry[0].useCount + 1,
        })
        .where(eq(announcerCache.textHash, cacheKey));
      
      return { audio, filePath };
    } catch (error) {
      console.error('Failed to read cached audio file:', error);
      // Remove invalid cache entry
      await db.delete(announcerCache).where(eq(announcerCache.textHash, cacheKey));
      return null;
    }
  } catch (error) {
    console.error('Error getting cached audio:', error);
    return null;
  }
}

/**
 * Save audio to cache
 */
export async function saveToCache(
  text: string,
  voiceId: string,
  audio: Buffer
): Promise<string> {
  await ensureCacheDir();
  
  const cacheKey = generateCacheKey(text, voiceId);
  const filePath = getAudioFilePath(cacheKey);
  
  try {
    // Save audio file
    await fs.writeFile(filePath, audio);
    
    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Estimate duration (rough approximation: 128kbps MP3)
    const durationMs = Math.round((stats.size / 16000) * 1000);
    
    // Save to database
    await db.insert(announcerCache).values({
      textHash: cacheKey,
      voiceId,
      audioFilePath: filePath,
      fileSize: stats.size,
      durationMs,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      useCount: 1,
    });
    
    return filePath;
  } catch (error) {
    console.error('Failed to save audio to cache:', error);
    throw error;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalSize: number;
  totalDuration: number;
  hitRate: number;
}> {
  try {
    const entries = await db.select().from(announcerCache);
    
    const totalEntries = entries.length;
    const totalSize = entries.reduce((sum, entry) => sum + entry.fileSize, 0);
    const totalDuration = entries.reduce((sum, entry) => sum + entry.durationMs, 0);
    const totalUses = entries.reduce((sum, entry) => sum + entry.useCount, 0);
    
    // Hit rate: (total uses - total entries) / total uses
    // (Each entry's first use is a miss, subsequent uses are hits)
    const hitRate = totalUses > 0 ? ((totalUses - totalEntries) / totalUses) * 100 : 0;
    
    return {
      totalEntries,
      totalSize,
      totalDuration,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      totalSize: 0,
      totalDuration: 0,
      hitRate: 0,
    };
  }
}

/**
 * Clear all cached audio
 */
export async function clearCache(): Promise<void> {
  try {
    // Delete all files
    const entries = await db.select().from(announcerCache);
    for (const entry of entries) {
      try {
        await fs.unlink(entry.audioFilePath);
      } catch (error) {
        console.warn(`Failed to delete file: ${entry.audioFilePath}`);
      }
    }
    
    // Clear database
    await db.delete(announcerCache);
    
    console.log('Audio cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw error;
  }
}

/**
 * Evict least recently used cache entries to free space
 */
export async function evictLRU(targetSizeMB: number = 100): Promise<number> {
  try {
    const stats = await getCacheStats();
    const currentSizeMB = stats.totalSize / (1024 * 1024);
    
    if (currentSizeMB <= targetSizeMB) {
      return 0; // No eviction needed
    }
    
    // Get all entries sorted by last used (oldest first)
    const entries = await db
      .select()
      .from(announcerCache)
      .orderBy(announcerCache.lastUsedAt);
    
    let freedSize = 0;
    let evictedCount = 0;
    
    for (const entry of entries) {
      if (currentSizeMB - (freedSize / (1024 * 1024)) <= targetSizeMB) {
        break;
      }
      
      try {
        await fs.unlink(entry.audioFilePath);
        await db.delete(announcerCache).where(eq(announcerCache.id, entry.id!));
        freedSize += entry.fileSize;
        evictedCount++;
      } catch (error) {
        console.warn(`Failed to evict cache entry ${entry.id}:`, error);
      }
    }
    
    console.log(`Evicted ${evictedCount} cache entries, freed ${Math.round(freedSize / 1024 / 1024)}MB`);
    return evictedCount;
  } catch (error) {
    console.error('Failed to evict LRU cache entries:', error);
    throw error;
  }
}

/**
 * Pre-generate common phrases for instant playback
 */
export async function preGenerateCommonPhrases(
  phrases: string[],
  voiceId: string,
  generateFn: (text: string, voiceId: string) => Promise<Buffer>
): Promise<number> {
  let generated = 0;
  
  for (const phrase of phrases) {
    const cached = await isCached(phrase, voiceId);
    if (!cached) {
      try {
        const audio = await generateFn(phrase, voiceId);
        await saveToCache(phrase, voiceId, audio);
        generated++;
      } catch (error) {
        console.error(`Failed to pre-generate phrase: "${phrase}"`, error);
      }
    }
  }
  
  return generated;
}
