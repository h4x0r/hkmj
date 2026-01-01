"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import type { Mesh } from "three";
import type { TileWithId } from "@/lib/game/tiles";

interface Tile3DProps {
  tile: TileWithId;
  position: [number, number, number];
  rotation?: [number, number, number];
  isSelected?: boolean;
  isPlayable?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const TILE_WIDTH = 0.5;
const TILE_HEIGHT = 0.7;
const TILE_DEPTH = 0.3;

// Tile colors
const TILE_FACE_COLOR = "#f5f5dc"; // Beige/ivory
const TILE_BACK_COLOR = "#228B22"; // Forest green
const TILE_SELECTED_COLOR = "#fef08a"; // Yellow highlight

// Suit colors
const SUIT_COLORS: Record<string, string> = {
  bamboo: "#228B22",
  character: "#dc2626",
  dot: "#2563eb",
  wind: "#1f2937",
  dragon: "#1f2937",
};

const WIND_SYMBOLS: Record<number, string> = {
  1: "東",
  2: "南",
  3: "西",
  4: "北",
};

const DRAGON_SYMBOLS: Record<number, string> = {
  1: "中",
  2: "發",
  3: "白",
};

const DRAGON_COLORS: Record<number, string> = {
  1: "#dc2626", // Red dragon
  2: "#22c55e", // Green dragon
  3: "#374151", // White dragon (dark gray outline)
};

const SUIT_LETTERS: Record<string, string> = {
  bamboo: "B",
  character: "C",
  dot: "D",
};

export function Tile3D({
  tile,
  position,
  rotation = [0, 0, 0],
  isSelected = false,
  isPlayable = true,
  faceDown = false,
  onClick,
  onDoubleClick,
}: Tile3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const lastClickRef = useRef<number>(0);

  const handleClick = () => {
    if (!isPlayable) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickRef.current;

    if (timeSinceLastClick < 300) {
      // Double-click detected
      onDoubleClick?.();
      lastClickRef.current = 0; // Reset to prevent triple-click
    } else {
      // Single click
      onClick?.();
      lastClickRef.current = now;
    }
  };

  // Hover animation
  useFrame(() => {
    if (meshRef.current && isPlayable) {
      const targetY = position[1] + (hovered || isSelected ? 0.1 : 0);
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    }
  });

  const getTileDisplay = (): { main: string; sub?: string; color: string } => {
    const { suit, value } = tile;

    if (suit === "wind") {
      return { main: WIND_SYMBOLS[value] || "?", color: "#1f2937" };
    }
    if (suit === "dragon") {
      return { main: DRAGON_SYMBOLS[value] || "?", color: DRAGON_COLORS[value] || "#1f2937" };
    }

    return {
      main: `${value}`,
      sub: SUIT_LETTERS[suit],
      color: SUIT_COLORS[suit] || "#1f2937",
    };
  };

  const faceColor = isSelected ? TILE_SELECTED_COLOR : TILE_FACE_COLOR;
  const display = getTileDisplay();

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        ref={meshRef}
        args={[TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH]}
        radius={0.03}
        smoothness={4}
        onClick={handleClick}
        onPointerOver={() => isPlayable && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={faceDown ? TILE_BACK_COLOR : faceColor}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Tile face content using HTML overlay */}
      {!faceDown && (
        <Html
          position={[0, 0, TILE_DEPTH / 2 + 0.01]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "serif",
              userSelect: "none",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: display.color,
                lineHeight: 1,
              }}
            >
              {display.main}
            </span>
            {display.sub && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: display.color,
                  lineHeight: 1,
                }}
              >
                {display.sub}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
