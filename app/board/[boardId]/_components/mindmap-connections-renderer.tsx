"use client";

import { memo } from "react";
import { useStorage } from "@/liveblocks.config";
import { LayerType } from "@/types/canvas";
import { MindMapConnection } from "./mindmap-connection";

interface MindMapConnectionsRendererProps {
  layerIds: readonly string[];
}

export const MindMapConnectionsRenderer = memo(({
  layerIds
}: MindMapConnectionsRendererProps) => {
  const layers = useStorage((root) => root.layers);
  
  if (!layerIds || !layers) {
    return null;
  }
  
  // Collect mindmap nodes
  const mindMapNodes = new Map();
  
  layerIds.forEach((layerId) => {
    const layer = layers.get(layerId);
    if (layer && layer.type === LayerType.MindMapNode) {
      mindMapNodes.set(layer.nodeId, { 
        id: layerId,
        type: layer.type,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        fill: layer.fill,
        stroke: layer.stroke,
        strokeWidth: layer.strokeWidth,
        value: layer.value,
        mindMapId: layer.mindMapId,
        nodeId: layer.nodeId,
        level: layer.level,
        parentId: layer.parentId,
        description: layer.description,
        isExpanded: layer.isExpanded
      });
    }
  });
  
  // Create connections between nodes that have parent-child relationships
  const connections: JSX.Element[] = [];
  
  mindMapNodes.forEach((node) => {
    if (node.parentId && mindMapNodes.has(node.parentId)) {
      const parentNode = mindMapNodes.get(node.parentId);
      connections.push(
        <MindMapConnection
          key={`connection-${parentNode.nodeId}-${node.nodeId}`}
          fromLayer={parentNode}
          toLayer={node}
          color="#64748b"
        />
      );
    }
  });
  
  return <>{connections}</>;
});

MindMapConnectionsRenderer.displayName = "MindMapConnectionsRenderer";