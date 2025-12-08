import { jsPDF } from "jspdf";
import fs from "fs";

console.log("Testing card PDF generation...");

try {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const cardId = "TEST1";
  const images = [
    { url: "", label: "Winter scene" },
    { url: "", label: "Snow" },
    { url: "", label: "Christmas tree" },
    { url: "", label: "Presents" },
    { url: "", label: "Candy cane" },
    { url: "", label: "Snowman" },
    { url: "", label: "Reindeer" },
    { url: "", label: "Santa" },
    { url: "", label: "Elf" },
    { url: "", label: "Ornament" },
    { url: "", label: "Wreath" },
    { url: "", label: "Stocking" },
    null, // FREE space
    { url: "", label: "Gingerbread" },
    { url: "", label: "Hot cocoa" },
    { url: "", label: "Fireplace" },
    { url: "", label: "Candle" },
    { url: "", label: "Bell" },
    { url: "", label: "Star" },
    { url: "", label: "Angel" },
    { url: "", label: "Snowflake" },
    { url: "", label: "Lights" },
    { url: "", label: "Ribbon" },
    { url: "", label: "Bow" },
    { url: "", label: "Holly" },
  ];

  const startY = 20;
  const pageWidth = 210;
  const gridSize = 5;
  const cellSize = 30;
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
        doc.setFillColor(251, 191, 36);
        doc.rect(x, y, cellSize, cellSize, "F");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("FREE", x + cellSize / 2, y + cellSize / 2 + 5, { align: "center" });
        doc.setTextColor(0, 0, 0);
      } else {
        const img = images[index];
        if (img) {
          // Image placeholder
          doc.setFillColor(248, 250, 252);
          doc.rect(x, y, cellSize, cellSize - 8, "F");

          // Label
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

  // Instructions
  const instructionsY = gridStartY + gridSize * cellSize + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("How to Play:", 20, instructionsY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("• Mark off images as they are called by the host", 20, instructionsY + 5);
  doc.text("• Complete the winning pattern to get BINGO!", 20, instructionsY + 10);
  doc.text(`• Call out "BINGO!" and provide your Card ID: ${cardId}`, 20, instructionsY + 15);

  // Generate PDF
  console.log("Generating PDF...");
  const arrayBuffer = doc.output("arraybuffer");
  console.log("ArrayBuffer size:", arrayBuffer.byteLength);
  
  const buffer = Buffer.from(arrayBuffer);
  console.log("Buffer size:", buffer.length);
  
  fs.writeFileSync("/home/ubuntu/test-card-output.pdf", buffer);
  console.log("PDF written to /home/ubuntu/test-card-output.pdf");
  
  const stats = fs.statSync("/home/ubuntu/test-card-output.pdf");
  console.log("File size:", stats.size, "bytes");
  
} catch (error) {
  console.error("Error:", error.message);
  console.error(error.stack);
}
