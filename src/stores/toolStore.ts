import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ToolState, ToolType, ToolOptions, Tool, ShortcutMap } from '@/types/tool';

interface ToolStore extends ToolState {
  // Actions
  setActiveTool: (tool: ToolType) => void;
  updateToolOptions: (tool: ToolType, options: Partial<ToolOptions>) => void;
  resetToolOptions: (tool: ToolType) => void;
  addCustomTool: (tool: Tool) => void;
  removeCustomTool: (toolType: ToolType) => void;
  updateShortcuts: (shortcuts: Partial<ShortcutMap>) => void;
  resetShortcuts: () => void;
  getToolByType: (type: ToolType) => Tool | undefined;
  getDefaultOptions: (tool: ToolType) => ToolOptions;
}

const defaultToolOptions: Record<ToolType, ToolOptions> = {
  select: {},
  text: {
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    fillColor: '#000000',
  },
  rect: {
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 1,
  },
  circle: {
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 1,
  },
  line: {
    strokeColor: '#000000',
    strokeWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
  },
  path: {
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
  },
  image: {},
  pen: {
    strokeColor: '#000000',
    strokeWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
  },
  eraser: {
    strokeWidth: 10,
    strokeColor: 'transparent',
  },
  zoom: {},
  pan: {},
};

const defaultShortcuts: ShortcutMap = {
  'v': 'select',
  't': 'text',
  'r': 'rect',
  'c': 'circle',
  'l': 'line',
  'p': 'pen',
  'e': 'eraser',
  'z': 'zoom',
  'h': 'pan',
  'i': 'image',
};

const initialState: ToolState = {
  activeTool: 'select',
  toolOptions: { ...defaultToolOptions },
  shortcuts: { ...defaultShortcuts },
  customTools: [],
};

export const useToolStore = create<ToolStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setActiveTool: (tool) => {
      set({ activeTool: tool });
    },

    updateToolOptions: (tool, options) => {
      set((state) => ({
        toolOptions: {
          ...state.toolOptions,
          [tool]: { ...state.toolOptions[tool], ...options },
        },
      }));
    },

    resetToolOptions: (tool) => {
      set((state) => ({
        toolOptions: {
          ...state.toolOptions,
          [tool]: { ...defaultToolOptions[tool] },
        },
      }));
    },

    addCustomTool: (tool) => {
      set((state) => ({
        customTools: [...state.customTools, tool],
      }));
    },

    removeCustomTool: (toolType) => {
      set((state) => ({
        customTools: state.customTools.filter((tool) => tool.type !== toolType),
      }));
    },

    updateShortcuts: (shortcuts) => {
      set((state) => ({
        shortcuts: { ...state.shortcuts, ...shortcuts },
      }));
    },

    resetShortcuts: () => {
      set({ shortcuts: { ...defaultShortcuts } });
    },

    getToolByType: (type) => {
      const state = get();
      return state.customTools.find((tool) => tool.type === type);
    },

    getDefaultOptions: (tool) => {
      return defaultToolOptions[tool];
    },
  }))
);
