"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/auth";
import { useGameStore } from "@/stores/game";
import { useChatStore } from "@/stores/chat";
import { useSettingsStore } from "@/stores/settings";
import { encodeTile } from "@/lib/game/tiles";
import { isWinningHand } from "@/lib/game/win";
import { calculateFaan } from "@/lib/game/faan";

// Dynamic import for 3D components (no SSR)
const GameBoard = dynamic(
  () => import("@/components/game/GameBoard").then((mod) => mod.GameBoard),
  { ssr: false }
);

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const t = useTranslations();

  const SEAT_NAMES = [
    t("seats.east"),
    t("seats.south"),
    t("seats.west"),
    t("seats.north"),
  ];

  const { user, isAuthenticated } = useAuthStore();
  const {
    status,
    players,
    currentPlayerIndex,
    winnerId,
    winningFaan,
    startGame,
    drawTile,
    discardTile,
    declareWin,
  } = useGameStore();
  const { messages, addMessage, addSystemMessage, quickPhrases } = useChatStore();
  const { turnTimer } = useSettingsStore();

  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(turnTimer);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user's player data
  const currentPlayer = players.find((p) => p.id === user?.id);
  const isMyTurn = currentPlayer && players[currentPlayerIndex]?.id === user?.id;
  const isBotTurn = status === "playing" && players[currentPlayerIndex]?.id.startsWith("bot_");
  const needsToDraw = isMyTurn && currentPlayer?.hand.length === 13;
  const needsToDiscard = isMyTurn && currentPlayer?.hand.length === 14;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Start game on mount (for demo purposes)
  useEffect(() => {
    if (user && status === "idle") {
      // Demo: Start with 4 players
      const demoPlayers = [
        { id: user.id, displayName: user.displayName, seat: 0 },
        { id: "bot_1", displayName: t("game.botEast"), seat: 1 },
        { id: "bot_2", displayName: t("game.botSouth"), seat: 2 },
        { id: "bot_3", displayName: t("game.botWest"), seat: 3 },
      ];
      startGame(`game_${code}`, demoPlayers, 0);
      addSystemMessage(t("game.gameStarted", { seat: t("seats.east") }));
    }
  }, [user, status, code, startGame, addSystemMessage, t]);

  // Check if current hand is winning
  const checkWin = useCallback(() => {
    if (!currentPlayer || !user) return false;

    const handCodes = currentPlayer.hand.map((tile) => encodeTile(tile));
    const exposedMeldCodes = currentPlayer.exposedMelds.map((meld) =>
      meld.tiles.map((tile) => encodeTile(tile))
    );

    if (isWinningHand(handCodes)) {
      const faanResult = calculateFaan(handCodes, exposedMeldCodes, {
        winType: "self_draw",
        seatWind: 1, // East
        roundWind: 1, // East
        isConcealed: currentPlayer.exposedMelds.length === 0,
        isLastTile: false,
        isKongRob: false,
      });

      declareWin(
        players.findIndex((p) => p.id === user.id),
        faanResult.total
      );
      addSystemMessage(`${user.displayName} wins with ${faanResult.total} faan!`);
      return true;
    }
    return false;
  }, [currentPlayer, user, players, declareWin, addSystemMessage]);

  // Bot AI: auto-play when it's bot's turn
  useEffect(() => {
    if (!isBotTurn || status !== "playing") return;

    // Clear any existing timeout
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
    }

    const botPlayer = players[currentPlayerIndex];
    const botNeedsToDraw = botPlayer.hand.length === 13;
    const botNeedsToDiscard = botPlayer.hand.length === 14;

    // Simulate thinking delay (0.5-1.5 seconds)
    const delay = 500 + Math.random() * 1000;

    botTimeoutRef.current = setTimeout(() => {
      if (botNeedsToDraw) {
        // Bot draws a tile
        const drawnTile = drawTile(currentPlayerIndex);
        if (drawnTile) {
          addSystemMessage(t("game.botDrewTile", { name: botPlayer.displayName }));
        }
      } else if (botNeedsToDiscard) {
        // Bot discards a random tile (simple AI)
        const randomIndex = Math.floor(Math.random() * botPlayer.hand.length);
        const tileToDiscard = botPlayer.hand[randomIndex];
        const success = discardTile(currentPlayerIndex, tileToDiscard.id);
        if (success) {
          addSystemMessage(t("game.botDiscardedTile", { name: botPlayer.displayName }));
        }
      }
    }, delay);

    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, [isBotTurn, currentPlayerIndex, players, status, drawTile, discardTile, addSystemMessage, t]);

  // Turn timer countdown
  useEffect(() => {
    // Reset timer when turn changes
    setTimeLeft(turnTimer);

    // Only run timer for human player's turn
    if (!isMyTurn || status !== "playing") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-discard if needed
          if (needsToDiscard && currentPlayer) {
            const randomIndex = Math.floor(Math.random() * currentPlayer.hand.length);
            const tileToDiscard = currentPlayer.hand[randomIndex];
            const playerIndex = players.findIndex((p) => p.id === user?.id);
            discardTile(playerIndex, tileToDiscard.id);
            addSystemMessage(t("game.timeoutDiscard"));
          }
          return turnTimer;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isMyTurn, status, currentPlayerIndex, turnTimer, needsToDiscard, currentPlayer, players, user, discardTile, addSystemMessage, t]);

  const handleDraw = useCallback(() => {
    if (!needsToDraw || !user) return;

    const playerIndex = players.findIndex((p) => p.id === user.id);
    const drawnTile = drawTile(playerIndex);

    if (drawnTile) {
      addSystemMessage(t("game.youDrewTile"));
      // Auto-check for win after drawing
      setTimeout(checkWin, 100);
    }
  }, [needsToDraw, user, players, drawTile, addSystemMessage, t, checkWin]);

  const handleDiscard = useCallback((tileId: string) => {
    if (!needsToDiscard || !user) return;

    const playerIndex = players.findIndex((p) => p.id === user.id);
    const success = discardTile(playerIndex, tileId);

    if (success) {
      setSelectedTileId(null);
      addSystemMessage(t("game.youDiscardedTile"));
    }
  }, [needsToDiscard, user, players, discardTile, addSystemMessage, t]);

  const handleTileSelect = useCallback((tileId: string) => {
    if (!isMyTurn) return;
    setSelectedTileId((prev) => (prev === tileId ? null : tileId));
  }, [isMyTurn]);

  // Double-click to discard
  const handleTileDoubleClick = useCallback((tileId: string) => {
    if (!needsToDiscard) return;
    handleDiscard(tileId);
  }, [needsToDiscard, handleDiscard]);

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

  // Game finished screen
  if (status === "finished") {
    const winner = players.find((p) => p.id === winnerId);
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="card text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">{t("game.gameOver")}</h1>
          <p className="text-xl text-neutral-300 mb-2">
            {t("game.winner")}: <span className="text-yellow-400">{winner?.displayName}</span>
          </p>
          <p className="text-lg text-neutral-400 mb-6">
            {winningFaan} {t("settings.faan")}
          </p>
          <button
            onClick={() => router.push("/lobby")}
            className="btn btn-primary w-full"
          >
            {t("game.returnToLobby")}
          </button>
        </div>
      </main>
    );
  }

  // Calculate timer color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 3) return "text-red-500";
    if (timeLeft <= 5) return "text-yellow-500";
    return "text-green-400";
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
        <div>
          <h1 className="font-bold">{t("room.room")}: {code}</h1>
          <p className="text-sm text-neutral-400">
            {t("game.turn", { seat: SEAT_NAMES[currentPlayerIndex] })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isMyTurn && (
            <>
              <span className={`font-mono text-2xl font-bold ${getTimerColor()}`}>
                {timeLeft}s
              </span>
              <span className="text-green-400 font-medium animate-pulse">
                {t("game.yourTurn")}
              </span>
            </>
          )}
          <button
            onClick={() => router.push("/lobby")}
            className="btn btn-ghost text-sm"
          >
            {t("game.leave")}
          </button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex">
        {/* 3D Board */}
        <div className="flex-1 bg-mahjong-green">
          <GameBoard
            currentUserId={user.id}
            selectedTileId={selectedTileId || undefined}
            onTileSelect={handleTileSelect}
            onTileDoubleClick={handleTileDoubleClick}
          />
        </div>

        {/* Side panel */}
        <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
          {/* Player info */}
          <div className="p-4 border-b border-neutral-800">
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-2 rounded text-sm ${
                    index === currentPlayerIndex
                      ? "bg-green-500/20 border border-green-500"
                      : "bg-neutral-800"
                  }`}
                >
                  <div className="text-neutral-400 text-xs">{SEAT_NAMES[index]}</div>
                  <div className="font-medium truncate">{player.displayName}</div>
                  <div className="text-xs text-neutral-500">
                    {player.hand.length} {t("game.tiles")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {isMyTurn && (
            <div className="p-4 border-b border-neutral-800 space-y-2">
              {needsToDraw && (
                <button onClick={handleDraw} className="btn btn-primary w-full">
                  {t("game.drawTile")}
                </button>
              )}
              {needsToDiscard && (
                <>
                  <button
                    onClick={() => selectedTileId && handleDiscard(selectedTileId)}
                    className="btn btn-secondary w-full"
                    disabled={!selectedTileId}
                  >
                    {t("game.discardSelected")}
                  </button>
                  <p className="text-xs text-neutral-500 text-center">
                    {t("game.doubleClickToDiscard")}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Chat */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">{t("room.chat")}</h3>
            <div className="flex-1 overflow-y-auto space-y-1 text-sm">
              {messages.slice(-20).map((msg) => (
                <div
                  key={msg.id}
                  className={msg.type === "system" ? "text-neutral-500 italic" : ""}
                >
                  {msg.type !== "system" && (
                    <span className="text-neutral-400">{msg.senderName}: </span>
                  )}
                  <span className={msg.type === "quick" ? "text-yellow-400" : ""}>
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick phrases popup */}
            {showQuickPhrases && (
              <div className="bg-neutral-800 rounded-lg p-2 mb-2 grid grid-cols-2 gap-1">
                {quickPhrases.slice(0, 8).map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => handleQuickPhrase(phrase)}
                    className="text-xs text-left px-2 py-1 hover:bg-neutral-700 rounded"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowQuickPhrases(!showQuickPhrases)}
                className="btn btn-ghost px-2"
              >
                ⚡
              </button>
              <input
                type="text"
                className="input flex-1 text-sm"
                placeholder={t("game.message")}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                maxLength={200}
              />
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
