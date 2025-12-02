/**
 * Pure TypeScript game engine for Holiday Bingo
 * No framework dependencies - can be used on client or server
 */

export interface BingoTile {
  imageId: number;
  marked: boolean;
}

export interface BingoCard {
  tiles: BingoTile[][];
  playerId: string;
}

export interface WinningPattern {
  type: "line" | "diagonal" | "blackout" | "custom";
  name: string;
  positions?: [number, number][];
}

export interface GameState {
  calledImageIds: number[];
  players: Map<string, BingoCard>;
  currentPattern: WinningPattern;
}

/**
 * Generate a random 5x5 bingo card with unique images
 * Center tile (2,2) is FREE and auto-marked
 */
export function generateBingoCard(
  availableImageIds: number[],
  playerId: string
): BingoCard {
  if (availableImageIds.length < 24) {
    throw new Error("Need at least 24 unique images for a bingo card");
  }

  // Shuffle and select 24 random images (center is FREE)
  const shuffled = [...availableImageIds].sort(() => Math.random() - 0.5);
  const selectedImages = shuffled.slice(0, 24);

  const tiles: BingoTile[][] = [];
  let imageIndex = 0;

  for (let row = 0; row < 5; row++) {
    tiles[row] = [];
    for (let col = 0; col < 5; col++) {
      // Center tile is FREE
      if (row === 2 && col === 2) {
        tiles[row][col] = { imageId: -1, marked: true };
      } else {
        tiles[row][col] = {
          imageId: selectedImages[imageIndex++],
          marked: false,
        };
      }
    }
  }

  return { tiles, playerId };
}

/**
 * Validate if a tile can be marked (anti-cheat)
 * Returns true only if the image has been called
 */
export function canMarkTile(
  imageId: number,
  calledImageIds: number[]
): boolean {
  return calledImageIds.includes(imageId) || imageId === -1; // FREE tile always allowed
}

/**
 * Mark a tile on a card
 */
export function markTile(
  card: BingoCard,
  row: number,
  col: number,
  calledImageIds: number[]
): { success: boolean; reason?: string } {
  if (row < 0 || row >= 5 || col < 0 || col >= 5) {
    return { success: false, reason: "Invalid position" };
  }

  const tile = card.tiles[row][col];

  if (tile.marked) {
    return { success: false, reason: "Already marked" };
  }

  if (!canMarkTile(tile.imageId, calledImageIds)) {
    return { success: false, reason: "Not called yet" };
  }

  tile.marked = true;
  return { success: true };
}

/**
 * Check if a card has a winning pattern
 */
export function checkBingo(
  card: BingoCard,
  pattern: WinningPattern
): boolean {
  switch (pattern.type) {
    case "line":
      return checkLines(card);
    case "diagonal":
      return checkDiagonals(card);
    case "blackout":
      return checkBlackout(card);
    case "custom":
      return checkCustomPattern(card, pattern.positions || []);
    default:
      return false;
  }
}

/**
 * Check for any horizontal or vertical line
 */
function checkLines(card: BingoCard): boolean {
  // Check horizontal lines
  for (let row = 0; row < 5; row++) {
    if (card.tiles[row].every((tile) => tile.marked)) {
      return true;
    }
  }

  // Check vertical lines
  for (let col = 0; col < 5; col++) {
    if (card.tiles.every((row) => row[col].marked)) {
      return true;
    }
  }

  return false;
}

/**
 * Check for diagonal lines
 */
function checkDiagonals(card: BingoCard): boolean {
  // Top-left to bottom-right
  const diagonal1 = [0, 1, 2, 3, 4].every((i) => card.tiles[i][i].marked);

  // Top-right to bottom-left
  const diagonal2 = [0, 1, 2, 3, 4].every(
    (i) => card.tiles[i][4 - i].marked
  );

  return diagonal1 || diagonal2;
}

/**
 * Check if all tiles are marked
 */
function checkBlackout(card: BingoCard): boolean {
  return card.tiles.every((row) => row.every((tile) => tile.marked));
}

/**
 * Check for custom pattern (specific positions)
 */
function checkCustomPattern(
  card: BingoCard,
  positions: [number, number][]
): boolean {
  return positions.every(([row, col]) => card.tiles[row][col].marked);
}

/**
 * Get all possible winning patterns
 */
export function getStandardPatterns(): WinningPattern[] {
  return [
    { type: "line", name: "Any Line" },
    { type: "diagonal", name: "Diagonal" },
    { type: "blackout", name: "Blackout" },
    {
      type: "custom",
      name: "Four Corners",
      positions: [
        [0, 0],
        [0, 4],
        [4, 0],
        [4, 4],
      ],
    },
    {
      type: "custom",
      name: "T Shape",
      positions: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
      ],
    },
    {
      type: "custom",
      name: "L Shape",
      positions: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ],
    },
    {
      type: "custom",
      name: "Plus Sign",
      positions: [
        [0, 2],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [3, 2],
        [4, 2],
      ],
    },
  ];
}

/**
 * Export card data to simple 2D array format
 */
export function serializeCard(card: BingoCard): {
  imageIds: number[][];
  marked: boolean[][];
} {
  return {
    imageIds: card.tiles.map((row) => row.map((tile) => tile.imageId)),
    marked: card.tiles.map((row) => row.map((tile) => tile.marked)),
  };
}

/**
 * Import card from serialized format
 */
export function deserializeCard(
  data: { imageIds: number[][]; marked: boolean[][] },
  playerId: string
): BingoCard {
  const tiles: BingoTile[][] = data.imageIds.map((row, rowIdx) =>
    row.map((imageId, colIdx) => ({
      imageId,
      marked: data.marked[rowIdx][colIdx],
    }))
  );

  return { tiles, playerId };
}
