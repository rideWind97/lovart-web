import { useEffect, useRef, useState } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

export const useCanvasSize = (containerRef: React.RefObject<HTMLElement>) => {
  const [size, setSize] = useState<CanvasSize>({ width: 800, height: 600 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setSize({ width: clientWidth, height: clientHeight });
      }
    };

    // 初始设置
    updateSize();

    // 创建ResizeObserver
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    // 开始观察
    resizeObserverRef.current.observe(containerRef.current);

    // 同时监听window resize事件作为备用
    window.addEventListener('resize', updateSize);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [containerRef]);

  return size;
};
