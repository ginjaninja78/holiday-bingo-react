# Game Engine Module

Pure TypeScript game logic for Holiday Bingo. This module contains no dependencies on React, Express, or database - making it highly testable and reusable.

## Overview

The game engine handles:
- Bingo card generation with unique images
- Tile marking with validation
- Bingo pattern detection (lines, diagonals, blackout, custom)
- Card serialization for database storage

## Core Functions

### `generateBingoCard(availableImages: number[], playerId: string): BingoCard`

Generates a unique 5×5 bingo card for a player.

**Parameters:**
- `availableImages`: Array of image IDs to choose from (must have at least 24)
- `playerId`: Unique identifier for the player

**Returns:** `BingoCard` object with 25 tiles (center is FREE)

**Example:**
```typescript
const images = [1, 2, 3, 4, ..., 50];
const card = generateBingoCard(images, "player-uuid-123");
// card.tiles[2][2] is always the FREE tile
```

### `canMarkTile(imageId: number, calledImages: number[]): boolean`

Checks if a tile can be marked (anti-cheat validation).

**Parameters:**
- `imageId`: The image ID on the tile
- `calledImages`: Array of image IDs that have been called

**Returns:** `true` if tile can be marked, `false` otherwise

**Rules:**
- FREE tiles (imageId === -1) can always be marked
- Regular tiles can only be marked if their image has been called

### `markTile(card: BingoCard, row: number, col: number, calledImages: number[]): MarkResult`

Marks a tile on the card with validation.

**Parameters:**
- `card`: The bingo card to modify
- `row`: Row index (0-4)
- `col`: Column index (0-4)
- `calledImages`: Array of called image IDs

**Returns:** `MarkResult` with success status and reason if failed

**Validation:**
- Position must be valid (0-4 for both row and col)
- Tile must not already be marked
- Image must have been called (unless FREE tile)

### `checkBingo(card: BingoCard, pattern: WinningPattern): boolean`

Checks if the card has achieved the winning pattern.

**Parameters:**
- `card`: The bingo card to check
- `pattern`: The winning pattern definition

**Returns:** `true` if pattern is complete, `false` otherwise

**Supported Patterns:**
- `line`: Any horizontal or vertical line
- `diagonal`: Either diagonal (top-left to bottom-right or top-right to bottom-left)
- `blackout`: All 25 tiles marked
- `custom`: Specific positions defined in pattern.positions

### `serializeCard(card: BingoCard): SerializedCard`

Converts a BingoCard to a format suitable for database storage.

**Returns:**
```typescript
{
  imageIds: number[][], // 5x5 array of image IDs
  marked: boolean[][],  // 5x5 array of marked states
}
```

### `deserializeCard(serialized: SerializedCard, playerId: string): BingoCard`

Converts serialized card data back to a BingoCard object.

### `getStandardPatterns(): WinningPattern[]`

Returns an array of standard bingo patterns.

**Included Patterns:**
- Any Line (horizontal or vertical)
- Diagonal
- Four Corners
- T Shape
- L Shape
- Plus Sign
- Blackout (full card)

## Data Structures

### `BingoCard`

```typescript
interface BingoCard {
  playerId: string;
  tiles: BingoTile[][]; // 5x5 grid
}
```

### `BingoTile`

```typescript
interface BingoTile {
  imageId: number;  // -1 for FREE tile
  marked: boolean;
}
```

### `WinningPattern`

```typescript
interface WinningPattern {
  type: "line" | "diagonal" | "blackout" | "custom";
  name: string;
  positions?: [number, number][]; // For custom patterns
}
```

## Algorithm Details

### Card Generation

1. Shuffle available images using Fisher-Yates algorithm
2. Select first 24 images
3. Create 5×5 grid
4. Place FREE tile at center (2, 2)
5. Distribute remaining 24 images around it
6. Seed random number generator with player ID for reproducibility

### Bingo Detection

**Line Detection:**
```typescript
// Check each row
for (let row = 0; row < 5; row++) {
  if (all tiles in row are marked) return true;
}

// Check each column
for (let col = 0; col < 5; col++) {
  if (all tiles in column are marked) return true;
}
```

**Diagonal Detection:**
```typescript
// Top-left to bottom-right
if (tiles[0][0], tiles[1][1], ..., tiles[4][4] all marked) return true;

// Top-right to bottom-left
if (tiles[0][4], tiles[1][3], ..., tiles[4][0] all marked) return true;
```

**Custom Pattern Detection:**
```typescript
for (let [row, col] of pattern.positions) {
  if (!tiles[row][col].marked) return false;
}
return true;
```

## Testing

All game engine functions are thoroughly tested in `server/gameEngine.test.ts`.

**Run tests:**
```bash
pnpm test server/gameEngine.test.ts
```

**Test Coverage:**
- Card generation with various image counts
- FREE tile placement
- Unique image distribution
- Tile marking validation
- All pattern types
- Serialization/deserialization
- Edge cases and error handling

## Performance Considerations

- **Card Generation**: O(n) where n is number of available images
- **Bingo Detection**: O(1) for lines and diagonals, O(k) for custom patterns where k is number of positions
- **Memory**: Each card uses ~200 bytes (25 tiles × 8 bytes per tile)

## Security Notes

- **Server-Side Only**: This module must only run on the server
- **No Client Exposure**: Never send game engine code to client
- **Validation**: Always validate with `canMarkTile` before marking
- **Deterministic**: Card generation is deterministic per player ID for verification

## Extension Points

### Adding New Patterns

```typescript
const newPattern: WinningPattern = {
  type: "custom",
  name: "X Pattern",
  positions: [
    [0, 0], [0, 4],
    [1, 1], [1, 3],
    [2, 2],
    [3, 1], [3, 3],
    [4, 0], [4, 4],
  ],
};
```

### Custom Validation Rules

Extend `canMarkTile` to add custom rules:
```typescript
export function canMarkTile(
  imageId: number,
  calledImages: number[],
  customRules?: ValidationRule[]
): boolean {
  // Existing validation
  if (imageId === -1) return true;
  if (!calledImages.includes(imageId)) return false;
  
  // Custom validation
  if (customRules) {
    for (const rule of customRules) {
      if (!rule.validate(imageId)) return false;
    }
  }
  
  return true;
}
```

## Troubleshooting

### "Need at least 24 unique images" Error

**Cause**: Not enough images provided to `generateBingoCard`

**Solution**: Ensure image catalog has at least 24 images

### Bingo Not Detected

**Cause**: Pattern definition doesn't match marked tiles

**Solution**: 
1. Log marked tiles: `console.log(card.tiles.map(row => row.map(t => t.marked)))`
2. Verify pattern positions
3. Check if FREE tile is counted in pattern

### Tiles Marked Out of Order

**Cause**: Client-side marking without server validation

**Solution**: Always call `markTile` on server and broadcast result

## Related Files

- `server/gameRouter.ts`: tRPC procedures using game engine
- `server/db.ts`: Database persistence of cards
- `server/gameEngine.test.ts`: Comprehensive test suite
- `shared/gameTypes.ts`: TypeScript type definitions

---

For questions or contributions, see main project README.
