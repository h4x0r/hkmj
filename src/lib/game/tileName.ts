import type { TileWithId } from "./tiles";

// Chinese number names
const CHINESE_NUMBERS: Record<number, string> = {
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
  7: "七",
  8: "八",
  9: "九",
};

// Suit names
const SUIT_NAMES_ZH: Record<string, string> = {
  dot: "筒",
  bamboo: "索",
  character: "萬",
};

const SUIT_NAMES_EN: Record<string, string> = {
  dot: " Dot",
  bamboo: " Bamboo",
  character: " Character",
};

// Wind names
const WIND_NAMES_ZH: Record<number, string> = {
  1: "東",
  2: "南",
  3: "西",
  4: "北",
};

const WIND_NAMES_EN: Record<number, string> = {
  1: "East",
  2: "South",
  3: "West",
  4: "North",
};

// Dragon names
const DRAGON_NAMES_ZH: Record<number, string> = {
  1: "紅中",
  2: "發財",
  3: "白板",
};

const DRAGON_NAMES_EN: Record<number, string> = {
  1: "Red Dragon",
  2: "Green Dragon",
  3: "White Dragon",
};

/**
 * Get the display name of a tile in the specified locale
 */
export function getTileName(tile: TileWithId, locale: "en" | "zh-TW" = "zh-TW"): string {
  const { suit, value } = tile;

  if (locale === "zh-TW") {
    if (suit === "wind") {
      return WIND_NAMES_ZH[value] || "?";
    }
    if (suit === "dragon") {
      return DRAGON_NAMES_ZH[value] || "?";
    }
    // Number suits: e.g., "一萬", "五筒", "九索"
    return `${CHINESE_NUMBERS[value]}${SUIT_NAMES_ZH[suit]}`;
  }

  // English
  if (suit === "wind") {
    return WIND_NAMES_EN[value] || "?";
  }
  if (suit === "dragon") {
    return DRAGON_NAMES_EN[value] || "?";
  }
  // Number suits: e.g., "1 Dot", "5 Bamboo"
  return `${value}${SUIT_NAMES_EN[suit]}`;
}
