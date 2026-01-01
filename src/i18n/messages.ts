import type { Locale } from "./config";

const messageImports = {
  en: () => import("../../messages/en.json"),
  "zh-TW": () => import("../../messages/zh-TW.json"),
} as const;

export async function getMessages(locale: Locale) {
  const messages = await messageImports[locale]();
  return messages.default;
}

// Synchronous version for client-side (messages pre-loaded)
import enMessages from "../../messages/en.json";
import zhTWMessages from "../../messages/zh-TW.json";

export const messages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  "zh-TW": zhTWMessages,
};
