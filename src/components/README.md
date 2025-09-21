# components 目录说明

- **[职责]** 应用内的可视化组件与容器，按功能域分子目录组织。
- **[当前子目录]**
  - `Canvas/`：画布编辑与渲染相关的全部 UI 与逻辑入口。
  - `Comment/`：评论侧边栏与评论交互相关组件。
  - `Layout/`：主布局（Header、MainLayout）。
  - `Toolbar/`：全局工具栏入口。
  - `Chat/`：聊天/对话相关组件（预留/基础）。
- **[备注]** 近期进行了结构梳理：将 Canvas 相关文件归拢在 `components/Canvas/` 下，内部再按 elements/hooks/overlays 等拆分，便于协作与维护。
