# TODO: Scoring System Integration

## Overview
Connect the Card UUID tracking system to the game scoring/verification system. This enables hosts to verify bingo winners by entering a Card ID and checking if the card has a valid bingo based on called images.

---

## Current State

### What Exists
- `generated_cards` table stores Card IDs and their image layouts
- Cards are generated with unique 5-character IDs (e.g., "A3K7P")
- `imageIds` array stores 25 image IDs (-1 for FREE space)
- Host can call images during gameplay
- `playedImages` tracked in `host_game_state`

### What's Missing
- No link between generated cards and active game sessions
- No winner verification endpoint
- No UI for host to verify a claimed bingo
- No tracking of which cards belong to which game

---

## Database Schema (Already Exists)

### Key Tables
```typescript
// generated_cards - stores card layouts
{
  id: int,
  cardId: varchar(5),        // "A3K7P"
  batchId: varchar(64),      // UUID for batch
  gameId: int | null,        // Link to host_game_state
  imageIds: json<number[]>,  // [120001, 120015, ..., -1, ...]
  createdAt: timestamp
}

// host_game_state - active game
{
  id: int,
  hostId: int,
  configId: int,
  currentRound: int,
  status: "active" | "paused" | "ended",
  playedImages: json<PlayedImage[]>,  // Called images
  currentImageIndex: int,
  startedAt: timestamp
}

// PlayedImage type
{
  imageId: string,
  imageUrl: string,
  imageLabel: string,
  playedAt: number,
  orderIndex: number
}
```

---

## Implementation Steps

### Phase 1: Link Cards to Games

#### Step 1.1: Update Card Generation
**File:** `server/pdfGenerator.ts`

When generating cards, optionally link them to an active game:

```typescript
// In generateMultipleCardsPDF function, after generating cards:
// If there's an active game, link cards to it

export async function generateMultipleCardsPDF(
  options: PDFGenerationOptions & { gameId?: number }
): Promise<PDFGenerationResult> {
  // ... existing code ...
  
  // Save cards to database with gameId
  for (const card of cards) {
    await db.insert(generatedCards).values({
      cardId: card.cardId,
      gameId: options.gameId || null,  // Link to game if provided
      imageIds: card.imageIds,
    });
    savedCardIds.push(card.cardId);
  }
  
  // ... rest of function ...
}
```

#### Step 1.2: Add tRPC Procedure to Link Cards
**File:** `server/routers.ts`

```typescript
// Add to router
linkCardsToGame: protectedProcedure
  .input(z.object({
    cardIds: z.array(z.string()),
    gameId: z.number()
  }))
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    
    await db.update(generatedCards)
      .set({ gameId: input.gameId })
      .where(inArray(generatedCards.cardId, input.cardIds));
    
    return { success: true, linkedCount: input.cardIds.length };
  }),
```

---

### Phase 2: Winner Verification Logic

#### Step 2.1: Create Bingo Verification Function
**File:** `server/bingoVerification.ts` (NEW FILE)

