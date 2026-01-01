import { generateRoomCode } from "./code";

export interface RoomSettings {
  minFaan: number;
  sessionType: "single" | "east_only" | "full";
  flowerTiles: boolean;
  voiceEnabled: boolean;
  turnTimer: number;
}

export interface RoomPlayer {
  userId: string;
  displayName: string;
  seat: number;
  isReady: boolean;
  isMuted: boolean;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: "waiting" | "playing" | "finished";
  settings: RoomSettings;
  players: RoomPlayer[];
  createdAt: Date;
}

export interface RoomResult {
  success: boolean;
  room: Room | null;
  error?: string;
  closed?: boolean;
}

const MAX_PLAYERS = 4;

/**
 * Generate a unique room ID
 */
function generateRoomId(): string {
  return `room_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create a new room
 */
export function createRoom(
  hostId: string,
  hostDisplayName: string,
  settings: RoomSettings
): Room {
  const hostPlayer: RoomPlayer = {
    userId: hostId,
    displayName: hostDisplayName,
    seat: 0,
    isReady: false,
    isMuted: false,
  };

  return {
    id: generateRoomId(),
    code: generateRoomCode(),
    hostId,
    status: "waiting",
    settings,
    players: [hostPlayer],
    createdAt: new Date(),
  };
}

/**
 * Join an existing room
 */
export function joinRoom(
  room: Room,
  userId: string,
  displayName: string
): RoomResult {
  // Check if already in room
  if (room.players.some((p) => p.userId === userId)) {
    return { success: false, room: null, error: "Already in room" };
  }

  // Check if room is full
  if (room.players.length >= MAX_PLAYERS) {
    return { success: false, room: null, error: "Room is full" };
  }

  // Check if game in progress
  if (room.status === "playing") {
    return { success: false, room: null, error: "Game already in progress" };
  }

  // Find next available seat
  const takenSeats = new Set(room.players.map((p) => p.seat));
  let nextSeat = 0;
  while (takenSeats.has(nextSeat)) {
    nextSeat++;
  }

  const newPlayer: RoomPlayer = {
    userId,
    displayName,
    seat: nextSeat,
    isReady: false,
    isMuted: false,
  };

  return {
    success: true,
    room: {
      ...room,
      players: [...room.players, newPlayer],
    },
  };
}

/**
 * Leave a room
 */
export function leaveRoom(room: Room, userId: string): RoomResult {
  const playerIndex = room.players.findIndex((p) => p.userId === userId);

  if (playerIndex === -1) {
    return { success: false, room: null, error: "Player not in room" };
  }

  const remainingPlayers = room.players.filter((p) => p.userId !== userId);

  // Room closes if no players left
  if (remainingPlayers.length === 0) {
    return { success: true, room: null, closed: true };
  }

  // Transfer host if host leaves
  let newHostId = room.hostId;
  if (userId === room.hostId) {
    newHostId = remainingPlayers[0].userId;
  }

  return {
    success: true,
    room: {
      ...room,
      hostId: newHostId,
      players: remainingPlayers,
    },
  };
}
