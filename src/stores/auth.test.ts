import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth";

describe("Auth Store", () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      isLoading: false,
      error: null,
    });
  });

  describe("loginAsGuest", () => {
    it("creates guest session with display name", () => {
      const { loginAsGuest } = useAuthStore.getState();
      loginAsGuest("Player1");

      const { user } = useAuthStore.getState();
      expect(user).not.toBeNull();
      expect(user?.displayName).toBe("Player1");
      expect(user?.isGuest).toBe(true);
    });

    it("sets error on invalid display name", () => {
      const { loginAsGuest } = useAuthStore.getState();
      loginAsGuest("");

      const { user, error } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(error).toBe("Display name is required");
    });
  });

  describe("logout", () => {
    it("clears user session", () => {
      const { loginAsGuest, logout } = useAuthStore.getState();
      loginAsGuest("Player1");

      expect(useAuthStore.getState().user).not.toBeNull();

      logout();

      expect(useAuthStore.getState().user).toBeNull();
    });

    it("clears any errors", () => {
      useAuthStore.setState({ error: "Some error" });

      const { logout } = useAuthStore.getState();
      logout();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns false when no user", () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated()).toBe(false);
    });

    it("returns true when user exists", () => {
      const { loginAsGuest, isAuthenticated } = useAuthStore.getState();
      loginAsGuest("Player1");
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("clearError", () => {
    it("clears error state", () => {
      useAuthStore.setState({ error: "Some error" });

      const { clearError } = useAuthStore.getState();
      clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
