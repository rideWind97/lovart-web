// 统一导出所有状态管理

import { useCanvasStore } from './canvasStore';
import { useChatStore } from './chatStore';
import { useToolStore } from './toolStore';
import { useUserStore } from './userStore';

// 状态管理工具函数
export const resetAllStores = () => {
  useCanvasStore.getState().clearCanvas();
  useChatStore.getState().clearMessages();
  useToolStore.getState().setActiveTool('select');
  useUserStore.getState().logout();
};
