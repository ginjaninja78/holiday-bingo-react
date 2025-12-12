# GitHub Copilot Instructions - Holiday Bingo PDF Card Generation

## Current Task: Fix Image Embedding in PDF Cards

### Context
We're building a corporate holiday bingo game. PDF card generation works but currently uses text labels instead of actual images due to performance issues with real-time image conversion.

### Problem Statement
The `server/pdfGenerator.ts` module attempts to embed images using sharp for resizing and jsPDF for rendering, but the server hangs during base64 conversion of 25 images per card.

### Current State
- ✅ PDF generation works (126KB for 12 cards)
- ✅ Card IDs, FREE space, grid layout all functional
- ❌ Images show as text labels, not actual images
- ❌ `resizeAndConvertToBase64()` causes server timeout

### Goal
Enable actual image embedding in PDF cards without performance degradation.

---

## Proposed Solution: Pre-generated Thumbnails

### Step 1: Create Thumbnail Directory
```bash
mkdir -p /home/ubuntu/holiday-bingo/client/public/thumbnails
```

### Step 2: Generate Thumbnails for Existing Images
Create `scripts/generate-thumbnails.ts`:
```typescript
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const IMAGES_DIR = '/home/ubuntu/holiday-bingo/client/public/images/gallery';
const THUMBNAILS_DIR = '/home/ubuntu/holiday-bingo/client/public/thumbnails';

async function generateThumbnails() {
  const files = await fs.readdir(IMAGES_DIR);
  
  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;
    
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(THUMBNAILS_DIR, file.replace(/\.\w+$/, '.png'));
    
    await sharp(inputPath)
      .resize(200, 200, { fit: 'inside' })
      .png({ quality: 80 })
      .toFile(outputPath);
    
    console.log(`✓ Generated thumbnail: ${file}`);
  }
}

generateThumbnails().catch(console.error);
```

Run with: `npx tsx scripts/generate-thumbnails.ts`

### Step 3: Update Database Schema
Add `thumbnail_url` column to `gallery_images` table:
```typescript
// drizzle/schema.ts
export const galleryImages = sqliteTable("gallery_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"), // NEW
  alt: text("alt").notNull(),
  source: text("source").notNull().default("ai"),
  deletedAt: integer("deleted_at"),
});
```

Run migration: `pnpm db:push`

### Step 4: Update Seed Script
Modify `seed-gallery.ts` to include thumbnail URLs:
```typescript
await db.insert(galleryImages).values(
  IMAGE_GALLERY.map((img) => ({
    url: img.url,
    thumbnailUrl: img.url.replace('/images/', '/thumbnails/').replace(/\.\w+$/, '.png'),
    alt: img.alt,
    source: "ai",
  }))
);
```

### Step 5: Update PDF Generator
Modify `server/pdfGenerator.ts` to use thumbnails:
```typescript
// Line ~260: Fetch images with thumbnails
const images = await db
  .select()
  .from(galleryImages)
  .where(inArray(galleryImages.id, uniqueImageIds))
  .execute();

// Line ~265: Convert thumbnails to base64
for (const img of images) {
  if (!uniqueImageIds.includes(img.id)) continue;
  
  try {
    const thumbnailPath = `/home/ubuntu/holiday-bingo/client/public${img.thumbnailUrl}`;
    const buffer = await fs.readFile(thumbnailPath);
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
    imageMap.set(img.id, { ...img, base64 });
  } catch (error) {
    console.error(`Failed to load thumbnail for image ${img.id}:`, error);
    imageMap.set(img.id, img); // Fallback to text label
  }
}
```

### Step 6: Test
```bash
# Generate new PDF with images
# Navigate to /play → Setup New Game → Generate PDF Cards (2 players)
# Verify downloaded PDF contains actual images, not text labels
```

---

## Alternative Approaches (If Above Fails)

### Option A: Use Data URLs from Database
Store base64-encoded thumbnails directly in database (increases DB size but eliminates filesystem dependency).

### Option B: Stream Images via CDN
Upload thumbnails to S3, reference via HTTPS URLs in PDF (requires internet connection during generation).

### Option C: Use Canvas API
Generate images on client-side using HTML Canvas, send as base64 to server (shifts load to client).

---

## Code Style Guidelines

- Use TypeScript strict mode
- Prefer async/await over promises
- Add error handling with try/catch
- Log progress for long operations
- Use Drizzle ORM for database queries
- Follow existing naming conventions (camelCase for functions, PascalCase for types)

---

## Testing Checklist

- [ ] Thumbnails generated for all 40 images
- [ ] Database updated with thumbnail URLs
- [ ] PDF generation completes in <5 seconds for 12 cards
- [ ] Downloaded PDF opens correctly
- [ ] Images display in PDF (not text labels)
- [ ] FREE space still shows as yellow background
- [ ] Card IDs still visible and unique
- [ ] File size reasonable (<20KB per card)

---

## Files to Modify

1. `scripts/generate-thumbnails.ts` (NEW)
2. `drizzle/schema.ts` (ADD thumbnailUrl column)
3. `seed-gallery.ts` (UPDATE to include thumbnails)
4. `server/pdfGenerator.ts` (UPDATE to use thumbnails)
5. `server/imageUtils.ts` (OPTIONAL: Remove if unused)

---

## Success Criteria

✅ PDF cards contain actual images (not text labels)  
✅ Generation time <5s for 12 cards  
✅ File size <20KB per card  
✅ No server timeouts or hangs  
✅ All existing features still work (Card IDs, FREE space, etc.)

---

## Questions to Ask Before Starting

1. Should thumbnails be square (200×200) or preserve aspect ratio?
2. Should we keep original images or replace with thumbnails?
3. Should thumbnail generation be automatic on image upload?
4. What quality/compression level for thumbnails (current: 80)?
5. Should we cache base64 strings to avoid repeated file reads?

---

## Debugging Tips

If PDF generation still hangs:
1. Add console.log before/after each image conversion
2. Check file permissions on thumbnails directory
3. Verify sharp is installed correctly (`pnpm list sharp`)
4. Test thumbnail conversion in isolation (single image)
5. Monitor memory usage during generation

If images don't display in PDF:
1. Verify base64 string format (should start with `data:image/png;base64,`)
2. Check jsPDF addImage parameters (x, y, width, height)
3. Test with a single hardcoded image first
4. Verify image dimensions match cell size

---

## Additional Resources

- Sharp API: https://sharp.pixelplumbing.com/api-resize
- jsPDF addImage: https://github.com/parallax/jsPDF#addimage
- Base64 encoding: https://nodejs.org/api/buffer.html#buftostringencoding-start-end
