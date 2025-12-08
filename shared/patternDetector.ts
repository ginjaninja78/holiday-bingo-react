/**
 * Pattern Detection Module
 * Validates bingo wins by checking if played images match winning patterns on a card
 */

export type PatternType = 'LINE' | 'DIAGONAL' | 'FOUR_CORNERS' | 'X_PATTERN' | 'BLACKOUT';

export type PatternMatch = {
  isWin: boolean;
  matchedPattern: PatternType | null;
  matchedPositions: number[]; // Flat indices of matched positions
};

const GRID_SIZE = 5;
const FREE_SPACE_INDEX = 12; // Center position

/**
 * Convert row, col to flat index
 */
function toIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

/**
 * Check if an image has been played
 */
function isImagePlayed(imageId: number, playedImageIds: number[]): boolean {
  return playedImageIds.includes(imageId);
}

/**
 * Check if a position is marked (either played or FREE space)
 */
function isPositionMarked(
  cardImageIds: number[],
  playedImageIds: number[],
  index: number
): boolean {
  const imageId = cardImageIds[index];
  
  // FREE space is always marked
  if (imageId === -1 || index === FREE_SPACE_INDEX) {
    return true;
  }
  
  return isImagePlayed(imageId, playedImageIds);
}

/**
 * Check all horizontal and vertical lines
 */
function checkLines(
  cardImageIds: number[],
  playedImageIds: number[]
): PatternMatch | null {
  // Check horizontal lines
  for (let row = 0; row < GRID_SIZE; row++) {
    const positions: number[] = [];
    let allMarked = true;
    
    for (let col = 0; col < GRID_SIZE; col++) {
      const index = toIndex(row, col);
      positions.push(index);
      
      if (!isPositionMarked(cardImageIds, playedImageIds, index)) {
        allMarked = false;
        break;
      }
    }
    
    if (allMarked) {
      return {
        isWin: true,
        matchedPattern: 'LINE',
        matchedPositions: positions,
      };
    }
  }
  
  // Check vertical lines
  for (let col = 0; col < GRID_SIZE; col++) {
    const positions: number[] = [];
    let allMarked = true;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      const index = toIndex(row, col);
      positions.push(index);
      
      if (!isPositionMarked(cardImageIds, playedImageIds, index)) {
        allMarked = false;
        break;
      }
    }
    
    if (allMarked) {
      return {
        isWin: true,
        matchedPattern: 'LINE',
        matchedPositions: positions,
      };
    }
  }
  
  return null;
}

/**
 * Check both diagonals
 */
function checkDiagonals(
  cardImageIds: number[],
  playedImageIds: number[]
): PatternMatch | null {
  // Check top-left to bottom-right diagonal
  let positions: number[] = [];
  let allMarked = true;
  
  for (let i = 0; i < GRID_SIZE; i++) {
    const index = toIndex(i, i);
    positions.push(index);
    
    if (!isPositionMarked(cardImageIds, playedImageIds, index)) {
      allMarked = false;
      break;
    }
  }
  
  if (allMarked) {
    return {
      isWin: true,
      matchedPattern: 'DIAGONAL',
      matchedPositions: positions,
    };
  }
  
  // Check top-right to bottom-left diagonal
  positions = [];
  allMarked = true;
  
  for (let i = 0; i < GRID_SIZE; i++) {
    const index = toIndex(i, GRID_SIZE - 1 - i);
    positions.push(index);
    
    if (!isPositionMarked(cardImageIds, playedImageIds, index)) {
      allMarked = false;
      break;
    }
  }
  
  if (allMarked) {
    return {
      isWin: true,
      matchedPattern: 'DIAGONAL',
      matchedPositions: positions,
    };
  }
  
  return null;
}

/**
 * Check four corners
 */
