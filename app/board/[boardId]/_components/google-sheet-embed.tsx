"use client";

import { LayerType, type GoogleSheetEmbedLayer } from "@/types/canvas";

interface GoogleSheetEmbedProps {
  id: string;
  layer: GoogleSheetEmbedLayer;
  onSelected: (id: string) => void;
  selectionColor?: string;
}

export const GoogleSheetEmbed = ({
  id,
  layer,
  onSelected,
  selectionColor,
}: GoogleSheetEmbedProps) => {
  const embedUrl = `https://docs.google.com/spreadsheets/d/${layer.spreadsheetId}/preview`;

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
        src={embedUrl}
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