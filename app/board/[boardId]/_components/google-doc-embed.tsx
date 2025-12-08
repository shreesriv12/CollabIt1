"use client";

import { LayerType, type GoogleDocEmbedLayer } from "@/types/canvas";

interface GoogleDocEmbedProps {
  id: string;
  layer: GoogleDocEmbedLayer;
  onSelected: (id: string) => void;
  selectionColor?: string;
}

export const GoogleDocEmbed = ({
  id,
  layer,
  onSelected,
  selectionColor,
}: GoogleDocEmbedProps) => {
  return (
    <foreignObject
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelected(id);
      }}
      style={{
        outline: selectionColor ? `2px solid ${selectionColor}` : "none",
      }}
    >
      <iframe
        src={layer.embeddableLink}
        title={layer.title}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "4px",
        }}
        allowFullScreen
      />
    </foreignObject>
  );
};