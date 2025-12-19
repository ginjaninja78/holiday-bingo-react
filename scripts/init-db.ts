/**
 * Initialize SQLite database and seed with gallery images
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";
import { galleryImages } from "../drizzle/schema";

async function initDatabase() {
  console.log("[Init] Starting database initialization...");
  
  // Create database
  const dbPath = path.join(process.cwd(), "data", "bingo.db");
  const dataDir = path.dirname(dbPath);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`[Init] Created data directory: ${dataDir}`);
  }
  
  console.log(`[Init] Database path: ${dbPath}`);
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite);
  
  // Run migrations
  console.log("[Init] Running migrations...");
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle", "migrations") });
  console.log("[Init] Migrations completed");
  
  // Seed gallery images
  console.log("[Init] Seeding gallery images...");
  const galleryDir = path.join(process.cwd(), "client", "public", "images", "gallery");
  
  if (!fs.existsSync(galleryDir)) {
    console.error(`[Init] Gallery directory not found: ${galleryDir}`);
    process.exit(1);
  }
  
  const imageFiles = fs.readdirSync(galleryDir).filter(f => f.endsWith(".png"));
  console.log(`[Init] Found ${imageFiles.length} images in gallery`);
  
  const imagesToInsert = imageFiles.map((filename) => {
    // Extract label from filename (e.g., "001_christmas_tree_snow.png" -> "Christmas Tree Snow")
    const nameWithoutExt = filename.replace(/\.png$/, "");
    const nameWithoutNumber = nameWithoutExt.replace(/^\d+_/, "");
    const label = nameWithoutNumber
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    return {
      url: `/images/gallery/${filename}`,
      label,
      source: "ai_generated" as const,
    };
  });
  
  // Insert images in batches
  for (const image of imagesToInsert) {
    await db.insert(galleryImages).values(image);
  }
  
  console.log(`[Init] Seeded ${imagesToInsert.length} gallery images`);
  
  // Verify
  const count = await db.select().from(galleryImages);
  console.log(`[Init] Total images in database: ${count.length}`);
  
  sqlite.close();
  console.log("[Init] Database initialization complete!");
}

initDatabase().catch((error) => {
  console.error("[Init] Error:", error);
  process.exit(1);
});
