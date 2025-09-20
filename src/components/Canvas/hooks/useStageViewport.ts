import { useEffect, useState } from 'react';
import type Konva from 'konva';

export function useStageViewport(containerRef: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      setSize({ width: el.clientWidth || 800, height: el.clientHeight || 600 });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [containerRef]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>, stage: Konva.Stage | null) => {
    e.evt.preventDefault();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setScale(newScale);
    setPosition(newPos);
  };

  return { size, scale, position, setPosition, handleWheel };
}
