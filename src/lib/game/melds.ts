import { decodeTile, type Tile } from "./tiles";

export type MeldType = "chow" | "pong" | "kong";

export interface Meld {
  type: MeldType;
  tiles: string[];
  fromPlayer?: number; // Who discarded (for exposed melds)
  concealed?: boolean; // For concealed kongs
}

/**
 * Check if 3 tiles form a valid Pong (3 identical tiles)
 */
export function isValidPong(tileCodes: string[]): boolean {
  if (tileCodes.length !== 3) return false;

  const first = tileCodes[0];
  return tileCodes.every((code) => code === first);
}

/**
 * Check if 4 tiles form a valid Kong (4 identical tiles)
 */
export function isValidKong(tileCodes: string[]): boolean {
  if (tileCodes.length !== 4) return false;

  const first = tileCodes[0];
  return tileCodes.every((code) => code === first);
}

/**
 * Check if 3 tiles form a valid Chow (3 sequential tiles, same suit)
 */
export function isValidChow(tileCodes: string[]): boolean {
  if (tileCodes.length !== 3) return false;

  // Decode tiles
  const tiles = tileCodes.map((code) => {
    try {
      return decodeTile(code);
    } catch {
      return null;
    }
  });

  // All must decode successfully
  if (tiles.some((t) => t === null)) return false;

  const decodedTiles = tiles as Tile[];

  // Honor tiles cannot form chows
  if (decodedTiles.some((t) => t.suit === "wind" || t.suit === "dragon")) {
    return false;
  }

  // All must be same suit
  const suit = decodedTiles[0].suit;
  if (!decodedTiles.every((t) => t.suit === suit)) return false;

  // Sort by value and check sequential
  const values = decodedTiles.map((t) => t.value).sort((a, b) => a - b);

  return values[1] === values[0] + 1 && values[2] === values[1] + 1;
}

/**
 * Check if player can claim a Pong with the discarded tile
 */
export function canClaimPong(hand: string[], discardedTile: string): boolean {
  const matchingCount = hand.filter((code) => code === discardedTile).length;
  return matchingCount >= 2;
}

/**
 * Check if player can claim a Kong with the discarded tile
 */
export function canClaimKong(hand: string[], discardedTile: string): boolean {
  const matchingCount = hand.filter((code) => code === discardedTile).length;
  return matchingCount >= 3;
}

/**
 * Check if player can claim a Chow with the discarded tile
 * Chow can only be claimed from the player to your left (previous player)
 */
export function canClaimChow(hand: string[], discardedTile: string): boolean {
  let discardedDecoded: Tile;
  try {
    discardedDecoded = decodeTile(discardedTile);
  } catch {
    return false;
  }

  // Honor tiles cannot form chows
  if (
    discardedDecoded.suit === "wind" ||
    discardedDecoded.suit === "dragon"
  ) {
    return false;
  }

  const suit = discardedDecoded.suit;
  const value = discardedDecoded.value;

  // Get all tiles of the same suit from hand
  const sameSuitValues = hand
    .map((code) => {
      try {
        return decodeTile(code);
      } catch {
        return null;
      }
    })
    .filter((t): t is Tile => t !== null && t.suit === suit)
    .map((t) => t.value);

  // Check all possible sequences that include the discarded tile
  // Sequence: [value-2, value-1, value]
  if (
    value >= 3 &&
    sameSuitValues.includes(value - 2) &&
    sameSuitValues.includes(value - 1)
  ) {
    return true;
  }

  // Sequence: [value-1, value, value+1]
  if (
    value >= 2 &&
    value <= 8 &&
    sameSuitValues.includes(value - 1) &&
    sameSuitValues.includes(value + 1)
  ) {
    return true;
  }

  // Sequence: [value, value+1, value+2]
  if (
    value <= 7 &&
    sameSuitValues.includes(value + 1) &&
    sameSuitValues.includes(value + 2)
  ) {
    return true;
  }

  return false;
}
