"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import { useChatStore } from "@/stores/chat";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const t = useTranslations();

  const SEAT_POSITIONS = [
    t("seats.east"),
    t("seats.south"),
    t("seats.west"),
    t("seats.north"),
  ];

  const { user, isAuthenticated } = useAuthStore();
  const { currentRoom, setPlayerReady, leaveRoom, isHost, allPlayersReady } = useRoomStore();
  const { messages, addMessage, addSystemMessage, quickPhrases } = useChatStore();

  const [chatInput, setChatInput] = useState("");
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Simulate room join (in production, use Supabase Realtime)
  useEffect(() => {
    if (user && !currentRoom) {
      addSystemMessage(`Welcome to room ${code}!`);
    }
  }, [user, currentRoom, code, addSystemMessage]);

  const handleLeave = () => {
    leaveRoom();
    router.push("/lobby");
  };

  const handleReady = () => {
    if (!user) return;
    const player = currentRoom?.players.find((p) => p.userId === user.id);
    setPlayerReady(user.id, !player?.isReady);
  };

  const handleStartGame = () => {
    if (!isHost(user?.id || "") || !allPlayersReady()) return;
    router.push(`/game/${code}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    addMessage({
      senderId: user.id,
      senderName: user.displayName,
      content: chatInput,
      type: "text",
    });
    setChatInput("");
  };

  const handleQuickPhrase = (phrase: string) => {
    if (!user) return;
    addMessage({
      senderId: user.id,
      senderName: user.displayName,
      content: phrase,
      type: "quick",
    });
    setShowQuickPhrases(false);
  };

  if (!isAuthenticated() || !user) return null;

  const getSessionTypeLabel = () => {
    switch (currentRoom?.settings.sessionType) {
      case "single": return t("settings.singleRound");
      case "east_only": return t("settings.eastOnly");
      default: return t("settings.fullGame");
    }
  };

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("room.room")}: {code}</h1>
          <p className="text-neutral-400 text-sm">
            {getSessionTypeLabel()} • {t("settings.minFaan")} {currentRoom?.settings.minFaan || 3} {t("settings.faan")}
          </p>
        </div>
        <button onClick={handleLeave} className="btn btn-ghost">
          {t("room.leaveRoom")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">{t("room.players")}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((seat) => {
                const player = currentRoom?.players.find((p) => p.seat === seat);
                return (
                  <div
                    key={seat}
                    className={`p-4 rounded-lg border ${
                      player
                        ? player.isReady
                          ? "border-green-500 bg-green-500/10"
                          : "border-neutral-700 bg-neutral-800"
                        : "border-dashed border-neutral-700"
                    }`}
                  >
                    <div className="text-sm text-neutral-400 mb-1">
                      {SEAT_POSITIONS[seat]}
                    </div>
                    {player ? (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {player.displayName}
                          {currentRoom?.hostId === player.userId && (
                            <span className="text-yellow-400 text-xs ml-2">({t("room.host")})</span>
                          )}
                        </span>
                        {player.isReady && (
                          <span className="text-green-400 text-sm">{t("room.ready")}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-500">{t("room.waitingForPlayer")}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button onClick={handleReady} className="btn btn-secondary flex-1">
                {currentRoom?.players.find((p) => p.userId === user.id)?.isReady
                  ? t("room.cancelReady")
                  : t("room.ready")}
              </button>
              {isHost(user.id) && (
                <button
                  onClick={handleStartGame}
                  className="btn btn-primary flex-1"
                  disabled={!allPlayersReady()}
                >
                  {t("room.startGame")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="card flex flex-col h-[500px]">
          <h2 className="text-lg font-semibold mb-4">{t("room.chat")}</h2>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm ${
                  msg.type === "system"
                    ? "text-neutral-500 italic"
                    : msg.senderId === user.id
                      ? "text-right"
                      : ""
                }`}
              >
                {msg.type !== "system" && (
                  <span className="text-neutral-400">{msg.senderName}: </span>
                )}
                <span
                  className={
                    msg.type === "quick" ? "text-yellow-400" : "text-white"
                  }
                >
                  {msg.content}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Phrases */}
          {showQuickPhrases && (
            <div className="absolute bottom-20 left-0 right-0 bg-neutral-900 border border-neutral-700 rounded-lg p-2 mx-4">
              <div className="grid grid-cols-2 gap-1">
                {quickPhrases.map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => handleQuickPhrase(phrase)}
                    className="text-sm text-left px-2 py-1 hover:bg-neutral-800 rounded"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowQuickPhrases(!showQuickPhrases)}
              className="btn btn-ghost px-3"
              title={t("room.quickPhrases")}
            >
              ⚡
            </button>
            <input
              type="text"
              className="input flex-1"
              placeholder={t("room.typeMessage")}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={200}
            />
            <button type="submit" className="btn btn-primary px-4">
              {t("common.send")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
