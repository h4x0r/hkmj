"use client";

import { useEffect, useState } from "react";
import { getAllTileImagePaths } from "./Tile3D";

interface TilePreloaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Preloads all tile images before rendering children.
 * Shows fallback while loading.
 */
export function TilePreloader({ children, fallback }: TilePreloaderProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const paths = getAllTileImagePaths();
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= paths.length) {
        setLoaded(true);
      }
    };

    paths.forEach((path) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // Count errors too to not block forever
      img.src = path;
    });

    // Fallback timeout - don't block forever
    const timeout = setTimeout(() => setLoaded(true), 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!loaded) {
    return fallback || (
      <div className="w-full h-full flex items-center justify-center bg-mahjong-green">
        <div className="text-white text-lg animate-pulse">載入牌面中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
