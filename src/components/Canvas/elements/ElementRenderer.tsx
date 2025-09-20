import React from 'react';
import { Line, Path, Arrow } from 'react-konva';
import type { CanvasElement } from '@/types/canvas';
import { TextNode } from './TextNode';
import { RectNode } from './RectNode';
import { ImageNode } from './ImageNode';
import type Konva from 'konva';

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
      if (el.data?.connectionType === 'orthogonal' && pts.length >= 2) {
        const rDefault = (el.data?.cornerRadius ?? 12) as number;
        const start = pts[0];
        const end = pts[pts.length - 1];
        // 中间竖直通道横坐标
        const mx = (start.x + end.x) / 2;
        const p1 = { x: start.x, y: start.y };
        const p2 = { x: mx, y: start.y };
        const p3 = { x: mx, y: end.y };
        const p4 = { x: end.x, y: end.y };
        const dx1 = Math.abs(p2.x - p1.x);
        const dy1 = Math.abs(p3.y - p2.y);
        const dx2 = Math.abs(p4.x - p3.x);
        const r1 = Math.min(rDefault, dx1 / 2, dy1 / 2);
        const r2 = Math.min(rDefault, dx2 / 2, dy1 / 2);
        const sgnH1 = Math.sign(p2.x - p1.x) || 1; // +1 to right, -1 to left
        const sgnV = Math.sign(p3.y - p2.y) || 1;  // +1 down, -1 up
        const sgnH2 = Math.sign(p4.x - p3.x) || 1;
        const a1x = p2.x - sgnH1 * r1, a1y = p2.y;
        const b1x = p2.x, b1y = p2.y + sgnV * r1;
        const a2x = p3.x, a2y = p3.y - sgnV * r2;
        const b2x = p3.x + sgnH2 * r2, b2y = p3.y;
        const d = [
          `M ${p1.x} ${p1.y}`,
          `L ${a1x} ${a1y}`,
          `Q ${p2.x} ${p2.y} ${b1x} ${b1y}`,
          `L ${a2x} ${a2y}`,
          `Q ${p3.x} ${p3.y} ${b2x} ${b2y}`,
          `L ${p4.x} ${p4.y}`,
        ].join(' ');
        const stroke = el.style?.stroke || '#9ca3af';
        const strokeWidth = el.style?.strokeWidth || 2;
        const arrowSize = (el.data?.arrowSize ?? 10) as number;
        const arrowEnds = (el.data?.arrowEnds ?? 'start') as 'none' | 'start' | 'end' | 'both';
        // 起点箭头沿第一段水平（p1->p2）；终点箭头沿最后一段水平（p3->p4）
        const sx1 = p1.x, sy1 = p1.y;
        const sx2 = p1.x + sgnH1 * arrowSize * 2, sy2 = p1.y;
        const ex1 = p4.x - sgnH2 * arrowSize * 2, ey1 = p4.y;
        return (
          <>
            <Path
              key={el.id}
              id={el.id}
              data={d}
              stroke={stroke}
              strokeWidth={strokeWidth}
              lineCap="round"
              lineJoin="round"
            />
            {arrowEnds !== 'none' && (arrowEnds === 'start' || arrowEnds === 'both') && (
              <Arrow
                points={[sx1, sy1, sx2, sy2]}
                pointerLength={arrowSize}
                pointerWidth={arrowSize}
                fill={stroke}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            )}
            {arrowEnds !== 'none' && (arrowEnds === 'end' || arrowEnds === 'both') && (
              <Arrow
                points={[ex1, ey1, p4.x, p4.y]}
                pointerLength={arrowSize}
                pointerWidth={arrowSize}
                fill={stroke}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            )}
          </>
        );
      }
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
