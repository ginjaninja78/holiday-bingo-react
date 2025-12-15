import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { galleryImages, generatedCards } from './drizzle/schema.ts';
import { isNull } from 'drizzle-orm';
import { jsPDF } from 'jspdf';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Testing PDF generation...');

// Get gallery images
const images = await db.select().from(galleryImages).where(isNull(galleryImages.deletedAt));
console.log('Found', images.length, 'gallery images');

// Test image conversion
const basePath = '/home/ubuntu/holiday-bingo/client/public';
let successCount = 0;
let failCount = 0;

for (const img of images.slice(0, 5)) {
  const localPath = path.join(basePath, img.url);
  if (fs.existsSync(localPath)) {
    try {
      const buffer = await sharp(localPath).resize(150).png().toBuffer();
      console.log(`✅ ${img.id}: ${img.label} (${buffer.length} bytes)`);
      successCount++;
    } catch (e) {
      console.log(`❌ ${img.id}: ${img.label} - ${e.message}`);
      failCount++;
    }
  } else {
    console.log(`❌ ${img.id}: ${img.label} - FILE NOT FOUND: ${localPath}`);
    failCount++;
  }
}

console.log(`\nResults: ${successCount} success, ${failCount} failed`);

// Generate a test PDF
console.log('\nGenerating test PDF...');
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
doc.setFontSize(24);
doc.text('SSO&O Holiday Bingo', 105, 30, { align: 'center' });

// Add one test image
const testImg = images[0];
const testPath = path.join(basePath, testImg.url);
if (fs.existsSync(testPath)) {
  const buffer = await sharp(testPath).resize(100).png().toBuffer();
  const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
  doc.addImage(base64, 'PNG', 50, 50, 40, 40);
  doc.setFontSize(10);
  doc.text(testImg.label, 70, 95, { align: 'center' });
}

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync('/home/ubuntu/test-card.pdf', pdfBuffer);
console.log('✅ Test PDF saved to /home/ubuntu/test-card.pdf');
console.log('   Size:', pdfBuffer.length, 'bytes');

await connection.end();
