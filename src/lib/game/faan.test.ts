import { describe, it, expect } from "vitest";
import { calculateFaan, type FaanResult, type WinContext } from "./faan";

describe("Faan Calculation", () => {
  const defaultContext: WinContext = {
    winType: "discard",
    seatWind: 1, // East
    roundWind: 1, // East
    isConcealed: false,
    isLastTile: false,
    isKongRob: false,
  };

  describe("All Chows (平糊)", () => {
    it("awards 1 faan for all chows hand", () => {
      const hand = [
        "1B", "2B", "3B", // Chow
        "4C", "5C", "6C", // Chow
        "7D", "8D", "9D", // Chow
        "1C", "2C", "3C", // Chow
        "5B", "5B",       // Pair
      ];
      const result = calculateFaan(hand, [], defaultContext);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.breakdown.some((f) => f.name === "All Chows")).toBe(true);
    });
  });

  describe("All Pongs (對對糊)", () => {
    it("awards 3 faan for all pongs hand", () => {
      const hand = [
        "1B", "1B", "1B", // Pong
        "2C", "2C", "2C", // Pong
        "3D", "3D", "3D", // Pong
        "EW", "EW", "EW", // Pong
        "RD", "RD",       // Pair
      ];
      const result = calculateFaan(hand, [], defaultContext);
      expect(result.breakdown.some((f) => f.name === "All Pongs")).toBe(true);
      const allPongs = result.breakdown.find((f) => f.name === "All Pongs");
      expect(allPongs?.faan).toBe(3);
    });
  });

  describe("Mixed One Suit (混一色)", () => {
    it("awards 3 faan for mixed one suit", () => {
      const hand = [
        "1B", "2B", "3B", // Chow (bamboo)
        "4B", "5B", "6B", // Chow (bamboo)
        "7B", "8B", "9B", // Chow (bamboo)
        "EW", "EW", "EW", // Pong (wind)
        "RD", "RD",       // Pair (dragon)
      ];
      const result = calculateFaan(hand, [], defaultContext);
      expect(result.breakdown.some((f) => f.name === "Mixed One Suit")).toBe(true);
      const mixed = result.breakdown.find((f) => f.name === "Mixed One Suit");
      expect(mixed?.faan).toBe(3);
    });
  });

  describe("All One Suit (清一色)", () => {
    it("awards 7 faan for all one suit", () => {
      const hand = [
        "1B", "2B", "3B", // Chow
        "4B", "5B", "6B", // Chow
        "7B", "8B", "9B", // Chow
        "1B", "1B", "1B", // Pong
        "5B", "5B",       // Pair
      ];
      const result = calculateFaan(hand, [], defaultContext);
      expect(result.breakdown.some((f) => f.name === "All One Suit")).toBe(true);
      const allOne = result.breakdown.find((f) => f.name === "All One Suit");
      expect(allOne?.faan).toBe(7);
    });
  });

  describe("Self Draw (自摸)", () => {
    it("awards 1 faan for self-draw win", () => {
      const hand = [
        "1B", "2B", "3B",
        "4C", "5C", "6C",
        "7D", "8D", "9D",
        "1C", "2C", "3C",
        "5B", "5B",
      ];
      const context: WinContext = { ...defaultContext, winType: "self_draw" };
      const result = calculateFaan(hand, [], context);
      expect(result.breakdown.some((f) => f.name === "Self Draw")).toBe(true);
    });
  });

  describe("Concealed Hand", () => {
    it("awards 1 faan for fully concealed hand", () => {
      const hand = [
        "1B", "2B", "3B",
        "4C", "5C", "6C",
        "7D", "8D", "9D",
        "1C", "2C", "3C",
        "5B", "5B",
      ];
      const context: WinContext = { ...defaultContext, isConcealed: true };
      const result = calculateFaan(hand, [], context);
      expect(result.breakdown.some((f) => f.name === "Concealed Hand")).toBe(true);
    });
  });

  describe("Dragon Pong", () => {
    it("awards 1 faan per dragon pong", () => {
      const hand = [
        "1B", "2B", "3B",
        "4C", "5C", "6C",
        "7D", "8D", "9D",
        "RD", "RD", "RD", // Red Dragon Pong
        "5B", "5B",
      ];
      const result = calculateFaan(hand, [], defaultContext);
      expect(result.breakdown.some((f) => f.name === "Dragon Pong")).toBe(true);
    });
  });

  describe("Seat/Round Wind", () => {
    it("awards 1 faan for seat wind pong", () => {
      const hand = [
        "1B", "2B", "3B",
        "4C", "5C", "6C",
        "7D", "8D", "9D",
        "EW", "EW", "EW", // East Wind Pong
        "5B", "5B",
      ];
      const context: WinContext = { ...defaultContext, seatWind: 1 }; // East
      const result = calculateFaan(hand, [], context);
      expect(result.breakdown.some((f) => f.name === "Seat Wind")).toBe(true);
    });
  });

  describe("Minimum Faan Check", () => {
    it("returns whether hand meets minimum faan", () => {
      const hand = [
        "1B", "2B", "3B",
        "4C", "5C", "6C",
        "7D", "8D", "9D",
        "1C", "2C", "3C",
        "5B", "5B",
      ];
      // All chows = 1 faan
      const result = calculateFaan(hand, [], defaultContext);
      expect(result.meetsMinimum(3)).toBe(false); // Doesn't meet 3 faan min
      expect(result.meetsMinimum(1)).toBe(true);  // Meets 1 faan min
      expect(result.meetsMinimum(0)).toBe(true);  // Meets 0 faan min
    });
  });
});
