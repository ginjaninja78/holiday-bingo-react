/**
 * Test PDF generation directly
 */

import { generateMultipleCardsPDF } from "./server/pdfGenerator";
import fs from "fs";

async function test() {
  console.log("Testing PDF generation...");
  
  try {
    const result = await generateMultipleCardsPDF({
      count: 2,
      gamesPerPlayer: 1,
    });

    console.log("Result:", {
      success: result.success,
      error: result.error,
      fileName: result.fileName,
      cardIds: result.cardIds,
      totalPages: result.totalPages,
      bufferSize: result.pdfBuffer?.length || 0,
    });

    if (result.success && result.pdfBuffer) {
      const outputPath = "/home/ubuntu/test-generated-cards.pdf";
      fs.writeFileSync(outputPath, result.pdfBuffer);
      console.log("PDF written to:", outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log("File size:", stats.size, "bytes");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
