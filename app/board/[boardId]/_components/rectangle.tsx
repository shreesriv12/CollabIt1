import React from "react";

import { colorToCSS } from "@/lib/utils";
import type { RectangleLayer } from "@/types/canvas";

type RectangleProps = {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const Rectangle = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: RectangleProps) => {
  const { x, y, width, height, fill, stroke, strokeWidth } = layer;

  return (
    <rect
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      width={width}
      height={height}
      strokeWidth={selectionColor ? 1 : (strokeWidth || 2)}
      fill={fill ? colorToCSS(fill) : "#CCC"}
      stroke={selectionColor || (stroke ? colorToCSS(stroke) : "#666")}
    />
  );
};
