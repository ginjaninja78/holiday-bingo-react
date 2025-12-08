/**
 * Card Generation Module
 * Generates 5x5 bingo cards with unique Card IDs and random image assignments
 */

export type BingoCard = {
  cardId: string;
  imageIds: number[]; // 25 image IDs (index 12 is always FREE space)
  createdAt: Date;
};

export type CardPosition = {
  row: number; // 0-4
  col: number; // 0-4
  imageId: number | null; // null for FREE space (center)
};

const GRID_SIZE = 5;
const TOTAL_SPACES = GRID_SIZE * GRID_SIZE;
const FREE_SPACE_INDEX = 12; // Center position (row 2, col 2)

/**
 * Generate a unique 5-character Card ID
 * Format: XXXXX (uppercase alphanumeric, excluding confusing characters like O, 0, I, 1)
 */
export function generateCardId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude O, I, 0, 1
  let cardId = '';
  for (let i = 0; i < 5; i++) {
    cardId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return cardId;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a single bingo card with random image assignments
 * @param availableImageIds - Array of image IDs to choose from (must have at least 24 images)
 * @returns BingoCard object with unique Card ID and image positions
 */
export function generateBingoCard(availableImageIds: number[]): BingoCard {
  if (availableImageIds.length < TOTAL_SPACES - 1) {
    throw new Error(
      `Need at least ${TOTAL_SPACES - 1} images to generate a card. Got ${availableImageIds.length}`
    );
  }

  // Shuffle and take first 24 images (excluding center FREE space)
  const shuffled = shuffleArray(availableImageIds);
  const selectedImages = shuffled.slice(0, TOTAL_SPACES - 1);

  // Create image array with FREE space in center
  const imageIds: number[] = [];
  for (let i = 0; i < TOTAL_SPACES; i++) {
    if (i === FREE_SPACE_INDEX) {
      imageIds.push(-1); // -1 represents FREE space
    } else {
      const imageIndex = i < FREE_SPACE_INDEX ? i : i - 1;
      imageIds.push(selectedImages[imageIndex]);
    }
  }

  return {
    cardId: generateCardId(),
    imageIds,
    createdAt: new Date(),
  };
}

/**
 * Generate multiple unique bingo cards
 * @param count - Number of cards to generate
 * @param availableImageIds - Array of image IDs to choose from
 * @returns Array of BingoCard objects
 */
export function generateBingoCards(
  count: number,
  availableImageIds: number[]
): BingoCard[] {
  const cards: BingoCard[] = [];
  const usedCardIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    let card = generateBingoCard(availableImageIds);

    // Ensure unique Card ID (extremely unlikely collision, but check anyway)
    while (usedCardIds.has(card.cardId)) {
      card = generateBingoCard(availableImageIds);
    }

    usedCardIds.add(card.cardId);
    cards.push(card);
  }

  return cards;
}

/**
 * Convert flat image array to 2D grid for display
 */
export function cardToGrid(imageIds: number[]): number[][] {
  const grid: number[][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowData: number[] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const index = row * GRID_SIZE + col;
      rowData.push(imageIds[index]);
    }
    grid.push(rowData);
  }
  return grid;
}

/**
 * Get image ID at specific position
 */
export function getImageAtPosition(
  imageIds: number[],
  row: number,
  col: number
): number {
  return imageIds[row * GRID_SIZE + col];
}

/**
 * Check if a position is the FREE space
 */
export function isFreeSpace(row: number, col: number): boolean {
  return row === 2 && col === 2;
}
