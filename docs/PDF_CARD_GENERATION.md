# PDF Card Generation System

## Overview

The PDF card generation system creates printable bingo cards with unique Card IDs, 5x5 grids, and image references. Cards are generated server-side using jsPDF and downloaded as multi-page PDFs.

## Architecture

```
Client Request (GameSetupPanel)
    ↓
tRPC Mutation (pdf.generateMultipleCards)
    ↓
Card Generator (shared/cardGenerator.ts)
    ↓
PDF Generator (server/pdfGenerator.ts)
    ↓
Database Storage (generated_cards table)
    ↓
Base64 PDF Response
    ↓
Client Download (blob creation)
```

## Modules

### 1. `shared/cardGenerator.ts`
**Purpose**: Generate bingo card data structures with random image assignments

**Key Functions**:
- `generateCardId()`: Creates 5-character alphanumeric Card IDs
- `generateBingoCards(imageIds, count)`: Generates array of card objects

**Card Structure**:
```typescript
{
  cardId: string;        // e.g., "MNH32"
  imageIds: number[];    // 25 image IDs (center = -1 for FREE)
}
```

**Issues Resolved**:
- ✅ Unique Card ID generation
- ✅ No duplicate images per card
- ✅ FREE space at center (index 12)

**Issues To Resolve**:
- [ ] Add validation for minimum 25 images
- [ ] Add error handling for insufficient images
- [ ] Consider adding card metadata (created_at, game_id)

---

### 2. `server/pdfGenerator.ts`
**Purpose**: Convert card data to PDF format using jsPDF

**Key Functions**:
- `generateCardPDF(card, images)`: Single card PDF
- `generateMultipleCardsPDF(cards, images)`: Multi-page PDF
- `generatePDFsForCards(cardIds)`: Generate from existing cards

**PDF Layout**:
- **Page Size**: A4 (210mm × 297mm)
- **Grid**: 5×5 cells, 30mm × 22mm each
- **Card ID**: Top center, 16pt bold, gray background
- **FREE Space**: Center cell, yellow background
- **Image Labels**: 6pt text below each cell

**Issues Resolved**:
- ✅ jsPDF integration (Puppeteer failed in sandbox)
- ✅ Multi-page PDF generation
- ✅ Card ID display
- ✅ FREE space styling
- ✅ Base64 encoding for transmission

**Issues To Resolve**:
- [ ] **CRITICAL**: Image embedding fails with sharp
  - Problem: Server hangs during base64 conversion
  - Current: Using text labels as workaround
  - Solution: Pre-generate thumbnails (200×200px)
- [ ] Add QR code with Card ID for mobile scanning
- [ ] Add game metadata footer (date, round info)
- [ ] Optimize for black & white printing
- [ ] Add cut lines between cards for multi-card sheets

**Technical Debt**:
```typescript
// Current workaround (lines 95-100)
doc.setFontSize(6);
doc.text(img.alt, x + cellWidth / 2, y + cellHeight - 2, {
  align: "center",
  maxWidth: cellWidth - 2,
});

// Desired implementation
if (img.base64) {
  doc.addImage(img.base64, 'PNG', x + 2, y + 2, cellWidth - 4, cellHeight - 10);
}
```

---

### 3. `server/imageUtils.ts`
**Purpose**: Convert images to base64 for PDF embedding

**Key Functions**:
- `resizeAndConvertToBase64(filePath, maxWidth)`: Resize and encode

**Issues Resolved**:
- ✅ Sharp library installed
- ✅ Resize logic implemented

**Issues To Resolve**:
- [ ] **CRITICAL**: Performance bottleneck
  - Problem: Converting 25 images per card causes timeout
  - Current: Function exists but not used
  - Solution: Pre-generate thumbnails during image upload
- [ ] Add caching layer for converted images
- [ ] Add error handling for missing files
- [ ] Support remote URLs (currently filesystem only)

