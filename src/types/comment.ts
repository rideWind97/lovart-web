// 评论数据类型
export interface Comment {
  id: string;
  content: string;
  position: { x: number; y: number };
  elementId?: string; // 关联的元素ID，如果为空则表示画布评论
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isVisible: boolean;
  color?: string; // 评论颜色主题
  isResolved?: boolean; // 是否已解决
  replies?: Comment[]; // 回复评论
  parentId?: string; // 父评论ID（用于回复）
}

// 评论状态类型
export interface CommentState {
  comments: Comment[];
  selectedCommentId: string | null;
  selectedCommentIds: string[]; // 多选评论ID数组
  isCommentPanelOpen: boolean;
  isCreatingComment: boolean;
  commentPosition: { x: number; y: number } | null;
  targetElementId: string | null; // 目标元素ID（用于创建关联评论）
  isSelecting: boolean; // 是否正在框选
  selectionBox: { x: number; y: number; width: number; height: number } | null; // 框选区域
}

// 评论操作类型
export interface CommentActions {
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  selectComment: (id: string | null) => void;
  selectComments: (ids: string[]) => void; // 多选评论
  toggleCommentSelection: (id: string) => void; // 切换评论选中状态
  clearCommentSelection: () => void; // 清空选择
  toggleCommentPanel: () => void;
  setCreatingComment: (isCreating: boolean, position?: { x: number; y: number }, elementId?: string) => void;
  setSelecting: (isSelecting: boolean) => void; // 设置框选状态
  setSelectionBox: (box: { x: number; y: number; width: number; height: number } | null) => void; // 设置框选区域
  resolveComment: (id: string) => void;
  addReply: (parentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteReply: (parentId: string, replyId: string) => void;
}

// 评论主题颜色
export const COMMENT_COLORS = [
  '#ff6b6b', // 红色
  '#4ecdc4', // 青色
  '#45b7d1', // 蓝色
  '#96ceb4', // 绿色
  '#feca57', // 黄色
  '#ff9ff3', // 粉色
  '#54a0ff', // 亮蓝色
  '#5f27cd', // 紫色
] as const;

export type CommentColor = typeof COMMENT_COLORS[number];
