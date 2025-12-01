export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
};

export enum LayerType {
  Rectangle,
  Ellipse,
  Path,
  Text,
  Note,
  Diamond,
  Triangle,
  Hexagon,
  Star,
  Arrow,
  Parallelogram,
  Trapezoid,
  // Flowchart shapes
  FlowStart,
  FlowProcess,
  FlowDecision,
  FlowDocument,
  FlowDatabase,
  FlowConnector,
  // UML shapes
  UMLClass,
  UMLInterface,
  UMLActor,
  UMLUseCase,
  // Wireframe components
  WireButton,
  WireInput,
  WireImage,
  WireText,
  WireCheckbox,
}

export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke?: Color;
  strokeWidth?: number;
  value?: string;
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke?: Color;
  strokeWidth?: number;
  value?: string;
};

export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke?: Color;
  strokeWidth?: number;
  points: number[][];
  value?: string;
};

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type NoteLayer = {
  type: LayerType.Note;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type AdvancedShapeLayer = {
  type: LayerType.Diamond | LayerType.Triangle | LayerType.Hexagon | LayerType.Star | 
        LayerType.Arrow | LayerType.Parallelogram | LayerType.Trapezoid |
        LayerType.FlowStart | LayerType.FlowProcess | LayerType.FlowDecision |
        LayerType.FlowDocument | LayerType.FlowDatabase | LayerType.FlowConnector |
        LayerType.UMLClass | LayerType.UMLInterface | LayerType.UMLActor |
        LayerType.UMLUseCase | LayerType.WireButton | LayerType.WireInput |
        LayerType.WireImage | LayerType.WireText | LayerType.WireCheckbox;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke?: Color;
  strokeWidth?: number;
  value?: string;
};

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  height: number;
  width: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Eraser;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    };

export enum CanvasMode {
  None,
  Pressing,
  SelectionNet,
  Translating,
  Inserting,
  Resizing,
  Pencil,
  Eraser,
}

export type Layer =
  | RectangleLayer
  | EllipseLayer
  | PathLayer
  | TextLayer
  | NoteLayer
  | AdvancedShapeLayer;
