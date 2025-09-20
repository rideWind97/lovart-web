export interface Comment {
  id: string;
  content: string;
  position: { x: number; y: number };
  elementId?: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isVisible: boolean;
  color?: string;
  isResolved?: boolean;
  replies?: Comment[];
  parentId?: string;
}

export interface CommentState {
  comments: Comment[];
  selectedCommentId: string | null;
  selectedCommentIds: string[];
  isCommentPanelOpen: boolean;
  isCreatingComment: boolean;
  commentPosition: { x: number; y: number } | null;
  targetElementId: string | null;
  isSelecting: boolean;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
}

export interface CommentActions {
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  selectComment: (id: string | null) => void;
  selectComments: (ids: string[]) => void;
  toggleCommentSelection: (id: string) => void;
  clearCommentSelection: () => void;
  toggleCommentPanel: () => void;
  setCreatingComment: (isCreating: boolean, position?: { x: number; y: number }, elementId?: string) => void;
  setSelecting: (isSelecting: boolean) => void;
  setSelectionBox: (box: { x: number; y: number; width: number; height: number } | null) => void;
  resolveComment: (id: string) => void;
  addReply: (parentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteReply: (parentId: string, replyId: string) => void;
}

export const COMMENT_COLORS = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#feca57',
  '#ff9ff3',
  '#54a0ff',
  '#5f27cd',
] as const;

export type CommentColor = typeof COMMENT_COLORS[number];
