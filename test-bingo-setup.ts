/**
 * Test script to set up BINGO verification
 * Generates test cards and creates a game state
 */

import { getDb } from "./server/db";
import { generatedCards, hostGameState, hostGameConfigs, users, galleryImages } from "./drizzle/schema";
import { generateBingoCards } from "./shared/cardGenerator";
import { isNull } from "drizzle-orm";

async function setupBingoTest() {
  console.log("Setting up BINGO test data...");
  
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  // Get all active gallery images
  const images = await db
    .select()
    .from(galleryImages)
    .where(isNull(galleryImages.deletedAt));

  console.log(`Found ${images.length} gallery images`);

  if (images.length < 24) {
    console.error("Need at least 24 images to generate cards");
    process.exit(1);
  }

  // Generate 5 test cards
  const imageIds = images.map((img) => img.id);
  const cards = generateBingoCards(5, imageIds);

  console.log("Generated cards:");
  for (const card of cards) {
    // Save to database
    await db.insert(generatedCards).values({
      cardId: card.cardId,
      gameId: null,
      imageIds: card.imageIds,
    });
    
    console.log(`  Card ID: ${card.cardId}`);
    console.log(`    Images: ${card.imageIds.filter(id => id !== -1).slice(0, 5).join(", ")}...`);
  }

  // Get or create test user
  const [testUser] = await db.select().from(users).limit(1);
  
  if (!testUser) {
    console.error("No users found. Please log in first.");
    process.exit(1);
  }

  // Create a test game config
  const [config] = await db.insert(hostGameConfigs).values({
    hostId: testUser.id,
    gameName: "Test Game",
    totalRounds: 1,
    winsPerRound: 1,
    roundPatterns: [{ type: "line", name: "Line" }],
    imagePool: imageIds.map(String),
  });

  console.log(`Created game config ID: ${config.insertId}`);

  // Create a test game state with some played images
  const playedImages = images.slice(0, 10).map((img, index) => ({
    imageId: String(img.id),
    imageUrl: img.url,
    imageLabel: img.label,
    playedAt: Date.now() - (10 - index) * 60000, // Played in sequence
    orderIndex: index + 1,
  }));

  const [gameState] = await db.insert(hostGameState).values({
    hostId: testUser.id,
    configId: config.insertId,
    currentRound: 1,
    totalRounds: 1,
    winsPerRound: 1,
    status: "active",
    playedImages,
    currentImageIndex: 9,
  });

  console.log(`Created game state ID: ${gameState.insertId}`);
  console.log(`Played ${playedImages.length} images`);
  console.log("\nTest setup complete!");
  console.log("\nTo test BINGO verification:");
  console.log("1. Start the game");
  console.log("2. Click BINGO! button");
  console.log("3. Enter one of these Card IDs:");
  cards.forEach(card => console.log(`   - ${card.cardId}`));
  console.log(`\nGame ID for verification: ${gameState.insertId}`);
  
  process.exit(0);
}

setupBingoTest().catch((error) => {
  console.error("Error setting up test:", error);
  process.exit(1);
});
