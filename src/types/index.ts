// 统一导出所有类型定义

export * from './canvas';
export * from './chat';
export * from './tool';
export * from './user';

// 通用类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 事件类型
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  userId: string;
  projectId?: string;
}

export interface CollaborationEvent extends BaseEvent {
  type: 'element_add' | 'element_update' | 'element_delete' | 'cursor_move' | 'selection_change';
  data: any;
}

export interface AIEvent extends BaseEvent {
  type: 'generation_start' | 'generation_progress' | 'generation_complete' | 'generation_error';
  taskId: string;
  data: any;
}

export interface SystemEvent extends BaseEvent {
  type: 'user_join' | 'user_leave' | 'project_save' | 'project_load' | 'error';
  data: any;
}

export type AppEvent = CollaborationEvent | AIEvent | SystemEvent;

// 配置类型
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  websocket: {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
  canvas: {
    maxElements: number;
    maxHistory: number;
    autoSaveInterval: number;
  };
  ai: {
    maxConcurrentGenerations: number;
    defaultModel: string;
    timeout: number;
  };
  storage: {
    maxFileSize: number;
    allowedTypes: string[];
    compressionEnabled: boolean;
  };
}