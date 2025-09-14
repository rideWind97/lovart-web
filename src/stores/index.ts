// 统一导出所有状态管理

export { useCanvasStore } from './canvasStore';
export { useChatStore } from './chatStore';
export { useToolStore } from './toolStore';
export { useUserStore } from './userStore';

// 状态管理工具函数
export const resetAllStores = () => {
  useCanvasStore.getState().clearCanvas();
  useChatStore.getState().clearMessages();
  useToolStore.getState().setActiveTool('select');
  useUserStore.getState().logout();
};
