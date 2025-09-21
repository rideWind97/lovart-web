# components/Canvas/elements 目录说明

- **[职责]** 画布元素的渲染器与节点组件，负责将数据结构（如 `CanvasElement`）转换为 Konva 形状。
- **[主要文件]**
  - `ElementRenderer.tsx`：统一分发，根据 `el.type` 与 `el.data.connectionType` 决定绘制逻辑（直线/正交/曲线、文本、矩形、图片等）。
  - `BezierControls.tsx`：曲线（贝塞尔）控制点的可视化与拖拽更新。
  - `LineEndpoints.tsx`：直线端点的编辑控件。
  - `TextNode.tsx` / `RectNode.tsx` / `ImageNode.tsx`：具体元素的 Konva 节点封装。
- **[近期更新]**
  - 正交连线在存在箭头时：路径端点内收、`lineCap` 调整为 `butt`，并让 `Arrow` 轴线替代首/末直线段，消除“箭头处短线外凸”的问题。
