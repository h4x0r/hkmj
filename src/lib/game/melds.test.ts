import { describe, it, expect } from "vitest";
import {
  isValidPong,
  isValidKong,
  isValidChow,
  canClaimPong,
  canClaimKong,
  canClaimChow,
  type MeldType,
} from "./melds";
import { decodeTile } from "./tiles";

describe("Pong Validation", () => {
  it("validates a valid pong (3 identical tiles)", () => {
    const tiles = ["1B", "1B", "1B"];
    expect(isValidPong(tiles)).toBe(true);
  });

  it("rejects pong with different values", () => {
    const tiles = ["1B", "2B", "3B"];
    expect(isValidPong(tiles)).toBe(false);
  });

  it("rejects pong with different suits", () => {
    const tiles = ["1B", "1C", "1D"];
    expect(isValidPong(tiles)).toBe(false);
  });

  it("rejects pong with wrong count", () => {
    expect(isValidPong(["1B", "1B"])).toBe(false);
    expect(isValidPong(["1B", "1B", "1B", "1B"])).toBe(false);
  });

  it("validates pong with honor tiles", () => {
    expect(isValidPong(["EW", "EW", "EW"])).toBe(true);
    expect(isValidPong(["RD", "RD", "RD"])).toBe(true);
  });
});

describe("Kong Validation", () => {
  it("validates a valid kong (4 identical tiles)", () => {
    const tiles = ["5C", "5C", "5C", "5C"];
    expect(isValidKong(tiles)).toBe(true);
  });

  it("rejects kong with different tiles", () => {
    const tiles = ["5C", "5C", "5C", "6C"];
    expect(isValidKong(tiles)).toBe(false);
  });

  it("rejects kong with wrong count", () => {
    expect(isValidKong(["5C", "5C", "5C"])).toBe(false);
    expect(isValidKong(["5C", "5C", "5C", "5C", "5C"])).toBe(false);
  });

  it("validates kong with honor tiles", () => {
    expect(isValidKong(["NW", "NW", "NW", "NW"])).toBe(true);
    expect(isValidKong(["GD", "GD", "GD", "GD"])).toBe(true);
  });
});

describe("Chow Validation", () => {
  it("validates a valid chow (3 sequential tiles same suit)", () => {
    expect(isValidChow(["1B", "2B", "3B"])).toBe(true);
    expect(isValidChow(["7C", "8C", "9C"])).toBe(true);
    expect(isValidChow(["4D", "5D", "6D"])).toBe(true);
  });

  it("validates chow regardless of order", () => {
    expect(isValidChow(["3B", "1B", "2B"])).toBe(true);
    expect(isValidChow(["2B", "3B", "1B"])).toBe(true);
  });

  it("rejects chow with different suits", () => {
    expect(isValidChow(["1B", "2C", "3D"])).toBe(false);
  });

  it("rejects chow with non-sequential tiles", () => {
    expect(isValidChow(["1B", "2B", "4B"])).toBe(false);
    expect(isValidChow(["1B", "3B", "5B"])).toBe(false);
  });

  it("rejects chow with honor tiles", () => {
    expect(isValidChow(["EW", "SW", "WW"])).toBe(false);
    expect(isValidChow(["RD", "GD", "WD"])).toBe(false);
  });

  it("rejects wrap-around sequences", () => {
    expect(isValidChow(["8B", "9B", "1B"])).toBe(false);
  });
});

describe("Claim Checks", () => {
  describe("canClaimPong", () => {
    it("returns true when player has 2 matching tiles", () => {
      const hand = ["1B", "1B", "3C", "4D"];
      const discarded = "1B";
      expect(canClaimPong(hand, discarded)).toBe(true);
    });

    it("returns false when player has only 1 matching tile", () => {
      const hand = ["1B", "2B", "3C", "4D"];
      const discarded = "1B";
      expect(canClaimPong(hand, discarded)).toBe(false);
    });

    it("returns false when player has no matching tiles", () => {
      const hand = ["2B", "3B", "4C", "5D"];
      const discarded = "1B";
      expect(canClaimPong(hand, discarded)).toBe(false);
    });
  });

  describe("canClaimKong", () => {
    it("returns true when player has 3 matching tiles", () => {
      const hand = ["5C", "5C", "5C", "9D"];
      const discarded = "5C";
      expect(canClaimKong(hand, discarded)).toBe(true);
    });

    it("returns false when player has only 2 matching tiles", () => {
      const hand = ["5C", "5C", "9D", "1B"];
      const discarded = "5C";
      expect(canClaimKong(hand, discarded)).toBe(false);
    });
  });

  describe("canClaimChow", () => {
    it("returns true when player can form sequence", () => {
      const hand = ["1B", "2B", "5C", "9D"];
      const discarded = "3B";
      expect(canClaimChow(hand, discarded)).toBe(true);
    });

    it("returns true for middle tile claim", () => {
      const hand = ["1B", "3B", "5C", "9D"];
      const discarded = "2B";
      expect(canClaimChow(hand, discarded)).toBe(true);
    });

    it("returns true for end tile claim", () => {
      const hand = ["2B", "3B", "5C", "9D"];
      const discarded = "1B";
      expect(canClaimChow(hand, discarded)).toBe(true);
    });

    it("returns false when cannot form sequence", () => {
      const hand = ["1B", "3B", "5C", "9D"];
      const discarded = "5B";
      expect(canClaimChow(hand, discarded)).toBe(false);
    });

    it("returns false for honor tiles", () => {
      const hand = ["EW", "SW", "5C", "9D"];
      const discarded = "WW";
      expect(canClaimChow(hand, discarded)).toBe(false);
    });
  });
});
