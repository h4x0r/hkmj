import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createGuestSession, validateDisplayName, type GuestSession } from "@/lib/auth/guest";

export interface User {
  id: string;
  displayName: string;
  isGuest: boolean;
  avatarUrl?: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loginAsGuest: (displayName: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      loginAsGuest: (displayName: string) => {
        const validation = validateDisplayName(displayName);
        if (!validation.valid) {
          set({ error: validation.error, user: null });
          return;
        }

        try {
          const session = createGuestSession(displayName);
          set({
            user: {
              id: session.id,
              displayName: session.displayName,
              isGuest: session.isGuest,
              createdAt: session.createdAt,
            },
            error: null,
          });
        } catch (e) {
          set({ error: (e as Error).message, user: null });
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      isAuthenticated: () => {
        return get().user !== null;
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "auth-store" }
  )
);
