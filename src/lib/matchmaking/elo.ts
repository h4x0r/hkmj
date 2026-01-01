export const STARTING_ELO = 1200;
export const K_FACTOR = 32;
export const K_FACTOR_PLACEMENT = 64;

/**
 * Calculate expected score using ELO formula
 * E_A = 1 / (1 + 10^((R_B - R_A) / 400))
 */
export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate new rating after a game
 * R'_A = R_A + K * (S_A - E_A)
 * where S_A is actual score (1 for win, 0 for loss)
 */
export function calculateNewRating(
  rating: number,
  opponentRating: number,
  actualScore: number,
  isPlacement: boolean = false
): number {
  const k = isPlacement ? K_FACTOR_PLACEMENT : K_FACTOR;
  const expectedScore = calculateExpectedScore(rating, opponentRating);
  return Math.round(rating + k * (actualScore - expectedScore));
}

export interface MatchPlayer {
  id: string;
  rating: number;
  isPlacement: boolean;
}

export interface RatingResult {
  id: string;
  oldRating: number;
  newRating: number;
  change: number;
}

/**
 * Calculate new ratings for all players in a 4-player match
 * Winner beats all 3 opponents, losers lose to winner only
 */
export function calculateMatchRatings(
  players: MatchPlayer[],
  winnerId: string
): RatingResult[] {
  const results: RatingResult[] = [];

  for (const player of players) {
    const isWinner = player.id === winnerId;
    let totalChange = 0;

    // Each player's rating changes based on matchups with other players
    for (const opponent of players) {
      if (opponent.id === player.id) continue;

      // Winner beats everyone, losers only lose to winner
      if (isWinner) {
        // Winner gains against each opponent
        const newRating = calculateNewRating(
          player.rating,
          opponent.rating,
          1, // win
          player.isPlacement
        );
        totalChange += newRating - player.rating;
      } else if (opponent.id === winnerId) {
        // Loser loses to winner only
        const newRating = calculateNewRating(
          player.rating,
          opponent.rating,
          0, // loss
          player.isPlacement
        );
        totalChange += newRating - player.rating;
      }
      // Losers don't affect each other's ratings
    }

    const newRating = player.rating + totalChange;

    results.push({
      id: player.id,
      oldRating: player.rating,
      newRating,
      change: totalChange,
    });
  }

  return results;
}
