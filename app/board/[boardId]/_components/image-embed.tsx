"use client";

import { LayerType, type ImageEmbedLayer } from "@/types/canvas";

interface ImageEmbedProps {
  id: string;
  layer: ImageEmbedLayer;
  onSelected: (id: string) => void;
  selectionColor?: string;
}

export const ImageEmbed = ({
  id,
  layer,
  onSelected,
  selectionColor,
}: ImageEmbedProps) => {
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
      <img
        src={layer.imageUrl}
        alt={layer.fileName}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
    </foreignObject>
  );
};