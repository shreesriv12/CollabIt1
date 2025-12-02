"use client";

import { memo, useState } from "react";
import { useMutation } from "convex/react";

import { cn, colorToCSS } from "@/lib/utils";
import { ERDEntityLayer } from "@/types/canvas";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2, Key, KeyRound } from "lucide-react";
import { useERDEntityModal } from "@/store/use-erd-entity-modal";

interface ERDEntityProps {
  id: string;
  layer: ERDEntityLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const ERDEntity = memo(({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: ERDEntityProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { open: openERDModal } = useERDEntityModal();

  const {
    x,
    y,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    entityData
  } = layer;

  // Safely extract entity data with defaults
  const tableName = entityData?.tableName || entityData?.name || "Entity";
  const fields = entityData?.fields || [];
  const erdEntityId = entityData?.id || id;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Convert layer data to ERD entity format and open modal
    if (entityData) {
      openERDModal(entityData);
    }
  };

  // Calculate field display - limit to visible area
  const maxFieldsVisible = Math.max(1, Math.floor((height - 50) / 25));
  const displayFields = fields.slice(0, maxFieldsVisible);
  const hasMoreFields = fields.length > maxFieldsVisible;

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        outline: selectionColor ? `2px solid ${selectionColor}` : "none",
        outlineOffset: "2px",
      }}
      className="drop-shadow-lg"
    >
      <div
        className={cn(
          "h-full w-full bg-white border-2 rounded-lg transition-all duration-200",
          "hover:shadow-lg cursor-move",
          isHovered && "shadow-xl"
        )}
        style={{
          borderColor: stroke ? colorToCSS(stroke) : "#e2e8f0",
          borderWidth: strokeWidth || 2,
        }}
      >
        {/* Entity Header */}
        <div
          className="px-3 py-2 rounded-t-lg border-b-2 flex items-center justify-between"
          style={{
            backgroundColor: colorToCSS(fill),
            borderBottomColor: stroke ? colorToCSS(stroke) : "#e2e8f0",
          }}
        >
          <h3 className="font-bold text-white text-sm truncate" title={tableName}>
            {tableName}
          </h3>
          {isHovered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              title="Edit Entity"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Fields List */}
        <div className="p-2 space-y-1 overflow-hidden">
          {displayFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-1 text-xs bg-gray-50 rounded px-2 py-1 border"
              title={`${field.name}: ${field.type}${field.isRequired ? ' (Required)' : ''}${field.defaultValue ? ` = ${field.defaultValue}` : ''}`}
            >
              {/* Primary Key Icon */}
              {field.isPrimaryKey && (
                <KeyRound className="h-3 w-3 text-yellow-600 flex-shrink-0" />
              )}
              
              {/* Foreign Key Icon */}
              {field.isForeignKey && !field.isPrimaryKey && (
                <Key className="h-3 w-3 text-blue-600 flex-shrink-0" />
              )}

              {/* Field Info */}
              <div className="flex-1 min-w-0 flex items-center gap-1">
                <span 
                  className={cn(
                    "truncate font-medium",
                    field.isPrimaryKey && "text-yellow-700",
                    field.isForeignKey && !field.isPrimaryKey && "text-blue-700"
                  )}
                >
                  {field.name}
                </span>
                <span className="text-gray-500 text-xs">
                  {field.type}
                </span>
              </div>

              {/* Required indicator */}
              {field.isRequired && (
                <span className="text-red-500 text-xs font-bold">*</span>
              )}
            </div>
          ))}

          {/* Show more indicator */}
          {hasMoreFields && (
            <div className="text-xs text-gray-500 text-center py-1">
              +{fields.length - maxFieldsVisible} more fields
            </div>
          )}

          {/* Empty state */}
          {fields.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-2">
              No fields defined
            </div>
          )}
        </div>
      </div>
    </foreignObject>
  );
});

ERDEntity.displayName = "ERDEntity";