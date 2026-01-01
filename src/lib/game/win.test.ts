import { describe, it, expect } from "vitest";
import { isWinningHand, findWinningCombinations } from "./win";

describe("Win Detection", () => {
  describe("Basic Winning Hands", () => {
    it("detects standard winning hand (4 melds + 1 pair)", () => {
      // All Pongs hand
      const hand = [
        "1B", "1B", "1B", // Pong
        "2C", "2C", "2C", // Pong
        "3D", "3D", "3D", // Pong
        "EW", "EW", "EW", // Pong
        "RD", "RD",       // Pair
      ];
      expect(isWinningHand(hand)).toBe(true);
    });

    it("detects winning hand with chows", () => {
      // All Chows hand
      const hand = [
        "1B", "2B", "3B", // Chow
        "4C", "5C", "6C", // Chow
        "7D", "8D", "9D", // Chow
        "1C", "2C", "3C", // Chow
        "5B", "5B",       // Pair
      ];
      expect(isWinningHand(hand)).toBe(true);
    });

    it("detects winning hand with mixed melds", () => {
      const hand = [
        "1B", "2B", "3B", // Chow
        "5C", "5C", "5C", // Pong
        "7D", "8D", "9D", // Chow
        "EW", "EW", "EW", // Pong
        "GD", "GD",       // Pair
      ];
      expect(isWinningHand(hand)).toBe(true);
    });

    it("rejects incomplete hand (13 tiles)", () => {
      const hand = [
        "1B", "1B", "1B",
        "2C", "2C", "2C",
        "3D", "3D", "3D",
        "EW", "EW", "EW",
        "RD", // Only 1, not a pair
      ];
      expect(isWinningHand(hand)).toBe(false);
    });

    it("rejects hand that cannot form 4 melds + pair", () => {
      const hand = [
        "1B", "1B", "1B",
        "2C", "2C", "2C",
        "3D", "3D", "3D",
        "4D", "5D", "7D", // Cannot form meld (gap)
        "RD", "RD",
      ];
      expect(isWinningHand(hand)).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("handles seven pairs (special hand)", () => {
      const hand = [
        "1B", "1B",
        "2B", "2B",
        "3B", "3B",
        "4C", "4C",
        "5C", "5C",
        "6D", "6D",
        "RD", "RD",
      ];
      expect(isWinningHand(hand)).toBe(true);
    });

    it("handles all same tile pair options", () => {
      // Hand where multiple pairs could work
      const hand = [
        "1B", "2B", "3B", // Chow
        "4B", "5B", "6B", // Chow
        "7B", "8B", "9B", // Chow
        "1C", "2C", "3C", // Chow
        "5C", "5C",       // Pair
      ];
      expect(isWinningHand(hand)).toBe(true);
    });
  });

  describe("findWinningCombinations", () => {
    it("returns valid combination for winning hand", () => {
      const hand = [
        "1B", "1B", "1B",
        "2C", "2C", "2C",
        "3D", "3D", "3D",
        "EW", "EW", "EW",
        "RD", "RD",
      ];
      const combinations = findWinningCombinations(hand);
      expect(combinations.length).toBeGreaterThan(0);
      expect(combinations[0].melds).toHaveLength(4);
      expect(combinations[0].pair).toEqual(["RD", "RD"]);
    });

    it("returns empty array for non-winning hand", () => {
      const hand = [
        "1B", "2B", "4B", // Cannot form chow
        "2C", "2C", "2C",
        "3D", "3D", "3D",
        "EW", "EW", "EW",
        "RD", "RD",
      ];
      const combinations = findWinningCombinations(hand);
      expect(combinations).toHaveLength(0);
    });
  });
});
