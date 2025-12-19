/**
 * Seed 100 new gallery images into the database
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";
import { galleryImages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function seedNewImages() {
  console.log("[Seed] Starting to seed 100 new gallery images...");
  
  // Connect to database
  const dbPath = path.join(process.cwd(), "data", "bingo.db");
  
  if (!fs.existsSync(dbPath)) {
    console.error(`[Seed] Database not found at: ${dbPath}`);
    console.error("[Seed] Please run 'pnpm init-db' first");
    process.exit(1);
  }
  
  console.log(`[Seed] Connecting to database: ${dbPath}`);
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);
  
  // Get all image files from gallery
  const galleryPath = path.join(process.cwd(), "client/public/images/gallery");
  
  if (!fs.existsSync(galleryPath)) {
    console.error(`[Seed] Gallery directory not found: ${galleryPath}`);
    process.exit(1);
  }
  
  // Get all image files from 041 to 140
  const allFiles = fs.readdirSync(galleryPath);
  const newImageFiles = allFiles.filter(file => {
    const match = file.match(/^(\d{3})_/);
    if (!match) return false;
    const num = parseInt(match[1]);
    return num >= 41 && num <= 140 && file.endsWith('.png');
  }).sort();
  
  console.log(`[Seed] Found ${newImageFiles.length} new images to seed`);
  
  let seededCount = 0;
  let skippedCount = 0;
  
  for (const filename of newImageFiles) {
    const url = `/images/gallery/${filename}`;
    
    // Extract label from filename
    const nameWithoutExt = filename.replace('.png', '');
    const parts = nameWithoutExt.split('_');
    parts.shift(); // Remove number
    const label = parts.join(' ').replace(/-/g, ' ');
    
    try {
      // Check if image already exists
      const existing = await db.select().from(galleryImages).where(eq(galleryImages.url, url)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(galleryImages).values({
          url,
          label,
          source: 'ai_generated',
        });
        seededCount++;
        
        if (seededCount % 20 === 0) {
          console.log(`[Seed] Seeded ${seededCount}/${newImageFiles.length} images...`);
        }
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`[Seed] Error seeding ${filename}:`, error);
    }
  }
  
  console.log(`[Seed] Successfully seeded ${seededCount} new images`);
  console.log(`[Seed] Skipped ${skippedCount} existing images`);
  
  // Verify total count
  const totalImages = await db.select().from(galleryImages);
  console.log(`[Seed] Total images in database: ${totalImages.length}`);
  console.log('[Seed] Seeding complete!');
  
  sqlite.close();
}

seedNewImages().catch(console.error);
