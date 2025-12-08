"use client";

import React, { useEffect, useState } from "react";
import { colorToCSS } from "@/lib/utils";
import type { AdvancedShapeLayer } from "@/types/canvas";
import { LayerType } from "@/types/canvas";

type AdvancedShapeProps = {
  id: string;
  layer: AdvancedShapeLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const AdvancedShape = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: AdvancedShapeProps) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;
    
    setIsDarkTheme(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (isDark: boolean) => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    applyTheme(newTheme);
  };

  const { x, y, width, height, fill, stroke, strokeWidth, type, value } = layer;

  const fillColor = fill ? colorToCSS(fill) : "#CCC";
  const strokeColor = selectionColor || (stroke ? colorToCSS(stroke) : "#666");
  const strokeW = selectionColor ? 2 : (strokeWidth || 2);

  const renderShape = () => {
    switch (type) {
      case LayerType.Diamond:
        return (
          <polygon
            points={`${width/2},0 ${width},${height/2} ${width/2},${height} 0,${height/2}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.Triangle:
        return (
          <polygon
            points={`${width/2},0 ${width},${height} 0,${height}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.Hexagon:
        return (
          <polygon
            points={`${width*0.25},0 ${width*0.75},0 ${width},${height/2} ${width*0.75},${height} ${width*0.25},${height} 0,${height/2}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.Star:
        const outerRadius = Math.min(width, height) / 2;
        const innerRadius = outerRadius * 0.4;
        const centerX = width / 2;
        const centerY = height / 2;
        let starPoints = "";
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          starPoints += `${x},${y} `;
        }
        return (
          <polygon
            points={starPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.Arrow:
        return (
          <polygon
            points={`0,${height*0.3} ${width*0.7},${height*0.3} ${width*0.7},0 ${width},${height/2} ${width*0.7},${height} ${width*0.7},${height*0.7} 0,${height*0.7}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.Parallelogram:
        return (
          <polygon
            points={`${width*0.2},0 ${width},0 ${width*0.8},${height} 0,${height}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.Trapezoid:
        return (
          <polygon
            points={`${width*0.2},0 ${width*0.8},0 ${width},${height} 0,${height}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      // Flowchart shapes
      case LayerType.FlowStart:
        return (
          <ellipse
            cx={width/2}
            cy={height/2}
            rx={width/2}
            ry={height/2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.FlowProcess:
        return (
          <rect
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            rx={5}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.FlowDecision:
        return (
          <polygon
            points={`${width/2},0 ${width},${height/2} ${width/2},${height} 0,${height/2}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.FlowDocument:
        return (
          <path
            d={`M 0,0 L ${width},0 L ${width},${height*0.8} Q ${width*0.75},${height} ${width*0.5},${height*0.8} Q ${width*0.25},${height} 0,${height*0.8} Z`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      case LayerType.FlowDatabase:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <ellipse
              cx={width/2}
              cy={height*0.15}
              rx={width/2}
              ry={height*0.15}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <rect
              x={0}
              y={height*0.15}
              width={width}
              height={height*0.7}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <ellipse
              cx={width/2}
              cy={height*0.85}
              rx={width/2}
              ry={height*0.15}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
          </g>
        );

      case LayerType.FlowConnector:
        return (
          <circle
            cx={width/2}
            cy={height/2}
            r={Math.min(width, height)/2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      // UML shapes
      case LayerType.UMLClass:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <rect
              width={width}
              height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              rx={2}
            />
            <line
              x1={0}
              y1={height*0.3}
              x2={width}
              y2={height*0.3}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <line
              x1={0}
              y1={height*0.6}
              x2={width}
              y2={height*0.6}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
          </g>
        );

      case LayerType.UMLInterface:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <circle
              cx={width/2}
              cy={height*0.2}
              r={height*0.1}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <rect
              x={0}
              y={height*0.3}
              width={width}
              height={height*0.7}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              rx={2}
            />
          </g>
        );

      case LayerType.UMLActor:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <circle
              cx={width/2}
              cy={height*0.15}
              r={height*0.1}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <line
              x1={width/2}
              y1={height*0.25}
              x2={width/2}
              y2={height*0.75}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <line
              x1={width*0.2}
              y1={height*0.4}
              x2={width*0.8}
              y2={height*0.4}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <line
              x1={width/2}
              y1={height*0.75}
              x2={width*0.3}
              y2={height*0.9}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            <line
              x1={width/2}
              y1={height*0.75}
              x2={width*0.7}
              y2={height*0.9}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
          </g>
        );

      case LayerType.UMLUseCase:
        return (
          <ellipse
            cx={width/2}
            cy={height/2}
            rx={width/2}
            ry={height/2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
          />
        );

      // Wireframe components
      case LayerType.WireButton:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <rect
              width={width}
              height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              rx={8}
            />
            <rect
              x={width*0.1}
              y={height*0.3}
              width={width*0.8}
              height={height*0.4}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1}
              strokeDasharray="2,2"
            />
          </g>
        );

      case LayerType.WireInput:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <rect
              width={width}
              height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              rx={4}
            />
            <line
              x1={width*0.05}
              y1={height/2}
              x2={width*0.95}
              y2={height/2}
              stroke={strokeColor}
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          </g>
        );

      case LayerType.WireImage:
        // If the layer carries an image metadata, render it. The layer may be a LiveObject
        // so we guard access with any cast.
        const imageMeta: any = (layer as any).image;
        if (imageMeta && imageMeta.url) {
          if (imageMeta.type === 'image') {
            return (
              <g>
                <image
                  href={imageMeta.url}
                  width={width}
                  height={height}
                  preserveAspectRatio="xMidYMid slice"
                />
                <rect
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                />
              </g>
            );
          }

          if (imageMeta.type === 'pdf') {
            // render PDF via iframe inside foreignObject
            return (
              <g>
                <rect
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                />
                <foreignObject x={0} y={0} width={width} height={height}>
                  <div className="w-full h-full" xmlns="http://www.w3.org/1999/xhtml">
                    <iframe
                      src={imageMeta.url}
                      title={imageMeta.name || 'pdf-preview'}
                      className="w-full h-full"
                      style={{ border: 'none', width: '100%', height: '100%' }}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          }
        }

        // fallback wireframe if no image data is present
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <rect
              width={width}
              height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              rx={4}
            />
            <line
              x1={0}
              y1={0}
              x2={width}
              y2={height}
              stroke={strokeColor}
              strokeWidth={1}
            />
            <line
              x1={width}
              y1={0}
              x2={0}
              y2={height}
              stroke={strokeColor}
              strokeWidth={1}
            />
          </g>
        );

      case LayerType.WireText:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <rect
              width={width}
              height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              rx={2}
            />
            {[0.3, 0.5, 0.7].map((y, i) => (
              <line
                key={i}
                x1={width*0.1}
                y1={height*y}
                x2={width*0.9}
                y2={height*y}
                stroke={strokeColor}
                strokeWidth={1}
                strokeDasharray="2,1"
              />
            ))}
          </g>
        );

      case LayerType.WireCheckbox:
        return (
          <g style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}>
            <rect
              x={0}
              y={height*0.3}
              width={height*0.4}
              height={height*0.4}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              rx={2}
            />
            <line
              x1={height*0.5}
              y1={height*0.5}
              x2={width*0.9}
              y2={height*0.5}
              stroke={strokeColor}
              strokeWidth={1}
              strokeDasharray="2,1"
            />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <g
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        cursor: "move",
        transition: "all 0.2s ease",
      }}
    >
      {renderShape()}
      {value && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="500"
          fill={strokeColor}
          pointerEvents="none"
          style={{
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            letterSpacing: "0.3px",
          }}
        >
          {value}
        </text>
      )}
    </g>
  );
};