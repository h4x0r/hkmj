import { create } from "zustand";
import { createTileSet, shuffleWall, type TileWithId } from "@/lib/game/tiles";
import { dealTiles } from "@/lib/game/dealing";

export type GameStatus = "idle" | "playing" | "finished";

export interface ExposedMeld {
  type: "pong" | "kong" | "chow";
  tiles: TileWithId[];
  claimedFrom?: string; // player id who discarded
}

export interface GamePlayer {
  id: string;
  displayName: string;
  seat: number;
  hand: TileWithId[];
  exposedMelds: ExposedMeld[];
}

interface GameState {
  gameId: string | null;
  status: GameStatus;
  players: GamePlayer[];
  wall: TileWithId[];
  discardPile: TileWithId[];
  currentPlayerIndex: number;
  winnerId: string | null;
  winningFaan: number | null;

  // Actions
  startGame: (
    gameId: string,
    players: { id: string; displayName: string; seat: number }[],
    dealerSeat: number
  ) => void;
  drawTile: (playerIndex: number) => TileWithId | null;
  discardTile: (playerIndex: number, tileId: string) => boolean;
  claimMeld: (
    playerIndex: number,
    meldType: "pong" | "kong" | "chow",
    tileIds: string[]
  ) => void;
  declareWin: (playerIndex: number, faan: number) => void;
  reset: () => void;
}

const initialState = {
  gameId: null as string | null,
  status: "idle" as GameStatus,
  players: [] as GamePlayer[],
  wall: [] as TileWithId[],
  discardPile: [] as TileWithId[],
  currentPlayerIndex: -1,
  winnerId: null as string | null,
  winningFaan: null as number | null,
};

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState,

  startGame: (gameId, playerInfos, dealerSeat) => {
    // Create and shuffle tiles
    const tiles = createTileSet();
    const shuffledWall = shuffleWall(tiles);

    // Deal tiles
    const dealt = dealTiles(shuffledWall, dealerSeat);

    // Create game players with hands
    const gamePlayers: GamePlayer[] = playerInfos.map((info, index) => ({
      id: info.id,
      displayName: info.displayName,
      seat: info.seat,
      hand: dealt.hands[index],
      exposedMelds: [],
    }));

    set({
      gameId,
      status: "playing",
      players: gamePlayers,
      wall: dealt.remainingWall,
      discardPile: [],
      currentPlayerIndex: dealerSeat,
      winnerId: null,
      winningFaan: null,
    });
  },

  drawTile: (playerIndex) => {
    const { wall, players } = get();

    if (wall.length === 0) {
      return null;
    }

    const drawnTile = wall[0];
    const newWall = wall.slice(1);
    const newPlayers = players.map((player, index) => {
      if (index === playerIndex) {
        return {
          ...player,
          hand: [...player.hand, drawnTile],
        };
      }
      return player;
    });

    set({
      wall: newWall,
      players: newPlayers,
    });

    return drawnTile;
  },

  discardTile: (playerIndex, tileId) => {
    const { players, discardPile } = get();
    const player = players[playerIndex];

    const tileIndex = player.hand.findIndex((t) => t.id === tileId);
    if (tileIndex === -1) {
      return false;
    }

    const discardedTile = player.hand[tileIndex];
    const newHand = player.hand.filter((t) => t.id !== tileId);
    const newPlayers = players.map((p, index) => {
      if (index === playerIndex) {
        return { ...p, hand: newHand };
      }
      return p;
    });

    // Advance to next player (wrap around)
    const nextPlayerIndex = (playerIndex + 1) % 4;

    set({
      players: newPlayers,
      discardPile: [...discardPile, discardedTile],
      currentPlayerIndex: nextPlayerIndex,
    });

    return true;
  },

  claimMeld: (playerIndex, meldType, tileIds) => {
    const { players, discardPile } = get();
    const player = players[playerIndex];

    // Get the last discarded tile
    const claimedTile = discardPile[discardPile.length - 1];
    if (!claimedTile) return;

    // Remove tiles from hand
    const tilesFromHand = player.hand.filter((t) => tileIds.includes(t.id));
    const newHand = player.hand.filter((t) => !tileIds.includes(t.id));

    // Create the meld (tiles from hand + claimed tile)
    const meldTiles = [...tilesFromHand, claimedTile];
    const newMeld: ExposedMeld = {
      type: meldType,
      tiles: meldTiles,
    };

    // Update player with new hand and meld
    const newPlayers = players.map((p, index) => {
      if (index === playerIndex) {
        return {
          ...p,
          hand: newHand,
          exposedMelds: [...p.exposedMelds, newMeld],
        };
      }
      return p;
    });

    // Remove claimed tile from discard pile
    const newDiscardPile = discardPile.slice(0, -1);

    set({
      players: newPlayers,
      discardPile: newDiscardPile,
      currentPlayerIndex: playerIndex,
    });
  },

  declareWin: (playerIndex, faan) => {
    const { players } = get();
    const winner = players[playerIndex];

    set({
      status: "finished",
      winnerId: winner.id,
      winningFaan: faan,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
