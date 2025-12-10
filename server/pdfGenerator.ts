/**
 * PDF Generator for Bingo Cards
 * Uses jsPDF to create printable bingo cards
 */

import { jsPDF } from "jspdf";
import { getDb } from "./db";
import { galleryImages, generatedCards } from "../drizzle/schema";
import { eq, inArray, isNull } from "drizzle-orm";
import { generateBingoCards } from "../shared/cardGenerator";
import { resizeAndConvertToBase64 } from "./imageUtils";

export interface PDFGenerationOptions {
  count: number; // Number of cards to generate
  gamesPerPlayer?: number; // Number of games per player (default: 1)
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

/**
 * Generate a single bingo card PDF using jsPDF
 */
async function generateCardPDF(
  doc: jsPDF,
  cardId: string,
  images: (CardImage | null)[],
  startY: number = 20
): Promise<void> {
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 20;
  const gridSize = 5;
  const cellSize = 30; // 30mm per cell
  const gridWidth = cellSize * gridSize;
  const startX = (pageWidth - gridWidth) / 2;

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("🎄 HOLIDAY BINGO ❄️", pageWidth / 2, startY, { align: "center" });

  // Card ID
  doc.setFontSize(16);
  doc.setFont("courier", "bold");
  doc.setFillColor(241, 245, 249);
  const cardIdWidth = 60;
  const cardIdX = (pageWidth - cardIdWidth) / 2;
  doc.roundedRect(cardIdX, startY + 8, cardIdWidth, 10, 2, 2, "F");
  doc.text(`Card ID: ${cardId}`, pageWidth / 2, startY + 15, { align: "center" });

  // Grid
  const gridStartY = startY + 25;
  doc.setLineWidth(0.5);
  doc.setDrawColor(30, 64, 175); // Blue border

  // Draw grid cells
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = startX + col * cellSize;
      const y = gridStartY + row * cellSize;
      const index = row * gridSize + col;
      const isFreeSpace = row === 2 && col === 2;

      // Draw cell border
      doc.setDrawColor(203, 213, 225);
      doc.rect(x, y, cellSize, cellSize);

      if (isFreeSpace) {
        // FREE space
        doc.setFillColor(251, 191, 36); // Yellow
        doc.rect(x, y, cellSize, cellSize, "F");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("FREE", x + cellSize / 2, y + cellSize / 2, { align: "center" });
        doc.setTextColor(0, 0, 0);
      } else {
        const img = images[index];
        if (img && img.base64) {
          try {
            // Add image
            const imgWidth = cellSize - 2;
            const imgHeight = cellSize - 10;
            doc.addImage(img.base64, "PNG", x + 1, y + 1, imgWidth, imgHeight, undefined, "FAST");
            
            // Label below image
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            const labelLines = doc.splitTextToSize(img.label, cellSize - 4);
            const labelY = y + cellSize - 6;
            doc.text(labelLines.slice(0, 1), x + cellSize / 2, labelY, { align: "center" });
            doc.setTextColor(0, 0, 0);
          } catch (e) {
            // Fallback to label only if image fails
            doc.setFillColor(248, 250, 252);
            doc.rect(x, y, cellSize, cellSize - 8, "F");
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            const labelLines = doc.splitTextToSize(img.label, cellSize - 4);
            const labelY = y + cellSize - 6;
            doc.text(labelLines.slice(0, 2), x + cellSize / 2, labelY, { align: "center" });
            doc.setTextColor(0, 0, 0);
          }
        }
      }
    }
  }

  // Instructions
  const instructionsY = gridStartY + gridSize * cellSize + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("How to Play:", margin, instructionsY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("• Mark off images as they are called by the host", margin, instructionsY + 5);
  doc.text("• Complete the winning pattern to get BINGO!", margin, instructionsY + 10);
  doc.text(`• Call out "BINGO!" and provide your Card ID: ${cardId}`, margin, instructionsY + 15);
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
    // Get the card from database
    const [card] = await db
      .select()
      .from(generatedCards)
      .where(eq(generatedCards.cardId, cardId))
      .limit(1);

    if (!card) {
      return { success: false, error: "Card not found" };
    }

    // Get all gallery images
    const images = await db
      .select()
      .from(galleryImages)
      .where(isNull(galleryImages.deletedAt));

    const imageMap = new Map(images.map((img) => [img.id, img]));

    // Build card data
    const imageIds = card.imageIds as number[];
    const cardImages = imageIds.map((id) => {
      if (id === -1) return null; // FREE space
      const img = imageMap.get(id);
      return img ? { url: img.url, label: img.label } : null;
    });

    // Generate PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    await generateCardPDF(doc, card.cardId, cardImages);

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
 * Generate multiple bingo cards in a single PDF
 */
export async function generateMultipleCardsPDF(
  options: PDFGenerationOptions
): Promise<PDFGenerationResult> {
  console.log("[PDF] generateMultipleCardsPDF called with:", options);
  const { count, gamesPerPlayer = 1 } = options;

  if (count < 1 || count > 1000) {
    return {
      success: false,
      error: "Card count must be between 1 and 1000",
    };
  }

  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Get all active gallery images
    const images = await db
      .select()
      .from(galleryImages)
      .where(isNull(galleryImages.deletedAt));

    if (images.length < 24) {
      return {
        success: false,
        error: `Need at least 24 images to generate cards. Currently have ${images.length}`,
      };
    }

    // Generate cards
    const imageIds = images.map((img) => img.id);
    console.log("[PDF] Generating", count, "cards with", imageIds.length, "images");
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

    // Build card template data and convert only used images to base64
    const usedImageIds = new Set<number>();
    cards.forEach(card => card.imageIds.forEach(id => { if (id !== -1) usedImageIds.add(id); }));
    console.log("[PDF] Converting", usedImageIds.size, "unique images to base64...");
    
    const imageMap = new Map<number, typeof images[0] & { base64?: string }>();
    for (const img of images) {
      if (!usedImageIds.has(img.id)) {
        imageMap.set(img.id, img); // Skip unused images
        continue;
      }
      try {
        // Use local filesystem path with resizing
        const localPath = `/home/ubuntu/holiday-bingo/client/public${img.url}`;
        const base64 = await resizeAndConvertToBase64(localPath, 200);
        imageMap.set(img.id, { ...img, base64 });
      } catch (error) {
        console.error(`[PDF] Failed to convert image ${img.id}:`, error);
        imageMap.set(img.id, img); // Fallback without base64
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

      await generateCardPDF(doc, card.cardId, cardImages);
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer") as ArrayBuffer);

    const totalPages = count * gamesPerPlayer;
    const fileName = `bingo-cards-${count}x${gamesPerPlayer}.pdf`;

    return {
      success: true,
      pdfBuffer,
      fileName,
      cardIds: savedCardIds,
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
    // Get cards from database
    const cards = await db
      .select()
      .from(generatedCards)
      .where(inArray(generatedCards.cardId, cardIds));

    if (cards.length === 0) {
      return { success: false, error: "No cards found" };
    }

    // Get all gallery images
    const images = await db
      .select()
      .from(galleryImages)
      .where(isNull(galleryImages.deletedAt));

    const imageMap = new Map(images.map((img) => [img.id, img]));

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
      const imageIds = card.imageIds as number[];
      const cardImages = imageIds.map((id) => {
        if (id === -1) return null; // FREE space
        const img = imageMap.get(id);
        return img ? { url: img.url, label: img.label } : null;
      });

      await generateCardPDF(doc, card.cardId, cardImages);
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
