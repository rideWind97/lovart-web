// Canvas相关类型定义

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export type ElementType = 'text' | 'image' | 'rect' | 'circle' | 'line' | 'path' | 'group' | 'connectionPoint';

export interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  style: ElementStyle;
  data: any;
  locked?: boolean;
  visible?: boolean;
  zIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextElement extends CanvasElement {
  type: 'text';
  data: {
    text: string;
    maxWidth?: number;
  };
}

export interface ImageElement extends CanvasElement {
  type: 'image';
  data: {
    src: string;
    alt?: string;
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
  };
}

export interface RectElement extends CanvasElement {
  type: 'rect';
  data: {
    rx?: number; // 圆角半径
    ry?: number;
  };
}

export interface CircleElement extends CanvasElement {
  type: 'circle';
  data: {
    radius: number;
  };
}

export interface LineElement extends CanvasElement {
  type: 'line';
  data: {
    points: Position[];
    fromElementId?: string; // 起始元素ID
    toElementId?: string;   // 目标元素ID
    connectionType?: 'straight' | 'curved' | 'orthogonal'; // 连接线类型
  };
}

export interface PathElement extends CanvasElement {
  type: 'path';
  data: {
    path: string; // SVG path
  };
}

export interface GroupElement extends CanvasElement {
  type: 'group';
  data: {
    children: string[]; // 子元素ID数组
  };
}

export interface ConnectionPointElement extends CanvasElement {
  type: 'connectionPoint';
  data: {
    parentElementId: string; // 父元素ID
    position: 'top' | 'right' | 'bottom' | 'left' | 'center'; // 连接点位置
    connections: string[]; // 连接的连接线ID数组
  };
}

export interface HistoryState {
  id: string;
  action: string;
  elements: CanvasElement[];
  timestamp: Date;
  description?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor: Position;
  isActive: boolean;
  lastSeen: Date;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedElement: string | null;
  viewport: Viewport;
  history: HistoryState[];
  collaborators: Collaborator[];
  isDirty: boolean;
  lastSaved: Date | null;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showRulers: boolean;
}
