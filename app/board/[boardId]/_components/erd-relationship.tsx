"use client";

import { memo } from "react";
import { ERDRelationshipLayer } from "@/types/canvas";

interface ERDRelationshipProps {
  id: string;
  layer: ERDRelationshipLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const ERDRelationship = memo(({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: ERDRelationshipProps) => {
  const {
    points,
    stroke,
    strokeWidth,
    relationshipType,
    relationshipName
  } = layer;

  if (!points || points.length < 2) {
    return null;
  }

  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  
  // Calculate path for the relationship line
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  // Calculate midpoint for relationship label
  const midIndex = Math.floor(points.length / 2);
  const midPoint = points[midIndex] || startPoint;

  // Relationship symbols
  const getStartSymbol = () => {
    switch (relationshipType) {
      case 'one-to-one':
        return '1';
      case 'one-to-many':
        return '1';
      case 'many-to-many':
        return 'M';
      default:
        return '';
    }
  };

  const getEndSymbol = () => {
    switch (relationshipType) {
      case 'one-to-one':
        return '1';
      case 'one-to-many':
        return 'M';
      case 'many-to-many':
        return 'M';
      default:
        return '';
    }
  };

  const strokeColor = stroke ? `rgb(${stroke.r}, ${stroke.g}, ${stroke.b})` : '#64748b';

  return (
    <g>
      {/* Relationship line */}
      <path
        d={pathData}
        stroke={selectionColor || strokeColor}
        strokeWidth={strokeWidth || 2}
        fill="none"
        className="cursor-pointer"
        onPointerDown={(e) => onPointerDown(e, id)}
        markerEnd={`url(#arrowhead-${id})`}
      />

      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth={10}
          markerHeight={7}
          refX={9}
          refY={3.5}
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={selectionColor || strokeColor}
          />
        </marker>
      </defs>

      {/* Start symbol */}
      {getStartSymbol() && (
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={8}
          fill="white"
          stroke={strokeColor}
          strokeWidth={1}
        />
      )}
      {getStartSymbol() && (
        <text
          x={startPoint.x}
          y={startPoint.y + 4}
          textAnchor="middle"
          className="text-xs font-bold select-none"
          fill={strokeColor}
        >
          {getStartSymbol()}
        </text>
      )}

      {/* End symbol */}
      {getEndSymbol() && (
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={8}
          fill="white"
          stroke={strokeColor}
          strokeWidth={1}
        />
      )}
      {getEndSymbol() && (
        <text
          x={endPoint.x}
          y={endPoint.y + 4}
          textAnchor="middle"
          className="text-xs font-bold select-none"
          fill={strokeColor}
        >
          {getEndSymbol()}
        </text>
      )}

      {/* Relationship name/label */}
      {relationshipName && (
        <g>
          <rect
            x={midPoint.x - 30}
            y={midPoint.y - 8}
            width={60}
            height={16}
            fill="white"
            stroke={strokeColor}
            strokeWidth={1}
            rx={4}
          />
          <text
            x={midPoint.x}
            y={midPoint.y + 3}
            textAnchor="middle"
            className="text-xs select-none"
            fill={strokeColor}
          >
            {relationshipName}
          </text>
        </g>
      )}
    </g>
  );
});

ERDRelationship.displayName = "ERDRelationship";