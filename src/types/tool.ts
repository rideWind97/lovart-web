// 工具栏相关类型定义

export type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'line' | 'path' | 'image' | 'pen' | 'eraser' | 'zoom' | 'pan' | 'comment';

export interface ToolOptions {
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
  dashArray?: number[];
}

export interface Tool {
  type: ToolType;
  name: string;
  icon: string;
  description: string;
  handler: ToolHandler;
  options: ToolOptions;
  shortcuts: string[];
  category: ToolCategory;
}

export type ToolCategory = 'select' | 'draw' | 'text' | 'shape' | 'image' | 'view' | 'custom';

export interface ToolHandler {
  onMouseDown?: (event: MouseEvent, canvas: any) => void;
  onMouseMove?: (event: MouseEvent, canvas: any) => void;
  onMouseUp?: (event: MouseEvent, canvas: any) => void;
  onKeyDown?: (event: KeyboardEvent, canvas: any) => void;
  onKeyUp?: (event: KeyboardEvent, canvas: any) => void;
  onActivate?: (canvas: any) => void;
  onDeactivate?: (canvas: any) => void;
}

export interface ShortcutMap {
  [key: string]: ToolType;
}

export interface ToolState {
  activeTool: ToolType;
  toolOptions: Record<ToolType, ToolOptions>;
  shortcuts: ShortcutMap;
  customTools: Tool[];
}

export interface ToolbarConfig {
  position: 'left' | 'right' | 'top' | 'bottom';
  size: 'small' | 'medium' | 'large';
  showLabels: boolean;
  showShortcuts: boolean;
  collapsible: boolean;
  defaultTools: ToolType[];
}

// 工具事件类型
export interface ToolEvent {
  type: 'tool_change' | 'option_change' | 'shortcut_triggered';
  tool: ToolType;
  options?: ToolOptions;
  timestamp: Date;
}
