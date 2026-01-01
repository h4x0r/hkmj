export interface FilterResult {
  filtered: string;
  wasFiltered: boolean;
  count: number;
}

// Basic profanity list - in production would use a proper library
const PROFANITY_LIST = [
  "damn",
  "hell",
  "crap",
  "ass",
  "bastard",
  "bitch",
  "shit",
  "fuck",
  "piss",
];

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  for (const word of PROFANITY_LIST) {
    // Use word boundary regex to avoid false positives
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lowerText)) {
      return true;
    }
  }

  return false;
}

/**
 * Filter profanity from text, replacing with asterisks
 */
export function filterProfanity(text: string): FilterResult {
  if (!text) {
    return { filtered: "", wasFiltered: false, count: 0 };
  }

  let filtered = text;
  let count = 0;

  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = filtered.match(regex);

    if (matches) {
      count += matches.length;
      filtered = filtered.replace(regex, "*".repeat(word.length));
    }
  }

  return {
    filtered,
    wasFiltered: count > 0,
    count,
  };
}
