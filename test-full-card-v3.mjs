import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { galleryImages } from './drizzle/schema.ts';
import { isNull } from 'drizzle-orm';
import { jsPDF } from 'jspdf';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Generating full bingo card v3...');

const images = await db.select().from(galleryImages).where(isNull(galleryImages.deletedAt));
console.log('Found', images.length, 'gallery images');

const shuffled = [...images].sort(() => Math.random() - 0.5).slice(0, 24);

const basePath = '/home/ubuntu/holiday-bingo/client/public';
let logoBase64 = null;
let freeSpaceBase64 = null;

// Load PNG logo
const logoPath = path.join(basePath, 'images/john-hancock-logo.png');
if (fs.existsSync(logoPath)) {
  const buf = await sharp(logoPath).png().toBuffer();
  logoBase64 = `data:image/png;base64,${buf.toString('base64')}`;
  console.log('✅ Logo loaded');
}

// Load FREE SPACE PNG (the new one)
const freeSpacePath = path.join(basePath, 'images/free-space.png');
if (fs.existsSync(freeSpacePath)) {
  const buf = await sharp(freeSpacePath).resize(150).png().toBuffer();
  freeSpaceBase64 = `data:image/png;base64,${buf.toString('base64')}`;
  console.log('✅ Free space PNG loaded');
} else {
  console.log('❌ Free space not found at', freeSpacePath);
}

// Convert images
console.log('Converting images...');
const imageData = [];
for (const img of shuffled) {
  const localPath = path.join(basePath, img.url);
  if (fs.existsSync(localPath)) {
    const buf = await sharp(localPath).resize(150).png().toBuffer();
    imageData.push({ label: img.label, base64: `data:image/png;base64,${buf.toString('base64')}` });
  } else {
    imageData.push({ label: img.label, base64: null });
  }
}
console.log('✅ Converted', imageData.length, 'images');

// Generate PDF
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const pageWidth = 210;
const margin = 15;
const gridSize = 5;
const cellSize = 34;
const gridWidth = cellSize * gridSize;
const startX = (pageWidth - gridWidth) / 2;

let currentY = 12;

doc.setFontSize(11);
doc.setFont('helvetica', 'normal');
doc.text('Player ID: XXXXXX | Card ID: XXXXX', margin, currentY);
currentY += 10;

if (logoBase64) {
  const logoWidth = 55;
  const logoHeight = 18;
  doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, currentY, logoWidth, logoHeight);
  currentY += logoHeight + 6;
}

doc.setFontSize(26);
doc.setFont('helvetica', 'bold');
doc.text('SSO&O Holiday Bingo', pageWidth / 2, currentY + 8, { align: 'center' });
currentY += 18;

const gridStartY = currentY;
let imgIndex = 0;

for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const x = startX + col * cellSize;
    const y = gridStartY + row * cellSize;
    const isFreeSpace = row === 2 && col === 2;

    doc.setDrawColor(100, 100, 100);
    doc.rect(x, y, cellSize, cellSize);

    if (isFreeSpace) {
      if (freeSpaceBase64) {
        doc.addImage(freeSpaceBase64, 'PNG', x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      } else {
        doc.setFillColor(30, 100, 180);
        doc.rect(x, y, cellSize, cellSize, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('FREE', x + cellSize / 2, y + cellSize / 2 - 2, { align: 'center' });
        doc.text('SPACE', x + cellSize / 2, y + cellSize / 2 + 5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    } else {
      const img = imageData[imgIndex++];
      if (img && img.base64) {
        const imgPadding = 1;
        const labelHeight = 8;
        doc.addImage(img.base64, 'PNG', x + imgPadding, y + imgPadding, cellSize - imgPadding * 2, cellSize - labelHeight - imgPadding);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const labelLines = doc.splitTextToSize(img.label, cellSize - 2);
        doc.text(labelLines[0] || '', x + cellSize / 2, y + cellSize - 3, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    }
  }
}

const instructionsY = gridStartY + gridSize * cellSize + 12;
doc.setFontSize(11);
doc.setFont('helvetica', 'bold');
doc.text('Player Instructions:', margin, instructionsY);
doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
doc.text('To Mark: Comments > Drawing Markups > Stamps > Select stamp > Click square', margin, instructionsY + 6);
doc.text('To Reset: Tools > Comments > Clear All', margin, instructionsY + 11);

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync('/home/ubuntu/full-bingo-card-v3.pdf', pdfBuffer);
console.log('✅ Card v3 saved:', pdfBuffer.length, 'bytes');

await connection.end();