**Proposed Solution**:
```typescript
// Pre-generate thumbnails on image upload
async function generateThumbnail(originalPath: string) {
  const thumbnailPath = originalPath.replace('/images/', '/thumbnails/');
  await sharp(originalPath)
    .resize(200, 200, { fit: 'inside' })
    .png()
    .toFile(thumbnailPath);
  return thumbnailPath;
}
```

---

### 4. `server/pdfRouter.ts`
**Purpose**: tRPC procedures for PDF generation

**Procedures**:
- `generateMultipleCards`: Generate cards + PDF in one call
- `generateSingleCard`: Single card generation
- `generateForExistingCards`: PDF from existing Card IDs

**Issues Resolved**:
- ✅ tRPC integration
- ✅ Database persistence
- ✅ Base64 response format

**Issues To Resolve**:
- [ ] Add progress tracking for large batches (100+ cards)
- [ ] Add ZIP generation for multiple PDFs
- [ ] Add rate limiting to prevent abuse
- [ ] Add validation for input parameters

---

### 5. `client/src/components/GameSetupPanel.tsx`
**Purpose**: UI for PDF generation configuration

**Features**:
- Number of players input
- Games per player input
- Output summary display
- Download trigger

**Issues Resolved**:
- ✅ Base64 to blob conversion
- ✅ Browser download trigger
- ✅ Success/error notifications

**Issues To Resolve**:
- [ ] Add progress bar for large batches
- [ ] Add preview modal before download
- [ ] Add option to email PDFs
- [ ] Add print-friendly CSS for direct printing

---

## Database Schema

### `generated_cards` Table
```sql
CREATE TABLE generated_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT NOT NULL UNIQUE,
  game_id INTEGER,
  image_ids TEXT NOT NULL,  -- JSON array of image IDs
  created_at INTEGER NOT NULL
);
```

**Issues To Resolve**:
- [ ] Add indexes on card_id for fast lookups
- [ ] Add foreign key constraint to game_sessions
- [ ] Add soft delete for card recycling

---

## Testing

### Manual Tests Completed
- ✅ 2-card PDF generation (23KB)
- ✅ 12-card PDF generation (126KB)
- ✅ Card ID uniqueness
- ✅ FREE space rendering
- ✅ Download functionality

### Tests To Add
- [ ] Unit tests for cardGenerator
- [ ] Integration tests for PDF generation
- [ ] Load tests for 100+ card batches
- [ ] Print quality verification
- [ ] Cross-browser download testing

---

## Performance Metrics

| Operation | Current | Target |
|-----------|---------|--------|
| 2-card PDF | ~3s | <1s |
| 12-card PDF | ~5s | <2s |
| 100-card PDF | Unknown | <10s |
| File size (per card) | ~10KB | <5KB |

---

## Next Steps (Priority Order)

1. **Pre-generate Thumbnails**
   - Create `/client/public/thumbnails/` directory
   - Add thumbnail generation to image upload flow
   - Update pdfGenerator to use thumbnails
   - Test image embedding with 200×200px PNGs

2. **Add Progress Tracking**
   - Implement streaming response for large batches
   - Add progress bar in GameSetupPanel
   - Add cancellation support

3. **Optimize PDF Size**
   - Compress images before embedding
   - Use JPEG for photos, PNG for graphics
   - Test different quality settings

4. **Add QR Codes**
   - Install qrcode library
   - Generate QR with Card ID + game URL
   - Add to top-right corner of each card

5. **Print Optimization**
   - Add cut lines between cards
   - Test on actual printer
   - Add print CSS for direct printing
   - Support different paper sizes (Letter, A4)

---

## Known Limitations

1. **No Image Embedding**: Currently using text labels due to performance issues
2. **No Batch Progress**: Large batches appear frozen to user
3. **No Print Preview**: Users can't preview before downloading
4. **Fixed Layout**: A4 only, no customization
5. **No Accessibility**: PDFs not screen-reader friendly

---

## References

- jsPDF Documentation: https://github.com/parallax/jsPDF
- Sharp Documentation: https://sharp.pixelplumbing.com/
- tRPC Documentation: https://trpc.io/
