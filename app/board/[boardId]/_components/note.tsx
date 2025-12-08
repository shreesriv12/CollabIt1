import { Kalam } from "next/font/google";
import ContentEditable, {
  type ContentEditableEvent,
} from "react-contenteditable";

import { cn, colorToCSS, getContrastingTextColor } from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";
import type { NoteLayer } from "@/types/canvas";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.15;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize);
};

type NoteProps = {
  id: string;
  layer: NoteLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const Note = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: NoteProps) => {
  const { x, y, width, height, fill, value } = layer;

  const updateValue = useMutation(({ storage }, newValue: string) => {
    const liveLayers = storage.get("layers");

    liveLayers.get(id)?.set("value", newValue);
  }, []);

  const handleContentChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
  };

  const bgColor = fill ? colorToCSS(fill) : "#fef08a";
  const darkerColor = fill ? colorToCSS({
    r: Math.max(0, fill.r - 30),
    g: Math.max(0, fill.g - 30),
    b: Math.max(0, fill.b - 30),
  }) : "#d4af37";
  const lineColor = fill ? colorToCSS({
    r: Math.max(0, fill.r - 20),
    g: Math.max(0, fill.g - 20),
    b: Math.max(0, fill.b - 20),
  }) : "#e5d68a";

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
      className="drop-shadow-xl"
    >
      <div
        className="h-full w-full relative"
        style={{
          backgroundColor: bgColor,
          boxShadow: "3px 3px 10px rgba(0,0,0,0.15), inset 0 -3px 6px rgba(0,0,0,0.08)",
          borderRadius: "2px",
        }}
      >
        {/* Sticky note corner fold effect */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: 0,
            height: 0,
            borderLeft: "18px solid transparent",
            borderTop: `18px solid ${darkerColor}`,
            opacity: 0.4,
            borderTopRightRadius: "2px",
          }}
        />
        
        {/* Horizontal ruled lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: Math.floor(height / 30) }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${(i + 1) * 30}px`,
                left: 0,
                right: 0,
                height: "1px",
                backgroundColor: lineColor,
                opacity: 0.15,
              }}
            />
          ))}
        </div>

        {/* Content area */}
        <ContentEditable
          html={value || "Note"}
          onChange={handleContentChange}
          className={cn(
            "h-full w-full flex items-center justify-center text-center outline-none",
            font.className,
          )}
          style={{
            fontSize: calculateFontSize(width, height),
            color: fill ? getContrastingTextColor(fill) : "#1f2937",
            lineHeight: "1.6",
            padding: "16px 12px",
            textShadow: "0 1px 1px rgba(0,0,0,0.03)",
          }}
        />
        
        {/* Bottom shadow for depth */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "4px",
            background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))`,
            pointerEvents: "none",
          }}
        />
      </div>
    </foreignObject>
  );
};
