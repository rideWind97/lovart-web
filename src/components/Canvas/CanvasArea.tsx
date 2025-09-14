import React, { useRef, useEffect } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "@/stores/canvasStore";
import { useToolStore } from "@/stores/toolStore";
import { useCommentStore } from "@/stores/commentStore";
import { ZoomControls } from "./ZoomControls";
import { CommentIcon, CommentInput, CommentDetail, CommentSelectionBox } from "../Comment";

export const CanvasArea: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const {
    updateElement,
    selectElement,
    addElement,
  } = useCanvasStore();
  const { activeTool, setActiveTool } = useToolStore();
  const {
    comments,
    selectedCommentId,
    isCreatingComment,
    commentPosition,
    targetElementId,
    isSelecting,
    selectionBox,
    setCreatingComment,
    selectComment,
    selectComments,
    setSelecting,
    setSelectionBox,
  } = useCommentStore();

  // 连接点功能状态
  const [connectionPoints, setConnectionPoints] = React.useState<Map<string, fabric.Circle[]>>(new Map());
  const [isDraggingConnection, setIsDraggingConnection] = React.useState(false);
  const [connectionPreview, setConnectionPreview] = React.useState<fabric.Object | null>(null);
  const [dragStartPoint, setDragStartPoint] = React.useState<{ x: number; y: number; elementId: string } | null>(null);

  // 框选功能状态
  const [selectionStart, setSelectionStart] = React.useState<{ x: number; y: number } | null>(null);

  // 获取元素中心点
  const getElementCenter = (element: fabric.Object) => {
    const bounds = element.getBoundingRect();
    return {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2
    };
  };

  // 检测评论是否在框选区域内
  const isCommentInSelectionBox = (comment: any, box: { x: number; y: number; width: number; height: number }) => {
    const commentX = comment.position.x;
    const commentY = comment.position.y;
    
    return commentX >= box.x && 
           commentX <= box.x + box.width && 
           commentY >= box.y && 
           commentY <= box.y + box.height;
  };

  // 创建连接点
  const createConnectionPoints = (element: fabric.Object) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const elementId = (element as any).id;
    if (!elementId) return;

    const bounds = element.getBoundingRect();
    const points: fabric.Circle[] = [];

    // 在矩形的四个角创建连接点
    const positions = [
      { x: bounds.left, y: bounds.top, position: 'top-left' },
      { x: bounds.left + bounds.width, y: bounds.top, position: 'top-right' },
      { x: bounds.left, y: bounds.top + bounds.height, position: 'bottom-left' },
      { x: bounds.left + bounds.width, y: bounds.top + bounds.height, position: 'bottom-right' }
    ];

    positions.forEach((pos, index) => {
      const point = new fabric.Circle({
        left: pos.x,
        top: pos.y,
        radius: 6, // 增大半径便于点击
        fill: '#007bff',
        stroke: '#ffffff',
        strokeWidth: 2,
        selectable: false,
        evented: true,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        hoverCursor: 'pointer', // 添加悬停光标
        moveCursor: 'pointer',  // 添加移动光标
      });

      (point as any).id = `connection_${elementId}_${index}`;
      (point as any).parentElementId = elementId;
      (point as any).position = pos.position;

      canvas.add(point);
      // 将连接点移到最上层
      canvas.bringToFront(point);
      points.push(point);
    });

    // 更新状态
    setConnectionPoints(prev => new Map(prev.set(elementId, points)));
  };

  // 移除连接点
  const removeConnectionPoints = (elementId: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const points = connectionPoints.get(elementId);
    
    if (points) {
      points.forEach(point => {
        canvas.remove(point);
      });
    }

    setConnectionPoints(prev => {
      const newMap = new Map(prev);
      newMap.delete(elementId);
      return newMap;
    });
  };

  // 创建连接线
  const createConnection = (fromPoint: { x: number; y: number; elementId: string }, toPoint: { x: number; y: number; elementId: string }) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const lineId = crypto.randomUUID();

    // 计算贝塞尔曲线控制点
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlDistance = Math.min(distance * 0.3, 100);
    
    const control1 = {
      x: fromPoint.x + (dx > 0 ? controlDistance : -controlDistance),
      y: fromPoint.y
    };
    
    const control2 = {
      x: toPoint.x - (dx > 0 ? controlDistance : -controlDistance),
      y: toPoint.y
    };
    
    // 创建贝塞尔曲线路径
    const pathData = `M ${fromPoint.x} ${fromPoint.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${toPoint.x} ${toPoint.y}`;
    
    const path = new fabric.Path(pathData, {
      stroke: '#007bff',
      strokeWidth: 3,
      fill: '',
      selectable: true,
      evented: true,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      hasControls: false,
      hasBorders: true,
      shadow: new fabric.Shadow({
        color: 'rgba(0, 123, 255, 0.3)',
        blur: 4,
        offsetX: 2,
        offsetY: 2
      })
    });

    (path as any).id = lineId;
    (path as any).type = 'connection';
    (path as any).fromElementId = fromPoint.elementId;
    (path as any).toElementId = toPoint.elementId;
    
    // 添加悬停效果
    path.on('mouseover', () => {
      path.set({
        strokeWidth: 4,
        stroke: '#0056b3'
      });
      canvas.renderAll();
    });
    
    path.on('mouseout', () => {
      path.set({
        strokeWidth: 3,
        stroke: '#007bff'
      });
      canvas.renderAll();
    });
    
    canvas.add(path);

    // 添加到状态
    addElement({
      id: lineId,
      type: "line" as const,
      position: {
        x: Math.min(fromPoint.x, toPoint.x),
        y: Math.min(fromPoint.y, toPoint.y)
      },
      size: {
        width: Math.abs(toPoint.x - fromPoint.x),
        height: Math.abs(toPoint.y - fromPoint.y)
      },
      style: {
        stroke: '#007bff',
        strokeWidth: 3,
      },
      data: {
        points: [{ x: fromPoint.x, y: fromPoint.y }, { x: toPoint.x, y: toPoint.y }],
        fromElementId: fromPoint.elementId,
        toElementId: toPoint.elementId,
        connectionType: 'bezier'
      },
      zIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 选中新创建的连接线
    canvas.setActiveObject(path);
    selectElement(lineId);
  };

  // 开始拖拽连接
  const startConnectionDrag = (point: fabric.Circle) => {
    if (!fabricCanvasRef.current) return;

    const parentElementId = (point as any).parentElementId;
    
    setIsDraggingConnection(true);
    setDragStartPoint({
      x: point.left || 0,
      y: point.top || 0,
      elementId: parentElementId
    });

    // 创建贝塞尔曲线预览（初始状态为直线）
    const pathData = `M ${point.left || 0} ${point.top || 0} C ${point.left || 0} ${point.top || 0} ${point.left || 0} ${point.top || 0} ${point.left || 0} ${point.top || 0}`;
    
    const previewPath = new fabric.Path(pathData, {
      stroke: '#007bff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      fill: '',
      selectable: false,
      evented: false,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });

    fabricCanvasRef.current.add(previewPath);
    setConnectionPreview(previewPath);
  };

  // 更新连接预览
  const updateConnectionPreview = (x: number, y: number) => {
    if (!fabricCanvasRef.current || !dragStartPoint) return;

    const canvas = fabricCanvasRef.current;

    // 移除旧的预览线
    if (connectionPreview) {
      canvas.remove(connectionPreview);
    }

    // 计算贝塞尔曲线控制点
    const dx = x - dragStartPoint.x;
    const dy = y - dragStartPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlDistance = Math.min(distance * 0.3, 100);
    
    const control1 = {
      x: dragStartPoint.x + (dx > 0 ? controlDistance : -controlDistance),
      y: dragStartPoint.y
    };
    
    const control2 = {
      x: x - (dx > 0 ? controlDistance : -controlDistance),
      y: y
    };
    
    // 创建贝塞尔曲线预览路径
    const pathData = `M ${dragStartPoint.x} ${dragStartPoint.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${x} ${y}`;
    
    const previewPath = new fabric.Path(pathData, {
      stroke: '#007bff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      fill: '',
      selectable: false,
      evented: false,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });

    canvas.add(previewPath);
    setConnectionPreview(previewPath);
    canvas.renderAll();
  };

  // 完成连接
  const completeConnection = (targetElement: fabric.Object) => {
    if (!dragStartPoint || !fabricCanvasRef.current) return;

    const targetId = (targetElement as any).id;

    if (!targetId || targetId === dragStartPoint.elementId) {
      // 取消连接
      cancelConnection();
      return;
    }

    const targetCenter = getElementCenter(targetElement);
    createConnection(
      dragStartPoint,
      { x: targetCenter.x, y: targetCenter.y, elementId: targetId }
    );

    // 清理状态
    cancelConnection();
  };

  // 取消连接
  const cancelConnection = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    if (connectionPreview) {
      canvas.remove(connectionPreview);
    }

    setIsDraggingConnection(false);
    setDragStartPoint(null);
    setConnectionPreview(null);
    canvas.renderAll();
  };

  // 复制图层功能
  const duplicateElement = (originalElement: fabric.Object) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const elementId = (originalElement as any).id;
    
    if (!elementId) return;

    // 克隆对象
    originalElement.clone((cloned: fabric.Object) => {
      // 设置新位置（稍微偏移）
      const offset = 20;
      cloned.set({
        left: (cloned.left || 0) + offset,
        top: (cloned.top || 0) + offset,
        selectable: true,
        evented: true,
      });

      // 添加新ID
      const newId = crypto.randomUUID();
      (cloned as any).id = newId;

      // 添加到画布
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();

      // 根据对象类型创建对应的状态数据
      let elementData: any = {};
      let elementType: string = '';

      if (originalElement.type === 'i-text') {
        const text = originalElement as fabric.IText;
        elementType = 'text';
        elementData = {
          text: text.text || '',
        };
      } else if (originalElement.type === 'image') {
        const img = originalElement as fabric.Image;
        elementType = 'image';
        elementData = {
          src: (img as any).src || '',
          alt: 'Duplicated image',
        };
      } else if (originalElement.type === 'rect') {
        const rect = originalElement as fabric.Rect;
        elementType = 'rect';
        elementData = {
          rx: (rect as any).rx || 0,
          ry: (rect as any).ry || 0,
        };
      }

      // 更新状态
      addElement({
        id: newId,
        type: elementType as any,
        position: { 
          x: cloned.left || 0, 
          y: cloned.top || 0 
        },
        size: { 
          width: cloned.width || 0, 
          height: cloned.height || 0 
        },
        style: {
          fill: typeof cloned.fill === 'string' ? cloned.fill : undefined,
          stroke: (cloned as any).stroke,
          strokeWidth: (cloned as any).strokeWidth,
          opacity: cloned.opacity,
          fontSize: (cloned as any).fontSize,
          fontFamily: (cloned as any).fontFamily,
        },
        data: elementData,
        zIndex: (cloned as any).zIndex || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 选中新复制的对象
      selectElement(newId);
    });
  };

  // 图片上传功能
  const triggerImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      addImageToCanvas(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const addImageToCanvas = (imageUrl: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    fabric.Image.fromURL(imageUrl, (img) => {
      // 设置图片位置（画布中心）
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = img.width || 200;
      const imgHeight = img.height || 200;
      
      img.set({
        left: (canvasWidth - imgWidth) / 2,
        top: (canvasHeight - imgHeight) / 2,
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });

      // 添加ID
      const imageId = crypto.randomUUID();
      (img as any).id = imageId;

      // 添加到画布
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      // 更新状态
      addElement({
        id: imageId,
        type: "image" as const,
        position: { 
          x: img.left || 0, 
          y: img.top || 0 
        },
        size: { 
          width: imgWidth, 
          height: imgHeight 
        },
        style: {
          opacity: img.opacity || 1,
        },
        data: { 
          src: imageUrl,
          alt: 'Uploaded image',
        },
        zIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 设置选择状态
      selectElement(imageId);
      
      // 切换回选择模式
      setActiveTool("select");
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // 获取容器尺寸
    const container = canvasRef.current.parentElement;
    const containerWidth = container?.clientWidth || 800;
    const containerHeight = container?.clientHeight || 600;

    // 初始化Fabric.js画布
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: "#f8f9fa",
      selection: activeTool === "select",
    });

    fabricCanvasRef.current = canvas;

    // 设置画布事件监听
    canvas.on("selection:created", (e) => {
      if (e.selected && e.selected[0]) {
        const target = e.selected[0] as any;
        selectElement(target.id || null);
        
        // 显示连接点
        createConnectionPoints(target);
        
        // 注意：单击选择文本对象时不自动进入编辑模式
        // 用户需要双击才能进入编辑模式
      }
    });

    canvas.on("selection:cleared", () => {
      selectElement(null);
      
      // 隐藏所有连接点
      connectionPoints.forEach((_, elementId) => {
        removeConnectionPoints(elementId);
      });
    });

    // 添加鼠标按下事件监听，优先处理连接点
    canvas.on("mouse:down", (e) => {
      console.log('Mouse down event:', e.target?.type, (e.target as any)?.id);
      
      if (e.target && e.target.type === 'circle' && (e.target as any).parentElementId) {
        // 点击连接点开始拖拽连接
        console.log('Clicked connection point:', (e.target as any).id);
        e.e.stopPropagation(); // 阻止事件冒泡
        const point = e.target as fabric.Circle;
        startConnectionDrag(point);
        return;
      }
      
      if (isDraggingConnection && e.target && (e.target as any)?.id) {
        // 拖拽连接时点击目标元素完成连接
        e.e.stopPropagation();
        const target = e.target as fabric.Object;
        completeConnection(target);
        return;
      }
      
      if (isDraggingConnection) {
        // 拖拽连接时点击空白处取消连接
        e.e.stopPropagation();
        cancelConnection();
        return;
      }
    });

    // 添加右键菜单事件
    canvas.on("mouse:down", (e) => {
      console.log('Mouse down button:', e.e.button, 'Target:', e.target);
      
      if (e.e.button === 2) { // 右键
        e.e.preventDefault();
        e.e.stopPropagation();
        const pointer = canvas.getPointer(e.e);
        
        console.log('Right click detected at:', pointer);
        
        if (e.target && (e.target as any)?.id) {
          // 右键点击元素，创建关联评论
          console.log('Right click on element:', (e.target as any).id);
          setCreatingComment(true, pointer, (e.target as any).id);
        } else {
          // 右键点击空白处，创建画布评论
          console.log('Right click on canvas');
          setCreatingComment(true, pointer);
        }
      }
    });

    // 双击文本对象进入编辑模式
    canvas.on("mouse:dblclick", (e) => {
      if (e.target && e.target.type === 'i-text') {
        e.e.preventDefault();
        e.e.stopPropagation();
        
        const text = e.target as fabric.IText;
        
        // 确保文本被选中
        canvas.setActiveObject(text);
        selectElement((text as any).id || null);
        
        // 进入编辑模式
        text.enterEditing();
        
        // 延迟全选文本，确保编辑模式完全激活
        setTimeout(() => {
          text.selectAll();
          canvas.renderAll();
        }, 100);
      }
    });

    // IText对象默认支持点击编辑，不需要额外处理

    // 添加鼠标滚轮缩放功能
    canvas.on("mouse:wheel", (e) => {
      e.e.preventDefault();
      e.e.stopPropagation();

      const delta = e.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;

      // 限制缩放范围
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;

      canvas.zoomToPoint({ x: e.e.offsetX, y: e.e.offsetY }, zoom);
    });

    canvas.on("object:modified", (e) => {
      if (e.target) {
        const target = e.target as any;
        const element = {
          id: target.id || crypto.randomUUID(),
          type: target.type as any,
          position: { x: target.left || 0, y: target.top || 0 },
          size: { width: target.width || 0, height: target.height || 0 },
          style: {
            fill: typeof target.fill === "string" ? target.fill : undefined,
            stroke: target.stroke,
            strokeWidth: target.strokeWidth,
            opacity: target.opacity,
          },
          data: target.toObject(),
          zIndex: target.zIndex || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updateElement(element.id, element);
      }
    });

    // 处理文本编辑完成事件
    canvas.on("text:editing:exited", (e) => {
      if (e.target && e.target.type === "i-text") {
        const target = e.target as any;
        const element = {
          id: target.id || crypto.randomUUID(),
          type: "text" as const,
          position: { x: target.left || 0, y: target.top || 0 },
          size: { width: target.width || 0, height: target.height || 0 },
          style: {
            fontSize: target.fontSize || 24,
            fontFamily: target.fontFamily || "Arial",
            fill: typeof target.fill === "string" ? target.fill : "#000000",
          },
          data: { text: target.text || "" },
          zIndex: target.zIndex || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updateElement(element.id, element);
      }
    });

    // 窗口大小变化监听
    const handleResize = () => {
      if (fabricCanvasRef.current && canvasRef.current) {
        const container = canvasRef.current.parentElement;
        const containerWidth = container?.clientWidth || 800;
        const containerHeight = container?.clientHeight || 600;

        fabricCanvasRef.current.setDimensions({
          width: containerWidth,
          height: containerHeight,
        });
        fabricCanvasRef.current.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  // 更新工具状态
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.selection = activeTool === "select";
    canvas.isDrawingMode = activeTool === "pen";

    // 设置画布交互模式
    if (activeTool === "text") {
      canvas.defaultCursor = "crosshair";
    } else if (activeTool === "image") {
      canvas.defaultCursor = "crosshair";
    } else if (activeTool === "rect") {
      canvas.defaultCursor = "crosshair";
    } else if (activeTool === "zoom") {
      canvas.defaultCursor = "zoom-in";
    } else if (activeTool === "pan") {
      canvas.defaultCursor = "grab";
    } else if (activeTool === "comment") {
      canvas.defaultCursor = "crosshair";
      canvas.selection = false; // 评论模式不需要选择元素
    } else {
      canvas.defaultCursor = "default";
    }
  }, [activeTool]);

  // 处理画布点击事件
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    let isDrawingRect = false;
    let startPoint: { x: number; y: number } | null = null;
    let currentRect: fabric.Rect | null = null;

    const handleCanvasClick = (e: any) => {
      if (activeTool === "text") {
        const pointer = canvas.getPointer(e.e);

        // 防止在文本对象上点击创建新文本
        if (e.target && e.target.type === "i-text") {
          return;
        }

        // 创建可编辑文本对象 - 使用IText类
        const text = new fabric.IText("点击编辑文字", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000",
          selectable: true,
          // 隐藏选择控制器
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
        });

        // 添加ID
        const textId = crypto.randomUUID();
        (text as any).id = textId;

        // 添加到画布
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();

        // 更新状态
        addElement({
          id: textId,
          type: "text" as const,
          position: { x: pointer.x, y: pointer.y },
          size: { width: text.width || 0, height: text.height || 0 },
          style: {
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#000000",
          },
          data: { text: "点击编辑文字" },
          zIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // 立即设置选择状态
        selectElement(textId);
      } else if (activeTool === "image") {
        // 图片工具：触发文件选择
        triggerImageUpload();
      } else if (activeTool === "rect") {
        // 矩形工具：开始绘制矩形
        const pointer = canvas.getPointer(e.e);
        startPoint = { x: pointer.x, y: pointer.y };
        isDrawingRect = true;

        // 创建临时矩形
        currentRect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 2,
          selectable: false,
          evented: false,
        });

        canvas.add(currentRect);
        canvas.renderAll();
      } else if (activeTool === "zoom") {
        // 缩放工具：点击放大
        const pointer = canvas.getPointer(e.e);
        let zoom = canvas.getZoom();
        zoom = zoom < 1 ? 1 : zoom * 1.2;
        canvas.zoomToPoint(pointer, zoom);
      } else if (activeTool === "comment") {
        // 评论模式：点击画布创建评论或开始框选
        const pointer = canvas.getPointer(e.e);
        
        if (e.target && e.target !== canvas && (e.target as any)?.id) {
          // 点击元素，创建关联评论
          setCreatingComment(true, pointer, (e.target as any).id);
        } else if (e.e.shiftKey) {
          // Shift + 点击：开始框选
          setSelectionStart(pointer);
          setSelecting(true);
        } else {
          // 点击空白处，创建画布评论
          setCreatingComment(true, pointer);
        }
      }
    };

    // 处理拖拽事件（平移工具）
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (e: any) => {
      if (activeTool === "pan") {
        isDragging = true;
        canvas.selection = false;
        lastPosX = e.e.clientX;
        lastPosY = e.e.clientY;
        canvas.defaultCursor = "grabbing";
      } else if (e.e.altKey && canvas.getActiveObject()) {
        // Option键 + 拖拽 = 复制图层
        const activeObject = canvas.getActiveObject();
        if (activeObject && !(activeObject as any).isDuplicating) {
          (activeObject as any).isDuplicating = true;
          // 设置复制模式光标
          canvas.defaultCursor = "copy";
        }
      }
    };

    const handleMouseMove = (e: any) => {
      if (isDraggingConnection && dragStartPoint) {
        // 拖拽连接：更新预览线，阻止其他事件
        e.e.stopPropagation();
        const pointer = canvas.getPointer(e.e);
        updateConnectionPreview(pointer.x, pointer.y);
        return;
      }
      
      if (isDragging && activeTool === "pan") {
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += e.e.clientX - lastPosX;
          vpt[5] += e.e.clientY - lastPosY;
          canvas.requestRenderAll();
          lastPosX = e.e.clientX;
          lastPosY = e.e.clientY;
        }
      } else if (isDrawingRect && currentRect && startPoint) {
        // 矩形绘制：更新矩形大小
        const pointer = canvas.getPointer(e.e);
        const width = Math.abs(pointer.x - startPoint.x);
        const height = Math.abs(pointer.y - startPoint.y);
        const left = Math.min(pointer.x, startPoint.x);
        const top = Math.min(pointer.y, startPoint.y);

        currentRect.set({
          left: left,
          top: top,
          width: width,
          height: height,
        });

        canvas.renderAll();
      } else if (isSelecting && selectionStart) {
        // 框选处理：更新框选区域
        const pointer = canvas.getPointer(e.e);
        const box = {
          x: Math.min(selectionStart.x, pointer.x),
          y: Math.min(selectionStart.y, pointer.y),
          width: Math.abs(pointer.x - selectionStart.x),
          height: Math.abs(pointer.y - selectionStart.y),
        };
        setSelectionBox(box);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingConnection) {
        // 连接拖拽结束，不处理其他事件
        return;
      }
      
      if (isDragging) {
        isDragging = false;
        canvas.selection = true;
        canvas.defaultCursor = "default";
      }

      // 检查是否按住Option键拖拽，如果是则复制图层
      const activeObject = canvas.getActiveObject();
      if (activeObject && (activeObject as any).isDuplicating) {
        // 创建副本
        duplicateElement(activeObject);
        // 重置复制状态
        (activeObject as any).isDuplicating = false;
        // 恢复正常光标
        canvas.defaultCursor = "default";
      }

      if (isDrawingRect && currentRect && startPoint) {
        // 完成矩形绘制
        const rectWidth = currentRect.width || 0;
        const rectHeight = currentRect.height || 0;
        
        // 如果矩形太小，不创建
        if (rectWidth < 5 || rectHeight < 5) {
          canvas.remove(currentRect);
          canvas.renderAll();
        } else {
          // 创建最终的矩形
          const rectId = crypto.randomUUID();
          (currentRect as any).id = rectId;
          
          // 设置为可选择
          currentRect.set({
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
          });

          // 更新状态
          addElement({
            id: rectId,
            type: "rect" as const,
            position: { 
              x: currentRect.left || 0, 
              y: currentRect.top || 0 
            },
            size: { 
              width: rectWidth, 
              height: rectHeight 
            },
            style: {
              fill: 'transparent',
              stroke: '#000000',
              strokeWidth: 2,
            },
            data: { 
              rx: 0, // 圆角半径
              ry: 0,
            },
            zIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // 选中新创建的矩形
          canvas.setActiveObject(currentRect);
          selectElement(rectId);
          
          // 为矩形创建连接点
          createConnectionPoints(currentRect);
        }

        // 重置状态
        isDrawingRect = false;
        startPoint = null;
        currentRect = null;
        
        // 切换回选择模式
        setActiveTool("select");
      }

      if (activeTool === "text" || activeTool === "image") {
        setActiveTool("select");
      }

      if (isSelecting && selectionBox) {
        // 框选完成：选择框选区域内的评论
        const selectedIds = comments
          .filter(comment => isCommentInSelectionBox(comment, selectionBox))
          .map(comment => comment.id);
        
        selectComments(selectedIds);
        setSelecting(false);
        setSelectionBox(null);
        setSelectionStart(null);
      }
    };

    canvas.on("mouse:down", handleCanvasClick);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleCanvasClick);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [activeTool, addElement, selectElement, setActiveTool]);

  // 添加键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;

      // Ctrl + 滚轮缩放
      if (e.ctrlKey) {
        e.preventDefault();
        return;
      }

      // 空格键 + 鼠标拖拽 = 平移
      if (e.code === "Space") {
        canvas.defaultCursor = "grab";
        canvas.selection = false;
      }

      // 重置缩放 (Ctrl + 0)
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        canvas.setZoom(1);
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.renderAll();
      }

      // ESC键退出文本编辑模式或取消连接
      if (e.key === "Escape") {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === "i-text") {
          (activeObject as fabric.IText).exitEditing();
          setActiveTool("select");
        } else if (isDraggingConnection) {
          // 取消连接拖拽
          cancelConnection();
        }
      }

      // Option键 + 拖拽 = 复制图层
      if (e.altKey && canvas.getActiveObject()) {
        canvas.defaultCursor = "copy";
        // 显示复制提示
        const hint = document.getElementById('duplicate-hint');
        if (hint) {
          hint.classList.remove('hidden');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;

      // 释放空格键，恢复正常选择模式
      if (e.code === "Space") {
        canvas.defaultCursor = "default";
        canvas.selection = true;
        // 确保光标正确显示
        canvas.renderAll();
      }

      // 释放Option键，恢复正常光标
      if (e.altKey === false) {
        canvas.defaultCursor = "default";
        canvas.renderAll();
        // 隐藏复制提示
        const hint = document.getElementById('duplicate-hint');
        if (hint) {
          hint.classList.add('hidden');
        }
      }
    };

    // 全局右键事件处理
    const handleContextMenu = (e: MouseEvent) => {
      if (!fabricCanvasRef.current) return;
      
      const canvas = fabricCanvasRef.current;
      const canvasElement = canvas.getElement();
      const rect = canvasElement.getBoundingClientRect();
      
      // 检查点击是否在画布区域内
      if (e.clientX >= rect.left && e.clientX <= rect.right && 
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        e.preventDefault();
        
        // 将屏幕坐标转换为画布坐标
        const pointer = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        
        // 考虑画布的缩放和视口变换
        const canvasPointer = canvas.getPointer(e);
        
        console.log('Global right click at:', pointer, 'Canvas pointer:', canvasPointer);
        
        // 检查点击位置是否有对象
        const target = canvas.findTarget(e, false);
        if (target && (target as any)?.id) {
          console.log('Right click on element:', (target as any).id);
          setCreatingComment(true, canvasPointer, (target as any).id);
        } else {
          console.log('Right click on canvas');
          setCreatingComment(true, canvasPointer);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center relative">
      <div className="w-full h-full bg-white shadow-lg rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* 图片模式提示 */}
      {activeTool === "image" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-pulse">
          <span className="text-sm">🖼️ 图片模式 - 点击画布选择图片</span>
        </div>
      )}

      {/* 矩形模式提示 */}
      {activeTool === "rect" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-pulse">
          <span className="text-sm">⬜ 矩形模式 - 拖拽绘制矩形</span>
        </div>
      )}

      {/* 连接拖拽提示 */}
      {isDraggingConnection && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-pulse">
          <span className="text-sm">🔗 拖拽连接中 - 点击目标元素完成连接，ESC取消</span>
        </div>
      )}

      {/* 评论模式提示 */}
      {activeTool === "comment" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-pulse">
          <span className="text-sm">💬 评论模式 - 点击画布添加评论</span>
        </div>
      )}


      {/* 复制模式提示 */}
      <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 hidden" id="duplicate-hint">
        <span className="text-sm">📋 按住Option键拖拽，松开时复制图层</span>
      </div>

      {/* 评论图标 */}
      {comments.map((comment) => (
        <CommentIcon
          key={comment.id}
          comment={comment}
          onClick={() => selectComment(comment.id)}
        />
      ))}

      {/* 评论输入框 */}
      {isCreatingComment && commentPosition && (
        <CommentInput
          position={commentPosition}
          elementId={targetElementId || undefined}
          onCancel={() => setCreatingComment(false)}
        />
      )}

      {/* 评论详情弹窗 */}
      <CommentDetail
        comment={comments.find(c => c.id === selectedCommentId) || null}
        visible={!!selectedCommentId}
        onClose={() => selectComment(null)}
      />

      {/* 框选区域 */}
      <CommentSelectionBox />

      {/* 缩放控制面板 */}
      <ZoomControls canvas={fabricCanvasRef.current} />
    </div>
  );
};
