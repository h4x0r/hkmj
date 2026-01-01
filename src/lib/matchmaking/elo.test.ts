import { describe, it, expect } from "vitest";
import {
  calculateExpectedScore,
  calculateNewRating,
  calculateMatchRatings,
  STARTING_ELO,
  K_FACTOR,
  K_FACTOR_PLACEMENT,
} from "./elo";

describe("ELO System", () => {
  describe("calculateExpectedScore", () => {
    it("returns 0.5 for equal ratings", () => {
      const expected = calculateExpectedScore(1200, 1200);
      expect(expected).toBeCloseTo(0.5, 2);
    });

    it("returns higher expected score for higher rated player", () => {
      const expected = calculateExpectedScore(1400, 1200);
      expect(expected).toBeGreaterThan(0.5);
    });

    it("returns lower expected score for lower rated player", () => {
      const expected = calculateExpectedScore(1000, 1200);
      expect(expected).toBeLessThan(0.5);
    });

    it("expected scores sum to 1 for two players", () => {
      const e1 = calculateExpectedScore(1400, 1200);
      const e2 = calculateExpectedScore(1200, 1400);
      expect(e1 + e2).toBeCloseTo(1.0, 5);
    });
  });

  describe("calculateNewRating", () => {
    it("increases rating on win", () => {
      const newRating = calculateNewRating(1200, 1200, 1);
      expect(newRating).toBeGreaterThan(1200);
    });

    it("decreases rating on loss", () => {
      const newRating = calculateNewRating(1200, 1200, 0);
      expect(newRating).toBeLessThan(1200);
    });

    it("uses higher K-factor for placement matches", () => {
      const normalWin = calculateNewRating(1200, 1200, 1, false);
      const placementWin = calculateNewRating(1200, 1200, 1, true);

      // Placement should gain more
      expect(placementWin - 1200).toBeGreaterThan(normalWin - 1200);
    });

    it("gains less against weaker opponent", () => {
      const againstWeaker = calculateNewRating(1400, 1000, 1);
      const againstEqual = calculateNewRating(1400, 1400, 1);

      expect(againstEqual - 1400).toBeGreaterThan(againstWeaker - 1400);
    });
  });

  describe("calculateMatchRatings", () => {
    it("calculates ratings for 4 players with 1 winner", () => {
      const players = [
        { id: "p1", rating: 1200, isPlacement: false },
        { id: "p2", rating: 1200, isPlacement: false },
        { id: "p3", rating: 1200, isPlacement: false },
        { id: "p4", rating: 1200, isPlacement: false },
      ];

      const results = calculateMatchRatings(players, "p1");

      expect(results.find((r) => r.id === "p1")?.newRating).toBeGreaterThan(1200);
      expect(results.find((r) => r.id === "p2")?.newRating).toBeLessThan(1200);
      expect(results.find((r) => r.id === "p3")?.newRating).toBeLessThan(1200);
      expect(results.find((r) => r.id === "p4")?.newRating).toBeLessThan(1200);
    });

    it("winner gains more against higher-rated opponents", () => {
      const lowRatedPlayers = [
        { id: "p1", rating: 1000, isPlacement: false },
        { id: "p2", rating: 1000, isPlacement: false },
        { id: "p3", rating: 1000, isPlacement: false },
        { id: "p4", rating: 1000, isPlacement: false },
      ];

      const highRatedPlayers = [
        { id: "p1", rating: 1000, isPlacement: false },
        { id: "p2", rating: 1400, isPlacement: false },
        { id: "p3", rating: 1400, isPlacement: false },
        { id: "p4", rating: 1400, isPlacement: false },
      ];

      const lowResult = calculateMatchRatings(lowRatedPlayers, "p1");
      const highResult = calculateMatchRatings(highRatedPlayers, "p1");

      const lowGain = lowResult.find((r) => r.id === "p1")!.change;
      const highGain = highResult.find((r) => r.id === "p1")!.change;

      expect(highGain).toBeGreaterThan(lowGain);
    });

    it("returns change deltas", () => {
      const players = [
        { id: "p1", rating: 1200, isPlacement: false },
        { id: "p2", rating: 1200, isPlacement: false },
        { id: "p3", rating: 1200, isPlacement: false },
        { id: "p4", rating: 1200, isPlacement: false },
      ];

      const results = calculateMatchRatings(players, "p1");

      for (const result of results) {
        expect(result.change).toBe(result.newRating - result.oldRating);
      }
    });
  });

  describe("Constants", () => {
    it("has standard starting ELO", () => {
      expect(STARTING_ELO).toBe(1200);
    });

    it("has standard K-factor", () => {
      expect(K_FACTOR).toBe(32);
    });

    it("has higher placement K-factor", () => {
      expect(K_FACTOR_PLACEMENT).toBeGreaterThan(K_FACTOR);
    });
  });
});
