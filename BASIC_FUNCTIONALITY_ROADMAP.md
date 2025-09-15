# Lovart Web 基本功能开发路线图

## 🎯 项目现状分析

### ✅ 已完成的基础架构
- React 18 + TypeScript 项目配置
- Vite 构建工具
- Tailwind CSS 样式系统
- Zustand 状态管理
- 基础组件结构

### ❌ 需要完成的核心功能
- 画布编辑功能实现
- 工具栏功能完善
- 评论系统实现
- 用户认证系统
- 数据持久化

## 🚀 开发排期计划 (8周完成)

### 第1周：项目基础完善
**目标**: 完善项目基础设施和开发环境

#### 1.1 开发环境配置 (1天)
```bash
# 安装必要依赖
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev jest @types/jest
npm install --save-dev cypress
npm install --save-dev @playwright/test
npm install --save-dev husky lint-staged
```

#### 1.2 代码规范配置 (1天)
```json
// .eslintrc.js
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80
}
```

#### 1.3 错误处理系统 (2天)
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// src/services/errorService.ts
export class ErrorService {
  static handleError(error: Error, context: string) {
    console.error(`Error in ${context}:`, error);
    // 后续可以集成错误上报服务
  }
}
```

#### 1.4 基础测试框架 (1天)
```typescript
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};

