import { describe, it, expect } from "vitest";
import { generateRoomCode, isValidRoomCode } from "./code";

describe("Room Code", () => {
  describe("generateRoomCode", () => {
    it("generates 6-character code", () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
    });

    it("generates uppercase alphanumeric code", () => {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it("generates unique codes", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode());
      }
      // Should have mostly unique codes (allow some collision in 100 attempts)
      expect(codes.size).toBeGreaterThan(95);
    });

    it("excludes ambiguous characters (0, O, I, L)", () => {
      // Generate many codes and check none contain ambiguous chars
      for (let i = 0; i < 100; i++) {
        const code = generateRoomCode();
        expect(code).not.toMatch(/[0OIL]/);
      }
    });
  });

  describe("isValidRoomCode", () => {
    it("accepts valid 6-char codes", () => {
      expect(isValidRoomCode("ABC123")).toBe(true);
      expect(isValidRoomCode("XYZW98")).toBe(true);
    });

    it("rejects codes that are too short", () => {
      expect(isValidRoomCode("ABC12")).toBe(false);
    });

    it("rejects codes that are too long", () => {
      expect(isValidRoomCode("ABC1234")).toBe(false);
    });

    it("rejects lowercase codes", () => {
      expect(isValidRoomCode("abc123")).toBe(false);
    });

    it("rejects codes with special characters", () => {
      expect(isValidRoomCode("ABC-12")).toBe(false);
      expect(isValidRoomCode("ABC_12")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValidRoomCode("")).toBe(false);
    });
  });
});
