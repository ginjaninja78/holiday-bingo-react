import puppeteer from 'puppeteer';

console.log("Testing Puppeteer...");
try {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log("Browser launched successfully!");
  await browser.close();
  console.log("Test passed!");
} catch (error) {
  console.error("Error:", error.message);
}