// src/setupTests.ts
import '@testing-library/jest-dom';
```

**第1周交付物**:
- [x] 完善的开发环境
- [x] 代码规范配置
- [x] 错误处理系统
- [x] 基础测试框架

---

### 第2周：画布核心功能
**目标**: 实现基础的画布编辑功能

#### 2.1 画布渲染引擎 (2天)
```typescript
// src/components/Canvas/CanvasArea.tsx
export const CanvasArea: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
      });
      
      // 画布事件监听
      fabricCanvas.current.on('selection:created', handleSelection);
      fabricCanvas.current.on('selection:updated', handleSelection);
      fabricCanvas.current.on('selection:cleared', handleSelectionCleared);
    }
    
    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
    };
  }, []);
  
  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
};
```

#### 2.2 基础绘图工具 (2天)
```typescript
// src/components/Toolbar/DrawingTools.tsx
export const DrawingTools: React.FC = () => {
  const { activeTool, setActiveTool } = useToolStore();
  
  const tools = [
    { id: 'select', name: '选择', icon: 'cursor' },
    { id: 'text', name: '文本', icon: 'text' },
    { id: 'rectangle', name: '矩形', icon: 'square' },
    { id: 'circle', name: '圆形', icon: 'circle' },
    { id: 'line', name: '直线', icon: 'line' },
    { id: 'pen', name: '画笔', icon: 'pen' }
  ];
  
  return (
    <div className="toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => setActiveTool(tool.id)}
        >
          <Icon name={tool.icon} />
          {tool.name}
        </button>
      ))}
    </div>
  );
};
```

#### 2.3 元素创建功能 (1天)
```typescript
// src/hooks/useCanvasTools.ts
export const useCanvasTools = (canvas: fabric.Canvas | null) => {
  const { activeTool } = useToolStore();
  
  const createText = (x: number, y: number) => {
    if (!canvas) return;
    
    const text = new fabric.Text('点击编辑文本', {
      left: x,
      top: y,
      fontSize: 16,
      fill: '#000000'
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };
  
  const createRectangle = (x: number, y: number) => {
    if (!canvas) return;
    
    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: 100,
      height: 60,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });
    
    canvas.add(rect);
    canvas.renderAll();
  };
  
  return { createText, createRectangle };
};
```

**第2周交付物**:
- [x] 画布渲染引擎
- [x] 基础绘图工具
- [x] 元素创建功能
- [x] 画布交互基础

---

### 第3周：画布高级功能
**目标**: 完善画布编辑和交互功能

#### 3.1 元素编辑功能 (2天)
```typescript
// src/components/Canvas/ElementEditor.tsx
export const ElementEditor: React.FC = () => {
  const { selectedElement, updateElement } = useCanvasStore();
  
  const handlePropertyChange = (property: string, value: any) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { [property]: value });
    }
  };
  
  if (!selectedElement) {
    return <div className="element-editor">未选择元素</div>;
  }
  
  return (
    <div className="element-editor">
      <h3>元素属性</h3>
      
      {selectedElement.type === 'text' && (
        <div className="text-properties">
          <label>文本内容</label>
          <input
            value={selectedElement.text || ''}
            onChange={(e) => handlePropertyChange('text', e.target.value)}
          />
          
          <label>字体大小</label>
          <input
            type="number"
            value={selectedElement.fontSize || 16}
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
          />
          
          <label>字体颜色</label>
          <input
            type="color"
            value={selectedElement.fill || '#000000'}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
          />
        </div>
      )}
      
      {selectedElement.type === 'rect' && (
        <div className="rect-properties">
          <label>宽度</label>
          <input
            type="number"
            value={selectedElement.width || 100}
            onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
          />
          
          <label>高度</label>
          <input
            type="number"
            value={selectedElement.height || 60}
            onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
          />
          
          <label>填充颜色</label>
          <input
            type="color"
            value={selectedElement.fill || 'transparent'}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
```

#### 3.2 历史记录功能 (1天)
```typescript
// src/stores/historyStore.ts
interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
  canUndo: boolean;
  canRedo: boolean;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: initialState,
  future: [],
  canUndo: false,
  canRedo: false,
  
  undo: () => {
    const { past, present, future } = get();
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({
      past: newPast,
      present: previous,
      future: [present, ...future],
      canUndo: newPast.length > 0,
      canRedo: true
    });
  },
  
  redo: () => {
    const { past, present, future } = get();
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    set({
      past: [...past, present],
      present: next,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0
    });
  },
  
  saveState: (state: CanvasState) => {
    const { past, present } = get();
    set({
      past: [...past, present],
      present: state,
      future: [],
      canUndo: true,
      canRedo: false
    });
  }
}));
```

#### 3.3 缩放和平移功能 (1天)
```typescript
// src/hooks/useCanvasZoom.ts
export const useCanvasZoom = (canvas: fabric.Canvas | null) => {
  const [zoom, setZoom] = useState(1);
  
  const zoomIn = () => {
    if (!canvas) return;
    const newZoom = Math.min(zoom * 1.2, 5);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };
  
  const zoomOut = () => {
    if (!canvas) return;
    const newZoom = Math.max(zoom / 1.2, 0.1);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };
  
  const resetZoom = () => {
    if (!canvas) return;
    canvas.setZoom(1);
    setZoom(1);
  };
  
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };
  
  useEffect(() => {
    if (canvas) {
      canvas.on('mouse:wheel', handleWheel);
      return () => canvas.off('mouse:wheel', handleWheel);
    }
  }, [canvas]);
  
  return { zoom, zoomIn, zoomOut, resetZoom };
};
```

#### 3.4 键盘快捷键 (1天)
```typescript
// src/hooks/useKeyboardShortcuts.ts
export const useKeyboardShortcuts = () => {
  const { undo, redo, deleteSelected } = useCanvasStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            deleteSelected();
            break;
          case 'Escape':
            // 取消选择
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected]);
};
```

**第3周交付物**:
- [x] 元素编辑功能
- [x] 历史记录系统
- [x] 缩放和平移
- [x] 键盘快捷键

---

### 第4周：评论系统
**目标**: 实现画布评论和标注功能

#### 4.1 评论组件 (2天)
```typescript
// src/components/Comment/CommentPanel.tsx
export const CommentPanel: React.FC = () => {
  const { comments, addComment, updateComment, deleteComment } = useCommentStore();
  const [newComment, setNewComment] = useState('');
  
  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment({
        id: generateId(),
        content: newComment,
        position: { x: 0, y: 0 },
        createdAt: new Date(),
        author: '当前用户'
      });
      setNewComment('');
    }
  };
  
  return (
    <div className="comment-panel">
      <h3>评论</h3>
      
      <div className="comment-input">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="添加评论..."
          rows={3}
        />
        <button onClick={handleAddComment}>添加评论</button>
      </div>
      
      <div className="comment-list">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onUpdate={updateComment}
            onDelete={deleteComment}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 4.2 画布评论标记 (2天)
```typescript
// src/components/Canvas/CommentMarker.tsx
export const CommentMarker: React.FC<{ comment: Comment }> = ({ comment }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`comment-marker ${isHovered ? 'hovered' : ''}`}
      style={{
        left: comment.position.x,
        top: comment.position.y
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="marker-icon">💬</div>
      {isHovered && (
        <div className="comment-preview">
          <div className="comment-content">{comment.content}</div>
          <div className="comment-author">{comment.author}</div>
        </div>
      )}
    </div>
  );
};
```

#### 4.3 评论状态管理 (1天)
```typescript
// src/stores/commentStore.ts
interface CommentState {
  comments: Comment[];
  selectedComment: string | null;
  isCommentMode: boolean;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  selectedComment: null,
  isCommentMode: false,
  
  addComment: (comment: Comment) => {
    set(state => ({
      comments: [...state.comments, comment]
    }));
  },
  
  updateComment: (id: string, updates: Partial<Comment>) => {
    set(state => ({
      comments: state.comments.map(comment =>
        comment.id === id ? { ...comment, ...updates } : comment
      )
    }));
  },
  
  deleteComment: (id: string) => {
    set(state => ({
      comments: state.comments.filter(comment => comment.id !== id)
    }));
  },
  
  setCommentMode: (mode: boolean) => {
    set({ isCommentMode: mode });
  },
  
  selectComment: (id: string | null) => {
    set({ selectedComment: id });
  }
}));
```

**第4周交付物**:
- [x] 评论面板组件
- [x] 画布评论标记
- [x] 评论状态管理
- [x] 评论交互功能

---

### 第5周：用户认证系统
**目标**: 实现用户登录和权限管理

#### 5.1 用户认证组件 (2天)
```typescript
// src/components/Auth/LoginForm.tsx
export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, isLoading, error } = useUserStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
  
  return (
    <div className="login-form">
      <h2>登录</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>邮箱</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>密码</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
};
```

#### 5.2 用户状态管理 (1天)
```typescript
// src/stores/userStore.ts
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      // 模拟API调用
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('登录失败');
      }
      
      const user = await response.json();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
    localStorage.removeItem('user');
  },
  
  checkAuth: () => {
    const user = localStorage.getItem('user');
    if (user) {
      set({
        user: JSON.parse(user),
        isAuthenticated: true
      });
    }
  }
}));
```

#### 5.3 路由保护 (1天)
```typescript
// src/components/Auth/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserStore();
  
  if (isLoading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// src/App.tsx
function App() {
  const { checkAuth } = useUserStore();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

#### 5.4 用户设置 (1天)
```typescript
// src/components/User/UserSettings.tsx
export const UserSettings: React.FC = () => {
  const { user, updateUser } = useUserStore();
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  });
  
  const handleSave = () => {
    updateUser({ settings });
  };
  
  return (
    <div className="user-settings">
      <h3>用户设置</h3>
      
      <div className="setting-group">
        <label>主题</label>
        <select
          value={settings.theme}
          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
        >
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>语言</label>
        <select
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
        >
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
          />
          启用通知
        </label>
      </div>
      
      <button onClick={handleSave}>保存设置</button>
    </div>
  );
};
```

**第5周交付物**:
- [x] 用户登录组件
- [x] 用户状态管理
- [x] 路由保护
- [x] 用户设置

---

### 第6周：数据持久化
**目标**: 实现数据保存和加载功能

#### 6.1 本地存储服务 (2天)
```typescript
// src/services/storageService.ts
export class StorageService {
  private static readonly STORAGE_KEY = 'lovart-canvas-data';
  
