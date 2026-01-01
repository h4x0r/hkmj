import { describe, it, expect, beforeEach } from "vitest";
import { useRoomStore } from "./room";

describe("Room Store", () => {
  beforeEach(() => {
    useRoomStore.getState().reset();
  });

  describe("initialization", () => {
    it("starts with no active room", () => {
      const state = useRoomStore.getState();
      expect(state.currentRoom).toBeNull();
    });

    it("starts as not connected", () => {
      const state = useRoomStore.getState();
      expect(state.isConnected).toBe(false);
    });

    it("starts with no error", () => {
      const state = useRoomStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe("setRoom", () => {
    const mockRoom = {
      id: "room_123",
      code: "ABC123",
      hostId: "user_1",
      status: "waiting" as const,
      settings: {
        minFaan: 3,
        sessionType: "single" as const,
        flowerTiles: false,
        voiceEnabled: true,
        turnTimer: 15,
      },
      players: [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
      ],
      createdAt: new Date(),
    };

    it("sets current room", () => {
      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().currentRoom).toEqual(mockRoom);
    });

    it("sets connected status", () => {
      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().isConnected).toBe(true);
    });

    it("clears error when room is set", () => {
      useRoomStore.setState({ error: "Previous error" });
      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().error).toBeNull();
    });
  });

  describe("updatePlayers", () => {
    const mockRoom = {
      id: "room_123",
      code: "ABC123",
      hostId: "user_1",
      status: "waiting" as const,
      settings: {
        minFaan: 3,
        sessionType: "single" as const,
        flowerTiles: false,
        voiceEnabled: true,
        turnTimer: 15,
      },
      players: [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
      ],
      createdAt: new Date(),
    };

    beforeEach(() => {
      useRoomStore.getState().setRoom(mockRoom);
    });

    it("updates players in current room", () => {
      const newPlayers = [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: true, isMuted: false },
        { userId: "user_2", displayName: "Player 2", seat: 1, isReady: false, isMuted: false },
      ];

      useRoomStore.getState().updatePlayers(newPlayers);
      expect(useRoomStore.getState().currentRoom?.players).toEqual(newPlayers);
    });

    it("does nothing if no current room", () => {
      useRoomStore.getState().reset();
      const newPlayers = [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: true, isMuted: false },
      ];

      useRoomStore.getState().updatePlayers(newPlayers);
      expect(useRoomStore.getState().currentRoom).toBeNull();
    });
  });

  describe("setPlayerReady", () => {
    const mockRoom = {
      id: "room_123",
      code: "ABC123",
      hostId: "user_1",
      status: "waiting" as const,
      settings: {
        minFaan: 3,
        sessionType: "single" as const,
        flowerTiles: false,
        voiceEnabled: true,
        turnTimer: 15,
      },
      players: [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
        { userId: "user_2", displayName: "Player 2", seat: 1, isReady: false, isMuted: false },
      ],
      createdAt: new Date(),
    };

    beforeEach(() => {
      useRoomStore.getState().setRoom(mockRoom);
    });

    it("sets player ready status to true", () => {
      useRoomStore.getState().setPlayerReady("user_1", true);

      const player = useRoomStore.getState().currentRoom?.players.find(
        (p) => p.userId === "user_1"
      );
      expect(player?.isReady).toBe(true);
    });

    it("sets player ready status to false", () => {
      useRoomStore.getState().setPlayerReady("user_1", true);
      useRoomStore.getState().setPlayerReady("user_1", false);

      const player = useRoomStore.getState().currentRoom?.players.find(
        (p) => p.userId === "user_1"
      );
      expect(player?.isReady).toBe(false);
    });

    it("does not affect other players", () => {
      useRoomStore.getState().setPlayerReady("user_1", true);

      const player2 = useRoomStore.getState().currentRoom?.players.find(
        (p) => p.userId === "user_2"
      );
      expect(player2?.isReady).toBe(false);
    });
  });

  describe("updateSettings", () => {
    const mockRoom = {
      id: "room_123",
      code: "ABC123",
      hostId: "user_1",
      status: "waiting" as const,
      settings: {
        minFaan: 3,
        sessionType: "single" as const,
        flowerTiles: false,
        voiceEnabled: true,
        turnTimer: 15,
      },
      players: [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
      ],
      createdAt: new Date(),
    };

    beforeEach(() => {
      useRoomStore.getState().setRoom(mockRoom);
    });

    it("updates room settings", () => {
      useRoomStore.getState().updateSettings({ minFaan: 5, turnTimer: 30 });

      const settings = useRoomStore.getState().currentRoom?.settings;
      expect(settings?.minFaan).toBe(5);
      expect(settings?.turnTimer).toBe(30);
    });

    it("preserves unchanged settings", () => {
      useRoomStore.getState().updateSettings({ minFaan: 5 });

      const settings = useRoomStore.getState().currentRoom?.settings;
      expect(settings?.voiceEnabled).toBe(true);
      expect(settings?.flowerTiles).toBe(false);
    });
  });

  describe("setRoomStatus", () => {
    const mockRoom = {
      id: "room_123",
      code: "ABC123",
      hostId: "user_1",
      status: "waiting" as const,
      settings: {
        minFaan: 3,
        sessionType: "single" as const,
        flowerTiles: false,
        voiceEnabled: true,
        turnTimer: 15,
      },
      players: [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
      ],
      createdAt: new Date(),
    };

    beforeEach(() => {
      useRoomStore.getState().setRoom(mockRoom);
    });

    it("updates room status to playing", () => {
      useRoomStore.getState().setRoomStatus("playing");
      expect(useRoomStore.getState().currentRoom?.status).toBe("playing");
    });

    it("updates room status to finished", () => {
      useRoomStore.getState().setRoomStatus("finished");
      expect(useRoomStore.getState().currentRoom?.status).toBe("finished");
    });
  });

  describe("setError", () => {
    it("sets error message", () => {
      useRoomStore.getState().setError("Connection failed");
      expect(useRoomStore.getState().error).toBe("Connection failed");
    });

    it("clears error when set to null", () => {
      useRoomStore.getState().setError("Some error");
      useRoomStore.getState().setError(null);
      expect(useRoomStore.getState().error).toBeNull();
    });
  });

  describe("leaveRoom", () => {
    const mockRoom = {
      id: "room_123",
      code: "ABC123",
      hostId: "user_1",
      status: "waiting" as const,
      settings: {
        minFaan: 3,
        sessionType: "single" as const,
        flowerTiles: false,
        voiceEnabled: true,
        turnTimer: 15,
      },
      players: [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
      ],
      createdAt: new Date(),
    };

    beforeEach(() => {
      useRoomStore.getState().setRoom(mockRoom);
    });

    it("clears current room", () => {
      useRoomStore.getState().leaveRoom();
      expect(useRoomStore.getState().currentRoom).toBeNull();
    });

    it("sets connected to false", () => {
      useRoomStore.getState().leaveRoom();
      expect(useRoomStore.getState().isConnected).toBe(false);
    });
  });

  describe("isHost", () => {
    const mockRoom = {
      id: "room_123",
      code: "ABC123",
      hostId: "user_1",
      status: "waiting" as const,
      settings: {
        minFaan: 3,
        sessionType: "single" as const,
        flowerTiles: false,
        voiceEnabled: true,
        turnTimer: 15,
      },
      players: [
        { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
      ],
      createdAt: new Date(),
    };

    it("returns true if user is host", () => {
      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().isHost("user_1")).toBe(true);
    });

    it("returns false if user is not host", () => {
      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().isHost("user_2")).toBe(false);
    });

    it("returns false if no room", () => {
      expect(useRoomStore.getState().isHost("user_1")).toBe(false);
    });
  });

  describe("allPlayersReady", () => {
    it("returns true when all 4 players are ready", () => {
      const mockRoom = {
        id: "room_123",
        code: "ABC123",
        hostId: "user_1",
        status: "waiting" as const,
        settings: {
          minFaan: 3,
          sessionType: "single" as const,
          flowerTiles: false,
          voiceEnabled: true,
          turnTimer: 15,
        },
        players: [
          { userId: "user_1", displayName: "Host", seat: 0, isReady: true, isMuted: false },
          { userId: "user_2", displayName: "P2", seat: 1, isReady: true, isMuted: false },
          { userId: "user_3", displayName: "P3", seat: 2, isReady: true, isMuted: false },
          { userId: "user_4", displayName: "P4", seat: 3, isReady: true, isMuted: false },
        ],
        createdAt: new Date(),
      };

      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().allPlayersReady()).toBe(true);
    });

    it("returns false when not all players are ready", () => {
      const mockRoom = {
        id: "room_123",
        code: "ABC123",
        hostId: "user_1",
        status: "waiting" as const,
        settings: {
          minFaan: 3,
          sessionType: "single" as const,
          flowerTiles: false,
          voiceEnabled: true,
          turnTimer: 15,
        },
        players: [
          { userId: "user_1", displayName: "Host", seat: 0, isReady: true, isMuted: false },
          { userId: "user_2", displayName: "P2", seat: 1, isReady: false, isMuted: false },
          { userId: "user_3", displayName: "P3", seat: 2, isReady: true, isMuted: false },
          { userId: "user_4", displayName: "P4", seat: 3, isReady: true, isMuted: false },
        ],
        createdAt: new Date(),
      };

      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().allPlayersReady()).toBe(false);
    });

    it("returns true with less than 4 players if all are ready (bots fill remaining)", () => {
      const mockRoom = {
        id: "room_123",
        code: "ABC123",
        hostId: "user_1",
        status: "waiting" as const,
        settings: {
          minFaan: 3,
          sessionType: "single" as const,
          flowerTiles: false,
          voiceEnabled: true,
          turnTimer: 15,
        },
        players: [
          { userId: "user_1", displayName: "Host", seat: 0, isReady: true, isMuted: false },
          { userId: "user_2", displayName: "P2", seat: 1, isReady: true, isMuted: false },
        ],
        createdAt: new Date(),
      };

      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().allPlayersReady()).toBe(true);
    });

    it("returns false when no players", () => {
      const mockRoom = {
        id: "room_123",
        code: "ABC123",
        hostId: "user_1",
        status: "waiting" as const,
        settings: {
          minFaan: 3,
          sessionType: "single" as const,
          flowerTiles: false,
          voiceEnabled: true,
          turnTimer: 15,
        },
        players: [],
        createdAt: new Date(),
      };

      useRoomStore.getState().setRoom(mockRoom);
      expect(useRoomStore.getState().allPlayersReady()).toBe(false);
    });

    it("returns false when no room", () => {
      expect(useRoomStore.getState().allPlayersReady()).toBe(false);
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", () => {
      const mockRoom = {
        id: "room_123",
        code: "ABC123",
        hostId: "user_1",
        status: "waiting" as const,
        settings: {
          minFaan: 3,
          sessionType: "single" as const,
          flowerTiles: false,
          voiceEnabled: true,
          turnTimer: 15,
        },
        players: [
          { userId: "user_1", displayName: "Host", seat: 0, isReady: false, isMuted: false },
        ],
        createdAt: new Date(),
      };

      useRoomStore.getState().setRoom(mockRoom);
      useRoomStore.getState().setError("Some error");
      useRoomStore.getState().reset();

      const state = useRoomStore.getState();
      expect(state.currentRoom).toBeNull();
      expect(state.isConnected).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
