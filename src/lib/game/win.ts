import { decodeTile, encodeTile, type Tile } from "./tiles";
import { isValidPong, isValidChow } from "./melds";

export interface WinningCombination {
  melds: string[][]; // 4 melds (each 3 tiles)
  pair: string[];    // 1 pair (2 tiles)
}

/**
 * Check if a hand is a winning hand (14 tiles that form 4 melds + 1 pair)
 */
export function isWinningHand(hand: string[]): boolean {
  if (hand.length !== 14) return false;

  // Check for seven pairs (special hand)
  if (isSevenPairs(hand)) return true;

  // Check for standard 4 melds + 1 pair
  const combinations = findWinningCombinations(hand);
  return combinations.length > 0;
}

/**
 * Check for seven pairs hand (special winning hand)
 */
function isSevenPairs(hand: string[]): boolean {
  if (hand.length !== 14) return false;

  // Sort and check pairs
  const sorted = [...hand].sort();
  for (let i = 0; i < 14; i += 2) {
    if (sorted[i] !== sorted[i + 1]) return false;
  }
  return true;
}

/**
 * Find all valid winning combinations for a hand
 * Returns array of possible combinations (melds + pair)
 */
export function findWinningCombinations(hand: string[]): WinningCombination[] {
  if (hand.length !== 14) return [];

  const results: WinningCombination[] = [];
  const sorted = [...hand].sort();

  // Try each possible pair
  const uniqueTiles = [...new Set(sorted)];
  for (const pairTile of uniqueTiles) {
    const pairCount = sorted.filter((t) => t === pairTile).length;
    if (pairCount < 2) continue;

    // Remove pair from hand and try to form 4 melds
    const remaining = [...sorted];
    const pairIndex1 = remaining.indexOf(pairTile);
    remaining.splice(pairIndex1, 1);
    const pairIndex2 = remaining.indexOf(pairTile);
    remaining.splice(pairIndex2, 1);

    const melds = tryFormMelds(remaining, 4);
    if (melds) {
      results.push({
        melds,
        pair: [pairTile, pairTile],
      });
    }
  }

  return results;
}

/**
 * Recursively try to form N melds from remaining tiles
 */
function tryFormMelds(tiles: string[], count: number): string[][] | null {
  if (count === 0) {
    return tiles.length === 0 ? [] : null;
  }

  if (tiles.length < 3) return null;

  const sorted = [...tiles].sort();
  const first = sorted[0];

  // Try Pong first (3 identical tiles)
  const sameCount = sorted.filter((t) => t === first).length;
  if (sameCount >= 3) {
    const remaining = [...sorted];
    for (let i = 0; i < 3; i++) {
      const idx = remaining.indexOf(first);
      remaining.splice(idx, 1);
    }
    const result = tryFormMelds(remaining, count - 1);
    if (result) {
      return [[first, first, first], ...result];
    }
  }

  // Try Chow (sequential tiles of same suit)
  const firstDecoded = safeDecodeTile(first);
  if (firstDecoded && isNumberedSuit(firstDecoded.suit)) {
    const value = firstDecoded.value;
    const suit = firstDecoded.suit;

    // Look for value+1 and value+2 of same suit
    const second = encodeTile({ suit, value: value + 1 });
    const third = encodeTile({ suit, value: value + 2 });

    if (sorted.includes(second) && sorted.includes(third)) {
      const remaining = [...sorted];
      remaining.splice(remaining.indexOf(first), 1);
      remaining.splice(remaining.indexOf(second), 1);
      remaining.splice(remaining.indexOf(third), 1);

      const result = tryFormMelds(remaining, count - 1);
      if (result) {
        return [[first, second, third], ...result];
      }
    }
  }

  return null;
}

function safeDecodeTile(code: string): Tile | null {
  try {
    return decodeTile(code);
  } catch {
    return null;
  }
}

function isNumberedSuit(suit: string): boolean {
  return suit === "bamboo" || suit === "character" || suit === "dot";
}
