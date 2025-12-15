/**
 * PDF Generator for Bingo Cards
 * Uses jsPDF to create printable bingo cards matching SSO&O Holiday Bingo template
 */

import { jsPDF } from "jspdf";
import { getDb } from "./db";
import { galleryImages, generatedCards } from "../drizzle/schema";
import { eq, inArray, isNull } from "drizzle-orm";
import { generateBingoCards } from "../shared/cardGenerator";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

export interface PDFGenerationOptions {
  count: number; // Number of cards (players) to generate
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  fileName?: string;
  cardIds?: string[];
  error?: string;
  totalPages?: number;
}

interface CardImage {
  url: string;
  label: string;
  base64?: string;
}

// Pre-load logo and free space images
let logoBase64: string | null = null;
let freeSpaceBase64: string | null = null;

async function loadStaticAssets(): Promise<void> {
  const basePath = "/home/ubuntu/holiday-bingo/client/public/images";
  
  // Load John Hancock logo (PNG)
  const logoPath = path.join(basePath, "john-hancock-logo.png");
  if (fs.existsSync(logoPath)) {
    const logoBuffer = await sharp(logoPath).png().toBuffer();
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    console.log("[PDF] Logo loaded:", logoBuffer.length, "bytes");
  } else {
    console.log("[PDF] Logo not found at:", logoPath);
  }
  
  // Load FREE SPACE image (PNG)
  const freeSpacePath = path.join(basePath, "free-space.png");
  if (fs.existsSync(freeSpacePath)) {
    const freeBuffer = await sharp(freeSpacePath).resize(150).png().toBuffer();
    freeSpaceBase64 = `data:image/png;base64,${freeBuffer.toString("base64")}`;
    console.log("[PDF] Free space loaded:", freeBuffer.length, "bytes");
  } else {
    console.log("[PDF] Free space not found at:", freeSpacePath);
  }
}

/**
 * Convert image file to base64
 */
