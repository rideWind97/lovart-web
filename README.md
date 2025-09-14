# Lovart Web - 数字工作空间

一个现代化的数字工作空间应用，集成了AI助手和创意工具，为用户提供智能化的内容创作和协作环境。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **UI组件库**: Ant Design
- **画布渲染**: Fabric.js
- **样式方案**: Tailwind CSS
- **构建工具**: Vite
- **数据获取**: React Query

## 项目结构

```
src/
├── components/          # React组件
│   ├── Layout/         # 布局组件
│   ├── Canvas/         # 画布组件
│   ├── Chat/           # 聊天组件
│   └── Toolbar/        # 工具栏组件
├── stores/             # 状态管理
│   ├── canvasStore.ts  # 画布状态
│   ├── chatStore.ts    # 聊天状态
│   ├── toolStore.ts    # 工具状态
│   └── userStore.ts    # 用户状态
├── types/              # TypeScript类型定义
│   ├── canvas.ts       # 画布类型
│   ├── chat.ts         # 聊天类型
│   ├── tool.ts         # 工具类型
│   └── user.ts         # 用户类型
├── services/           # API服务
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
└── App.tsx             # 应用入口
```

## 功能特性

### Canvas画布模块
- 多元素支持（文本、图片、形状、绘图）
- 实时协作编辑
- 版本历史管理
- 导出功能（PNG、PDF、SVG）

### AI对话模块
- 智能对话管理
- 图像生成集成
- 任务规划与执行
- 上下文记忆

### 工具栏模块
- 工具切换管理
- 状态同步
- 快捷键支持
- 自定义工具

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 类型检查

```bash
npm run type-check
```

## 开发规范

- 使用TypeScript严格模式
- 遵循ESLint和Prettier规范
- 提交信息使用Conventional Commits格式
- 组件使用函数式组件和Hooks
- 状态管理使用Zustand
- 样式使用Tailwind CSS

## 部署说明

项目支持多种部署方式：

- **静态部署**: 构建后部署到CDN
- **容器部署**: 使用Docker容器化部署
- **云服务部署**: 支持Vercel、Netlify等平台

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
