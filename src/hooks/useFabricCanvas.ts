import { useRef, useEffect } from 'react';
import { fabric } from 'fabric';

// 全局画布实例存储
let globalCanvasInstance: fabric.Canvas | null = null;

export const useFabricCanvas = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    // 尝试获取全局画布实例
    const getCanvas = () => {
      if (globalCanvasInstance) {
        canvasRef.current = globalCanvasInstance;
        return true;
      }
      
      // 尝试从 DOM 获取
      const canvasElement = document.querySelector('canvas');
      if (canvasElement) {
        const instance = (canvasElement as any).__fabricCanvas || 
                        (window as any).fabricCanvas;
        if (instance) {
          globalCanvasInstance = instance;
          canvasRef.current = instance;
          return true;
        }
      }
      
      return false;
    };

    if (!getCanvas()) {
      // 轮询获取
      const interval = setInterval(() => {
        if (getCanvas()) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  return canvasRef.current;
};

// 设置全局画布实例的函数
export const setGlobalCanvasInstance = (canvas: fabric.Canvas | null) => {
  globalCanvasInstance = canvas;
};
