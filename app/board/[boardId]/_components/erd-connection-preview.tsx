"use client";

import { memo } from "react";
import { useStorage } from "@/liveblocks.config";
import { Point } from "@/types/canvas";

interface ERDConnectionPreviewProps {
  fromLayerId: string;
  toPoint: Point;
}

export const ERDConnectionPreview = memo(({ fromLayerId, toPoint }: ERDConnectionPreviewProps) => {
  const fromLayer = useStorage((root) => root.layers.get(fromLayerId));

  if (!fromLayer) return null;

  const startPoint = {
    x: fromLayer.x + fromLayer.width / 2,
    y: fromLayer.y + fromLayer.height / 2,
  };

  return (
    <line
      x1={startPoint.x}
      y1={startPoint.y}
      x2={toPoint.x}
      y2={toPoint.y}
      stroke="#3b82f6"
      strokeWidth={2}
      strokeDasharray="5,5"
      opacity={0.7}
      pointerEvents="none"
    />
  );
});

ERDConnectionPreview.displayName = "ERDConnectionPreview";
