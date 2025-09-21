# components/Canvas/hooks 目录说明

- **[职责]** 画布专用 Hook，封装复杂交互与状态配合，减少容器组件体积。
- **[主要文件]**
  - `useSelectionBox.ts`：框选交互（空白起拖、坐标转换、选区计算、批量选中）。
  - `useCreateElement.ts`：创建文本/矩形/图片等元素的工厂与入口。
  - `useStageViewport.ts`：舞台视口（缩放、平移）管理。
  - `useTransformer.ts`：Konva Transformer 绑定与选中态同步。
  - `useImageLoader.ts`：图片加载与缓存（供 `ImageNode` 使用）。