  static saveCanvas(canvasData: CanvasData): void {
    try {
      const data = {
        ...canvasData,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save canvas data:', error);
    }
  }
  
  static loadCanvas(): CanvasData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load canvas data:', error);
      return null;
    }
  }
  
  static exportCanvas(canvas: fabric.Canvas): void {
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    const link = document.createElement('a');
    link.download = `canvas-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }
  
  static importCanvas(file: File): Promise<CanvasData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
```

#### 6.2 自动保存功能 (1天)
```typescript
// src/hooks/useAutoSave.ts
export const useAutoSave = (canvas: fabric.Canvas | null, interval: number = 30000) => {
  const { saveCanvas } = useCanvasStore();
  
  useEffect(() => {
    if (!canvas) return;
    
    const autoSave = () => {
      const canvasData = canvas.toJSON();
      StorageService.saveCanvas(canvasData);
    };
    
    const intervalId = setInterval(autoSave, interval);
    
    // 页面卸载时保存
    const handleBeforeUnload = () => {
      autoSave();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [canvas, interval]);
};
```

#### 6.3 文件导入导出 (1天)
```typescript
// src/components/File/FileManager.tsx
export const FileManager: React.FC = () => {
  const { loadCanvas, saveCanvas } = useCanvasStore();
  
  const handleExport = () => {
    const canvas = getCanvasInstance();
    if (canvas) {
      StorageService.exportCanvas(canvas);
    }
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      StorageService.importCanvas(file)
        .then(data => {
          loadCanvas(data);
        })
        .catch(error => {
          console.error('Import failed:', error);
        });
    }
  };
  
  return (
    <div className="file-manager">
      <button onClick={handleExport}>导出画布</button>
      <input
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
        id="import-input"
      />
      <label htmlFor="import-input" className="import-button">
        导入画布
      </label>
    </div>
  );
};
```

#### 6.4 数据同步 (1天)
```typescript
// src/services/syncService.ts
export class SyncService {
  private static readonly API_BASE = process.env.REACT_APP_API_URL || '';
  
  static async saveToCloud(canvasData: CanvasData): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/api/canvas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(canvasData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save to cloud');
      }
    } catch (error) {
      console.error('Cloud save failed:', error);
      throw error;
    }
  }
  
  static async loadFromCloud(canvasId: string): Promise<CanvasData> {
    try {
      const response = await fetch(`${this.API_BASE}/api/canvas/${canvasId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load from cloud');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Cloud load failed:', error);
      throw error;
    }
  }
  
  private static getToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}
