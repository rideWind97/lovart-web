import React from 'react';
import { Circle } from 'react-konva';
import type Konva from 'konva';
import type { CanvasElement } from '@/types/canvas';

interface Props {
  element: CanvasElement; // straight line element
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export const LineEndpoints: React.FC<Props> = ({ element: el, onUpdate }) => {
  const pts = (el.data?.points || []) as { x: number; y: number }[];
  if (!pts.length) return null;
  const start = pts[0];
  const end = pts[pts.length - 1];

  const handleDrag = (which: 'start' | 'end') => (e: any) => {
    const node = e.target as Konva.Circle;
    const nx = node.x();
    const ny = node.y();
    const newPts = [...pts];
    if (which === 'start') newPts[0] = { x: nx, y: ny };
    else newPts[newPts.length - 1] = { x: nx, y: ny };
    onUpdate(el.id, { data: { ...(el.data || {}), points: newPts }, updatedAt: new Date() } as any);
  };

  const common = {
    radius: 6,
    fill: '#ffffff',
    stroke: '#10b981',
    strokeWidth: 2,
    draggable: true,
  } as const;

  return (
    <>
      <Circle key={`${el.id}-start`} x={start.x} y={start.y} {...common} onDragMove={handleDrag('start')} />
      <Circle key={`${el.id}-end`} x={end.x} y={end.y} {...common} onDragMove={handleDrag('end')} />
    </>
  );
};
