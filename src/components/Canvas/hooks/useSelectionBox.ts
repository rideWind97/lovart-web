import { useState } from 'react';
import type Konva from 'konva';
import { useCanvasStore } from '@/stores/canvasStore';

export interface SelectionBoxState {
  isSelecting: boolean;
  selectRect: { x: number; y: number; width: number; height: number } | null;
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function useSelectionBox(activeTool: string): SelectionBoxState {
  const { elements, selectElements } = useCanvasStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [selectRect, setSelectRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'select') return;
    const stage = e.target.getStage();
    if (!stage) return;
    const type = (e.target as any)?.getType ? (e.target as any).getType() : (e.target as any)?.className;
    const clickedOnEmpty = e.target === stage || type === 'Layer' || type === 'Group';
    if (clickedOnEmpty) {
      const pos = stage.getPointerPosition();
      if (!pos) return;
      // 转换为舞台坐标（去除缩放和平移影响）
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const p = transform.point(pos);
      if (!p) return;
      setIsSelecting(true);
      setStart(p);
      setSelectRect({ x: p.x, y: p.y, width: 0, height: 0 });
    } else {
      // 点击非空白，清理框选状态但不清空已有选择
      setIsSelecting(false);
      setStart(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isSelecting || !start) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const p = transform.point(pos);
    if (!p) return;
    setSelectRect({
      x: Math.min(start.x, p.x),
      y: Math.min(start.y, p.y),
      width: Math.abs(p.x - start.x),
      height: Math.abs(p.y - start.y),
    });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !selectRect) return;
    setIsSelecting(false);
    setStart(null);
    const rect = selectRect;
    setSelectRect(null);
    const ids = elements
      .filter((el) => {
        const bx = el.position.x;
        const by = el.position.y;
        const bw = Math.max(1, el.size.width);
        const bh = Math.max(1, el.size.height);
        return !(bx > rect.x + rect.width || bx + bw < rect.x || by > rect.y + rect.height || by + bh < rect.y);
      })
      .map((el) => el.id);
    if (ids.length) selectElements(ids);
  };

  return { isSelecting, selectRect, handleMouseDown, handleMouseMove, handleMouseUp };
}
