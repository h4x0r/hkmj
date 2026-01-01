"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import { createRoom, type RoomSettings } from "@/lib/room/service";
import { isValidRoomCode } from "@/lib/room/code";
import { LanguageSwitch } from "@/components/ui/LanguageSwitch";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";

const DEFAULT_SETTINGS: RoomSettings = {
  minFaan: 3,
  sessionType: "single",
  flowerTiles: false,
  voiceEnabled: true,
  turnTimer: 15,
};

export default function LobbyPage() {
  const router = useRouter();
  const t = useTranslations();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setRoom } = useRoomStore();

  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [roomCode, setRoomCode] = useState("");
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_SETTINGS);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated() || !user) {
    router.push("/");
    return null;
  }

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const room = createRoom(user.id, user.displayName, settings);
      setRoom(room);
      router.push(`/room/${room.code}`);
    } catch {
      setError("Failed to create room");
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!isValidRoomCode(roomCode)) {
      setError("Invalid room code. Must be 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // In production, this would validate with Supabase
    router.push(`/room/${roomCode.toUpperCase()}`);
  };

  const handleQuickPlay = () => {
    setIsLoading(true);
    // In production, this would use the matchmaking system
    router.push("/game/matchmaking");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4 flex items-center gap-2 sm:gap-4">
        <span className="text-neutral-400 text-sm">
          {t("auth.playingAs")} <span className="text-white font-medium">{user.displayName}</span>
        </span>
        <LanguageSwitch />
        <ThemeSwitch />
        <button onClick={logout} className="btn btn-ghost text-sm">
          {t("auth.signOut")}
        </button>
      </div>

      <div className="card w-full max-w-md">
        {mode === "menu" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center mb-6">{t("common.appName")}</h1>

            <button
              onClick={handleQuickPlay}
              className="btn btn-primary w-full py-3 text-lg"
              disabled={isLoading}
            >
              {t("lobby.quickPlay")}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("create")}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                {t("lobby.createRoom")}
              </button>
              <button
                onClick={() => setMode("join")}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                {t("lobby.joinRoom")}
              </button>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t("lobby.createRoom")}</h2>
              <button onClick={() => setMode("menu")} className="btn btn-ghost text-sm">
                {t("common.back")}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t("settings.minFaan")}
                </label>
                <select
                  className="input"
                  value={settings.minFaan}
                  onChange={(e) =>
                    setSettings({ ...settings, minFaan: Number(e.target.value) })
                  }
                >
                  <option value={0}>0 ({t("settings.anyWin")})</option>
                  <option value={1}>1 {t("settings.faan")}</option>
                  <option value={3}>3 {t("settings.faan")}</option>
                  <option value={5}>5 {t("settings.faan")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t("settings.sessionType")}
                </label>
                <select
                  className="input"
                  value={settings.sessionType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionType: e.target.value as RoomSettings["sessionType"],
                    })
                  }
                >
                  <option value="single">{t("settings.singleRound")}</option>
                  <option value="east_only">{t("settings.eastOnly")}</option>
                  <option value="full">{t("settings.fullGame")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  {t("settings.turnTimer")}
                </label>
                <select
                  className="input"
                  value={settings.turnTimer}
                  onChange={(e) =>
                    setSettings({ ...settings, turnTimer: Number(e.target.value) })
                  }
                >
                  <option value={10}>10s ({t("settings.fast")})</option>
                  <option value={15}>15s ({t("settings.normal")})</option>
                  <option value={30}>30s ({t("settings.relaxed")})</option>
                  <option value={60}>60s ({t("settings.casual")})</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, voiceEnabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">{t("settings.voiceChat")}</span>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleCreateRoom}
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? t("settings.creating") : t("lobby.createRoom")}
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t("lobby.joinRoom")}</h2>
              <button onClick={() => setMode("menu")} className="btn btn-ghost text-sm">
                {t("common.back")}
              </button>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">{t("lobby.roomCode")}</label>
              <input
                type="text"
                className="input text-center text-2xl tracking-widest uppercase"
                placeholder="ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleJoinRoom}
              className="btn btn-primary w-full"
              disabled={isLoading || roomCode.length !== 6}
            >
              {isLoading ? t("common.loading") : t("lobby.joinRoom")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
