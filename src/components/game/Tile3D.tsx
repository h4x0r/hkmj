"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import type { Group } from "three";
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

// Map suit + value to FluffyStuff SVG file names
export const getTileImagePath = (suit: string, value: number): string => {
  switch (suit) {
    case "dot":
      return `/tiles/Pin${value}.svg`;
    case "bamboo":
      return `/tiles/Sou${value}.svg`;
    case "character":
      return `/tiles/Man${value}.svg`;
    case "wind":
      // 1=East(Ton), 2=South(Nan), 3=West(Shaa), 4=North(Pei)
      const windNames = ["", "Ton", "Nan", "Shaa", "Pei"];
      return `/tiles/${windNames[value]}.svg`;
    case "dragon":
      // 1=Red(Chun), 2=Green(Hatsu), 3=White(Haku)
      const dragonNames = ["", "Chun", "Hatsu", "Haku"];
      return `/tiles/${dragonNames[value]}.svg`;
    default:
      return `/tiles/Back.svg`;
  }
};

// Get all tile image paths for preloading
export const getAllTileImagePaths = (): string[] => {
  const paths: string[] = [];
  // Dots (Pin), Bamboo (Sou), Characters (Man)
  for (let i = 1; i <= 9; i++) {
    paths.push(`/tiles/Pin${i}.svg`);
    paths.push(`/tiles/Sou${i}.svg`);
    paths.push(`/tiles/Man${i}.svg`);
  }
  // Winds
  paths.push("/tiles/Ton.svg", "/tiles/Nan.svg", "/tiles/Shaa.svg", "/tiles/Pei.svg");
  // Dragons
  paths.push("/tiles/Chun.svg", "/tiles/Hatsu.svg", "/tiles/Haku.svg");
  // Back
  paths.push("/tiles/Back.svg");
  return paths;
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
  const groupRef = useRef<Group>(null);
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

  // Hover animation - animate the entire group so tile face moves with tile
  useFrame(() => {
    if (groupRef.current && isPlayable) {
      const targetY = position[1] + (hovered || isSelected ? 0.1 : 0);
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  const faceColor = isSelected ? TILE_SELECTED_COLOR : TILE_FACE_COLOR;

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      rotation={rotation}
    >
      <RoundedBox
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

      {/* Tile face image - only show for face-up tiles */}
      {!faceDown && (
        <Html
          position={[0, 0, TILE_DEPTH / 2 + 0.01]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: "40px",
              height: "56px",
              backgroundColor: "#f5f5dc",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={getTileImagePath(tile.suit, tile.value)}
              alt={`${tile.suit} ${tile.value}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                userSelect: "none",
                filter: isSelected ? "brightness(1.1)" : "none",
              }}
              draggable={false}
            />
          </div>
        </Html>
      )}
    </group>
  );
}
