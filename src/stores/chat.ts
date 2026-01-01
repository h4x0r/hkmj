import { create } from "zustand";
import { filterProfanity } from "@/lib/chat/filter";

export type MessageType = "text" | "quick" | "system";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  timestamp: number;
  wasFiltered: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isChatEnabled: boolean;
  quickPhrases: string[];

  // Actions
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp" | "wasFiltered">) => void;
  addSystemMessage: (content: string) => void;
  clearMessages: () => void;
  setChatEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const MAX_MESSAGES = 100;

const DEFAULT_QUICK_PHRASES = [
  "Good game!",
  "Pong!",
  "Kong!",
  "Chow!",
  "Mahjong!",
  "Nice!",
  "Wait please",
  "Ready!",
  "Thanks!",
  "Sorry!",
  "Good luck!",
  "Well played!",
];

function generateMessageId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

const initialState = {
  messages: [] as ChatMessage[],
  isChatEnabled: true,
  quickPhrases: DEFAULT_QUICK_PHRASES,
};

export const useChatStore = create<ChatState>()((set, get) => ({
  ...initialState,

  addMessage: (messageInput) => {
    const { isChatEnabled, messages } = get();

    if (!isChatEnabled) {
      return;
    }

    let finalContent = messageInput.content;
    let wasFiltered = false;

    // Only filter text messages, not quick phrases
    if (messageInput.type === "text") {
      const filterResult = filterProfanity(messageInput.content);
      finalContent = filterResult.filtered;
      wasFiltered = filterResult.wasFiltered;
    }

    const newMessage: ChatMessage = {
      id: generateMessageId(),
      senderId: messageInput.senderId,
      senderName: messageInput.senderName,
      content: finalContent,
      type: messageInput.type,
      timestamp: Date.now(),
      wasFiltered,
    };

    // Keep only last MAX_MESSAGES
    const newMessages = [...messages, newMessage].slice(-MAX_MESSAGES);

    set({ messages: newMessages });
  },

  addSystemMessage: (content) => {
    const { messages } = get();

    const newMessage: ChatMessage = {
      id: generateMessageId(),
      senderId: "system",
      senderName: "System",
      content,
      type: "system",
      timestamp: Date.now(),
      wasFiltered: false,
    };

    const newMessages = [...messages, newMessage].slice(-MAX_MESSAGES);
    set({ messages: newMessages });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setChatEnabled: (enabled) => {
    set({ isChatEnabled: enabled });
  },

  reset: () => {
    set(initialState);
  },
}));
