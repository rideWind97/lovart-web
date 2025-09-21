# stores 目录说明

- **[职责]** 使用 Zustand 管理的全局/模块状态。
- **[主要文件]**
  - `canvasStore.ts`：画布元素集合、选中状态、增删改操作等。
  - `toolStore.ts`：当前工具及其默认参数（笔、线、矩形、文本等）。
  - `commentStore.ts`：评论列表、面板开关、当前创建状态等。
  - `userStore.ts`：用户信息（预留扩展）。
  - `chatStore.ts`：聊天消息（预留扩展）。
  - `index.ts`：store 的集中导出。
