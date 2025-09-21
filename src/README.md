# src 目录说明

- **[职责]** 前端应用的业务代码根目录，包含应用入口、全局样式、功能组件、状态、类型等。
- **[入口文件]**
  - `main.tsx`：Vite 入口，挂载 React 应用。
  - `App.tsx`：应用壳组件。
- **[全局样式]** `index.css`、`App.css`。
- **[核心子目录]**
  - `components/`：按页面/功能拆分的 UI 组件与容器（当前主要是 Canvas、Comment、Layout、Toolbar、Chat）。
  - `stores/`：全局状态（Zustand）。
  - `types/`：全局与功能域类型定义。
  - `hooks/`：通用 Hook（跨功能复用）。
  - `modules/`：预留的按模块分层目录（当前为空，后续可逐步迁移到此处）。
