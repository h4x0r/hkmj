import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hong Kong Mahjong",
  description: "Multiplayer Hong Kong Mahjong with 3D graphics and voice chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="bg-mahjong-green dark:bg-neutral-900 min-h-screen transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
