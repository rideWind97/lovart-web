import React, { useEffect, useRef } from 'react';
import type Konva from 'konva';
import { Rect } from 'react-konva';
import type { CanvasElement } from '@/types/canvas';

interface Props {
  element: CanvasElement;
  activeTool: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDragStart?: (e: any) => void;
  onDragMove?: (e: any) => void;
  draggable?: boolean;
}

export const RectNode: React.FC<Props> = ({ element: el, activeTool, onSelect, onUpdate, onDragStart, onDragMove, draggable }) => {
  const ref = useRef<Konva.Rect | null>(null);
  useEffect(() => {
    ref.current?.getLayer()?.batchDraw();
  }, [
    el.size?.width,
    el.size?.height,
    (el.style as any)?.fill,
    (el.style as any)?.stroke,
    (el.style as any)?.strokeWidth,
    (el.data as any)?.rx,
    (el.data as any)?.ry,
  ]);
  const corner = (el.data as any)?.rx ?? (el.data as any)?.ry ?? 0;
  return (
    <Rect
      ref={(n) => (ref.current = n as any)}
      key={el.id}
      id={el.id}
      x={el.position.x}
      y={el.position.y}
      width={el.size.width}
      height={el.size.height}
      cornerRadius={corner}
      fill={el.style?.fill || 'transparent'}
      stroke={el.style?.stroke || '#000'}
      strokeWidth={el.style?.strokeWidth || 2}
      draggable={draggable ?? (activeTool === 'select')}
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={(e) => {
        const node = e.target as Konva.Rect;
        onUpdate(el.id, {
          position: { x: node.x(), y: node.y() },
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Rect;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const newWidth = Math.max(5, node.width() * scaleX);
        const newHeight = Math.max(5, node.height() * scaleY);
        node.scaleX(1);
        node.scaleY(1);
        node.width(newWidth);
        node.height(newHeight);
        onUpdate(el.id, {
          position: { x: node.x(), y: node.y() },
          size: { width: newWidth, height: newHeight },
        });
      }}
    />
  );
};
