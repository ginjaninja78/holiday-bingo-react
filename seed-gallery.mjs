import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { galleryImages } from './drizzle/schema.ts';
import { imageGallery } from './shared/imageGallery.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Seeding gallery images...');

// Check if images already exist
const existing = await db.select().from(galleryImages).limit(1);
if (existing.length > 0) {
  console.log('Gallery already seeded, skipping...');
  process.exit(0);
}

// Insert all 40 images
const imagesToInsert = imageGallery.map((img) => ({
  url: img.url,
  label: img.label,
  source: 'ai_generated',
  deletedAt: null,
}));

await db.insert(galleryImages).values(imagesToInsert);

console.log(`✅ Seeded ${imagesToInsert.length} gallery images`);

await connection.end();
