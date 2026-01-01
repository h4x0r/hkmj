"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Tile3D, getAllTileImagePaths } from "./Tile3D";
import { useGameStore } from "@/stores/game";
import type { TileWithId } from "@/lib/game/tiles";

// Preload all tile images on module load
if (typeof window !== "undefined") {
  getAllTileImagePaths().forEach((path) => {
    const img = new Image();
    img.src = path;
  });
}

interface PlayerHandProps {
  tiles: TileWithId[];
  position: [number, number, number];
  rotation: [number, number, number];
  isCurrentPlayer: boolean;
  faceDown?: boolean;
  selectedTileId?: string;
  onTileClick?: (tileId: string) => void;
  onTileDoubleClick?: (tileId: string) => void;
}

function PlayerHand({
  tiles,
  position,
  rotation,
  isCurrentPlayer,
  faceDown = false,
  selectedTileId,
  onTileClick,
  onTileDoubleClick,
}: PlayerHandProps) {
  const tileSpacing = 0.55;
  const startX = -((tiles.length - 1) * tileSpacing) / 2;

  return (
    <group position={position} rotation={rotation}>
      {tiles.map((tile, index) => (
        <Tile3D
          key={tile.id}
          tile={tile}
          position={[startX + index * tileSpacing, 0, 0]}
          isSelected={selectedTileId === tile.id}
          isPlayable={isCurrentPlayer}
          faceDown={faceDown}
          onClick={() => onTileClick?.(tile.id)}
          onDoubleClick={() => onTileDoubleClick?.(tile.id)}
        />
      ))}
    </group>
  );
}

interface DiscardPileProps {
  tiles: TileWithId[];
}

function DiscardPile({ tiles }: DiscardPileProps) {
  const tilesPerRow = 6;
  const tileSpacing = 0.55;

  return (
    <group position={[0, 0.1, 0]}>
      {tiles.map((tile, index) => {
        const row = Math.floor(index / tilesPerRow);
        const col = index % tilesPerRow;
        const startX = -((tilesPerRow - 1) * tileSpacing) / 2;

        return (
          <Tile3D
            key={tile.id}
            tile={tile}
            position={[startX + col * tileSpacing, 0, row * 0.8]}
            rotation={[-Math.PI / 2, 0, 0]}
            isPlayable={false}
          />
        );
      })}
    </group>
  );
}


interface GameBoardProps {
  currentUserId: string;
  selectedTileId?: string;
  onTileSelect?: (tileId: string) => void;
  onTileDoubleClick?: (tileId: string) => void;
  onCanvasDoubleClick?: () => void;
}

export function GameBoard({
  currentUserId,
  selectedTileId,
  onTileSelect,
  onTileDoubleClick,
  onCanvasDoubleClick,
}: GameBoardProps) {
  const { players, discardPile, currentPlayerIndex } = useGameStore();
  const lastClickRef = useRef<number>(0);

  // Handle canvas double-click for drawing tiles
  const handleCanvasClick = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickRef.current;

    if (timeSinceLastClick < 300) {
      // Double-click detected
      onCanvasDoubleClick?.();
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
    }
  };

  // Find the current user's seat index
  const userSeatIndex = players.findIndex((p) => p.id === currentUserId);

  // Calculate relative positions (user always at bottom)
  const getRelativeIndex = (absoluteIndex: number): number => {
    return (absoluteIndex - userSeatIndex + 4) % 4;
  };

  // Position configurations for each relative seat
  const seatPositions: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
  }> = [
    // Bottom (user)
    { position: [0, 0.5, 4], rotation: [0, 0, 0] },
    // Right
    { position: [5, 0.5, 0], rotation: [0, -Math.PI / 2, 0] },
    // Top
    { position: [0, 0.5, -4], rotation: [0, Math.PI, 0] },
    // Left
    { position: [-5, 0.5, 0], rotation: [0, Math.PI / 2, 0] },
  ];

  return (
    <div className="w-full h-full">
      <Canvas shadows onPointerMissed={handleCanvasClick}>
        <PerspectiveCamera makeDefault position={[0, 8, 10]} fov={50} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={8}
          maxDistance={15}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="studio" />

        {/* Table surface - clickable for draw action */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, 0]}
          receiveShadow
          onClick={handleCanvasClick}
        >
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#1a472a" roughness={0.8} />
        </mesh>

        {/* Discard pile in center */}
        <DiscardPile tiles={discardPile} />

        {/* Player hands */}
        {players.map((player, absoluteIndex) => {
          const relativeIndex = getRelativeIndex(absoluteIndex);
          const { position, rotation } = seatPositions[relativeIndex];
          const isUser = player.id === currentUserId;
          const isCurrentTurn = absoluteIndex === currentPlayerIndex;

          return (
            <PlayerHand
              key={player.id}
              tiles={player.hand}
              position={position}
              rotation={rotation}
              isCurrentPlayer={isUser && isCurrentTurn}
              faceDown={!isUser}
              selectedTileId={isUser ? selectedTileId : undefined}
              onTileClick={isUser && isCurrentTurn ? onTileSelect : undefined}
              onTileDoubleClick={isUser && isCurrentTurn ? onTileDoubleClick : undefined}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
