import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface BezierConnectionProps {
  fromPoint: { x: number; y: number; elementId: string };
  toPoint: { x: number; y: number; elementId: string };
  color?: string;
  strokeWidth?: number;
  onConnectionClick?: (connectionId: string) => void;
}

export const BezierConnection: React.FC<BezierConnectionProps> = ({
  fromPoint,
  toPoint,
  color = '#007bff',
  strokeWidth = 2,
  onConnectionClick
}) => {
  const pathRef = useRef<fabric.Path | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    // 获取画布实例
    const canvasElement = document.querySelector('canvas');
    if (!canvasElement) return;

    // 这里需要从父组件传入canvas实例，暂时使用全局方式
    const canvas = (window as any).fabricCanvas;
    if (!canvas) return;

    canvasRef.current = canvas;

    // 计算贝塞尔曲线控制点
    const controlPoints = calculateBezierControlPoints(fromPoint, toPoint);
    
    // 创建贝塞尔曲线路径
    const pathData = createBezierPath(fromPoint, toPoint, controlPoints);
    
    const path = new fabric.Path(pathData, {
      stroke: color,
      strokeWidth: strokeWidth,
      fill: '',
      selectable: false,
      evented: true,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });

    // 添加连接线ID
    (path as any).id = `connection_${fromPoint.elementId}_${toPoint.elementId}`;
    (path as any).type = 'connection';
    (path as any).fromElementId = fromPoint.elementId;
    (path as any).toElementId = toPoint.elementId;

    // 添加点击事件
    path.on('mousedown', (e) => {
      if (onConnectionClick) {
        onConnectionClick((path as any).id);
      }
    });

    canvas.add(path);
    pathRef.current = path;

    return () => {
      if (pathRef.current && canvasRef.current) {
        canvasRef.current.remove(pathRef.current);
      }
    };
  }, [fromPoint, toPoint, color, strokeWidth, onConnectionClick]);

  return null; // 这是一个纯逻辑组件，不渲染任何UI
};

// 计算贝塞尔曲线控制点
function calculateBezierControlPoints(
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 控制点距离，根据连接线长度调整
  const controlDistance = Math.min(distance * 0.3, 100);
  
  // 计算控制点位置
  const control1 = {
    x: from.x + (dx > 0 ? controlDistance : -controlDistance),
    y: from.y
  };
  
  const control2 = {
    x: to.x - (dx > 0 ? controlDistance : -controlDistance),
    y: to.y
  };
  
  return { control1, control2 };
}

// 创建贝塞尔曲线路径
function createBezierPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  controlPoints: { control1: { x: number; y: number }; control2: { x: number; y: number } }
) {
  const { control1, control2 } = controlPoints;
  
  return `M ${from.x} ${from.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${to.x} ${to.y}`;
}

// 导出工具函数
export { calculateBezierControlPoints, createBezierPath };