function checkFourCorners(
  cardImageIds: number[],
  playedImageIds: number[]
): PatternMatch | null {
  const corners = [
    toIndex(0, 0), // Top-left
    toIndex(0, GRID_SIZE - 1), // Top-right
    toIndex(GRID_SIZE - 1, 0), // Bottom-left
    toIndex(GRID_SIZE - 1, GRID_SIZE - 1), // Bottom-right
  ];
  
  const allMarked = corners.every(index =>
    isPositionMarked(cardImageIds, playedImageIds, index)
  );
  
  if (allMarked) {
    return {
      isWin: true,
      matchedPattern: 'FOUR_CORNERS',
      matchedPositions: corners,
    };
  }
  
  return null;
}

/**
 * Check X pattern (both diagonals)
 */
function checkXPattern(
  cardImageIds: number[],
  playedImageIds: number[]
): PatternMatch | null {
  const positions: number[] = [];
  
  // Top-left to bottom-right diagonal
  for (let i = 0; i < GRID_SIZE; i++) {
    positions.push(toIndex(i, i));
  }
  
  // Top-right to bottom-left diagonal
  for (let i = 0; i < GRID_SIZE; i++) {
    const index = toIndex(i, GRID_SIZE - 1 - i);
    if (!positions.includes(index)) {
      positions.push(index);
    }
  }
  
  const allMarked = positions.every(index =>
    isPositionMarked(cardImageIds, playedImageIds, index)
  );
  
  if (allMarked) {
    return {
      isWin: true,
      matchedPattern: 'X_PATTERN',
      matchedPositions: positions,
    };
  }
  
  return null;
}

/**
 * Check blackout (all 25 spaces)
 */
function checkBlackout(
  cardImageIds: number[],
  playedImageIds: number[]
): PatternMatch | null {
  const positions: number[] = [];
  
  for (let i = 0; i < cardImageIds.length; i++) {
    positions.push(i);
    
    if (!isPositionMarked(cardImageIds, playedImageIds, i)) {
      return null;
    }
  }
  
  return {
    isWin: true,
    matchedPattern: 'BLACKOUT',
    matchedPositions: positions,
  };
}

/**
 * Verify if a card has a winning pattern
 * @param cardImageIds - The 25 image IDs on the card (index 12 is FREE space = -1)
 * @param playedImageIds - Array of image IDs that have been called
 * @param requiredPatterns - Array of patterns that are valid for this round
 * @returns PatternMatch object indicating if there's a win and which pattern matched
 */
export function verifyBingo(
  cardImageIds: number[],
  playedImageIds: number[],
  requiredPatterns: PatternType[]
): PatternMatch {
  // Check patterns in order of complexity (fastest to slowest)
  const patternCheckers: Record<PatternType, () => PatternMatch | null> = {
    FOUR_CORNERS: () => checkFourCorners(cardImageIds, playedImageIds),
    LINE: () => checkLines(cardImageIds, playedImageIds),
    DIAGONAL: () => checkDiagonals(cardImageIds, playedImageIds),
    X_PATTERN: () => checkXPattern(cardImageIds, playedImageIds),
    BLACKOUT: () => checkBlackout(cardImageIds, playedImageIds),
  };
  
  // Check each required pattern
  for (const pattern of requiredPatterns) {
    const checker = patternCheckers[pattern];
    if (checker) {
      const result = checker();
      if (result) {
        return result;
      }
    }
  }
  
  // No winning pattern found
  return {
    isWin: false,
    matchedPattern: null,
    matchedPositions: [],
  };
}

/**
 * Get human-readable pattern name
 */
export function getPatternName(pattern: PatternType): string {
  const names: Record<PatternType, string> = {
    LINE: 'Line (Horizontal or Vertical)',
    DIAGONAL: 'Diagonal',
    FOUR_CORNERS: 'Four Corners',
    X_PATTERN: 'X Pattern',
    BLACKOUT: 'Blackout (Full Card)',
  };
  return names[pattern];
}

/**
 * Get pattern description
 */
export function getPatternDescription(pattern: PatternType): string {
  const descriptions: Record<PatternType, string> = {
    LINE: 'Complete any horizontal or vertical line',
    DIAGONAL: 'Complete either diagonal line',
    FOUR_CORNERS: 'Mark all four corner spaces',
    X_PATTERN: 'Complete both diagonal lines',
    BLACKOUT: 'Mark all 25 spaces on the card',
  };
  return descriptions[pattern];
}
