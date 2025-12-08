import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { galleryImages } from './drizzle/schema';
import { IMAGE_GALLERY } from './shared/imageGallery';

async function seedGallery() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  console.log('Seeding gallery images...');

  // Check if images already exist
  const existing = await db.select().from(galleryImages).limit(1);
  if (existing.length > 0) {
    console.log('Gallery already seeded, skipping...');
    await connection.end();
    return;
  }

  // Insert all 40 images
  const imagesToInsert = IMAGE_GALLERY.map((img) => ({
    url: img.url,
    label: img.alt,
    source: 'ai_generated' as const,
    deletedAt: null,
  }));

  await db.insert(galleryImages).values(imagesToInsert);

  console.log(`✅ Seeded ${imagesToInsert.length} gallery images`);

  await connection.end();
}

seedGallery().catch(console.error);