```typescript
/**
 * Bingo Verification Module
 * Checks if a card has achieved bingo based on called images
 */

import { WinningPattern } from "../drizzle/schema";

const GRID_SIZE = 5;
const FREE_SPACE_INDEX = 12; // Center position

/**
 * Convert flat imageIds array to 2D grid
 */
function toGrid(imageIds: number[]): number[][] {
  const grid: number[][] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    grid.push(imageIds.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE));
  }
  return grid;
}

/**
 * Check if a position is marked (image was called or is FREE space)
 */
function isMarked(
  imageId: number,
  calledImageIds: Set<number>
): boolean {
  if (imageId === -1) return true; // FREE space always marked
  return calledImageIds.has(imageId);
}

/**
 * Check for horizontal line bingo
 */
function checkHorizontalLines(
  grid: number[][],
  calledIds: Set<number>
): { hasBingo: boolean; winningPositions: [number, number][] } {
  for (let row = 0; row < GRID_SIZE; row++) {
    const positions: [number, number][] = [];
    let complete = true;
    
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isMarked(grid[row][col], calledIds)) {
        positions.push([row, col]);
      } else {
        complete = false;
        break;
      }
    }
    
    if (complete) {
      return { hasBingo: true, winningPositions: positions };
    }
  }
  return { hasBingo: false, winningPositions: [] };
}

/**
 * Check for vertical line bingo
 */
function checkVerticalLines(
  grid: number[][],
  calledIds: Set<number>
): { hasBingo: boolean; winningPositions: [number, number][] } {
  for (let col = 0; col < GRID_SIZE; col++) {
    const positions: [number, number][] = [];
    let complete = true;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      if (isMarked(grid[row][col], calledIds)) {
        positions.push([row, col]);
      } else {
        complete = false;
        break;
      }
    }
    
    if (complete) {
      return { hasBingo: true, winningPositions: positions };
    }
  }
  return { hasBingo: false, winningPositions: [] };
}

/**
 * Check for diagonal bingo (both directions)
 */
function checkDiagonals(
  grid: number[][],
  calledIds: Set<number>
): { hasBingo: boolean; winningPositions: [number, number][] } {
  // Top-left to bottom-right
  let positions: [number, number][] = [];
  let complete = true;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (isMarked(grid[i][i], calledIds)) {
      positions.push([i, i]);
    } else {
      complete = false;
      break;
    }
  }
  if (complete) {
    return { hasBingo: true, winningPositions: positions };
  }
  
  // Top-right to bottom-left
  positions = [];
  complete = true;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (isMarked(grid[i][GRID_SIZE - 1 - i], calledIds)) {
      positions.push([i, GRID_SIZE - 1 - i]);
    } else {
      complete = false;
      break;
    }
  }
  if (complete) {
    return { hasBingo: true, winningPositions: positions };
  }
  
  return { hasBingo: false, winningPositions: [] };
}

/**
 * Check for four corners bingo
 */
function checkFourCorners(
  grid: number[][],
  calledIds: Set<number>
): { hasBingo: boolean; winningPositions: [number, number][] } {
  const corners: [number, number][] = [
    [0, 0], [0, 4], [4, 0], [4, 4]
  ];
  
  for (const [row, col] of corners) {
    if (!isMarked(grid[row][col], calledIds)) {
      return { hasBingo: false, winningPositions: [] };
    }
  }
  
  return { hasBingo: true, winningPositions: corners };
}

/**
 * Check for X pattern bingo
 */
function checkXPattern(
  grid: number[][],
  calledIds: Set<number>
): { hasBingo: boolean; winningPositions: [number, number][] } {
  const xPositions: [number, number][] = [];
  
  // Both diagonals
  for (let i = 0; i < GRID_SIZE; i++) {
    xPositions.push([i, i]);
    if (i !== GRID_SIZE - 1 - i) {
      xPositions.push([i, GRID_SIZE - 1 - i]);
    }
  }
  
  for (const [row, col] of xPositions) {
    if (!isMarked(grid[row][col], calledIds)) {
      return { hasBingo: false, winningPositions: [] };
    }
  }
  
  return { hasBingo: true, winningPositions: xPositions };
}

/**
 * Check for blackout (all squares)
 */
function checkBlackout(
  grid: number[][],
  calledIds: Set<number>
): { hasBingo: boolean; winningPositions: [number, number][] } {
  const positions: [number, number][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!isMarked(grid[row][col], calledIds)) {
        return { hasBingo: false, winningPositions: [] };
      }
      positions.push([row, col]);
    }
  }
  
  return { hasBingo: true, winningPositions: positions };
}

/**
 * Check for custom pattern
 */
function checkCustomPattern(
  grid: number[][],
  calledIds: Set<number>,
  positions: [number, number][]
): { hasBingo: boolean; winningPositions: [number, number][] } {
  for (const [row, col] of positions) {
    if (!isMarked(grid[row][col], calledIds)) {
      return { hasBingo: false, winningPositions: [] };
    }
  }
  
  return { hasBingo: true, winningPositions: positions };
}

/**
 * Main verification function
 */
export interface VerificationResult {
  isValid: boolean;
  cardId: string;
  pattern: string;
  winningPositions: [number, number][];
  message: string;
}

export function verifyBingo(
  cardImageIds: number[],
  calledImageIds: number[],
  pattern: WinningPattern
): VerificationResult {
  const grid = toGrid(cardImageIds);
  const calledSet = new Set(calledImageIds);
  
  let result: { hasBingo: boolean; winningPositions: [number, number][] };
  
  switch (pattern.type) {
    case "line":
      // Check both horizontal and vertical
      result = checkHorizontalLines(grid, calledSet);
      if (!result.hasBingo) {
        result = checkVerticalLines(grid, calledSet);
      }
      break;
    case "diagonal":
      result = checkDiagonals(grid, calledSet);
      break;
    case "four_corners":
      result = checkFourCorners(grid, calledSet);
      break;
    case "x_pattern":
      result = checkXPattern(grid, calledSet);
      break;
    case "blackout":
      result = checkBlackout(grid, calledSet);
      break;
    case "custom":
      if (!pattern.positions) {
        return {
          isValid: false,
          cardId: "",
          pattern: pattern.name,
          winningPositions: [],
          message: "Custom pattern has no positions defined"
        };
      }
      result = checkCustomPattern(grid, calledSet, pattern.positions);
      break;
    default:
      return {
        isValid: false,
        cardId: "",
        pattern: pattern.name,
        winningPositions: [],
        message: `Unknown pattern type: ${pattern.type}`
      };
  }
  
  return {
    isValid: result.hasBingo,
    cardId: "",
    pattern: pattern.name,
    winningPositions: result.winningPositions,
    message: result.hasBingo 
      ? `BINGO! Valid ${pattern.name} pattern!`
      : `Not a valid ${pattern.name} - some required squares not called yet`
  };
}
```

