# hooks 目录说明

- **[职责]** 跨功能复用的通用 Hook。
- **[主要文件]**
  - `useCanvasSize.ts`：侦测容器尺寸变化并返回画布尺寸，供布局与舞台初始化使用。
- **[备注]** 与画布强相关的 Hook 已集中在 `components/Canvas/hooks/` 下。
