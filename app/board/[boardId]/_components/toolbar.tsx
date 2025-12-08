import {
  Circle,
  Database,
  Eraser,
  MousePointer2,
  Pencil,
  Redo2,
  Shapes,
  Square,
  StickyNote,
  Type,
  Undo2,
  Workflow,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";

import { CanvasMode, LayerType, type CanvasState } from "@/types/canvas";
import { useAIMindmapModal } from "@/store/use-ai-mindmap-modal";

import { ToolButton } from "./tool-button";
import { Skeleton } from "@/components/ui/skeleton";

type ToolbarProps = {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showShapesToolbar: boolean;
  setShowShapesToolbar: (show: boolean) => void;
  showFlowDiagram: boolean;
  setShowFlowDiagram: (show: boolean) => void;
  showERDDiagram: boolean;
  setShowERDDiagram: (show: boolean) => void;
  // optional handlers for zoom and hand panning
  zoomIn?: () => void;
  zoomOut?: () => void;
  resetZoom?: () => void;
  isHandPanning?: boolean;
  toggleHandPan?: () => void;
};

export const Toolbar = ({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canRedo,
  canUndo,
  showShapesToolbar,
  setShowShapesToolbar,
  showFlowDiagram,
  setShowFlowDiagram,
  showERDDiagram,
  setShowERDDiagram,
  zoomIn,
  zoomOut,
  resetZoom,
  isHandPanning,
  toggleHandPan,
}: ToolbarProps) => {
  const { open: openAIMindmapModal } = useAIMindmapModal();

  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 z-20">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-2 flex gap-y-1.5 flex-col items-center shadow-lg border border-gray-200 dark:border-neutral-700">
        {zoomIn && zoomOut && resetZoom && toggleHandPan && (
          <>
            <ToolButton label="Zoom In" icon={ZoomIn} onClick={zoomIn} />
            <ToolButton label="Zoom Out" icon={ZoomOut} onClick={zoomOut} />
            <ToolButton label="Reset Zoom" icon={RefreshCw} onClick={resetZoom} />
            <ToolButton label="Hand" icon={MousePointer2} onClick={toggleHandPan} isActive={!!isHandPanning} />
            <div className="mt-1" />
          </>
        )}
        <ToolButton
          label="Select"
          icon={MousePointer2}
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing
          }
        />

        <ToolButton
          label="AI Mind Map"
          icon={Sparkles}
          onClick={openAIMindmapModal}
          isActive={false}
        />

        <ToolButton
          label="Text"
          icon={Type}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
          }
        />

        <ToolButton
          label="Sticky note"
          icon={StickyNote}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Note
          }
        />

        <ToolButton
          label="Rectangle"
          icon={Square}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Rectangle
          }
        />

        <ToolButton
          label="Ellipse"
          icon={Circle}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Ellipse
          }
        />

        <ToolButton
          label="Shapes"
          icon={Shapes}
          onClick={() => setShowShapesToolbar(!showShapesToolbar)}
          isActive={showShapesToolbar}
        />

        <ToolButton
          label="Flow Diagram"
          icon={Workflow}
          onClick={() => setShowFlowDiagram(!showFlowDiagram)}
          isActive={showFlowDiagram}
        />

        <ToolButton
          label="ERD Diagram"
          icon={Database}
          onClick={() => setShowERDDiagram(!showERDDiagram)}
          isActive={showERDDiagram}
        />

        <ToolButton
          label="Pen"
          icon={Pencil}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Pencil,
            })
          }
          isActive={canvasState.mode === CanvasMode.Pencil}
        />

        <ToolButton
          label="Eraser"
          icon={Eraser}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Eraser,
            })
          }
          isActive={canvasState.mode === CanvasMode.Eraser}
        />
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg p-2 flex flex-col gap-y-1.5 items-center shadow-lg border border-gray-200 dark:border-neutral-700">
        <ToolButton
          label="Undo"
          icon={Undo2}
          onClick={undo}
          isDisabled={!canUndo}
        />
        <ToolButton
          label="Redo"
          icon={Redo2}
          onClick={redo}
          isDisabled={!canRedo}
        />
      </div>
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div
      className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white dark:bg-neutral-800 h-[360px] w-[52px] shadow-lg rounded-lg border border-gray-200 dark:border-neutral-700 z-20 p-3"
      aria-hidden
    >
      <div className="flex flex-col gap-3 items-center">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="mt-2" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
};
