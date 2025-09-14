// AI对话相关类型定义

export type MessageType = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokens?: number;
  model?: string;
  generationTime?: number;
  error?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'canvas';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  assignee?: string;
  tags: string[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface GenerationTask {
  id: string;
  type: 'image' | 'text' | 'code';
  prompt: string;
  status: GenerationStatus;
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AIStatus = 'idle' | 'thinking' | 'generating' | 'error';

export interface ChatState {
  messages: Message[];
  currentTask: Task | null;
  aiStatus: AIStatus;
  generationQueue: GenerationTask[];
  isTyping: boolean;
  lastActivity: Date;
}

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableMemory: boolean;
  maxHistory: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  config: AIConfig;
}
