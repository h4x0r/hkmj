/**
 * Tile system for Hong Kong Mahjong
 * 136 tiles total: 3 suits × 9 values × 4 copies + 4 winds × 4 + 3 dragons × 4
 */

export type Suit = "bamboo" | "character" | "dot" | "wind" | "dragon";

export interface Tile {
  suit: Suit;
  value: number;
}

export interface TileWithId extends Tile {
  id: string;
  code: string;
}

export const SUITS: Suit[] = ["bamboo", "character", "dot"];
export const HONORS: Suit[] = ["wind", "dragon"];

const SUIT_CODES: Record<Suit, string> = {
  bamboo: "B",
  character: "C",
  dot: "D",
  wind: "W",
  dragon: "D",
};

const WIND_CODES: Record<number, string> = {
  1: "E", // East
  2: "S", // South
  3: "W", // West
  4: "N", // North
};

const DRAGON_CODES: Record<number, string> = {
  1: "R", // Red
  2: "G", // Green
  3: "W", // White
};

/**
 * Encode a tile to its string representation
 */
export function encodeTile(tile: Tile): string {
  if (tile.suit === "wind") {
    return `${WIND_CODES[tile.value]}W`;
  }
  if (tile.suit === "dragon") {
    return `${DRAGON_CODES[tile.value]}D`;
  }
  return `${tile.value}${SUIT_CODES[tile.suit]}`;
}

/**
 * Decode a tile code to its tile representation
 */
export function decodeTile(code: string): Tile {
  if (!code || code.length < 2) {
    throw new Error("Invalid tile code");
  }

  // Handle winds: EW, SW, WW, NW
  if (code.endsWith("W") && code.length === 2) {
    const windChar = code[0];
    const windValue = Object.entries(WIND_CODES).find(
      ([_, char]) => char === windChar
    );
    if (windValue) {
      return { suit: "wind", value: Number.parseInt(windValue[0]) };
    }
  }

  // Handle dragons: RD, GD, WD
  if (code.endsWith("D") && code.length === 2 && Number.isNaN(Number(code[0]))) {
    const dragonChar = code[0];
    const dragonValue = Object.entries(DRAGON_CODES).find(
      ([_, char]) => char === dragonChar
    );
    if (dragonValue) {
      return { suit: "dragon", value: Number.parseInt(dragonValue[0]) };
    }
  }

  // Handle numbered tiles: 1B-9B, 1C-9C, 1D-9D
  const value = Number.parseInt(code[0]);
  const suitChar = code[1];

  if (Number.isNaN(value) || value < 1 || value > 9) {
    throw new Error("Invalid tile code");
  }

  if (suitChar === "B") return { suit: "bamboo", value };
  if (suitChar === "C") return { suit: "character", value };
  if (suitChar === "D") return { suit: "dot", value };

  throw new Error("Invalid tile code");
}

/**
 * Create a complete set of 136 Mahjong tiles
 */
export function createTileSet(): TileWithId[] {
  const tiles: TileWithId[] = [];
  let idCounter = 0;

  // Create numbered tiles (bamboo, character, dot)
  for (const suit of SUITS) {
    for (let value = 1; value <= 9; value++) {
      for (let copy = 0; copy < 4; copy++) {
        const tile: Tile = { suit, value };
        tiles.push({
          ...tile,
          id: `${idCounter++}`,
          code: encodeTile(tile),
        });
      }
    }
  }

  // Create wind tiles (4 winds × 4 copies)
  for (let value = 1; value <= 4; value++) {
    for (let copy = 0; copy < 4; copy++) {
      const tile: Tile = { suit: "wind", value };
      tiles.push({
        ...tile,
        id: `${idCounter++}`,
        code: encodeTile(tile),
      });
    }
  }

  // Create dragon tiles (3 dragons × 4 copies)
  for (let value = 1; value <= 3; value++) {
    for (let copy = 0; copy < 4; copy++) {
      const tile: Tile = { suit: "dragon", value };
      tiles.push({
        ...tile,
        id: `${idCounter++}`,
        code: encodeTile(tile),
      });
    }
  }

  return tiles;
}

/**
 * Shuffle the wall using Fisher-Yates algorithm
 */
export function shuffleWall(tiles: TileWithId[]): TileWithId[] {
  const shuffled = [...tiles];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
