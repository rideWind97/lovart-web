import React from 'react';
import { Circle } from 'react-konva';
import type Konva from 'konva';
import type { CanvasElement } from '@/types/canvas';

interface Props {
  element: CanvasElement; // line element with curved connection
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export const BezierControls: React.FC<Props> = ({ element: el, onUpdate }) => {
  const c1 = el.data?.control1;
  const c2 = el.data?.control2;
  if (!c1 || !c2) return null;

  const common = {
    radius: 5,
    fill: '#ffffff',
    stroke: '#f59e0b',
    strokeWidth: 2,
    draggable: true,
  } as const;

  return (
    <>
      <Circle
        x={c1.x}
        y={c1.y}
        {...common}
        onDragMove={(e) => {
          const node = e.target as Konva.Circle;
          onUpdate(el.id, { data: { ...(el.data || {}), control1: { x: node.x(), y: node.y() } } } as any);
        }}
      />
      <Circle
        x={c2.x}
        y={c2.y}
        {...common}
        onDragMove={(e) => {
          const node = e.target as Konva.Circle;
          onUpdate(el.id, { data: { ...(el.data || {}), control2: { x: node.x(), y: node.y() } } } as any);
        }}
      />
    </>
  );
};
