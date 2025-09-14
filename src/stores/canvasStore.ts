import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CanvasState, CanvasElement, Viewport, HistoryState, Collaborator } from '@/types/canvas';

interface CanvasStore extends CanvasState {
  // Actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  updateViewport: (viewport: Partial<Viewport>) => void;
  addToHistory: (action: string, description?: string) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  setDirty: (dirty: boolean) => void;
  updateCollaborator: (collaborator: Collaborator) => void;
  removeCollaborator: (id: string) => void;
  clearCollaborators: () => void;
}

const initialState: CanvasState = {
  elements: [],
  selectedElement: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [],
  collaborators: [],
  isDirty: false,
  lastSaved: null,
};

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    addElement: (element) => {
      set((state) => ({
        elements: [...state.elements, element],
        isDirty: true,
      }));
      get().addToHistory('add_element', `添加${element.type}元素`);
    },

    updateElement: (id, updates) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates, updatedAt: new Date() } : el
        ),
        isDirty: true,
      }));
      get().addToHistory('update_element', `更新${updates.type || '元素'}`);
    },

    removeElement: (id) => {
      set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedElement: state.selectedElement === id ? null : state.selectedElement,
        isDirty: true,
      }));
      get().addToHistory('remove_element', '删除元素');
    },

    selectElement: (id) => {
      set({ selectedElement: id });
    },

    updateViewport: (viewport) => {
      set((state) => ({
        viewport: { ...state.viewport, ...viewport },
      }));
    },

    addToHistory: (action, description) => {
      const state = get();
      const historyEntry: HistoryState = {
        id: crypto.randomUUID(),
        action,
        elements: [...state.elements],
        timestamp: new Date(),
        description,
      };

      set((state) => ({
        history: [...state.history.slice(-49), historyEntry], // 保留最近50条历史
        isDirty: true,
      }));
    },

    undo: () => {
      const state = get();
      if (state.history.length > 0) {
        const lastState = state.history[state.history.length - 1];
        set({
          elements: lastState.elements,
          history: state.history.slice(0, -1),
          isDirty: true,
        });
      }
    },

    redo: () => {
      // 重做功能需要额外的重做历史栈
      // 这里简化实现
      console.log('重做功能待实现');
    },

    clearCanvas: () => {
      set({
        elements: [],
        selectedElement: null,
        isDirty: true,
      });
      get().addToHistory('clear_canvas', '清空画布');
    },

    setDirty: (dirty) => {
      set({ isDirty: dirty });
    },

    updateCollaborator: (collaborator) => {
      set((state) => ({
        collaborators: state.collaborators.some((c) => c.id === collaborator.id)
          ? state.collaborators.map((c) => (c.id === collaborator.id ? collaborator : c))
          : [...state.collaborators, collaborator],
      }));
    },

    removeCollaborator: (id) => {
      set((state) => ({
        collaborators: state.collaborators.filter((c) => c.id !== id),
      }));
    },

    clearCollaborators: () => {
      set({ collaborators: [] });
    },
  }))
);
