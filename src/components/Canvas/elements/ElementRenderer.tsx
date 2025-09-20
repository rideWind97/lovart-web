import React from 'react';
import { Line, Path } from 'react-konva';
import type { CanvasElement } from '@/types/canvas';
import type Konva from 'konva';
import { TextNode } from './TextNode';
import { RectNode } from './RectNode';
import { ImageNode } from './ImageNode';

interface Props {
  element: CanvasElement;
  activeTool: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onTextDblClick?: (id: string, currentText: string) => void;
}

export const ElementRenderer: React.FC<Props> = ({ element: el, activeTool, onSelect, onUpdate, onTextDblClick }) => {
  switch (el.type) {
    case 'text':
      return (
        <TextNode
          element={el}
          activeTool={activeTool}
          onSelect={onSelect}
          onUpdate={onUpdate}
          onDblClick={onTextDblClick}
        />
      );
    case 'rect':
      return (
        <RectNode
          element={el}
          activeTool={activeTool}
          onSelect={onSelect}
          onUpdate={onUpdate}
        />
      );
    case 'image':
      return (
        <ImageNode
          element={el}
          activeTool={activeTool}
          onSelect={onSelect}
          onUpdate={onUpdate}
        />
      );
    case 'line': {
      const pts = (el.data?.points || []) as { x: number; y: number }[];
      const points = pts.flatMap((p) => [p.x, p.y]);
      if (el.data?.connectionType === 'curved' && el.data.control1 && el.data.control2 && pts.length >= 2) {
        const start = pts[0];
        const end = pts[pts.length - 1];
        const c1 = el.data.control1;
        const c2 = el.data.control2;
        const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
        return (
          <Path
            key={el.id}
            id={el.id}
            data={d}
            stroke={el.style?.stroke || '#007bff'}
            strokeWidth={el.style?.strokeWidth || 3}
            fill=""
            lineCap="round"
            lineJoin="round"
            onClick={() => onSelect(el.id)}
            onTap={() => onSelect(el.id)}
          />
        );
      }
      return (
        <Line
          key={el.id}
          id={el.id}
          points={points}
          stroke={el.style?.stroke || '#007bff'}
          strokeWidth={el.style?.strokeWidth || 3}
          lineCap="round"
          lineJoin="round"
          draggable={activeTool === 'select'}
          onClick={() => onSelect(el.id)}
          onTap={() => onSelect(el.id)}
          onDragEnd={(e) => {
            const node = e.target as Konva.Line;
            const dx = node.x();
            const dy = node.y();
            const ptsArr = node.points();
            const newPoints: number[] = ptsArr.map((v, idx) => v + (idx % 2 === 0 ? dx : dy));
            node.position({ x: 0, y: 0 });
            node.points(newPoints);
            const pairs = [] as { x: number; y: number }[];
            for (let i = 0; i < newPoints.length; i += 2) {
              pairs.push({ x: newPoints[i], y: newPoints[i + 1] });
            }
            onUpdate(el.id, {
              data: { ...(el.data || {}), points: pairs },
              updatedAt: new Date(),
            } as any);
          }}
        />
      );
    }
    default:
      return null;
  }
};