async function imageToBase64(filePath: string, maxWidth: number = 150): Promise<string> {
  const buffer = await sharp(filePath)
    .resize(maxWidth, maxWidth, { fit: "inside" })
    .png()
    .toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

/**
 * Generate a single bingo card PDF matching SSO&O template
 */
async function generateCardPDF(
  doc: jsPDF,
  cardId: string,
  images: (CardImage | null)[],
  playerNumber: number
): Promise<void> {
  const pageWidth = 210; // A4 width in mm
  const margin = 15;
  const gridSize = 5;
  const cellSize = 34; // Larger cells for better visibility
  const gridWidth = cellSize * gridSize;
  const startX = (pageWidth - gridWidth) / 2;
  
  let currentY = 12;

  // Player ID and Card ID header
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Player ID: ${playerNumber} | Card ID: ${cardId}`, margin, currentY);
  
  currentY += 10;

  // John Hancock Logo (centered)
  if (logoBase64) {
    try {
      const logoWidth = 55;
      const logoHeight = 18;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoBase64, "PNG", logoX, currentY, logoWidth, logoHeight);
      currentY += logoHeight + 6;
    } catch (e) {
      console.error("[PDF] Failed to add logo:", e);
      currentY += 10;
    }
  } else {
    currentY += 10;
  }

  // SSO&O Holiday Bingo title
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("SSO&O Holiday Bingo", pageWidth / 2, currentY + 8, { align: "center" });
  
  currentY += 18;

  // Grid
  const gridStartY = currentY;

  // Draw grid cells with images
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = startX + col * cellSize;
      const y = gridStartY + row * cellSize;
      const index = row * gridSize + col; // Use actual grid position
      const isFreeSpace = row === 2 && col === 2;

      // Draw cell border
      doc.setDrawColor(100, 100, 100);
      doc.rect(x, y, cellSize, cellSize);

      if (isFreeSpace) {
        // FREE SPACE - use template image
        if (freeSpaceBase64) {
          try {
            doc.addImage(freeSpaceBase64, "PNG", x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
          } catch (e) {
            // Fallback to text
            doc.setFillColor(30, 100, 180);
            doc.rect(x, y, cellSize, cellSize, "F");
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text("FREE", x + cellSize / 2, y + cellSize / 2 - 2, { align: "center" });
            doc.text("SPACE", x + cellSize / 2, y + cellSize / 2 + 5, { align: "center" });
            doc.setTextColor(0, 0, 0);
          }
        } else {
          // Fallback FREE SPACE
          doc.setFillColor(30, 100, 180);
          doc.rect(x, y, cellSize, cellSize, "F");
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text("FREE", x + cellSize / 2, y + cellSize / 2 - 2, { align: "center" });
          doc.text("SPACE", x + cellSize / 2, y + cellSize / 2 + 5, { align: "center" });
          doc.setTextColor(0, 0, 0);
        }
      } else {
        const img = images[index]; // Use grid position index directly
        
        if (img && img.base64) {
          try {
            // Add image (leaving space for label)
            const imgPadding = 1;
            const labelHeight = 8;
            const imgWidth = cellSize - imgPadding * 2;
            const imgHeight = cellSize - labelHeight - imgPadding;
            doc.addImage(img.base64, "PNG", x + imgPadding, y + imgPadding, imgWidth, imgHeight);
            
            // Label below image
            doc.setFontSize(5.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            const labelLines = doc.splitTextToSize(img.label, cellSize - 2);
            const labelY = y + cellSize - 3;
            doc.text(labelLines[0] || "", x + cellSize / 2, labelY, { align: "center" });
            doc.setTextColor(0, 0, 0);
          } catch (e) {
            // Fallback: show label only
            doc.setFillColor(240, 240, 240);
            doc.rect(x + 1, y + 1, cellSize - 2, cellSize - 10, "F");
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            const labelLines = doc.splitTextToSize(img.label, cellSize - 4);
            doc.text(labelLines.slice(0, 2), x + cellSize / 2, y + cellSize / 2, { align: "center" });
            doc.setTextColor(0, 0, 0);
          }
        } else if (img) {
          // No base64 - show label only
          doc.setFillColor(245, 245, 245);
          doc.rect(x + 1, y + 1, cellSize - 2, cellSize - 2, "F");
          doc.setFontSize(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          const labelLines = doc.splitTextToSize(img.label, cellSize - 4);
          doc.text(labelLines.slice(0, 3), x + cellSize / 2, y + cellSize / 2, { align: "center" });
          doc.setTextColor(0, 0, 0);
        }
      }
    }
  }

  // Player Instructions
  const instructionsY = gridStartY + gridSize * cellSize + 12;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Player Instructions:", margin, instructionsY);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("To Mark: Comments > Drawing Markups > Stamps > Select stamp > Click square", margin, instructionsY + 6);
  doc.text("To Reset: Tools > Comments > Clear All", margin, instructionsY + 11);
}

/**
 * Generate multiple bingo cards in a single PDF (one card per player)
 */
export async function generateMultipleCardsPDF(
  options: PDFGenerationOptions
): Promise<PDFGenerationResult> {
  console.log("[PDF] generateMultipleCardsPDF called with:", options);
  const { count } = options;

  if (count < 1 || count > 100) {
    return {
      success: false,
      error: "Player count must be between 1 and 100",
    };
  }

  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Load static assets (logo, free space)
    await loadStaticAssets();
    console.log("[PDF] Static assets loaded. Logo:", !!logoBase64, "FreeSpace:", !!freeSpaceBase64);

    // Get all active gallery images
    const images = await db
      .select()
      .from(galleryImages)
      .where(isNull(galleryImages.deletedAt));

    console.log("[PDF] Found", images.length, "gallery images");

    if (images.length < 24) {
      return {
        success: false,
        error: `Need at least 24 images to generate cards. Currently have ${images.length}`,
      };
    }

    // Generate cards (one per player)
    const imageIds = images.map((img) => img.id);
    console.log("[PDF] Generating", count, "cards...");
    const cards = generateBingoCards(count, imageIds);
    console.log("[PDF] Generated", cards.length, "cards");

    // Save cards to database
    const savedCardIds: string[] = [];
    for (const card of cards) {
      await db.insert(generatedCards).values({
        cardId: card.cardId,
        gameId: null,
        imageIds: card.imageIds,
      });
      savedCardIds.push(card.cardId);
    }

    // Convert all used images to base64
    const usedImageIds = new Set<number>();
    cards.forEach(card => card.imageIds.forEach(id => { if (id !== -1) usedImageIds.add(id); }));
    console.log("[PDF] Converting", usedImageIds.size, "unique images to base64...");
    
    const imageMap = new Map<number, typeof images[0] & { base64?: string }>();
    const basePath = "/home/ubuntu/holiday-bingo/client/public";
    
    for (const img of images) {
      if (!usedImageIds.has(img.id)) {
        imageMap.set(img.id, img);
        continue;
      }
      try {
        const localPath = path.join(basePath, img.url);
        if (fs.existsSync(localPath)) {
          const base64 = await imageToBase64(localPath, 150);
          imageMap.set(img.id, { ...img, base64 });
        } else {
          console.warn(`[PDF] Image not found: ${localPath}`);
          imageMap.set(img.id, img);
        }
      } catch (error) {
        console.error(`[PDF] Failed to convert image ${img.id}:`, error);
        imageMap.set(img.id, img);
      }
    }
    console.log("[PDF] Image conversion complete");

    // Generate PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    for (let i = 0; i < cards.length; i++) {
      if (i > 0) {
        doc.addPage();
      }

      const card = cards[i];
      const cardImages = card.imageIds.map((id) => {
        if (id === -1) return null; // FREE space
        const img = imageMap.get(id);
        return img ? { url: img.url, label: img.label, base64: img.base64 } : null;
      });

      await generateCardPDF(doc, card.cardId, cardImages, i + 1);
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer") as ArrayBuffer);
    const fileName = count === 1 
      ? `bingo-card-${savedCardIds[0]}.pdf`
      : `bingo-cards-${count}-players.pdf`;

    console.log("[PDF] Generation complete. File size:", pdfBuffer.length, "bytes");

    return {
      success: true,
      pdfBuffer,
      fileName,
      cardIds: savedCardIds,
      totalPages: cards.length,
    };
  } catch (error) {
    console.error("[PDF] Error generating PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate a single bingo card PDF
 */
export async function generateSingleCardPDF(
  cardId: string
): Promise<PDFGenerationResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    await loadStaticAssets();

    const [card] = await db
      .select()
      .from(generatedCards)
      .where(eq(generatedCards.cardId, cardId))
      .limit(1);

    if (!card) {
      return { success: false, error: "Card not found" };
    }

    const images = await db
      .select()
      .from(galleryImages)
      .where(isNull(galleryImages.deletedAt));

    const basePath = "/home/ubuntu/holiday-bingo/client/public";
    const imageMap = new Map<number, typeof images[0] & { base64?: string }>();
    
    for (const img of images) {
      try {
        const localPath = path.join(basePath, img.url);
        if (fs.existsSync(localPath)) {
          const base64 = await imageToBase64(localPath, 150);
          imageMap.set(img.id, { ...img, base64 });
        } else {
          imageMap.set(img.id, img);
        }
      } catch {
        imageMap.set(img.id, img);
      }
    }

    const imageIds = card.imageIds as number[];
    const cardImages = imageIds.map((id) => {
      if (id === -1) return null;
      const img = imageMap.get(id);
      return img ? { url: img.url, label: img.label, base64: img.base64 } : null;
    });

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    await generateCardPDF(doc, card.cardId, cardImages, 1);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer") as ArrayBuffer);

    return {
      success: true,
      pdfBuffer,
      fileName: `bingo-card-${cardId}.pdf`,
      cardIds: [cardId],
      totalPages: 1,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate PDFs for existing card IDs
 */
export async function generatePDFsForCards(
  cardIds: string[]
): Promise<PDFGenerationResult> {
  if (cardIds.length === 0) {
    return { success: false, error: "No card IDs provided" };
  }

  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    await loadStaticAssets();

    const cards = await db
      .select()
      .from(generatedCards)
      .where(inArray(generatedCards.cardId, cardIds));

    if (cards.length === 0) {
      return { success: false, error: "No cards found" };
    }

    const images = await db
      .select()
      .from(galleryImages)
      .where(isNull(galleryImages.deletedAt));

    const basePath = "/home/ubuntu/holiday-bingo/client/public";
    const imageMap = new Map<number, typeof images[0] & { base64?: string }>();
    
    for (const img of images) {
      try {
        const localPath = path.join(basePath, img.url);
        if (fs.existsSync(localPath)) {
          const base64 = await imageToBase64(localPath, 150);
          imageMap.set(img.id, { ...img, base64 });
        } else {
          imageMap.set(img.id, img);
        }
      } catch {
        imageMap.set(img.id, img);
      }
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    for (let i = 0; i < cards.length; i++) {
      if (i > 0) {
        doc.addPage();
      }

      const card = cards[i];
      const imageIds = card.imageIds as number[];
      const cardImages = imageIds.map((id) => {
        if (id === -1) return null;
        const img = imageMap.get(id);
        return img ? { url: img.url, label: img.label, base64: img.base64 } : null;
      });

      await generateCardPDF(doc, card.cardId, cardImages, i + 1);
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer") as ArrayBuffer);

    const fileName =
      cards.length === 1
        ? `bingo-card-${cards[0].cardId}.pdf`
        : `bingo-cards-${cards.length}.pdf`;

    return {
      success: true,
      pdfBuffer,
      fileName,
      cardIds: cards.map((c) => c.cardId),
      totalPages: cards.length,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
