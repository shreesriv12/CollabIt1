"use client";

import { 
  Box, 
  Database, 
  FileCode,
  Plus, 
  Link2 
} from "lucide-react";
import { CanvasMode, LayerType, CanvasState } from "@/types/canvas";
import { ToolButton } from "./tool-button";

interface ERDToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  onExportSchema: () => void;
  isVisible: boolean;
}

export const ERDToolbar = ({ 
  canvasState, 
  setCanvasState, 
  onExportSchema,
  isVisible 
}: ERDToolbarProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-2 left-[70px] bg-white rounded-md p-1.5 flex gap-x-1 items-center shadow-md">
      <div className="flex items-center gap-x-1">
        <span className="text-xs font-medium text-gray-600 px-2">ERD Tools:</span>
        
        <ToolButton
          label="Create Entity"
          icon={Plus}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.ERDEntity,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.ERDEntity
          }
        />

        <ToolButton
          label="Create Relationship"
          icon={Link2}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.ERDConnecting,
            })
          }
          isActive={canvasState.mode === CanvasMode.ERDConnecting}
        />

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolButton
          label="Export Schema"
          icon={FileCode}
          onClick={onExportSchema}
          isActive={false}
        />
      </div>
    </div>
  );
};