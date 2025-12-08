"use client";

import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";

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
import { ERDToolbar } from "./erd-toolbar";
import { Info } from "./info";
import { LayerPreview } from "./layer-preview";
import { Participants } from "./participants";
import { Path } from "./path";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { ShapesToolbar } from "./shapes-toolbar";
import { Toolbar } from "./toolbar";
import { AIMindmapModal } from "@/components/modals/ai-mindmap-modal";
import { useAIMindmapModal } from "@/store/use-ai-mindmap-modal";
import { convertMindMapToLayers, findOptimalMindMapPosition, adjustMindMapPositions } from "@/lib/mindmap-converter";
import { MindMapData } from "@/lib/ai-mindmap";
import { MindMapConnection } from "./mindmap-connection";
import { MindMapConnectionsRenderer } from "./mindmap-connections-renderer";
import { SchemaExportModal } from "@/components/modals/schema-export-modal";
import { ERDEntityModal } from "@/components/modals/erd-entity-modal";
import { useSchemaExportModal } from "@/store/use-schema-export-modal";
import { useERDEntityModal } from "@/store/use-erd-entity-modal";
import { ERDConnectionPreview } from "./erd-connection-preview";

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
  const [isHandPanning, setIsHandPanning] = useState(false);
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 255,
    g: 255,
    b: 255,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeColor, setStrokeColor] = useState<Color>({
    r: 255,
    g: 255,
    b: 255,
  });
  const [showShapesToolbar, setShowShapesToolbar] = useState<boolean>(false);
  const [showFlowDiagram, setShowFlowDiagram] = useState<boolean>(false);
  const [showERDDiagram, setShowERDDiagram] = useState<boolean>(false);
  const [isInserting, setIsInserting] = useState(false);
  const [insertionStart, setInsertionStart] = useState<Point | null>(null);
  const [currentPointer, setCurrentPointer] = useState<Point | null>(null);
  
  // ERD relationship state
  const [erdConnectingFrom, setErdConnectingFrom] = useState<string | null>(null);
  const [erdConnectionPreview, setErdConnectionPreview] = useState<Point | null>(null);

  // AI Mindmap modal state
  const { isOpen: isAIMindmapModalOpen, close: closeAIMindmapModal } = useAIMindmapModal();
  
  // ERD modal state
  const { isOpen: isSchemaExportModalOpen, open: openSchemaExportModal, close: closeSchemaExportModal } = useSchemaExportModal();
  const { isOpen: isERDEntityModalOpen } = useERDEntityModal();

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
        | LayerType.ERDEntity
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
        LayerType.ERDEntity,
      ].includes(layerType);

      let layer;

      if (layerType === LayerType.ERDEntity) {
        // Create ERD entity layer
        layer = new LiveObject({
          type: layerType,
          x: position.x,
          y: position.y,
          height: 120,
          width: 200,
          fill: { r: 59, g: 130, b: 246 },
          stroke: { r: 59, g: 130, b: 246 },
          strokeWidth: 2,
          entityData: {
            id: layerId,
            name: "NewEntity",
            tableName: "new_entity",
            fields: [
              {
                id: nanoid(),
                name: "id",
                type: "UUID",
                isRequired: true,
                isPrimaryKey: true,
                isUnique: true,
                isForeignKey: false,
                defaultValue: "",
                constraints: [],
              }
            ],
            position: { x: position.x, y: position.y },
          }
        });
      } else {
        // Create regular layer
        layer = new LiveObject({
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
      }

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
        | LayerType.ERDEntity
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
        LayerType.ERDEntity,
      ].includes(layerType);

      let layer;

      if (layerType === LayerType.ERDEntity) {
        // Create ERD entity layer
        layer = new LiveObject({
          type: layerType,
          x: position.x,
          y: position.y,
          height: Math.max(height, 120),
          width: Math.max(width, 200),
          fill: { r: 59, g: 130, b: 246 },
          stroke: { r: 59, g: 130, b: 246 },
          strokeWidth: 2,
          entityData: {
            id: layerId,
            name: "NewEntity",
            tableName: "new_entity", 
            fields: [
              {
                id: nanoid(),
                name: "id",
                type: "UUID",
                isRequired: true,
                isPrimaryKey: true,
                isUnique: true,
                isForeignKey: false,
                defaultValue: "",
                constraints: [],
              }
            ],
            position: { x: position.x, y: position.y },
          }
        });
      } else {
        // Create regular layer
        layer = new LiveObject({
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
      }

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [strokeColor, strokeWidth],
  );

  const createERDRelationship = useMutation(
    ({ storage }, fromEntityId: string, toEntityId: string, relationshipType: string = "one-to-many") => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");

      if (liveLayers.size >= MAX_LAYERS) return;

      const fromLayer = liveLayers.get(fromEntityId);
      const toLayer = liveLayers.get(toEntityId);

      if (!fromLayer || !toLayer) return;

      // Get entity positions
      const fromData = fromLayer.toObject();
      const toData = toLayer.toObject();

      // Calculate connection points (center of each entity)
      const fromPoint = {
        x: fromData.x + fromData.width / 2,
        y: fromData.y + fromData.height / 2,
      };

      const toPoint = {
        x: toData.x + toData.width / 2,
        y: toData.y + toData.height / 2,
      };

      // Create relationship layer
      const relationshipId = nanoid();
      const relationshipLayer = new LiveObject({
        type: LayerType.ERDRelationship,
        fromEntityId: fromEntityId,
        toEntityId: toEntityId,
        relationshipType: relationshipType,
        relationshipName: "",
        fromField: "id",
        toField: `${fromData.entityData?.tableName || 'entity'}_id`,
        points: [fromPoint, toPoint],
        stroke: { r: 100, g: 116, b: 139 },
        strokeWidth: 2,
        x: Math.min(fromPoint.x, toPoint.x),
        y: Math.min(fromPoint.y, toPoint.y),
        width: Math.abs(toPoint.x - fromPoint.x),
        height: Math.abs(toPoint.y - fromPoint.y),
      });

      liveLayerIds.push(relationshipId);
      liveLayers.set(relationshipId, relationshipLayer);
    },
    []
  );

  const insertImageLayer = useMutation(
    ({ storage, setMyPresence }, position: Point, width: number, height: number, image: { url: string; type: string; name?: string }) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) return;

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();

      const layer = new LiveObject({
        type: LayerType.WireImage,
        x: position.x,
        y: position.y,
        width,
        height,
        fill: { r: 255, g: 255, b: 255, a: 0.1 },
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        image, // store image metadata (url, type, name)
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [strokeColor, strokeWidth],
  );

  const insertMindMapLayers = useMutation(
    ({ storage, setMyPresence }, mindMapData: MindMapData) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");

      // Convert mindmap data to layers
      const conversion = convertMindMapToLayers(mindMapData);
      
      // Find optimal position for the mindmap
      const existingLayers: Record<string, any> = {};
      liveLayerIds.forEach((id) => {
        const layer = liveLayers.get(id);
        if (layer) {
          existingLayers[id] = layer.toObject();
        }
      });
      
      const targetCenter = findOptimalMindMapPosition(existingLayers);
      const adjustedLayers = adjustMindMapPositions(conversion.layers, targetCenter);
      
      // Insert all mindmap layers
      const newLayerIds: string[] = [];
      Object.entries(adjustedLayers).forEach(([layerId, layer]) => {
        const liveLayer = new LiveObject(layer);
        liveLayers.set(layerId, liveLayer);
        liveLayerIds.push(layerId);
        newLayerIds.push(layerId);
      });

      // Select all the new mindmap layers
      setMyPresence({ selection: newLayerIds }, { addToHistory: true });
    },
    [],
  );

  // Handler for AI mindmap generation
  const handleMindMapGenerate = useCallback((mindMapData: MindMapData) => {
    insertMindMapLayers(mindMapData);
  }, [insertMindMapLayers]);

  // Extract ERD entities and relationships from layers
  const erdEntities = useStorage((root) => {
    const entities: any[] = [];
    root.layerIds.forEach((id) => {
      const layer = root.layers.get(id);
      if (layer && layer.type === LayerType.ERDEntity && layer.entityData) {
        entities.push(layer.entityData);
      }
    });
    return entities;
  }) || [];

  const erdRelationships = useStorage((root) => {
    const relationships: any[] = [];
    root.layerIds.forEach((id) => {
      const layer = root.layers.get(id);
      if (layer && layer.type === LayerType.ERDRelationship) {
        relationships.push({
          id,
          fromEntityId: layer.fromEntityId,
          toEntityId: layer.toEntityId,
          type: layer.relationshipType || 'one-to-many',
          fromField: layer.fromField || 'id',
          toField: layer.toField || 'foreign_key',
          name: layer.relationshipName || '',
        });
      }
    });
    return relationships;
  }) || [];

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
    // If Ctrl/Cmd is pressed, use wheel to zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      setCamera((prev) => {
        const z = prev.zoom ?? 1;
        const factor = delta > 0 ? 1.08 : 1 / 1.08;
        const next = Math.max(0.25, Math.min(3, +(z * factor).toFixed(3)));
        // zoom towards cursor position
        const rect = (e.target as Element).getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const worldX = (cx - prev.x) / z;
        const worldY = (cy - prev.y) / z;
        return {
          x: Math.round(cx - worldX * next),
          y: Math.round(cy - worldY * next),
          zoom: next,
        };
      });
      return;
    }

    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
      zoom: camera.zoom ?? 1,
    }));
  }, []);

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      // Handle panning
      if (isPanning && panStart) {
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        setCamera((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        setPanStart({ x: e.clientX, y: e.clientY });
        return;
      }

      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting && isInserting) {
        setCurrentPointer(current);
      } else if (canvasState.mode === CanvasMode.ERDConnecting && erdConnectingFrom) {
        setErdConnectionPreview(current);
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
      isPanning,
      panStart,
      erdConnectingFrom,
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

      // Start panning with spacebar + left click or middle mouse button
      if (isSpacePressed || e.button === 1 || isHandPanning) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        return;
      }

      if (canvasState.mode === CanvasMode.Inserting) {
        setIsInserting(true);
        setInsertionStart(point);
        setCurrentPointer(point);
        return;
      }

      if (canvasState.mode === CanvasMode.ERDConnecting) {
        // Cancel connection on empty space click
        setErdConnectingFrom(null);
        setErdConnectionPreview(null);
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
    [camera, canvasState.mode, setCanvasState, startDrawing, eraseLayer, isSpacePressed],
  );

  const onPointerUp = useMutation(
    ({}, e) => {
      // Stop panning
      if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
        return;
      }

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
      isPanning,
    ],
  );

  const selections = useOthersMapped((other) => other.presence.selection);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence, storage }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      )
        return;

      // Handle ERD relationship creation
      if (canvasState.mode === CanvasMode.ERDConnecting) {
        e.stopPropagation();
        
        const liveLayers = storage.get("layers");
        const layer = liveLayers.get(layerId);
        
        // Only connect to ERD entities
        if (layer && layer.get("type") === LayerType.ERDEntity) {
          if (!erdConnectingFrom) {
            // Start connection from this entity
            setErdConnectingFrom(layerId);
          } else if (erdConnectingFrom !== layerId) {
            // Complete connection to this entity
            createERDRelationship(erdConnectingFrom, layerId, "one-to-many");
            setErdConnectingFrom(null);
            setErdConnectionPreview(null);
            setCanvasState({ mode: CanvasMode.None });
          }
        }
        return;
      }

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode, erdConnectingFrom, createERDRelationship],
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
        case " ":
          // Enable panning mode with spacebar
          if (!isSpacePressed) {
            e.preventDefault();
            setIsSpacePressed(true);
          }
          break;
        case "Escape":
          // Cancel ERD connection mode
          if (canvasState.mode === CanvasMode.ERDConnecting) {
            setErdConnectingFrom(null);
            setErdConnectionPreview(null);
            setCanvasState({ mode: CanvasMode.None });
          }
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey || e.altKey) history.redo();
            else history.undo();

            break;
          }
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === " ") {
        setIsSpacePressed(false);
        setIsPanning(false);
        setPanStart(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [deleteLayers, history, canvasState.mode, isSpacePressed]);

  useEffect(() => {
    if (canvasState.mode !== CanvasMode.Eraser) {
      setCursorPosition(null);
    }
  }, [canvasState.mode]);

  // Zoom handling
  useEffect(() => {
    // Ensure camera.zoom exists
    setCamera((c) => ({ x: c.x, y: c.y, zoom: c.zoom ?? 1 }));
  }, []);

  const zoomTo = (newZoom: number) => {
    setCamera((prev) => {
      const oldZoom = prev.zoom ?? 1;
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
      const worldX = (centerX - prev.x) / oldZoom;
      const worldY = (centerY - prev.y) / oldZoom;
      return {
        x: Math.round(centerX - worldX * newZoom),
        y: Math.round(centerY - worldY * newZoom),
        zoom: newZoom,
      };
    });
  };

  const zoomIn = () => {
    setCamera((prev) => {
      const z = prev.zoom ?? 1;
      const next = Math.min(3, +(z * 1.15).toFixed(3));
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
      const worldX = (centerX - prev.x) / z;
      const worldY = (centerY - prev.y) / z;
      return { x: Math.round(centerX - worldX * next), y: Math.round(centerY - worldY * next), zoom: next };
    });
  };

  const zoomOut = () => {
    setCamera((prev) => {
      const z = prev.zoom ?? 1;
      const next = Math.max(0.25, +(z / 1.15).toFixed(3));
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
      const worldX = (centerX - prev.x) / z;
      const worldY = (centerY - prev.y) / z;
      return { x: Math.round(centerX - worldX * next), y: Math.round(centerY - worldY * next), zoom: next };
    });
  };

  const resetZoom = () => zoomTo(1);

  const toggleHandPan = () => {
    setIsHandPanning((v) => {
      const next = !v;
      if (!next) {
        // turning off hand pan; also stop any active panning
        setIsPanning(false);
        setPanStart(null);
      }
      return next;
    });
  };

  // Prevent accidental browser back/forward navigation on horizontal swipes
  // by disabling overscroll and intercepting horizontal touch gestures.
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el || typeof window === "undefined") return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(e: TouchEvent) {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!tracking || !e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // If gesture is mostly horizontal and moving right, prevent default to avoid back navigation
      if (Math.abs(dx) > Math.abs(dy) && dx > 20) {
        try {
          e.preventDefault();
        } catch (err) {
          // ignore
        }
      }
    }

    function onTouchEnd() {
      tracking = false;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart as EventListener);
      el.removeEventListener("touchmove", onTouchMove as EventListener);
      el.removeEventListener("touchend", onTouchEnd as EventListener);
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className="h-full w-full relative bg-white dark:bg-neutral-900 touch-none overflow-hidden overscroll-none"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Dotted grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-pattern-light" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#cbd5e1" />
            </pattern>
            <pattern id="dot-pattern-dark" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#404040" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern-light)" className="dark:hidden" />
          <rect width="100%" height="100%" fill="url(#dot-pattern-dark)" className="hidden dark:block" />
        </svg>
      </div>
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
        showERDDiagram={showERDDiagram}
        setShowERDDiagram={setShowERDDiagram}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        isHandPanning={isHandPanning}
        toggleHandPan={toggleHandPan}
      />
      
      {showShapesToolbar && (
        <ShapesToolbar
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          onFileImport={async (file: File) => {
            try {
              // Upload to our Cloudinary route
              const form = new FormData();
              form.append('file', file);

              const resp = await fetch('/api/uploads/cloudinary', {
                method: 'POST',
                body: form,
              });

              const json = await resp.json();
              if (!resp.ok || !json?.url) {
                console.error('Upload failed', json);
                return;
              }

              const url: string = json.url;
              const resourceType: string = json.resource_type || '';

              const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
              const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
              const z = camera.zoom ?? 1;
              const position = {
                x: Math.round((vw / 2 - camera.x) / z),
                y: Math.round((vh / 2 - camera.y) / z),
              } as Point;

              if (resourceType === 'image' || file.type.startsWith('image/')) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  const nw = img.naturalWidth;
                  const nh = img.naturalHeight;
                  const maxW = 1200;
                  const maxH = 900;
                  const scale = Math.min(1, maxW / nw, maxH / nh);
                  const w = Math.round(nw * scale);
                  const h = Math.round(nh * scale);
                  insertImageLayer(position, w, h, { url, type: 'image', name: file.name });
                };
                img.onerror = () => {
                  // Fallback to default size
                  insertImageLayer(position, 480, 360, { url, type: 'image', name: file.name });
                };
                img.src = url;
              } else if (resourceType === 'raw' || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                const w = 640;
                const h = 820;
                insertImageLayer(position, w, h, { url, type: 'pdf', name: file.name });
              } else {
                // generic file preview as image placeholder
                insertImageLayer(position, 480, 360, { url, type: file.type || 'file', name: file.name });
              }
            } catch (err) {
              console.error('Failed to import file:', err);
            }
          }}
        />
      )}
      
      <ERDToolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        onExportSchema={openSchemaExportModal}
        isVisible={showERDDiagram}
      />
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
        className={`h-[100vh] w-[100vw] relative z-10 ${
          isPanning
            ? "cursor-hand-closed"
            : isHandPanning
            ? "cursor-hand"
            : isSpacePressed
            ? "cursor-hand"
            : canvasState.mode === CanvasMode.Pencil
            ? "cursor-pencil"
            : canvasState.mode === CanvasMode.Eraser
            ? "cursor-none"
            : canvasState.mode === CanvasMode.ERDConnecting
            ? "cursor-crosshair"
            : canvasState.mode === CanvasMode.Inserting
            ? "cursor-crosshair"
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
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom ?? 1})`,
            transformOrigin: '0 0',
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
          
          {/* Render mindmap connections */}
          <MindMapConnectionsRenderer layerIds={layerIds} />

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
          
          {/* ERD relationship connection preview */}
          {canvasState.mode === CanvasMode.ERDConnecting && erdConnectingFrom && erdConnectionPreview && (
            <ERDConnectionPreview 
              fromLayerId={erdConnectingFrom}
              toPoint={erdConnectionPreview}
            />
          )}
        </g>
      </svg>
      
      {/* React Flow Diagram */}
      <FlowDiagram 
        isOpen={showFlowDiagram} 
        onClose={() => setShowFlowDiagram(false)} 
      />
      
      {/* AI Mindmap Modal */}
      <AIMindmapModal
        isOpen={isAIMindmapModalOpen}
        onClose={closeAIMindmapModal}
        onGenerate={handleMindMapGenerate}
      />
      
      {/* ERD Modals */}
      <SchemaExportModal
        isOpen={isSchemaExportModalOpen}
        onClose={closeSchemaExportModal}
        entities={erdEntities}
        relationships={erdRelationships}
      />
      
      <ERDEntityModal />
    </main>
  );
};
