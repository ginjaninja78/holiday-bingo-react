/**
 * AI Voice Announcer System - Database Schema
 * 
 * Separate schema file for announcer tables to maintain modularity.
 * These tables are completely independent of core game tables.
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ==================== Announcer Settings Table ====================

export const announcerSettings = sqliteTable('announcer_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id'), // Optional: link to user if auth is added
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  gameIntro: integer('game_intro', { mode: 'boolean' }).notNull().default(true),
  cardAnnouncements: integer('card_announcements', { mode: 'boolean' }).notNull().default(true),
  hostNudging: integer('host_nudging', { mode: 'boolean' }).notNull().default(true),
  winnerAnnouncements: integer('winner_announcements', { mode: 'boolean' }).notNull().default(true),
  backgroundMusic: integer('background_music', { mode: 'boolean' }).notNull().default(true),
  musicVolume: integer('music_volume').notNull().default(30), // 0-100
  voiceVolume: integer('voice_volume').notNull().default(80), // 0-100
  humorLevel: text('humor_level', { enum: ['professional', 'sparky', 'roast'] }).notNull().default('sparky'),
  nudgeDelay: integer('nudge_delay').notNull().default(10), // seconds (0 = never)
  voiceId: text('voice_id'), // ElevenLabs voice ID
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

// ==================== Announcer Quips Table ====================

export const announcerQuips = sqliteTable('announcer_quips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imageId: integer('image_id').notNull(), // References gallery_images.id
  quipText: text('quip_text').notNull(),
  quipType: text('quip_type', { 
    enum: ['observational', 'ai-selfaware', 'contextual', 'winner', 'nudge'] 
  }).notNull().default('observational'),
  humorLevel: text('humor_level', { 
    enum: ['professional', 'sparky', 'roast'] 
  }).notNull().default('professional'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

// ==================== Announcer Audio Cache Table ====================

export const announcerCache = sqliteTable('announcer_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  textHash: text('text_hash').notNull().unique(), // MD5 hash of text + voice settings
  voiceId: text('voice_id').notNull(),
  audioFilePath: text('audio_file_path').notNull(),
  fileSize: integer('file_size').notNull(), // bytes
  durationMs: integer('duration_ms').notNull(), // milliseconds
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }).notNull().default(new Date()),
  useCount: integer('use_count').notNull().default(0),
});

// ==================== Announcer Session Memory Table ====================

export const announcerSessionMemory = sqliteTable('announcer_session_memory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type', {
    enum: ['game_start', 'game_end', 'card_reveal', 'player_win', 'host_delay', 'joke_told']
  }).notNull(),
  eventData: text('event_data'), // JSON string for flexible data storage
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(new Date()),
});

// ==================== Type Exports ====================

export type AnnouncerSettings = typeof announcerSettings.$inferSelect;
export type NewAnnouncerSettings = typeof announcerSettings.$inferInsert;

export type AnnouncerQuip = typeof announcerQuips.$inferSelect;
export type NewAnnouncerQuip = typeof announcerQuips.$inferInsert;

export type AnnouncerCacheEntry = typeof announcerCache.$inferSelect;
export type NewAnnouncerCacheEntry = typeof announcerCache.$inferInsert;

export type SessionMemoryEvent = typeof announcerSessionMemory.$inferSelect;
export type NewSessionMemoryEvent = typeof announcerSessionMemory.$inferInsert;
