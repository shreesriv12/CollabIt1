"use client";

import { memo } from "react";
import { useMutation } from "convex/react";

import { cn, colorToCSS } from "@/lib/utils";
import { MindMapNodeLayer } from "@/types/canvas";
import { api } from "@/convex/_generated/api";

interface MindMapNodeProps {
  id: string;
  layer: MindMapNodeLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const MindMapNode = memo(({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: MindMapNodeProps) => {
  const updateLayer = useMutation(api.board.updateLayer);

  const {
    x,
    y,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    value,
    level,
    description
  } = layer;

  // Calculate styles based on level
  const levelStyles = {
    0: { // Central node
      fontSize: "16px",
      fontWeight: "700",
      borderRadius: "16px",
      padding: "12px",
    },
    1: { // First level branches
      fontSize: "14px", 
      fontWeight: "600",
      borderRadius: "12px",
      padding: "10px",
    },
    2: { // Second level
      fontSize: "13px",
      fontWeight: "500", 
      borderRadius: "8px",
      padding: "8px",
    },
    default: { // Third level and beyond
      fontSize: "12px",
      fontWeight: "400",
      borderRadius: "6px", 
      padding: "6px",
    }
  };

  const currentStyle = levelStyles[level as keyof typeof levelStyles] || levelStyles.default;

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
      }}
      className="drop-shadow-md"
    >
      <div
        className={cn(
          "h-full w-full flex flex-col items-center justify-center text-center border-2 transition-all",
          "hover:drop-shadow-lg cursor-move"
        )}
        style={{
          backgroundColor: colorToCSS(fill),
          borderColor: stroke ? colorToCSS(stroke) : "transparent",
          borderWidth: strokeWidth || 2,
          borderRadius: currentStyle.borderRadius,
          fontSize: currentStyle.fontSize,
          fontWeight: currentStyle.fontWeight,
          padding: currentStyle.padding,
        }}
      >
        <div 
          className="text-white font-medium leading-tight break-words max-w-full overflow-hidden"
          style={{
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
          }}
        >
          {value || "Mind Map Node"}
        </div>
        
        {description && level === 0 && (
          <div 
            className="text-xs text-white/90 mt-1 leading-tight break-words max-w-full overflow-hidden"
            style={{
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
            }}
          >
            {description.length > 50 ? `${description.substring(0, 50)}...` : description}
          </div>
        )}

        {/* Level indicator for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 right-0 text-xs bg-black/20 text-white rounded-bl px-1">
            L{level}
          </div>
        )}
      </div>
    </foreignObject>
  );
});

MindMapNode.displayName = "MindMapNode";