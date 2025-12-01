import { MindMapData, MindMapNode } from '@/lib/ai-mindmap';
import { Layer, LayerType, Color, MindMapNodeLayer } from '@/types/canvas';
import { nanoid } from 'nanoid';

// Helper function to convert hex color to RGB Color object
function hexToRgb(hex: string): Color {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 59, g: 130, b: 246 }; // Default blue color
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

// Helper function to get a default color for mind map nodes
function getDefaultNodeColor(level: number): Color {
  const colors = [
    { r: 59, g: 130, b: 246 },   // Blue
    { r: 16, g: 185, b: 129 },   // Green
    { r: 245, g: 158, b: 11 },   // Amber
    { r: 239, g: 68, b: 68 },    // Red
    { r: 139, g: 92, b: 246 },   // Purple
    { r: 6, g: 182, b: 212 },    // Cyan
    { r: 132, g: 204, b: 22 },   // Lime
    { r: 249, g: 115, b: 22 }    // Orange
  ];
  return colors[level % colors.length];
}

export interface MindMapConversionResult {
  layers: Record<string, Layer>;
  connections: Array<{
    from: string;
    to: string;
    fromNode: MindMapNode;
    toNode: MindMapNode;
  }>;
  mindMapId: string;
}

export function convertMindMapToLayers(mindMapData: MindMapData): MindMapConversionResult {
  const layers: Record<string, Layer> = {};
  const mindMapId = nanoid();
  
  // Create a map for quick node lookup
  const nodeMap: Record<string, MindMapNode> = {};
  mindMapData.nodes.forEach(node => {
    nodeMap[node.id] = node;
  });

  // Convert each mind map node to a layer
  mindMapData.nodes.forEach((node) => {
    const layerId = nanoid();
    
    // Parse the color from the node or use a default
    const fillColor = node.color ? hexToRgb(node.color) : getDefaultNodeColor(node.level);
    
    const layer: MindMapNodeLayer = {
      type: LayerType.MindMapNode,
      x: node.x,
      y: node.y,
      height: node.height || 60,
      width: node.width || 120,
      fill: fillColor,
      stroke: { r: 0, g: 0, b: 0 },
      strokeWidth: 2,
      value: node.title,
      // Mind map specific properties
      mindMapId: mindMapId,
      nodeId: node.id,
      level: node.level,
      parentId: node.parentId,
      description: node.description,
      isExpanded: true
    };

    layers[layerId] = layer;
  });

  // Process connections
  const connectionsWithNodes = mindMapData.connections.map(connection => {
    const fromNode = nodeMap[connection.from];
    const toNode = nodeMap[connection.to];
    
    return {
      from: connection.from,
      to: connection.to,
      fromNode,
      toNode
    };
  }).filter(conn => conn.fromNode && conn.toNode);

  return {
    layers,
    connections: connectionsWithNodes,
    mindMapId
  };
}

// Helper function to find the center position of existing layers to place mindmap nearby
export function findOptimalMindMapPosition(existingLayers: Record<string, Layer>): { x: number; y: number } {
  const layers = Object.values(existingLayers);
  
  if (layers.length === 0) {
    // If no layers exist, place in the center
    return { x: 400, y: 300 };
  }

  // Find the bounds of existing content
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  layers.forEach(layer => {
    minX = Math.min(minX, layer.x);
    maxX = Math.max(maxX, layer.x + layer.width);
    minY = Math.min(minY, layer.y);
    maxY = Math.max(maxY, layer.y + layer.height);
  });

  // Place the mindmap to the right of existing content with some padding
  const padding = 200;
  return { 
    x: maxX + padding, 
    y: minY + (maxY - minY) / 2 
  };
}

// Helper function to adjust mindmap positions based on optimal placement
export function adjustMindMapPositions(
  layers: Record<string, Layer>, 
  targetCenter: { x: number; y: number }
): Record<string, Layer> {
  const mindMapLayers = Object.values(layers).filter(layer => layer.type === LayerType.MindMapNode) as MindMapNodeLayer[];
  
  if (mindMapLayers.length === 0) {
    return layers;
  }

  // Find current center of the mindmap
  let centerX = 0, centerY = 0;
  mindMapLayers.forEach(layer => {
    centerX += layer.x + layer.width / 2;
    centerY += layer.y + layer.height / 2;
  });
  centerX /= mindMapLayers.length;
  centerY /= mindMapLayers.length;

  // Calculate the offset to move to target center
  const offsetX = targetCenter.x - centerX;
  const offsetY = targetCenter.y - centerY;

  // Apply offset to all mindmap layers
  const adjustedLayers = { ...layers };
  Object.keys(adjustedLayers).forEach(layerId => {
    const layer = adjustedLayers[layerId];
    if (layer.type === LayerType.MindMapNode) {
      adjustedLayers[layerId] = {
        ...layer,
        x: layer.x + offsetX,
        y: layer.y + offsetY
      };
    }
  });

  return adjustedLayers;
}