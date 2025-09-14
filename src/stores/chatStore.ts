import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ChatState, Message, Task, GenerationTask, AIStatus } from '@/types/chat';

interface ChatStore extends ChatState {
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setCurrentTask: (task: Task | null) => void;
  updateTask: (updates: Partial<Task>) => void;
  setAIStatus: (status: AIStatus) => void;
  addGenerationTask: (task: Omit<GenerationTask, 'id' | 'createdAt'>) => void;
  updateGenerationTask: (id: string, updates: Partial<GenerationTask>) => void;
  removeGenerationTask: (id: string) => void;
  setTyping: (typing: boolean) => void;
  updateLastActivity: () => void;
}

const initialState: ChatState = {
  messages: [],
  currentTask: null,
  aiStatus: 'idle',
  generationQueue: [],
  isTyping: false,
  lastActivity: new Date(),
};

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    addMessage: (messageData) => {
      const message: Message = {
        ...messageData,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      
      set((state) => ({
        messages: [...state.messages, message],
        lastActivity: new Date(),
      }));
    },

    updateMessage: (id, updates) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
        lastActivity: new Date(),
      }));
    },

    removeMessage: (id) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id),
        lastActivity: new Date(),
      }));
    },

    clearMessages: () => {
      set({
        messages: [],
        lastActivity: new Date(),
      });
    },

    setCurrentTask: (task) => {
      set({
        currentTask: task,
        lastActivity: new Date(),
      });
    },

    updateTask: (updates) => {
      set((state) => ({
        currentTask: state.currentTask ? { ...state.currentTask, ...updates } : null,
        lastActivity: new Date(),
      }));
    },

    setAIStatus: (status) => {
      set({
        aiStatus: status,
        lastActivity: new Date(),
      });
    },

    addGenerationTask: (taskData) => {
      const task: GenerationTask = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      
      set((state) => ({
        generationQueue: [...state.generationQueue, task],
        lastActivity: new Date(),
      }));
    },

    updateGenerationTask: (id, updates) => {
      set((state) => ({
        generationQueue: state.generationQueue.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
        lastActivity: new Date(),
      }));
    },

    removeGenerationTask: (id) => {
      set((state) => ({
        generationQueue: state.generationQueue.filter((task) => task.id !== id),
        lastActivity: new Date(),
      }));
    },

    setTyping: (typing) => {
      set({
        isTyping: typing,
        lastActivity: new Date(),
      });
    },

    updateLastActivity: () => {
      set({ lastActivity: new Date() });
    },
  }))
);
