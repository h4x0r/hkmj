import { create } from "zustand";
import type { Room, RoomPlayer, RoomSettings } from "@/lib/room/service";

interface RoomState {
  currentRoom: Room | null;
  isConnected: boolean;
  error: string | null;

  // Actions
  setRoom: (room: Room) => void;
  updatePlayers: (players: RoomPlayer[]) => void;
  setPlayerReady: (userId: string, isReady: boolean) => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  setRoomStatus: (status: Room["status"]) => void;
  setError: (error: string | null) => void;
  leaveRoom: () => void;
  reset: () => void;

  // Computed helpers
  isHost: (userId: string) => boolean;
  allPlayersReady: () => boolean;
}

const initialState = {
  currentRoom: null as Room | null,
  isConnected: false,
  error: null as string | null,
};

export const useRoomStore = create<RoomState>()((set, get) => ({
  ...initialState,

  setRoom: (room) => {
    set({
      currentRoom: room,
      isConnected: true,
      error: null,
    });
  },

  updatePlayers: (players) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        players,
      },
    });
  },

  setPlayerReady: (userId, isReady) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    const updatedPlayers = currentRoom.players.map((player) => {
      if (player.userId === userId) {
        return { ...player, isReady };
      }
      return player;
    });

    set({
      currentRoom: {
        ...currentRoom,
        players: updatedPlayers,
      },
    });
  },

  updateSettings: (newSettings) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        settings: {
          ...currentRoom.settings,
          ...newSettings,
        },
      },
    });
  },

  setRoomStatus: (status) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        status,
      },
    });
  },

  setError: (error) => {
    set({ error });
  },

  leaveRoom: () => {
    set({
      currentRoom: null,
      isConnected: false,
    });
  },

  reset: () => {
    set(initialState);
  },

  isHost: (userId) => {
    const { currentRoom } = get();
    if (!currentRoom) return false;
    return currentRoom.hostId === userId;
  },

  allPlayersReady: () => {
    const { currentRoom } = get();
    if (!currentRoom) return false;
    // Allow starting with at least 1 player (bots fill remaining seats in game)
    if (currentRoom.players.length === 0) return false;
    return currentRoom.players.every((player) => player.isReady);
  },
}));
