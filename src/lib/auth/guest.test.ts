import { describe, it, expect } from "vitest";
import {
  validateDisplayName,
  generateGuestId,
  createGuestSession,
  type GuestSession,
} from "./guest";

describe("Guest Authentication", () => {
  describe("validateDisplayName", () => {
    it("accepts valid display names", () => {
      expect(validateDisplayName("Player1")).toEqual({ valid: true });
      expect(validateDisplayName("李四")).toEqual({ valid: true });
      expect(validateDisplayName("John Doe")).toEqual({ valid: true });
    });

    it("rejects empty names", () => {
      const result = validateDisplayName("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Display name is required");
    });

    it("rejects names that are too short", () => {
      const result = validateDisplayName("A");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Display name must be at least 2 characters");
    });

    it("rejects names that are too long", () => {
      const result = validateDisplayName("A".repeat(21));
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Display name must be at most 20 characters");
    });

    it("rejects names with only whitespace", () => {
      const result = validateDisplayName("   ");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Display name is required");
    });

    it("trims whitespace from names", () => {
      expect(validateDisplayName("  Player1  ")).toEqual({ valid: true });
    });
  });

  describe("generateGuestId", () => {
    it("generates unique IDs", () => {
      const id1 = generateGuestId();
      const id2 = generateGuestId();
      expect(id1).not.toBe(id2);
    });

    it("generates IDs with guest prefix", () => {
      const id = generateGuestId();
      expect(id).toMatch(/^guest_/);
    });

    it("generates IDs of consistent length", () => {
      const id = generateGuestId();
      expect(id.length).toBeGreaterThan(10);
    });
  });

  describe("createGuestSession", () => {
    it("creates a valid guest session", () => {
      const session = createGuestSession("Player1");

      expect(session.id).toMatch(/^guest_/);
      expect(session.displayName).toBe("Player1");
      expect(session.isGuest).toBe(true);
      expect(session.createdAt).toBeInstanceOf(Date);
    });

    it("trims display name", () => {
      const session = createGuestSession("  Player1  ");
      expect(session.displayName).toBe("Player1");
    });

    it("throws on invalid display name", () => {
      expect(() => createGuestSession("")).toThrow("Display name is required");
      expect(() => createGuestSession("A")).toThrow("Display name must be at least 2 characters");
    });
  });
});
