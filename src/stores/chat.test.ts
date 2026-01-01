import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "./chat";

describe("Chat Store", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  describe("initialization", () => {
    it("starts with empty messages", () => {
      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
    });

    it("starts with chat enabled", () => {
      const state = useChatStore.getState();
      expect(state.isChatEnabled).toBe(true);
    });
  });

  describe("addMessage", () => {
    it("adds a message to the list", () => {
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "Hello!",
        type: "text",
      });

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe("Hello!");
    });

    it("generates unique message IDs", () => {
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "First",
        type: "text",
      });
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "Second",
        type: "text",
      });

      const messages = useChatStore.getState().messages;
      expect(messages[0].id).not.toBe(messages[1].id);
    });

    it("sets timestamp on messages", () => {
      const before = Date.now();
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "Hello!",
        type: "text",
      });
      const after = Date.now();

      const message = useChatStore.getState().messages[0];
      expect(message.timestamp).toBeGreaterThanOrEqual(before);
      expect(message.timestamp).toBeLessThanOrEqual(after);
    });

    it("filters profanity from text messages", () => {
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "What the hell is this?",
        type: "text",
      });

      const message = useChatStore.getState().messages[0];
      expect(message.content).toBe("What the **** is this?");
      expect(message.wasFiltered).toBe(true);
    });

    it("does not filter quick phrases", () => {
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "Good game!",
        type: "quick",
      });

      const message = useChatStore.getState().messages[0];
      expect(message.wasFiltered).toBe(false);
    });

    it("does not add messages when chat is disabled", () => {
      useChatStore.getState().setChatEnabled(false);
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "Hello!",
        type: "text",
      });

      expect(useChatStore.getState().messages).toHaveLength(0);
    });
  });

  describe("addSystemMessage", () => {
    it("adds a system message", () => {
      useChatStore.getState().addSystemMessage("Player 2 has joined the room");

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe("system");
      expect(messages[0].senderId).toBe("system");
      expect(messages[0].senderName).toBe("System");
    });

    it("does not filter system messages", () => {
      useChatStore.getState().addSystemMessage("hell of a game");

      const message = useChatStore.getState().messages[0];
      expect(message.content).toBe("hell of a game");
      expect(message.wasFiltered).toBe(false);
    });
  });

  describe("clearMessages", () => {
    it("removes all messages", () => {
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "Hello!",
        type: "text",
      });
      useChatStore.getState().addMessage({
        senderId: "user_2",
        senderName: "Player 2",
        content: "Hi!",
        type: "text",
      });

      useChatStore.getState().clearMessages();

      expect(useChatStore.getState().messages).toEqual([]);
    });
  });

  describe("setChatEnabled", () => {
    it("disables chat", () => {
      useChatStore.getState().setChatEnabled(false);
      expect(useChatStore.getState().isChatEnabled).toBe(false);
    });

    it("enables chat", () => {
      useChatStore.getState().setChatEnabled(false);
      useChatStore.getState().setChatEnabled(true);
      expect(useChatStore.getState().isChatEnabled).toBe(true);
    });
  });

  describe("quick phrases", () => {
    it("provides default quick phrases", () => {
      const phrases = useChatStore.getState().quickPhrases;
      expect(phrases.length).toBeGreaterThan(0);
      expect(phrases).toContain("Good game!");
      expect(phrases).toContain("Pong!");
      expect(phrases).toContain("Kong!");
    });
  });

  describe("message limit", () => {
    it("keeps only last 100 messages", () => {
      for (let i = 0; i < 110; i++) {
        useChatStore.getState().addMessage({
          senderId: "user_1",
          senderName: "Player 1",
          content: `Message ${i}`,
          type: "text",
        });
      }

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(100);
      expect(messages[0].content).toBe("Message 10");
      expect(messages[99].content).toBe("Message 109");
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      useChatStore.getState().addMessage({
        senderId: "user_1",
        senderName: "Player 1",
        content: "Hello!",
        type: "text",
      });
      useChatStore.getState().setChatEnabled(false);

      useChatStore.getState().reset();

      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.isChatEnabled).toBe(true);
    });
  });
});
