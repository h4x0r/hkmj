import { describe, it, expect } from "vitest";
import { filterProfanity, containsProfanity, type FilterResult } from "./filter";

describe("Profanity Filter", () => {
  describe("containsProfanity", () => {
    it("detects common profanity", () => {
      expect(containsProfanity("damn")).toBe(true);
      expect(containsProfanity("hell")).toBe(true);
    });

    it("detects profanity regardless of case", () => {
      expect(containsProfanity("DAMN")).toBe(true);
      expect(containsProfanity("DaMn")).toBe(true);
    });

    it("detects profanity in sentences", () => {
      expect(containsProfanity("what the hell is this")).toBe(true);
    });

    it("returns false for clean text", () => {
      expect(containsProfanity("hello world")).toBe(false);
      expect(containsProfanity("good game")).toBe(false);
      expect(containsProfanity("pong!")).toBe(false);
    });

    it("handles empty string", () => {
      expect(containsProfanity("")).toBe(false);
    });
  });

  describe("filterProfanity", () => {
    it("replaces profanity with asterisks", () => {
      const result = filterProfanity("what the hell");
      expect(result.filtered).toBe("what the ****");
      expect(result.wasFiltered).toBe(true);
    });

    it("replaces multiple profane words", () => {
      const result = filterProfanity("damn this is hell");
      expect(result.filtered).toBe("**** this is ****");
      expect(result.wasFiltered).toBe(true);
      expect(result.count).toBe(2);
    });

    it("preserves clean text", () => {
      const result = filterProfanity("hello friend");
      expect(result.filtered).toBe("hello friend");
      expect(result.wasFiltered).toBe(false);
      expect(result.count).toBe(0);
    });

    it("handles case insensitively", () => {
      const result = filterProfanity("HELL and DAMN");
      expect(result.filtered).toBe("**** and ****");
    });

    it("preserves word boundaries", () => {
      // "shell" should not be filtered
      const result = filterProfanity("shell script");
      expect(result.filtered).toBe("shell script");
      expect(result.wasFiltered).toBe(false);
    });

    it("handles empty string", () => {
      const result = filterProfanity("");
      expect(result.filtered).toBe("");
      expect(result.wasFiltered).toBe(false);
    });
  });
});
