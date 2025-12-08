"use client";

import { memo } from "react";
import { 
  Diamond, 
  Triangle, 
  Hexagon, 
  Star, 
  MoveRight,
  Shapes,
  Circle,
  Square,
  FileText,
  Database,
  Users,
  Workflow,
  Monitor,
  Type,
  Image,
  CheckSquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { CanvasMode, LayerType, type CanvasState } from "@/types/canvas";

type ShapesToolbarProps = {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  onFileImport?: (file: File) => void;
};

export const ShapesToolbar = memo(
  ({ canvasState, setCanvasState, onFileImport }: ShapesToolbarProps & { onFileImport?: (file: File) => void }) => {
    const ShapeButton = ({ 
      icon: Icon, 
      label, 
      layerType, 
      onClick 
    }: { 
      icon: any; 
      label: string; 
      layerType: LayerType;
      onClick?: () => void;
    }) => (
      <Hint label={label}>
        <Button
          variant="board"
          size="icon"
          className="w-8 h-8"
          onClick={() => {
            if (onClick) {
              onClick();
            } else {
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: layerType,
              });
            }
          }}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </Hint>
    );

    return (
      <div className="absolute top-2 right-2 bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-neutral-700 z-20">
        <div className="grid grid-cols-4 gap-1.5">
          {/* Basic Shapes */}
          <div className="col-span-4 text-xs text-gray-600 mb-1 text-center">Basic</div>
          <ShapeButton icon={Diamond} label="Diamond" layerType={LayerType.Diamond} />
          <ShapeButton icon={Triangle} label="Triangle" layerType={LayerType.Triangle} />
          <ShapeButton icon={Hexagon} label="Hexagon" layerType={LayerType.Hexagon} />
          <ShapeButton icon={Star} label="Star" layerType={LayerType.Star} />
          
          <ShapeButton icon={MoveRight} label="Arrow" layerType={LayerType.Arrow} />
          <ShapeButton icon={Shapes} label="Parallelogram" layerType={LayerType.Parallelogram} />
          <ShapeButton icon={Shapes} label="Trapezoid" layerType={LayerType.Trapezoid} />
          <div></div>

          {/* Flowchart Shapes */}
          <div className="col-span-4 text-xs text-gray-600 mb-1 mt-2 text-center border-t pt-2">Flowchart</div>
          <ShapeButton icon={Circle} label="Start/End" layerType={LayerType.FlowStart} />
          <ShapeButton icon={Square} label="Process" layerType={LayerType.FlowProcess} />
          <ShapeButton icon={Diamond} label="Decision" layerType={LayerType.FlowDecision} />
          <ShapeButton icon={FileText} label="Document" layerType={LayerType.FlowDocument} />
          
          <ShapeButton icon={Database} label="Database" layerType={LayerType.FlowDatabase} />
          <ShapeButton icon={Circle} label="Connector" layerType={LayerType.FlowConnector} />
          <div></div>
          <div></div>

          {/* UML Shapes */}
          <div className="col-span-4 text-xs text-gray-600 mb-1 mt-2 text-center border-t pt-2">UML</div>
          <ShapeButton icon={Square} label="Class" layerType={LayerType.UMLClass} />
          <ShapeButton icon={Circle} label="Interface" layerType={LayerType.UMLInterface} />
          <ShapeButton icon={Users} label="Actor" layerType={LayerType.UMLActor} />
          <ShapeButton icon={Workflow} label="Use Case" layerType={LayerType.UMLUseCase} />

          {/* Wireframe Components */}
          <div className="col-span-4 text-xs text-gray-600 mb-1 mt-2 text-center border-t pt-2">Wireframe</div>
          <ShapeButton icon={Square} label="Button" layerType={LayerType.WireButton} />
          <ShapeButton icon={Square} label="Input" layerType={LayerType.WireInput} />
          <ShapeButton
            icon={Image}
            label="Image"
            layerType={LayerType.WireImage}
            onClick={() => {
              if (onFileImport) {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*,application/pdf";
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) onFileImport(f);
                };
                input.click();
              } else {
                setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.WireImage });
              }
            }}
          />
          <ShapeButton icon={Type} label="Text Block" layerType={LayerType.WireText} />
          
          <ShapeButton icon={CheckSquare} label="Checkbox" layerType={LayerType.WireCheckbox} />
        </div>
      </div>
    );
  },
);

ShapesToolbar.displayName = "ShapesToolbar";