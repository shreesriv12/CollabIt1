"use client";

import { memo } from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import type { Color } from "@/types/canvas";

import { ColorPicker } from "./color-picker";

type DrawingToolsProps = {
  strokeWidth: number;
  strokeColor: Color;
  fillColor: Color;
  onStrokeWidthChange: (width: number) => void;
  onStrokeColorChange: (color: Color) => void;
  onFillColorChange: (color: Color) => void;
};

export const DrawingTools = memo(
  ({
    strokeWidth,
    strokeColor,
    fillColor,
    onStrokeWidthChange,
    onStrokeColorChange,
    onFillColorChange,
  }: DrawingToolsProps) => {
    const increaseStrokeWidth = () => {
      const newWidth = Math.min(strokeWidth + 1, 20);
      onStrokeWidthChange(newWidth);
    };

    const decreaseStrokeWidth = () => {
      const newWidth = Math.max(strokeWidth - 1, 1);
      onStrokeWidthChange(newWidth);
    };

    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-neutral-700 flex items-center gap-4 z-30">
        {/* Stroke Color Section */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">Stroke</span>
          <ColorPicker onChange={onStrokeColorChange} />
        </div>

        {/* Stroke Width Section */}
        <div className="flex flex-col items-center gap-2 px-3 border-x border-neutral-200">
          <span className="text-xs font-medium text-neutral-600">Width</span>
          <div className="flex items-center gap-2">
            <Hint label="Decrease width">
              <Button
                onClick={decreaseStrokeWidth}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={strokeWidth <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
            </Hint>
            
            <div className="flex items-center justify-center w-12">
              <span className="text-sm font-medium">{strokeWidth}</span>
            </div>
            
            <Hint label="Increase width">
              <Button
                onClick={increaseStrokeWidth}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                disabled={strokeWidth >= 20}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </Hint>
          </div>
        </div>

        {/* Fill Color Section */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">Fill</span>
          <ColorPicker onChange={onFillColorChange} />
        </div>
      </div>
    );
  },
);

DrawingTools.displayName = "DrawingTools";