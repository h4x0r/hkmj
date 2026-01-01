import { describe, it, expect } from "vitest";
import { dealTiles, type DealtHands } from "./dealing";
import { createTileSet, shuffleWall } from "./tiles";

describe("Dealing", () => {
  it("deals 13 tiles to each of 4 players", () => {
    const wall = shuffleWall(createTileSet());
    const result = dealTiles(wall);

    expect(result.hands).toHaveLength(4);
    expect(result.hands[0]).toHaveLength(13);
    expect(result.hands[1]).toHaveLength(13);
    expect(result.hands[2]).toHaveLength(13);
    expect(result.hands[3]).toHaveLength(13);
  });

  it("leaves 84 tiles in the wall after dealing", () => {
    const wall = shuffleWall(createTileSet());
    const result = dealTiles(wall);

    // 136 - (13 * 4) = 136 - 52 = 84
    expect(result.remainingWall).toHaveLength(84);
  });

  it("deals unique tiles to each player", () => {
    const wall = shuffleWall(createTileSet());
    const result = dealTiles(wall);

    // Collect all dealt tile IDs
    const allDealtIds = result.hands.flat().map((t) => t.id);
    const uniqueIds = new Set(allDealtIds);

    expect(uniqueIds.size).toBe(52); // 13 * 4 = 52 unique tiles
  });

  it("does not include dealt tiles in remaining wall", () => {
    const wall = shuffleWall(createTileSet());
    const result = dealTiles(wall);

    const dealtIds = new Set(result.hands.flat().map((t) => t.id));
    const wallIds = new Set(result.remainingWall.map((t) => t.id));

    // No overlap between dealt and remaining
    for (const id of dealtIds) {
      expect(wallIds.has(id)).toBe(false);
    }
  });

  it("deals in correct order (dealer gets 14 tiles in first round)", () => {
    const wall = shuffleWall(createTileSet());
    const result = dealTiles(wall, 0); // Player 0 is dealer

    // In HK Mahjong, dealer draws first tile after dealing
    // So dealer hand will have 14 tiles initially
    expect(result.hands[0]).toHaveLength(14);
    expect(result.hands[1]).toHaveLength(13);
    expect(result.hands[2]).toHaveLength(13);
    expect(result.hands[3]).toHaveLength(13);
  });

  it("remaining wall has 83 tiles when dealer gets 14", () => {
    const wall = shuffleWall(createTileSet());
    const result = dealTiles(wall, 0);

    // 136 - (14 + 13 + 13 + 13) = 136 - 53 = 83
    expect(result.remainingWall).toHaveLength(83);
  });
});
