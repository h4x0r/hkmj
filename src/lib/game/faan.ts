import { decodeTile, type Tile } from "./tiles";
import { findWinningCombinations, type WinningCombination } from "./win";
import { isValidPong, isValidChow } from "./melds";

export interface WinContext {
  winType: "self_draw" | "discard";
  seatWind: number; // 1=East, 2=South, 3=West, 4=North
  roundWind: number;
  isConcealed: boolean;
  isLastTile: boolean;
  isKongRob: boolean;
}

export interface FaanItem {
  name: string;
  faan: number;
}

export interface FaanResult {
  total: number;
  breakdown: FaanItem[];
  meetsMinimum: (min: number) => boolean;
}

/**
 * Calculate faan (scoring value) for a winning hand
 */
export function calculateFaan(
  hand: string[],
  exposedMelds: string[][],
  context: WinContext
): FaanResult {
  const breakdown: FaanItem[] = [];

  // Find winning combinations
  const combinations = findWinningCombinations(hand);
  if (combinations.length === 0) {
    return {
      total: 0,
      breakdown: [],
      meetsMinimum: (min: number) => false,
    };
  }

  // Use first valid combination
  const combo = combinations[0];
  const allMelds = [...combo.melds, ...exposedMelds];

  // Decode all tiles for analysis
  const allTiles = hand.map((code) => safeDecodeTile(code)).filter(Boolean) as Tile[];

  // Check various faan conditions
  checkAllChows(allMelds, breakdown);
  checkAllPongs(allMelds, breakdown);
  checkOneSuit(allTiles, breakdown);
  checkDragonPongs(allMelds, breakdown);
  checkWindPongs(allMelds, context, breakdown);
  checkSelfDraw(context, breakdown);
  checkConcealed(context, breakdown);

  const total = breakdown.reduce((sum, item) => sum + item.faan, 0);

  return {
    total,
    breakdown,
    meetsMinimum: (min: number) => total >= min,
  };
}

function checkAllChows(melds: string[][], breakdown: FaanItem[]): void {
  const allChows = melds.every((meld) => isValidChow(meld));
  if (allChows && melds.length === 4) {
    breakdown.push({ name: "All Chows", faan: 1 });
  }
}

function checkAllPongs(melds: string[][], breakdown: FaanItem[]): void {
  const allPongs = melds.every((meld) => isValidPong(meld) || meld.length === 4);
  if (allPongs && melds.length === 4) {
    breakdown.push({ name: "All Pongs", faan: 3 });
  }
}

function checkOneSuit(tiles: Tile[], breakdown: FaanItem[]): void {
  const suits = new Set(tiles.map((t) => t.suit));
  const hasHonors = tiles.some(
    (t) => t.suit === "wind" || t.suit === "dragon"
  );
  const numberedSuits = tiles.filter(
    (t) => t.suit !== "wind" && t.suit !== "dragon"
  );
  const uniqueNumberedSuits = new Set(numberedSuits.map((t) => t.suit));

  // All One Suit (清一色) - all tiles same numbered suit, no honors
  if (!hasHonors && uniqueNumberedSuits.size === 1) {
    breakdown.push({ name: "All One Suit", faan: 7 });
    return;
  }

  // Mixed One Suit (混一色) - one numbered suit + honors
  if (hasHonors && uniqueNumberedSuits.size === 1) {
    breakdown.push({ name: "Mixed One Suit", faan: 3 });
  }
}

function checkDragonPongs(melds: string[][], breakdown: FaanItem[]): void {
  for (const meld of melds) {
    if (meld.length >= 3) {
      const first = safeDecodeTile(meld[0]);
      if (first?.suit === "dragon" && meld.every((t) => t === meld[0])) {
        breakdown.push({ name: "Dragon Pong", faan: 1 });
      }
    }
  }
}

function checkWindPongs(
  melds: string[][],
  context: WinContext,
  breakdown: FaanItem[]
): void {
  const windCodes = ["EW", "SW", "WW", "NW"];

  for (const meld of melds) {
    if (meld.length >= 3 && meld.every((t) => t === meld[0])) {
      const windIndex = windCodes.indexOf(meld[0]);
      if (windIndex !== -1) {
        const windValue = windIndex + 1;

        // Seat wind
        if (windValue === context.seatWind) {
          breakdown.push({ name: "Seat Wind", faan: 1 });
        }

        // Round wind
        if (windValue === context.roundWind) {
          breakdown.push({ name: "Round Wind", faan: 1 });
        }
      }
    }
  }
}

function checkSelfDraw(context: WinContext, breakdown: FaanItem[]): void {
  if (context.winType === "self_draw") {
    breakdown.push({ name: "Self Draw", faan: 1 });
  }
}

function checkConcealed(context: WinContext, breakdown: FaanItem[]): void {
  if (context.isConcealed) {
    breakdown.push({ name: "Concealed Hand", faan: 1 });
  }
}

function safeDecodeTile(code: string): Tile | null {
  try {
    return decodeTile(code);
  } catch {
    return null;
  }
}
