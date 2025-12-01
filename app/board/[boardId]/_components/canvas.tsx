"use client";

import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import React, { useCallback, useMemo, useState, useEffect } from "react";

import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import {
  colorToCSS,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useOthersMapped,
  useSelf,
  useStorage,
} from "@/liveblocks.config";
import {
  type Camera,
  CanvasMode,
  type CanvasState,
  type Color,
  LayerType,
  type Point,
  type Side,
  type XYWH,
} from "@/types/canvas";

import { CursorsPresence } from "./cursors-presence";
import { DrawingTools } from "./drawing-tools";
import { FlowDiagram } from "./flow-diagram";
import { Info } from "./info";
import { LayerPreview } from "./layer-preview";
import { Participants } from "./participants";
import { Path } from "./path";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { ShapesToolbar } from "./shapes-toolbar";
import { Toolbar } from "./toolbar";

const MAX_LAYERS = 100;
const MULTISELECTION_THRESHOLD = 5;

type CanvasProps = {
  boardId: string;
};

export const Canvas = ({ boardId }: CanvasProps) => {
  const layerIds = useStorage((root) => root.layerIds);

  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeColor, setStrokeColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });
  const [showShapesToolbar, setShowShapesToolbar] = useState<boolean>(false);
  const [showFlowDiagram, setShowFlowDiagram] = useState<boolean>(false);
  const [isInserting, setIsInserting] = useState(false);
  const [insertionStart, setInsertionStart] = useState<Point | null>(null);
  const [currentPointer, setCurrentPointer] = useState<Point | null>(null);

  useDisableScrollBounce();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note
        | LayerType.Diamond
        | LayerType.Triangle
        | LayerType.Hexagon
        | LayerType.Star
        | LayerType.Arrow
        | LayerType.Parallelogram
        | LayerType.Trapezoid
        | LayerType.FlowStart
        | LayerType.FlowProcess
        | LayerType.FlowDecision
        | LayerType.FlowDocument
        | LayerType.FlowDatabase
        | LayerType.FlowConnector
        | LayerType.UMLClass
        | LayerType.UMLInterface
        | LayerType.UMLActor
        | LayerType.UMLUseCase
        | LayerType.UMLComponent
        | LayerType.UMLPackage
        | LayerType.WireButton
        | LayerType.WireInput
        | LayerType.WireImage
        | LayerType.WireText
        | LayerType.WireCheckbox
        | LayerType.WireRadio
        | LayerType.WireDropdown,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers");

      if (liveLayers.size >= MAX_LAYERS) return;

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      
      // Check if it's an advanced shape
      const isAdvancedShape = ![
        LayerType.Ellipse,
        LayerType.Rectangle,
        LayerType.Text,
        LayerType.Note,
      ].includes(layerType);

      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        ...(isAdvancedShape && { 
          shapeType: layerType,
          text: layerType === LayerType.UMLClass ? 'Class Name' :
                layerType === LayerType.UMLInterface ? 'Interface Name' :
                layerType === LayerType.UMLActor ? 'Actor' :
                layerType === LayerType.UMLUseCase ? 'Use Case' :
                layerType === LayerType.WireButton ? 'Button' :
                layerType === LayerType.WireInput ? 'Input Field' :
                layerType === LayerType.WireText ? 'Text Block' :
                layerType === LayerType.WireCheckbox ? 'Checkbox' : ''
        }),
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor, strokeColor, strokeWidth],
  );

  const insertLayerWithSize = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note
        | LayerType.Diamond
        | LayerType.Triangle
        | LayerType.Hexagon
        | LayerType.Star
        | LayerType.Arrow
        | LayerType.Parallelogram
        | LayerType.Trapezoid
        | LayerType.FlowStart
        | LayerType.FlowProcess
        | LayerType.FlowDecision
        | LayerType.FlowDocument
        | LayerType.FlowDatabase
        | LayerType.FlowConnector
        | LayerType.UMLClass
        | LayerType.UMLInterface
        | LayerType.UMLActor
        | LayerType.UMLUseCase
        | LayerType.UMLComponent
        | LayerType.UMLPackage
        | LayerType.WireButton
        | LayerType.WireInput
        | LayerType.WireImage
        | LayerType.WireText
        | LayerType.WireCheckbox
        | LayerType.WireRadio
        | LayerType.WireDropdown,
      position: Point,
      width: number,
      height: number,
    ) => {
      const liveLayers = storage.get("layers");

      if (liveLayers.size >= MAX_LAYERS) return;

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      
      // Check if it's an advanced shape
      const isAdvancedShape = ![
        LayerType.Ellipse,
        LayerType.Rectangle,
        LayerType.Text,
        LayerType.Note,
      ].includes(layerType);

      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: height,
        width: width,
        fill: { r: 255, g: 255, b: 255, a: 0.1 }, // Transparent fill
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        ...(isAdvancedShape && { 
          shapeType: layerType,
          text: layerType === LayerType.UMLClass ? 'Class Name' :
                layerType === LayerType.UMLInterface ? 'Interface Name' :
                layerType === LayerType.UMLActor ? 'Actor' :
                layerType === LayerType.UMLUseCase ? 'Use Case' :
                layerType === LayerType.WireButton ? 'Button' :
                layerType === LayerType.WireInput ? 'Input Field' :
                layerType === LayerType.WireText ? 'Text Block' :
                layerType === LayerType.WireCheckbox ? 'Checkbox' : ''
        }),
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [strokeColor, strokeWidth],
  );

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);

        if (layer)
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers").toImmutable();
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current,
      );

      setMyPresence({ selection: ids });
    },
    [layerIds],
  );

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (
      Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) >
      MULTISELECTION_THRESHOLD
    ) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      )
        return;

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode],
  );

  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const { pencilDraft } = self.presence;

      if (
        pencilDraft == null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }

      const id = nanoid();
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor, strokeColor, strokeWidth)),
      );

      const liveLayerIds = storage.get("layerIds");
      liveLayerIds.push(id);

      setMyPresence({ pencilDraft: null });
      setCanvasState({ mode: CanvasMode.Pencil });
    },
    [lastUsedColor, strokeColor, strokeWidth],
  );

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor, strokeColor, strokeWidth],
  );

  const eraseLayer = useMutation(
    ({ storage }, point: Point) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");

      // Find the topmost layer at this point
      const layers = liveLayers.entries();
      let layerToErase: string | null = null;

      // Check layers from back to front (reverse order of layerIds)
      for (let i = liveLayerIds.length - 1; i >= 0; i--) {
        const layerId = liveLayerIds.get(i);
        const layer = liveLayers.get(layerId);
        
        if (!layer) continue;

        // Check if point is within layer bounds
        const layerData = layer.toObject();
        if (
          point.x >= layerData.x &&
          point.x <= layerData.x + layerData.width &&
          point.y >= layerData.y &&
          point.y <= layerData.y + layerData.height
        ) {
          layerToErase = layerId;
          break;
        }
      }

      // Erase the found layer
      if (layerToErase) {
        liveLayers.delete(layerToErase);
        const index = liveLayerIds.indexOf(layerToErase);
        if (index !== -1) {
          liveLayerIds.delete(index);
        }
      }
    },
    [],
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return;

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) layer.update(bounds);
    },
    [canvasState],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();

      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting && isInserting) {
        setCurrentPointer(current);
      } else if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      } else if (canvasState.mode === CanvasMode.Eraser) {
        // Erase while dragging
        if (e.buttons === 1) {
          eraseLayer(current);
        }
        setCursorPosition(current);
      }

      setMyPresence({ cursor: current });
    },
    [
      startMultiSelection,
      updateSelectionNet,
      continueDrawing,
      canvasState,
      resizeSelectedLayer,
      camera,
      translateSelectedLayers,
      eraseLayer,
      isInserting,
    ],
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({
      cursor: null,
    });
    setCursorPosition(null);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        setIsInserting(true);
        setInsertionStart(point);
        setCurrentPointer(point);
        return;
      }

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      if (canvasState.mode === CanvasMode.Eraser) {
        eraseLayer(point);
        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing, eraseLayer],
  );

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting && isInserting && insertionStart && currentPointer) {
        // Calculate the size based on distance from start
        const width = Math.abs(currentPointer.x - insertionStart.x);
        const height = Math.abs(currentPointer.y - insertionStart.y);
        
        // Minimum size to prevent tiny shapes
        const finalWidth = Math.max(width, 50);
        const finalHeight = Math.max(height, 50);
        
        // Calculate position (top-left corner)
        const x = Math.min(insertionStart.x, currentPointer.x);
        const y = Math.min(insertionStart.y, currentPointer.y);
        
        insertLayerWithSize(canvasState.layerType, { x, y }, finalWidth, finalHeight);
        
        setIsInserting(false);
        setInsertionStart(null);
        setCurrentPointer(null);
        return;
      }

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      history.resume();
    },
    [
      setCanvasState,
      camera,
      canvasState,
      history,
      insertLayer,
      insertLayerWithSize,
      unselectLayers,
      insertPath,
      isInserting,
      insertionStart,
      currentPointer,
    ],
  );

  const selections = useOthersMapped((other) => other.presence.selection);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      )
        return;

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode],
  );

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

  const deleteLayers = useDeleteLayers();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey || e.altKey) history.redo();
            else history.undo();

            break;
          }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers, history]);

  useEffect(() => {
    if (canvasState.mode !== CanvasMode.Eraser) {
      setCursorPosition(null);
    }
  }, [canvasState.mode]);

  return (
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
        showShapesToolbar={showShapesToolbar}
        setShowShapesToolbar={setShowShapesToolbar}
        showFlowDiagram={showFlowDiagram}
        setShowFlowDiagram={setShowFlowDiagram}
      />
      
      {showShapesToolbar && (
        <ShapesToolbar
          canvasState={canvasState}
          setCanvasState={setCanvasState}
        />
      )}
      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
      
      {(canvasState.mode === CanvasMode.Pencil || 
        canvasState.mode === CanvasMode.Inserting) && (
        <DrawingTools
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          fillColor={lastUsedColor}
          onStrokeWidthChange={setStrokeWidth}
          onStrokeColorChange={setStrokeColor}
          onFillColorChange={setLastUsedColor}
        />
      )}

      <svg
        className={`h-[100vh] w-[100vw] ${
          canvasState.mode === CanvasMode.Pencil
            ? "cursor-crosshair"
            : canvasState.mode === CanvasMode.Eraser
            ? "cursor-none"
            : ""
        }`}
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          <CursorsPresence />
          {canvasState.mode === CanvasMode.Eraser && cursorPosition && (
            <g transform={`translate(${cursorPosition.x}, ${cursorPosition.y})`}>
              <circle
                cx="0"
                cy="0"
                r="12"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle
                cx="0"
                cy="0"
                r="2"
                fill="#ef4444"
              />
            </g>
          )}
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCSS(lastUsedColor)}
              strokeWidth={strokeWidth}
              x={0}
              y={0}
            />
          )}
          
          {/* Shape insertion preview */}
          {isInserting && insertionStart && currentPointer && canvasState.mode === CanvasMode.Inserting && (
            <g>
              {(() => {
                const width = Math.abs(currentPointer.x - insertionStart.x);
                const height = Math.abs(currentPointer.y - insertionStart.y);
                const x = Math.min(insertionStart.x, currentPointer.x);
                const y = Math.min(insertionStart.y, currentPointer.y);
                
                const strokeStyle = {
                  stroke: colorToCSS(strokeColor),
                  strokeWidth: strokeWidth,
                  fill: 'none',
                  strokeDasharray: '5,5',
                  opacity: 0.7,
                };

                if (canvasState.layerType === LayerType.Rectangle) {
                  return <rect x={x} y={y} width={width} height={height} {...strokeStyle} />;
                } else if (canvasState.layerType === LayerType.Ellipse) {
                  return <ellipse cx={x + width/2} cy={y + height/2} rx={width/2} ry={height/2} {...strokeStyle} />;
                } else {
                  // For advanced shapes, show as rectangle preview
                  return <rect x={x} y={y} width={width} height={height} {...strokeStyle} />;
                }
              })()}
            </g>
          )}
        </g>
      </svg>
      
      {/* React Flow Diagram */}
      <FlowDiagram 
        isOpen={showFlowDiagram} 
        onClose={() => setShowFlowDiagram(false)} 
      />
    </main>
  );
};
