import React from "react";

import { colorToCSS } from "@/lib/utils";
import type { EllipseLayer } from "@/types/canvas";

type EllipseProps = {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const Ellipse = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: EllipseProps) => {
  const { x, y, width, height, fill, stroke, strokeWidth } = layer;
  
  return (
    <ellipse
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      cx={width / 2}
      cy={height / 2}
      rx={width / 2}
      ry={height / 2}
      fill={fill ? colorToCSS(fill) : "#CCC"}
      stroke={selectionColor || (stroke ? colorToCSS(stroke) : "#666")}
      strokeWidth={selectionColor ? 1 : (strokeWidth || 2)}
    />
  );
};
