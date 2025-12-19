/**
 * AI Voice Announcer System - Database Migration Script
 * 
 * Creates the four announcer tables in the SQLite database.
 * Run this script to set up the announcer system database schema.
 * 
 * Usage: pnpm tsx scripts/migrate-announcer.ts
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import * as announcerSchema from '../drizzle/schema-announcer';

const DATABASE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/bingo.db';

async function migrateAnnouncerTables() {
  console.log('🎙️  Starting Announcer System Database Migration...\n');
  
  // Connect to database
  const sqlite = new Database(DATABASE_PATH);
  const db = drizzle(sqlite);
  
  try {
    // Create announcer_settings table
    console.log('Creating announcer_settings table...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcer_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        enabled INTEGER NOT NULL DEFAULT 1,
        game_intro INTEGER NOT NULL DEFAULT 1,
        card_announcements INTEGER NOT NULL DEFAULT 1,
        host_nudging INTEGER NOT NULL DEFAULT 1,
        winner_announcements INTEGER NOT NULL DEFAULT 1,
        background_music INTEGER NOT NULL DEFAULT 1,
        music_volume INTEGER NOT NULL DEFAULT 30,
        voice_volume INTEGER NOT NULL DEFAULT 80,
        humor_level TEXT NOT NULL DEFAULT 'sparky' CHECK(humor_level IN ('professional', 'sparky', 'roast')),
        nudge_delay INTEGER NOT NULL DEFAULT 10,
        voice_id TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('✅ announcer_settings table created\n');
    
    // Create announcer_quips table
    console.log('Creating announcer_quips table...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcer_quips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_id INTEGER NOT NULL,
        quip_text TEXT NOT NULL,
        quip_type TEXT NOT NULL DEFAULT 'observational' CHECK(quip_type IN ('observational', 'ai-selfaware', 'contextual', 'winner', 'nudge')),
        humor_level TEXT NOT NULL DEFAULT 'professional' CHECK(humor_level IN ('professional', 'sparky', 'roast')),
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('✅ announcer_quips table created\n');
    
    // Create announcer_cache table
    console.log('Creating announcer_cache table...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcer_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_hash TEXT NOT NULL UNIQUE,
        voice_id TEXT NOT NULL,
        audio_file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        last_used_at INTEGER NOT NULL DEFAULT (unixepoch()),
        use_count INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log('✅ announcer_cache table created\n');
    
    // Create announcer_session_memory table
    console.log('Creating announcer_session_memory table...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS announcer_session_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL CHECK(event_type IN ('game_start', 'game_end', 'card_reveal', 'player_win', 'host_delay', 'joke_told')),
        event_data TEXT,
        timestamp INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    console.log('✅ announcer_session_memory table created\n');
    
    // Insert default settings
    console.log('Inserting default settings...');
    await db.run(sql`
      INSERT OR IGNORE INTO announcer_settings (id, enabled, game_intro, card_announcements, host_nudging, winner_announcements, background_music, music_volume, voice_volume, humor_level, nudge_delay)
      VALUES (1, 1, 1, 1, 1, 1, 1, 30, 80, 'sparky', 10)
    `);
    console.log('✅ Default settings inserted\n');
    
    // Verify tables
    console.log('Verifying tables...');
    const tables = db.all(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'announcer_%'
      ORDER BY name
    `);
    console.log('📋 Announcer tables created:');
    tables.forEach((table: any) => {
      console.log(`   - ${table.name}`);
    });
    
    console.log('\n🎉 Announcer System Database Migration Complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: pnpm tsx scripts/seed-announcer-quips.ts');
    console.log('   2. Set ELEVENLABS_API_KEY in .env');
    console.log('   3. Start the dev server: pnpm dev\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// Run migration
migrateAnnouncerTables().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
