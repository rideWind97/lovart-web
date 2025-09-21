# components/Canvas 目录说明

- **[职责]** 画布编辑器的主要功能区域，包含舞台容器、工具栏、渲染器、交互覆盖层、以及与画布强相关的 hooks。
- **[核心文件]**
  - `CanvasAreaKonva.tsx`：Konva 舞台容器与交互编排入口（选择、画笔、连线、缩放/平移等）。
  - `TextToolbar.tsx` / `RectToolbar.tsx` / `LineToolbar.tsx` / `ZoomControls.tsx`：画布上方/侧边的功能工具条与控件。
  - `TextPropertiesPanel.tsx` / `TextToolbar.css`：文本属性面板与样式。
- **[子目录]**
  - `elements/`：元素渲染器与绘制相关组件（见下级 README）。
  - `hooks/`：画布专用 Hook（选择框、创建元素、视口、Transformer 等）。
  - `overlays/`：编辑态覆盖层（文本输入、评论输入）。
- **[近期更新]**
  - 修复了正交连线与箭头叠接的绘制问题（路径端点内收、端帽处理、用 Arrow 轴线替代首/末直线段）。
  - 重新整理了 imports，统一走 `@/stores/*` 与相对路径，确保可编译。
