import { describe, it, expect } from "vitest";
import {
  type Tile,
  type Suit,
  encodeTile,
  decodeTile,
  createTileSet,
  shuffleWall,
  SUITS,
  HONORS,
} from "./tiles";

describe("Tile Encoding", () => {
  it("encodes bamboo tiles correctly", () => {
    expect(encodeTile({ suit: "bamboo", value: 1 })).toBe("1B");
    expect(encodeTile({ suit: "bamboo", value: 9 })).toBe("9B");
  });

  it("encodes character tiles correctly", () => {
    expect(encodeTile({ suit: "character", value: 1 })).toBe("1C");
    expect(encodeTile({ suit: "character", value: 5 })).toBe("5C");
  });

  it("encodes dot tiles correctly", () => {
    expect(encodeTile({ suit: "dot", value: 1 })).toBe("1D");
    expect(encodeTile({ suit: "dot", value: 9 })).toBe("9D");
  });

  it("encodes wind tiles correctly", () => {
    expect(encodeTile({ suit: "wind", value: 1 })).toBe("EW"); // East
    expect(encodeTile({ suit: "wind", value: 2 })).toBe("SW"); // South
    expect(encodeTile({ suit: "wind", value: 3 })).toBe("WW"); // West
    expect(encodeTile({ suit: "wind", value: 4 })).toBe("NW"); // North
  });

  it("encodes dragon tiles correctly", () => {
    expect(encodeTile({ suit: "dragon", value: 1 })).toBe("RD"); // Red
    expect(encodeTile({ suit: "dragon", value: 2 })).toBe("GD"); // Green
    expect(encodeTile({ suit: "dragon", value: 3 })).toBe("WD"); // White
  });
});

describe("Tile Decoding", () => {
  it("decodes bamboo tiles correctly", () => {
    expect(decodeTile("1B")).toEqual({ suit: "bamboo", value: 1 });
    expect(decodeTile("9B")).toEqual({ suit: "bamboo", value: 9 });
  });

  it("decodes character tiles correctly", () => {
    expect(decodeTile("1C")).toEqual({ suit: "character", value: 1 });
    expect(decodeTile("5C")).toEqual({ suit: "character", value: 5 });
  });

  it("decodes dot tiles correctly", () => {
    expect(decodeTile("1D")).toEqual({ suit: "dot", value: 1 });
    expect(decodeTile("9D")).toEqual({ suit: "dot", value: 9 });
  });

  it("decodes wind tiles correctly", () => {
    expect(decodeTile("EW")).toEqual({ suit: "wind", value: 1 });
    expect(decodeTile("SW")).toEqual({ suit: "wind", value: 2 });
    expect(decodeTile("WW")).toEqual({ suit: "wind", value: 3 });
    expect(decodeTile("NW")).toEqual({ suit: "wind", value: 4 });
  });

  it("decodes dragon tiles correctly", () => {
    expect(decodeTile("RD")).toEqual({ suit: "dragon", value: 1 });
    expect(decodeTile("GD")).toEqual({ suit: "dragon", value: 2 });
    expect(decodeTile("WD")).toEqual({ suit: "dragon", value: 3 });
  });

  it("throws on invalid tile code", () => {
    expect(() => decodeTile("XX")).toThrow("Invalid tile code");
    expect(() => decodeTile("")).toThrow("Invalid tile code");
  });
});

describe("Tile Set Generation", () => {
  it("creates exactly 136 tiles", () => {
    const tiles = createTileSet();
    expect(tiles).toHaveLength(136);
  });

  it("creates 4 copies of each numbered tile", () => {
    const tiles = createTileSet();
    const bamboo1Count = tiles.filter((t) => t.code === "1B").length;
    expect(bamboo1Count).toBe(4);

    const character5Count = tiles.filter((t) => t.code === "5C").length;
    expect(character5Count).toBe(4);
  });

  it("creates 4 copies of each honor tile", () => {
    const tiles = createTileSet();
    const eastWindCount = tiles.filter((t) => t.code === "EW").length;
    expect(eastWindCount).toBe(4);

    const redDragonCount = tiles.filter((t) => t.code === "RD").length;
    expect(redDragonCount).toBe(4);
  });

  it("assigns unique IDs to each tile", () => {
    const tiles = createTileSet();
    const ids = tiles.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(136);
  });
});

describe("Wall Shuffling", () => {
  it("returns same number of tiles", () => {
    const tiles = createTileSet();
    const shuffled = shuffleWall(tiles);
    expect(shuffled).toHaveLength(136);
  });

  it("contains all original tiles", () => {
    const tiles = createTileSet();
    const shuffled = shuffleWall(tiles);

    const originalIds = new Set(tiles.map((t) => t.id));
    const shuffledIds = new Set(shuffled.map((t) => t.id));

    expect(shuffledIds).toEqual(originalIds);
  });

  it("produces different order than original (statistically)", () => {
    const tiles = createTileSet();
    const shuffled = shuffleWall(tiles);

    // Count how many tiles are in same position
    let samePosition = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].id === shuffled[i].id) samePosition++;
    }

    // Statistically, should be very few in same position
    // Allow up to 20% same position for randomness tolerance
    expect(samePosition).toBeLessThan(tiles.length * 0.2);
  });
});
