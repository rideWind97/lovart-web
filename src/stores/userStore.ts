import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User, UserPreferences, UserSession, LoginRequest, RegisterRequest } from '@/types/user';

interface UserStore {
  // State
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      
      try {
        // 这里应该调用实际的API
        // const response = await authApi.login(credentials);
        
        // 模拟API响应
        const mockUser: User = {
          id: crypto.randomUUID(),
          email: credentials.email,
          name: '用户',
          role: 'editor',
          permissions: [],
          preferences: {
            theme: 'light',
            language: 'zh-CN',
            timezone: 'Asia/Shanghai',
            canvas: {
              defaultBackgroundColor: '#ffffff',
              defaultGridSize: 20,
              snapToGrid: false,
              showGrid: true,
              showRulers: true,
              autoSave: true,
              autoSaveInterval: 30,
            },
            chat: {
              defaultModel: 'gpt-3.5-turbo',
              temperature: 0.7,
              maxTokens: 2000,
              enableMemory: true,
              maxHistory: 50,
              autoScroll: true,
              showTimestamps: true,
            },
            toolbar: {
              position: 'left',
              size: 'medium',
              showLabels: true,
              showShortcuts: true,
              collapsible: true,
            },
            notifications: {
              enabled: true,
              desktop: true,
              email: false,
              push: false,
              types: ['collaboration', 'ai_generation', 'system'],
            },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true,
        };

        const mockSession: UserSession = {
          id: crypto.randomUUID(),
          userId: mockUser.id,
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
          createdAt: new Date(),
          lastActivityAt: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          isActive: true,
        };

        set({
          user: mockUser,
          session: mockSession,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : '登录失败',
        });
        throw error;
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      
      try {
        // 这里应该调用实际的API
        // const response = await authApi.register(data);
        
        // 模拟注册成功，直接登录
        await get().login({
          email: data.email,
          password: data.password,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : '注册失败',
        });
        throw error;
      }
    },

    logout: () => {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
      });
    },

    updateUser: (updates) => {
      set((state) => ({
        user: state.user ? { ...state.user, ...updates, updatedAt: new Date() } : null,
      }));
    },

    updatePreferences: (preferences) => {
      set((state) => ({
        user: state.user ? {
          ...state.user,
          preferences: { ...state.user.preferences, ...preferences },
          updatedAt: new Date(),
        } : null,
      }));
    },

    setLoading: (loading) => {
      set({ isLoading: loading });
    },

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    refreshSession: async () => {
      // 实现会话刷新逻辑
      console.log('刷新会话');
    },
  }))
);
