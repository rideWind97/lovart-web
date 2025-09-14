// 用户相关类型定义

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export type UserRole = 'admin' | 'editor' | 'viewer' | 'guest';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  canvas: CanvasPreferences;
  chat: ChatPreferences;
  toolbar: ToolbarPreferences;
  notifications: NotificationPreferences;
}

export interface CanvasPreferences {
  defaultBackgroundColor: string;
  defaultGridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showRulers: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // 秒
}

export interface ChatPreferences {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableMemory: boolean;
  maxHistory: number;
  autoScroll: boolean;
  showTimestamps: boolean;
}

export interface ToolbarPreferences {
  position: 'left' | 'right' | 'top' | 'bottom';
  size: 'small' | 'medium' | 'large';
  showLabels: boolean;
  showShortcuts: boolean;
  collapsible: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
  types: NotificationType[];
}

export type NotificationType = 'collaboration' | 'ai_generation' | 'system' | 'error';

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  session: UserSession;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
