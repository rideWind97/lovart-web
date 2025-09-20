import React from 'react';
import type Konva from 'konva';
import { Rect } from 'react-konva';
import type { CanvasElement } from '@/types/canvas';

interface Props {
  element: CanvasElement;
  activeTool: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export const RectNode: React.FC<Props> = ({ element: el, activeTool, onSelect, onUpdate }) => {
  return (
    <Rect
      key={el.id}
      id={el.id}
      x={el.position.x}
      y={el.position.y}
      width={el.size.width}
      height={el.size.height}
      fill={el.style?.fill || 'transparent'}
      stroke={el.style?.stroke || '#000'}
      strokeWidth={el.style?.strokeWidth || 2}
      draggable={activeTool === 'select'}
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
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
