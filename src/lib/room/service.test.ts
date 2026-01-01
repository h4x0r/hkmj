import { describe, it, expect } from "vitest";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  type Room,
  type RoomSettings,
  type RoomPlayer,
} from "./service";

describe("Room Service", () => {
  const defaultSettings: RoomSettings = {
    minFaan: 3,
    sessionType: "single",
    flowerTiles: false,
    voiceEnabled: true,
    turnTimer: 15,
  };

  describe("createRoom", () => {
    it("creates room with host as first player", () => {
      const hostId = "user_123";
      const hostName = "Host Player";

      const room = createRoom(hostId, hostName, defaultSettings);

      expect(room.code).toHaveLength(6);
      expect(room.hostId).toBe(hostId);
      expect(room.status).toBe("waiting");
      expect(room.players).toHaveLength(1);
      expect(room.players[0].userId).toBe(hostId);
      expect(room.players[0].displayName).toBe(hostName);
      expect(room.players[0].seat).toBe(0);
      expect(room.players[0].isReady).toBe(false);
    });

    it("applies provided settings", () => {
      const settings: RoomSettings = {
        minFaan: 5,
        sessionType: "full",
        flowerTiles: true,
        voiceEnabled: false,
        turnTimer: 30,
      };

      const room = createRoom("user_123", "Host", settings);

      expect(room.settings).toEqual(settings);
    });

    it("generates unique room IDs", () => {
      const room1 = createRoom("user_1", "Host1", defaultSettings);
      const room2 = createRoom("user_2", "Host2", defaultSettings);

      expect(room1.id).not.toBe(room2.id);
      expect(room1.code).not.toBe(room2.code);
    });
  });

  describe("joinRoom", () => {
    it("adds player to room", () => {
      const room = createRoom("host_id", "Host", defaultSettings);
      const userId = "player_2";
      const displayName = "Player 2";

      const result = joinRoom(room, userId, displayName);

      expect(result.success).toBe(true);
      expect(result.room?.players).toHaveLength(2);
      expect(result.room?.players[1].userId).toBe(userId);
      expect(result.room?.players[1].seat).toBe(1);
    });

    it("assigns next available seat", () => {
      let room = createRoom("host", "Host", defaultSettings);
      room = joinRoom(room, "p2", "P2").room!;
      room = joinRoom(room, "p3", "P3").room!;
      const result = joinRoom(room, "p4", "P4");

      expect(result.room?.players[3].seat).toBe(3);
    });

    it("rejects join when room is full", () => {
      let room = createRoom("host", "Host", defaultSettings);
      room = joinRoom(room, "p2", "P2").room!;
      room = joinRoom(room, "p3", "P3").room!;
      room = joinRoom(room, "p4", "P4").room!;

      const result = joinRoom(room, "p5", "P5");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Room is full");
    });

    it("rejects join when player already in room", () => {
      const room = createRoom("host", "Host", defaultSettings);
      const result = joinRoom(room, "host", "Host Again");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Already in room");
    });

    it("rejects join when game in progress", () => {
      const room = createRoom("host", "Host", defaultSettings);
      room.status = "playing";

      const result = joinRoom(room, "p2", "P2");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Game already in progress");
    });
  });

  describe("leaveRoom", () => {
    it("removes player from room", () => {
      let room = createRoom("host", "Host", defaultSettings);
      room = joinRoom(room, "p2", "P2").room!;

      const result = leaveRoom(room, "p2");

      expect(result.success).toBe(true);
      expect(result.room?.players).toHaveLength(1);
      expect(result.room?.players.find((p) => p.userId === "p2")).toBeUndefined();
    });

    it("transfers host when host leaves", () => {
      let room = createRoom("host", "Host", defaultSettings);
      room = joinRoom(room, "p2", "P2").room!;
      room = joinRoom(room, "p3", "P3").room!;

      const result = leaveRoom(room, "host");

      expect(result.success).toBe(true);
      expect(result.room?.hostId).toBe("p2");
    });

    it("closes room when last player leaves", () => {
      const room = createRoom("host", "Host", defaultSettings);

      const result = leaveRoom(room, "host");

      expect(result.success).toBe(true);
      expect(result.room).toBeNull();
      expect(result.closed).toBe(true);
    });

    it("returns error when player not in room", () => {
      const room = createRoom("host", "Host", defaultSettings);

      const result = leaveRoom(room, "unknown");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Player not in room");
    });
  });
});