#### Step 2.2: Add Verification tRPC Procedure
**File:** `server/routers.ts`

```typescript
import { verifyBingo } from "./bingoVerification";

// Add to router
verifyWinner: protectedProcedure
  .input(z.object({
    cardId: z.string().length(5),
    gameId: z.number()
  }))
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    
    // Get the card
    const [card] = await db
      .select()
      .from(generatedCards)
      .where(eq(generatedCards.cardId, input.cardId.toUpperCase()))
      .limit(1);
    
    if (!card) {
      return {
        success: false,
        isValid: false,
        message: `Card ID "${input.cardId}" not found`
      };
    }
    
    // Get the game state
    const [game] = await db
      .select()
      .from(hostGameState)
      .where(eq(hostGameState.id, input.gameId))
      .limit(1);
    
    if (!game) {
      return {
        success: false,
        isValid: false,
        message: "Game not found"
      };
    }
    
    // Get the current pattern for this round
    const [config] = await db
      .select()
      .from(hostGameConfigs)
      .where(eq(hostGameConfigs.id, game.configId))
      .limit(1);
    
    const patterns = config?.roundPatterns || [];
    const currentPattern = patterns[game.currentRound - 1] || {
      type: "line",
      name: "Any Line"
    };
    
    // Get called image IDs
    const calledImageIds = game.playedImages.map(
      (img: PlayedImage) => parseInt(img.imageId)
    );
    
    // Verify the bingo
    const result = verifyBingo(
      card.imageIds as number[],
      calledImageIds,
      currentPattern
    );
    
    return {
      success: true,
      isValid: result.isValid,
      cardId: input.cardId.toUpperCase(),
      pattern: result.pattern,
      winningPositions: result.winningPositions,
      message: result.message,
      calledCount: calledImageIds.length
    };
  }),
```

---

### Phase 3: Host UI for Winner Verification