```

**第6周交付物**:
- [x] 本地存储服务
- [x] 自动保存功能
- [x] 文件导入导出
- [x] 数据同步服务

---

### 第7周：性能优化和测试
**目标**: 优化应用性能和添加测试

#### 7.1 性能优化 (2天)
```typescript
// src/hooks/useCanvasOptimization.ts
export const useCanvasOptimization = (canvas: fabric.Canvas | null) => {
  const [isOptimized, setIsOptimized] = useState(false);
  
  useEffect(() => {
    if (!canvas) return;
    
    // 启用对象缓存
    canvas.preserveObjectStacking = true;
    
    // 优化渲染性能
    canvas.renderOnAddRemove = false;
    
    // 批量操作
    const batchUpdate = debounce(() => {
      canvas.renderAll();
    }, 100);
    
    canvas.on('object:modified', batchUpdate);
    canvas.on('object:added', batchUpdate);
    canvas.on('object:removed', batchUpdate);
    
    setIsOptimized(true);
    
    return () => {
      canvas.off('object:modified', batchUpdate);
      canvas.off('object:added', batchUpdate);
      canvas.off('object:removed', batchUpdate);
    };
  }, [canvas]);
  
  return { isOptimized };
};

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

#### 7.2 单元测试 (2天)
```typescript
// src/components/Canvas/__tests__/CanvasArea.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasArea } from '../CanvasArea';

describe('CanvasArea', () => {
  it('renders canvas element', () => {
    render(<CanvasArea />);
    expect(screen.getByTestId('fabric-canvas')).toBeInTheDocument();
  });
  
  it('handles text creation', async () => {
    const { user } = setup(<CanvasArea />);
    await user.click(screen.getByTestId('text-tool'));
    await user.click(screen.getByTestId('canvas'));
    expect(screen.getByTestId('text-element')).toBeInTheDocument();
  });
  
  it('handles element selection', async () => {
    const { user } = setup(<CanvasArea />);
    await user.click(screen.getByTestId('canvas'));
    expect(screen.getByTestId('selection-handles')).toBeInTheDocument();
  });
});

// src/stores/__tests__/canvasStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCanvasStore } from '../canvasStore';

describe('CanvasStore', () => {
  it('should add element', () => {
    const { result } = renderHook(() => useCanvasStore());
    
    act(() => {
      result.current.addElement({
        id: '1',
        type: 'text',
        content: 'Test text',
        position: { x: 0, y: 0 }
      });
    });
    
    expect(result.current.elements).toHaveLength(1);
  });
  
  it('should update element', () => {
    const { result } = renderHook(() => useCanvasStore());
    
    act(() => {
      result.current.addElement({
        id: '1',
        type: 'text',
        content: 'Test text',
        position: { x: 0, y: 0 }
      });
    });
    
    act(() => {
      result.current.updateElement('1', { content: 'Updated text' });
    });
    
    expect(result.current.elements[0].content).toBe('Updated text');
  });
});
```

