"use client";

import React, { memo } from "react";

import { colorToCSS } from "@/lib/utils";
import { useStorage } from "@/liveblocks.config";
import { LayerType } from "@/types/canvas";

import { Ellipse } from "./eliipse";
import { Note } from "./note";
import { Rectangle } from "./rectangle";
import { Text } from "./text";
import { Path } from "./path";
import { AdvancedShape } from "./advanced-shape";
import { MindMapNode } from "./mindmap-node";
import { ERDEntity } from "./erd-entity";
import { ERDRelationship } from "./erd-relationship";

type LayerPreviewProps = {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
};

export const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    const layer = useStorage((root) => root.layers.get(id));

    if (!layer) return null;

    switch (layer.type) {
      case LayerType.Path:
        return (
          <Path
            key={id}
            points={layer.points}
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCSS(layer.fill) : "#000"}
            stroke={selectionColor}
            strokeWidth={layer.strokeWidth || 16}
          />
        );
      case LayerType.Note:
        return (
          <Note
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Text:
        return (
          <Text
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Ellipse:
        return (
          <Ellipse
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
            layer={layer}
          />
        );
      case LayerType.MindMapNode:
        return (
          <MindMapNode
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.ERDEntity:
        return (
          <ERDEntity
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.ERDRelationship:
        return (
          <ERDRelationship
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      // Basic Shapes
      case LayerType.Diamond:
      case LayerType.Triangle:
      case LayerType.Hexagon:
      case LayerType.Star:
      case LayerType.Arrow:
      case LayerType.Parallelogram:
      case LayerType.Trapezoid:
      // Flowchart Shapes
      case LayerType.FlowStart:
      case LayerType.FlowProcess:
      case LayerType.FlowDecision:
      case LayerType.FlowDocument:
      case LayerType.FlowDatabase:
      case LayerType.FlowConnector:
      // UML Shapes
      case LayerType.UMLClass:
      case LayerType.UMLInterface:
      case LayerType.UMLActor:
      case LayerType.UMLUseCase:
      case LayerType.UMLComponent:
      case LayerType.UMLPackage:
      // Wireframe Components
      case LayerType.WireButton:
      case LayerType.WireInput:
      case LayerType.WireImage:
      case LayerType.WireText:
      case LayerType.WireCheckbox:
      case LayerType.WireRadio:
      case LayerType.WireDropdown:
        return (
          <AdvancedShape
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      default:
        console.warn("Unknown layer type");
        return null;
    }
  },
);

LayerPreview.displayName = "LayerPreview";
