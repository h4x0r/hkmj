import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "./game";

describe("Game Store", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  describe("initialization", () => {
    it("starts with no active game", () => {
      const state = useGameStore.getState();
      expect(state.gameId).toBeNull();
      expect(state.status).toBe("idle");
    });

    it("starts with empty players", () => {
      const state = useGameStore.getState();
      expect(state.players).toEqual([]);
    });

    it("starts with no current player", () => {
      const state = useGameStore.getState();
      expect(state.currentPlayerIndex).toBe(-1);
    });
  });

  describe("startGame", () => {
    const mockPlayers = [
      { id: "p1", displayName: "Player 1", seat: 0 },
      { id: "p2", displayName: "Player 2", seat: 1 },
      { id: "p3", displayName: "Player 3", seat: 2 },
      { id: "p4", displayName: "Player 4", seat: 3 },
    ];

    it("sets game status to playing", () => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
      expect(useGameStore.getState().status).toBe("playing");
    });

    it("sets game ID", () => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
      expect(useGameStore.getState().gameId).toBe("game_123");
    });

    it("initializes players with hands", () => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
      const state = useGameStore.getState();

      expect(state.players).toHaveLength(4);
      state.players.forEach((player, index) => {
        // Dealer (seat 0) gets 14, others get 13
        const expectedHand = index === 0 ? 14 : 13;
        expect(player.hand).toHaveLength(expectedHand);
      });
    });

    it("sets dealer as current player", () => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
      expect(useGameStore.getState().currentPlayerIndex).toBe(0);
    });

    it("initializes wall with remaining tiles", () => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
      const state = useGameStore.getState();

      // 136 total - 13*3 - 14 = 136 - 53 = 83 tiles in wall
      expect(state.wall.length).toBe(83);
    });

    it("starts with empty discard pile", () => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
      expect(useGameStore.getState().discardPile).toEqual([]);
    });
  });

  describe("drawTile", () => {
    const mockPlayers = [
      { id: "p1", displayName: "Player 1", seat: 0 },
      { id: "p2", displayName: "Player 2", seat: 1 },
      { id: "p3", displayName: "Player 3", seat: 2 },
      { id: "p4", displayName: "Player 4", seat: 3 },
    ];

    beforeEach(() => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
    });

    it("adds tile to current player hand", () => {
      const initialWallLength = useGameStore.getState().wall.length;
      useGameStore.getState().drawTile(0);

      const state = useGameStore.getState();
      expect(state.players[0].hand.length).toBe(15); // 14 + 1
      expect(state.wall.length).toBe(initialWallLength - 1);
    });

    it("returns the drawn tile", () => {
      const wall = useGameStore.getState().wall;
      const expectedTile = wall[0];

      const drawnTile = useGameStore.getState().drawTile(0);
      expect(drawnTile).toEqual(expectedTile);
    });

    it("returns null if wall is empty", () => {
      // Empty the wall
      useGameStore.setState({ wall: [] });

      const drawnTile = useGameStore.getState().drawTile(0);
      expect(drawnTile).toBeNull();
    });
  });

  describe("discardTile", () => {
    const mockPlayers = [
      { id: "p1", displayName: "Player 1", seat: 0 },
      { id: "p2", displayName: "Player 2", seat: 1 },
      { id: "p3", displayName: "Player 3", seat: 2 },
      { id: "p4", displayName: "Player 4", seat: 3 },
    ];

    beforeEach(() => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
    });

    it("removes tile from player hand", () => {
      const initialHand = [...useGameStore.getState().players[0].hand];
      const tileToDiscard = initialHand[0];

      useGameStore.getState().discardTile(0, tileToDiscard.id);

      const state = useGameStore.getState();
      expect(state.players[0].hand.length).toBe(13);
      expect(state.players[0].hand.find((t) => t.id === tileToDiscard.id)).toBeUndefined();
    });

    it("adds tile to discard pile", () => {
      const tileToDiscard = useGameStore.getState().players[0].hand[0];

      useGameStore.getState().discardTile(0, tileToDiscard.id);

      const state = useGameStore.getState();
      expect(state.discardPile).toHaveLength(1);
      expect(state.discardPile[0]).toEqual(tileToDiscard);
    });

    it("advances to next player", () => {
      const tileToDiscard = useGameStore.getState().players[0].hand[0];
      useGameStore.getState().discardTile(0, tileToDiscard.id);

      expect(useGameStore.getState().currentPlayerIndex).toBe(1);
    });

    it("wraps around to first player", () => {
      // Set current player to last player
      useGameStore.setState({ currentPlayerIndex: 3 });
      const tileToDiscard = useGameStore.getState().players[3].hand[0];

      useGameStore.getState().discardTile(3, tileToDiscard.id);

      expect(useGameStore.getState().currentPlayerIndex).toBe(0);
    });

    it("returns false if tile not in hand", () => {
      const result = useGameStore.getState().discardTile(0, "nonexistent_tile");
      expect(result).toBe(false);
    });
  });

  describe("claimMeld", () => {
    const mockPlayers = [
      { id: "p1", displayName: "Player 1", seat: 0 },
      { id: "p2", displayName: "Player 2", seat: 1 },
      { id: "p3", displayName: "Player 3", seat: 2 },
      { id: "p4", displayName: "Player 4", seat: 3 },
    ];

    beforeEach(() => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
    });

    it("removes tiles from hand when claiming pong", () => {
      // Set up a hand with tiles that can form a pong
      const testHand = [
        { id: "t1", tile: { suit: "bamboo" as const, value: 1 } },
        { id: "t2", tile: { suit: "bamboo" as const, value: 1 } },
        { id: "t3", tile: { suit: "bamboo" as const, value: 2 } },
      ];
      const discardedTile = { id: "d1", tile: { suit: "bamboo" as const, value: 1 } };

      useGameStore.setState((state) => ({
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, hand: testHand } : p
        ),
        discardPile: [discardedTile],
      }));

      useGameStore.getState().claimMeld(1, "pong", ["t1", "t2"]);

      const state = useGameStore.getState();
      expect(state.players[1].hand).toHaveLength(1); // Only t3 remains
      expect(state.players[1].hand[0].id).toBe("t3");
    });

    it("adds exposed meld to player", () => {
      const testHand = [
        { id: "t1", tile: { suit: "bamboo" as const, value: 1 } },
        { id: "t2", tile: { suit: "bamboo" as const, value: 1 } },
        { id: "t3", tile: { suit: "bamboo" as const, value: 2 } },
      ];
      const discardedTile = { id: "d1", tile: { suit: "bamboo" as const, value: 1 } };

      useGameStore.setState((state) => ({
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, hand: testHand } : p
        ),
        discardPile: [discardedTile],
      }));

      useGameStore.getState().claimMeld(1, "pong", ["t1", "t2"]);

      const state = useGameStore.getState();
      expect(state.players[1].exposedMelds).toHaveLength(1);
      expect(state.players[1].exposedMelds[0].type).toBe("pong");
      expect(state.players[1].exposedMelds[0].tiles).toHaveLength(3);
    });

    it("removes claimed tile from discard pile", () => {
      const testHand = [
        { id: "t1", tile: { suit: "bamboo" as const, value: 1 } },
        { id: "t2", tile: { suit: "bamboo" as const, value: 1 } },
      ];
      const discardedTile = { id: "d1", tile: { suit: "bamboo" as const, value: 1 } };

      useGameStore.setState((state) => ({
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, hand: testHand } : p
        ),
        discardPile: [discardedTile],
      }));

      useGameStore.getState().claimMeld(1, "pong", ["t1", "t2"]);

      expect(useGameStore.getState().discardPile).toHaveLength(0);
    });

    it("sets claiming player as current player", () => {
      const testHand = [
        { id: "t1", tile: { suit: "bamboo" as const, value: 1 } },
        { id: "t2", tile: { suit: "bamboo" as const, value: 1 } },
      ];
      const discardedTile = { id: "d1", tile: { suit: "bamboo" as const, value: 1 } };

      useGameStore.setState((state) => ({
        players: state.players.map((p, i) =>
          i === 2 ? { ...p, hand: testHand } : p
        ),
        discardPile: [discardedTile],
        currentPlayerIndex: 0,
      }));

      useGameStore.getState().claimMeld(2, "pong", ["t1", "t2"]);

      expect(useGameStore.getState().currentPlayerIndex).toBe(2);
    });
  });

  describe("declareWin", () => {
    const mockPlayers = [
      { id: "p1", displayName: "Player 1", seat: 0 },
      { id: "p2", displayName: "Player 2", seat: 1 },
      { id: "p3", displayName: "Player 3", seat: 2 },
      { id: "p4", displayName: "Player 4", seat: 3 },
    ];

    beforeEach(() => {
      useGameStore.getState().startGame("game_123", mockPlayers, 0);
    });

    it("sets game status to finished", () => {
      useGameStore.getState().declareWin(0, 5);
      expect(useGameStore.getState().status).toBe("finished");
    });

    it("records winner", () => {
      useGameStore.getState().declareWin(1, 8);
      expect(useGameStore.getState().winnerId).toBe("p2");
    });

    it("records faan count", () => {
      useGameStore.getState().declareWin(0, 10);
      expect(useGameStore.getState().winningFaan).toBe(10);
    });
  });

  describe("reset", () => {
    it("clears all game state", () => {
      const mockPlayers = [
        { id: "p1", displayName: "Player 1", seat: 0 },
        { id: "p2", displayName: "Player 2", seat: 1 },
        { id: "p3", displayName: "Player 3", seat: 2 },
        { id: "p4", displayName: "Player 4", seat: 3 },
      ];

      useGameStore.getState().startGame("game_123", mockPlayers, 0);
      useGameStore.getState().reset();

      const state = useGameStore.getState();
      expect(state.gameId).toBeNull();
      expect(state.status).toBe("idle");
      expect(state.players).toEqual([]);
      expect(state.wall).toEqual([]);
      expect(state.discardPile).toEqual([]);
    });
  });
});
