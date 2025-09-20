import React from 'react';
import type Konva from 'konva';
import { Image as KonvaImage } from 'react-konva';
import type { CanvasElement } from '@/types/canvas';
import { useImageLoader } from '../hooks/useImageLoader';

interface Props {
  element: CanvasElement;
  activeTool: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDragStart?: (e: any) => void;
  onDragMove?: (e: any) => void;
}

export const ImageNode: React.FC<Props> = ({ element: el, activeTool, onSelect, onUpdate, onDragStart, onDragMove }) => {
  const img = useImageLoader(el.data?.src as string | undefined);
  return (
    <KonvaImage
      key={el.id}
      id={el.id}
      x={el.position.x}
      y={el.position.y}
      width={el.size.width}
      height={el.size.height}
      image={img || undefined}
      draggable={activeTool === 'select'}
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={(e) => {
        const node = e.target as Konva.Image;
        onUpdate(el.id, {
          position: { x: node.x(), y: node.y() },
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Image;
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