#### Step 3.1: Add Verification Panel Component
**File:** `client/src/components/WinnerVerificationPanel.tsx` (NEW FILE)

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Trophy, Loader2 } from "lucide-react";

interface WinnerVerificationPanelProps {
  gameId: number;
}

export function WinnerVerificationPanel({ gameId }: WinnerVerificationPanelProps) {
  const [cardId, setCardId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const verifyMutation = trpc.verifyWinner.useMutation();
  
  const handleVerify = async () => {
    if (!cardId.trim()) return;
    
    await verifyMutation.mutateAsync({
      cardId: cardId.trim().toUpperCase(),
      gameId
    });
  };
  
  const result = verifyMutation.data;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trophy className="h-4 w-4 mr-2" />
          Verify Winner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Bingo Winner</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Card ID (e.g., A3K7P)"
              value={cardId}
              onChange={(e) => setCardId(e.target.value.toUpperCase())}
              maxLength={5}
              className="font-mono text-lg tracking-wider"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button 
              onClick={handleVerify}
              disabled={verifyMutation.isPending || cardId.length !== 5}
            >
              {verifyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Check"
              )}
            </Button>
          </div>
          
          {result && (
            <div className={`p-4 rounded-lg ${
              result.isValid 
                ? "bg-green-500/20 border border-green-500" 
                : "bg-red-500/20 border border-red-500"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <span className="font-bold text-lg">
                  {result.isValid ? "VALID BINGO!" : "NOT A WINNER"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.message}
              </p>
              {result.isValid && (
                <p className="text-sm mt-2">
                  Card ID: <span className="font-mono font-bold">{result.cardId}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Step 3.2: Integrate into PlayScreen
**File:** `client/src/pages/PlayScreen.tsx`

Add the verification panel to the host controls:

```tsx
// Import at top
import { WinnerVerificationPanel } from "@/components/WinnerVerificationPanel";

// In the JSX, add near other control buttons (around line 230-240):
{gameId && (
  <WinnerVerificationPanel gameId={gameId} />
)}
```

---

### Phase 4: Testing

#### Step 4.1: Create Unit Tests
**File:** `server/bingoVerification.test.ts` (NEW FILE)

```typescript
import { describe, it, expect } from "vitest";
import { verifyBingo } from "./bingoVerification";

describe("Bingo Verification", () => {
  // Card with known layout for testing
  // FREE space at index 12 (-1)
  const testCard = [
    1, 2, 3, 4, 5,      // Row 0
    6, 7, 8, 9, 10,     // Row 1
    11, 12, -1, 14, 15, // Row 2 (FREE in center)
    16, 17, 18, 19, 20, // Row 3
    21, 22, 23, 24, 25  // Row 4
  ];

  describe("Horizontal Line", () => {
    it("should detect valid horizontal bingo (row 0)", () => {
      const called = [1, 2, 3, 4, 5];
      const result = verifyBingo(testCard, called, { type: "line", name: "Line" });
      expect(result.isValid).toBe(true);
    });

    it("should detect valid horizontal bingo (row 2 with FREE)", () => {
      const called = [11, 12, 14, 15]; // FREE space auto-marked
      const result = verifyBingo(testCard, called, { type: "line", name: "Line" });
      expect(result.isValid).toBe(true);
    });

    it("should reject incomplete horizontal line", () => {
      const called = [1, 2, 3, 4]; // Missing 5
      const result = verifyBingo(testCard, called, { type: "line", name: "Line" });
      expect(result.isValid).toBe(false);
    });
  });

  describe("Vertical Line", () => {
    it("should detect valid vertical bingo (col 0)", () => {
      const called = [1, 6, 11, 16, 21];
      const result = verifyBingo(testCard, called, { type: "line", name: "Line" });
      expect(result.isValid).toBe(true);
    });

    it("should detect valid vertical bingo (col 2 with FREE)", () => {
      const called = [3, 8, 18, 23]; // FREE space auto-marked
      const result = verifyBingo(testCard, called, { type: "line", name: "Line" });
      expect(result.isValid).toBe(true);
    });
  });

  describe("Diagonal", () => {
    it("should detect valid diagonal (top-left to bottom-right)", () => {
      const called = [1, 7, 19, 25]; // FREE space in middle
      const result = verifyBingo(testCard, called, { type: "diagonal", name: "Diagonal" });
      expect(result.isValid).toBe(true);
    });

    it("should detect valid diagonal (top-right to bottom-left)", () => {
      const called = [5, 9, 17, 21]; // FREE space in middle
      const result = verifyBingo(testCard, called, { type: "diagonal", name: "Diagonal" });
      expect(result.isValid).toBe(true);
    });
  });

  describe("Four Corners", () => {
    it("should detect valid four corners", () => {
      const called = [1, 5, 21, 25];
      const result = verifyBingo(testCard, called, { type: "four_corners", name: "Four Corners" });
      expect(result.isValid).toBe(true);
    });

    it("should reject incomplete four corners", () => {
      const called = [1, 5, 21]; // Missing 25
      const result = verifyBingo(testCard, called, { type: "four_corners", name: "Four Corners" });
      expect(result.isValid).toBe(false);
    });
  });

  describe("Blackout", () => {
    it("should detect valid blackout", () => {
      const called = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25
      ]; // All except FREE space
      const result = verifyBingo(testCard, called, { type: "blackout", name: "Blackout" });
      expect(result.isValid).toBe(true);
    });

    it("should reject incomplete blackout", () => {
      const called = [1, 2, 3, 4, 5]; // Only one row
      const result = verifyBingo(testCard, called, { type: "blackout", name: "Blackout" });
      expect(result.isValid).toBe(false);
    });
  });
});
```

#### Step 4.2: Run Tests
```bash
cd /home/ubuntu/holiday-bingo
pnpm test
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `server/bingoVerification.ts` | Core verification logic |
| `server/bingoVerification.test.ts` | Unit tests |
| `client/src/components/WinnerVerificationPanel.tsx` | UI component |

### Modified Files
| File | Changes |
|------|---------|
| `server/routers.ts` | Add `verifyWinner` and `linkCardsToGame` procedures |
| `server/pdfGenerator.ts` | Add optional `gameId` parameter |
| `client/src/pages/PlayScreen.tsx` | Integrate verification panel |

---

## Branch & Commit Instructions

### Before Starting
```bash
git checkout card-gen-enhancements
git pull origin card-gen-enhancements
```

### Commit Strategy (Multiple Commits)
```bash
# After Phase 1
git add server/pdfGenerator.ts server/routers.ts
git commit -m "FEAT: Link generated cards to game sessions"

# After Phase 2
git add server/bingoVerification.ts server/routers.ts
git commit -m "FEAT: Add bingo verification logic with pattern support"

# After Phase 3
git add client/src/components/WinnerVerificationPanel.tsx client/src/pages/PlayScreen.tsx
git commit -m "FEAT: Add winner verification UI panel"

# After Phase 4
git add server/bingoVerification.test.ts
git commit -m "TEST: Add unit tests for bingo verification"

# Push all
git push origin card-gen-enhancements
```

---

## Estimated Effort
- Phase 1 (Link Cards): 1 hour
- Phase 2 (Verification Logic): 2 hours
- Phase 3 (UI): 1.5 hours
- Phase 4 (Testing): 1 hour
- **Total: 5-6 hours**

---

## Success Criteria
- [ ] Cards can be linked to game sessions
- [ ] Verification correctly identifies valid bingos
- [ ] All pattern types work (line, diagonal, corners, X, blackout)
- [ ] FREE space is always counted as marked
- [ ] UI allows host to enter Card ID and see result
- [ ] Invalid Card IDs show appropriate error
- [ ] Unit tests pass for all verification scenarios

---

## Dependencies
- Requires active game session with called images
- Requires cards generated with valid imageIds
- Pattern must be defined in game config
