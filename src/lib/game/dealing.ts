import type { TileWithId } from "./tiles";

export interface DealtHands {
  hands: TileWithId[][]; // 4 player hands
  remainingWall: TileWithId[];
}

/**
 * Deal tiles to 4 players from the wall
 * Each player gets 13 tiles, dealer (if specified) gets 14
 *
 * @param wall - Shuffled tile wall
 * @param dealerSeat - Optional dealer seat (0-3), dealer gets 14 tiles
 * @returns Dealt hands and remaining wall
 */
export function dealTiles(wall: TileWithId[], dealerSeat?: number): DealtHands {
  const wallCopy = [...wall];
  const hands: TileWithId[][] = [[], [], [], []];

  // Deal 13 tiles to each player (4 tiles at a time, 3 rounds, then 1 each)
  // Traditional dealing: 4 tiles × 3 rounds = 12, then 1 more = 13
  for (let round = 0; round < 3; round++) {
    for (let player = 0; player < 4; player++) {
      for (let i = 0; i < 4; i++) {
        const tile = wallCopy.shift();
        if (tile) hands[player].push(tile);
      }
    }
  }

  // Deal 1 more tile to each player
  for (let player = 0; player < 4; player++) {
    const tile = wallCopy.shift();
    if (tile) hands[player].push(tile);
  }

  // If dealer specified, they draw one more tile (their first draw)
  if (dealerSeat !== undefined && dealerSeat >= 0 && dealerSeat <= 3) {
    const tile = wallCopy.shift();
    if (tile) hands[dealerSeat].push(tile);
  }

  return {
    hands,
    remainingWall: wallCopy,
  };
}