#### 7.3 集成测试 (1天)
```typescript
// cypress/integration/canvas.spec.ts
describe('Canvas Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('should create and edit text element', () => {
    cy.get('[data-testid="text-tool"]').click();
    cy.get('[data-testid="canvas"]').click();
    cy.get('[data-testid="text-element"]').should('exist');
    
    cy.get('[data-testid="text-element"]').dblclick();
    cy.get('[data-testid="text-input"]').type('Hello World');
    cy.get('[data-testid="text-input"]').blur();
    
    cy.get('[data-testid="text-element"]').should('contain', 'Hello World');
  });
  
  it('should create rectangle element', () => {
    cy.get('[data-testid="rectangle-tool"]').click();
    cy.get('[data-testid="canvas"]').trigger('mousedown', { which: 1 })
      .trigger('mousemove', { clientX: 100, clientY: 100 })
      .trigger('mouseup');
    
    cy.get('[data-testid="rectangle-element"]').should('exist');
  });
  
  it('should handle undo/redo', () => {
    cy.get('[data-testid="text-tool"]').click();
    cy.get('[data-testid="canvas"]').click();
    cy.get('[data-testid="text-element"]').should('exist');
    
    cy.get('body').type('{ctrl}z');
    cy.get('[data-testid="text-element"]').should('not.exist');
    
    cy.get('body').type('{ctrl}y');
    cy.get('[data-testid="text-element"]').should('exist');
  });
});
```

**第7周交付物**:
- [x] 性能优化
- [x] 单元测试
- [x] 集成测试
- [x] 测试覆盖率报告

---

### 第8周：完善和部署
**目标**: 完善功能细节和准备部署

#### 8.1 功能完善 (2天)
```typescript
// src/components/Canvas/CanvasControls.tsx
export const CanvasControls: React.FC = () => {
  const { zoom, zoomIn, zoomOut, resetZoom } = useCanvasZoom();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  
  return (
    <div className="canvas-controls">
      <div className="zoom-controls">
        <button onClick={zoomOut} disabled={zoom <= 0.1}>-</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn} disabled={zoom >= 5}>+</button>
        <button onClick={resetZoom}>重置</button>
      </div>
      
      <div className="history-controls">
        <button onClick={undo} disabled={!canUndo}>撤销</button>
        <button onClick={redo} disabled={!canRedo}>重做</button>
      </div>
      
      <div className="view-controls">
        <button onClick={() => {/* 适应窗口 */}}>适应窗口</button>
        <button onClick={() => {/* 实际大小 */}}>实际大小</button>
      </div>
    </div>
  );
};
```

#### 8.2 响应式设计 (1天)
```typescript
// src/hooks/useResponsive.ts
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;
  
  return { screenSize, isMobile, isTablet, isDesktop };
};
```

#### 8.3 部署配置 (1天)
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          fabric: ['fabric'],
          antd: ['antd']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});

// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  }
}
```

#### 8.4 文档完善 (1天)
```markdown
# README.md 更新
## 快速开始
1. 安装依赖: `npm install`
2. 启动开发: `npm run dev`
3. 运行测试: `npm test`
4. 构建生产: `npm run build`

## 功能特性
- ✅ 画布编辑功能
- ✅ 多种绘图工具
- ✅ 评论系统
- ✅ 用户认证
- ✅ 数据持久化
- ✅ 性能优化
- ✅ 响应式设计

## 技术栈
- React 18 + TypeScript
- Fabric.js 画布引擎
- Zustand 状态管理
- Ant Design UI组件
- Tailwind CSS 样式
- Vite 构建工具
```

**第8周交付物**:
- [x] 功能完善
- [x] 响应式设计
- [x] 部署配置
- [x] 完整文档

---

## 📊 开发进度跟踪

### 每周检查点
- **第1周**: 基础架构完成 ✅
- **第2周**: 画布核心功能完成 ✅
- **第3周**: 画布高级功能完成 ✅
- **第4周**: 评论系统完成 ✅
- **第5周**: 用户认证完成 ✅
- **第6周**: 数据持久化完成 ✅
- **第7周**: 性能优化和测试完成 ✅
- **第8周**: 完善和部署完成 ✅

### 关键里程碑
1. **第2周末**: 基础画布功能可用
2. **第4周末**: 评论系统集成完成
3. **第6周末**: 数据持久化完成
4. **第8周末**: 完整应用部署

## 🛠️ 开发工具和资源

### 必需工具
- Node.js 18+
- npm 或 yarn
- Git
- VS Code (推荐)

### 推荐插件
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

### 测试工具
- Jest (单元测试)
- Testing Library (组件测试)
- Cypress (E2E测试)
- Playwright (跨浏览器测试)

## 💡 开发建议

### 代码质量
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 编写单元测试
- 代码审查

### 性能优化
- 使用 React.memo
- 避免不必要的重渲染
- 优化 Canvas 渲染
- 懒加载组件

### 用户体验
- 响应式设计
- 加载状态提示
- 错误处理
- 键盘快捷键

---

**总结**: 这个8周的开发计划将帮助您从头开始构建一个功能完整的数字工作空间应用。每周都有明确的目标和交付物，确保项目按计划推进。
