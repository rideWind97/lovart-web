import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Comment, CommentState, CommentActions, COMMENT_COLORS } from '../types/comment';

// 生成唯一ID
const generateId = () => {
  return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 获取随机颜色
const getRandomColor = (): string => {
  return COMMENT_COLORS[Math.floor(Math.random() * COMMENT_COLORS.length)];
};

export const useCommentStore = create<CommentState & CommentActions>()(
  persist(
    (set, get) => ({
      // 状态
      comments: [],
      selectedCommentId: null,
      selectedCommentIds: [],
      isCommentPanelOpen: false,
      isCreatingComment: false,
      commentPosition: null,
      targetElementId: null,
      isSelecting: false,
      selectionBox: null,

      // 操作
      addComment: (commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isVisible: true,
          color: commentData.color || getRandomColor(),
          isResolved: false,
          replies: [],
        };

        set((state) => ({
          comments: [...state.comments, newComment],
          isCreatingComment: false,
          commentPosition: null,
          targetElementId: null,
        }));
      },

      updateComment: (id, updates) => {
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === id
              ? { ...comment, ...updates, updatedAt: new Date() }
              : comment
          ),
        }));
      },

      deleteComment: (id) => {
        set((state) => ({
          comments: state.comments.filter((comment) => comment.id !== id),
          selectedCommentId: state.selectedCommentId === id ? null : state.selectedCommentId,
        }));
      },

      selectComment: (id) => {
        set({ selectedCommentId: id });
      },

      selectComments: (ids) => {
        set({ selectedCommentIds: ids });
      },

      toggleCommentSelection: (id) => {
        set((state) => {
          const currentIds = state.selectedCommentIds;
          const isSelected = currentIds.includes(id);
          const newIds = isSelected
            ? currentIds.filter(commentId => commentId !== id)
            : [...currentIds, id];
          return { selectedCommentIds: newIds };
        });
      },

      clearCommentSelection: () => {
        set({ selectedCommentIds: [], selectedCommentId: null });
      },

      toggleCommentPanel: () => {
        set((state) => ({
          isCommentPanelOpen: !state.isCommentPanelOpen,
        }));
      },

      setCreatingComment: (isCreating, position, elementId) => {
        set({
          isCreatingComment: isCreating,
          commentPosition: position || null,
          targetElementId: elementId || null,
        });
      },

      setSelecting: (isSelecting) => {
        set({ isSelecting });
      },

      setSelectionBox: (box) => {
        set({ selectionBox: box });
      },

      resolveComment: (id) => {
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === id
              ? { ...comment, isResolved: !comment.isResolved }
              : comment
          ),
        }));
      },

      addReply: (parentId, replyData) => {
        const newReply: Comment = {
          ...replyData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isVisible: true,
          color: replyData.color || getRandomColor(),
          isResolved: false,
          parentId,
        };

        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newReply],
                  updatedAt: new Date(),
                }
              : comment
          ),
        }));
      },

      deleteReply: (parentId, replyId) => {
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: (comment.replies || []).filter((reply) => reply.id !== replyId),
                  updatedAt: new Date(),
                }
              : comment
          ),
        }));
      },
    }),
    {
      name: 'comment-storage',
      partialize: (state) => ({
        comments: state.comments,
      }),
    }
  )
);
