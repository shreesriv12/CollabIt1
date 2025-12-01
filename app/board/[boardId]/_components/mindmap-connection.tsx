"use client";

import { memo } from "react";
import { MindMapNodeLayer } from "@/types/canvas";

interface MindMapConnectionProps {
  fromLayer: MindMapNodeLayer;
  toLayer: MindMapNodeLayer;
  color?: string;
}

export const MindMapConnection = memo(({
  fromLayer,
  toLayer,
  color = "#64748b"
}: MindMapConnectionProps) => {
  // Calculate connection points (center of each node)
  const fromX = fromLayer.x + fromLayer.width / 2;
  const fromY = fromLayer.y + fromLayer.height / 2;
  const toX = toLayer.x + toLayer.width / 2;
  const toY = toLayer.y + toLayer.height / 2;

  // Create a curved path for better visual appeal
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  
  // Calculate control points for a smooth curve
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Adjust curve based on distance and direction
  const curvature = Math.min(distance * 0.3, 100);
  const controlX1 = fromX + (dx * 0.3);
  const controlY1 = fromY + (dy * 0.3);
  const controlX2 = toX - (dx * 0.3);
  const controlY2 = toY - (dy * 0.3);

  const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

  return (
    <g>
      {/* Main connection line */}
      <path
        d={pathData}
        stroke={color}
        strokeWidth={2}
        fill="none"
        opacity={0.7}
        className="pointer-events-none"
      />
      
      {/* Optional: Add arrow head at the end */}
      <marker
        id={`arrowhead-${fromLayer.nodeId}-${toLayer.nodeId}`}
        markerWidth={10}
        markerHeight={7}
        refX={9}
        refY={3.5}
        orient="auto"
        className="pointer-events-none"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill={color}
          opacity={0.7}
        />
      </marker>
      
      {/* Connection line with arrow */}
      <path
        d={pathData}
        stroke={color}
        strokeWidth={2}
        fill="none"
        opacity={0.7}
        markerEnd={`url(#arrowhead-${fromLayer.nodeId}-${toLayer.nodeId})`}
        className="pointer-events-none"
      />
    </g>
  );
});

MindMapConnection.displayName = "MindMapConnection";