import { describe, expect, it } from "vitest";
import {
  generateBingoCard,
  canMarkTile,
  markTile,
  checkBingo,
  serializeCard,
  deserializeCard,
  getStandardPatterns,
} from "../core/gameEngine";

describe("Game Engine", () => {
  describe("generateBingoCard", () => {
    it("should generate a 5x5 card", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      expect(card.tiles).toHaveLength(5);
      expect(card.tiles[0]).toHaveLength(5);
    });

    it("should have FREE tile in center (2,2)", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      expect(card.tiles[2][2].imageId).toBe(-1);
      expect(card.tiles[2][2].marked).toBe(true);
    });

    it("should use unique images (except FREE)", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      const imageIds = card.tiles
        .flat()
        .filter((tile) => tile.imageId !== -1)
        .map((tile) => tile.imageId);

      const uniqueIds = new Set(imageIds);
      expect(uniqueIds.size).toBe(24); // 25 tiles - 1 FREE
    });

    it("should throw error if not enough images", () => {
      const availableImages = [1, 2, 3]; // Only 3 images

      expect(() => generateBingoCard(availableImages, "player1")).toThrow(
        "Need at least 24 unique images"
      );
    });
  });

  describe("canMarkTile", () => {
    it("should allow marking called images", () => {
      const calledImages = [1, 5, 10];
      expect(canMarkTile(5, calledImages)).toBe(true);
    });

    it("should not allow marking uncalled images", () => {
      const calledImages = [1, 5, 10];
      expect(canMarkTile(7, calledImages)).toBe(false);
    });

    it("should always allow marking FREE tile", () => {
      const calledImages = [1, 5, 10];
      expect(canMarkTile(-1, calledImages)).toBe(true);
    });
  });

  describe("markTile", () => {
    it("should mark a valid tile", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");
      const imageId = card.tiles[0][0].imageId;

      const result = markTile(card, 0, 0, [imageId]);

      expect(result.success).toBe(true);
      expect(card.tiles[0][0].marked).toBe(true);
    });

    it("should reject marking uncalled tile", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      const result = markTile(card, 0, 0, []); // No images called

      expect(result.success).toBe(false);
      expect(result.reason).toBe("Not called yet");
    });

    it("should reject marking already marked tile", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");
      const imageId = card.tiles[0][0].imageId;

      markTile(card, 0, 0, [imageId]);
      const result = markTile(card, 0, 0, [imageId]);

      expect(result.success).toBe(false);
      expect(result.reason).toBe("Already marked");
    });

    it("should reject invalid positions", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      const result = markTile(card, 10, 10, []);

      expect(result.success).toBe(false);
      expect(result.reason).toBe("Invalid position");
    });
  });

  describe("checkBingo - lines", () => {
    it("should detect horizontal line", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      // Mark entire first row
      for (let col = 0; col < 5; col++) {
        card.tiles[0][col].marked = true;
      }

      const result = checkBingo(card, { type: "line", name: "Any Line" });
      expect(result).toBe(true);
    });

    it("should detect vertical line", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      // Mark entire first column
      for (let row = 0; row < 5; row++) {
        card.tiles[row][0].marked = true;
      }

      const result = checkBingo(card, { type: "line", name: "Any Line" });
      expect(result).toBe(true);
    });
  });

  describe("checkBingo - diagonals", () => {
    it("should detect top-left to bottom-right diagonal", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      // Mark diagonal
      for (let i = 0; i < 5; i++) {
        card.tiles[i][i].marked = true;
      }

      const result = checkBingo(card, { type: "diagonal", name: "Diagonal" });
      expect(result).toBe(true);
    });

    it("should detect top-right to bottom-left diagonal", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      // Mark diagonal
      for (let i = 0; i < 5; i++) {
        card.tiles[i][4 - i].marked = true;
      }

      const result = checkBingo(card, { type: "diagonal", name: "Diagonal" });
      expect(result).toBe(true);
    });
  });

  describe("checkBingo - blackout", () => {
    it("should detect blackout", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      // Mark all tiles
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          card.tiles[row][col].marked = true;
        }
      }

      const result = checkBingo(card, { type: "blackout", name: "Blackout" });
      expect(result).toBe(true);
    });

    it("should not detect incomplete blackout", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      // Mark all but one
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (row !== 0 || col !== 0) {
            card.tiles[row][col].marked = true;
          }
        }
      }

      const result = checkBingo(card, { type: "blackout", name: "Blackout" });
      expect(result).toBe(false);
    });
  });

  describe("checkBingo - custom patterns", () => {
    it("should detect four corners pattern", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const card = generateBingoCard(availableImages, "player1");

      // Mark corners
      card.tiles[0][0].marked = true;
      card.tiles[0][4].marked = true;
      card.tiles[4][0].marked = true;
      card.tiles[4][4].marked = true;

      const result = checkBingo(card, {
        type: "custom",
        name: "Four Corners",
        positions: [
          [0, 0],
          [0, 4],
          [4, 0],
          [4, 4],
        ],
      });
      expect(result).toBe(true);
    });
  });

  describe("serializeCard and deserializeCard", () => {
    it("should serialize and deserialize card correctly", () => {
      const availableImages = Array.from({ length: 50 }, (_, i) => i);
      const originalCard = generateBingoCard(availableImages, "player1");

      // Mark some tiles
      originalCard.tiles[0][0].marked = true;
      originalCard.tiles[1][1].marked = true;

      const serialized = serializeCard(originalCard);
      const deserialized = deserializeCard(serialized, "player1");

      expect(deserialized.playerId).toBe(originalCard.playerId);
      expect(deserialized.tiles).toHaveLength(5);
      expect(deserialized.tiles[0][0].marked).toBe(true);
      expect(deserialized.tiles[1][1].marked).toBe(true);
      expect(deserialized.tiles[2][2].imageId).toBe(-1);
    });
  });

  describe("getStandardPatterns", () => {
    it("should return standard patterns", () => {
      const patterns = getStandardPatterns();

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some((p) => p.type === "line")).toBe(true);
      expect(patterns.some((p) => p.type === "diagonal")).toBe(true);
      expect(patterns.some((p) => p.type === "blackout")).toBe(true);
      expect(patterns.some((p) => p.name === "Four Corners")).toBe(true);
    });
  });
});
