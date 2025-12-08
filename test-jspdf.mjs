import { jsPDF } from "jspdf";
import fs from "fs";

console.log("Testing jsPDF...");

try {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add some content
  doc.setFontSize(24);
  doc.text("Hello World", 105, 50, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("This is a test PDF", 105, 70, { align: "center" });

  // Try to output
  console.log("Generating PDF...");
  const arrayBuffer = doc.output("arraybuffer");
  console.log("ArrayBuffer size:", arrayBuffer.byteLength);
  
  const buffer = Buffer.from(arrayBuffer);
  console.log("Buffer size:", buffer.length);
  
  fs.writeFileSync("/home/ubuntu/test-jspdf-output.pdf", buffer);
  console.log("PDF written to /home/ubuntu/test-jspdf-output.pdf");
  
  const stats = fs.statSync("/home/ubuntu/test-jspdf-output.pdf");
  console.log("File size:", stats.size, "bytes");
  
} catch (error) {
  console.error("Error:", error.message);
  console.error(error.stack);
}
