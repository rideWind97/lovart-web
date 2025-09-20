import React, { useEffect, useMemo, useRef } from 'react';
import type Konva from 'konva';
import KonvaNS from 'konva';
import { Text } from 'react-konva';
import type { CanvasElement } from '@/types/canvas';

interface Props {
  element: CanvasElement;
  activeTool: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDblClick?: (id: string, currentText: string) => void;
}

export const TextNode: React.FC<Props> = ({ element: el, activeTool, onSelect, onUpdate, onDblClick }) => {
  const textRef = useRef<Konva.Text | null>(null);

  useEffect(() => {
    // 样式变更后强制重绘，避免个别情况下未即时刷新
    textRef.current?.getLayer()?.batchDraw();
  }, [
    (el.style as any)?.fontSize,
    (el.style as any)?.fontFamily,
    (el.style as any)?.fill,
    (el.style as any)?.fontWeight,
    (el.style as any)?.textAlign,
    (el.style as any)?.opacity,
    (el.style as any)?.shadowColor,
    (el.style as any)?.shadowBlur,
    (el.style as any)?.shadowOffsetX,
    (el.style as any)?.shadowOffsetY,
    (el.style as any)?.shadowOpacity,
    (el.style as any)?.blurRadius,
    el.data?.text,
  ]);
  const weight = el.style?.fontWeight;
  const isBold = weight === 'bold' || (typeof weight === 'string' && !isNaN(parseInt(weight)) && parseInt(weight) >= 600);
  const blurRadius = (el.style as any)?.blurRadius as number | undefined;
  const filters = useMemo(() => {
    const arr: any[] = [];
    if (blurRadius && blurRadius > 0) arr.push(KonvaNS.Filters.Blur);
    return arr;
  }, [blurRadius]);

  // Konva 的 Filters 需要节点缓存后才会生效
  useEffect(() => {
    const node = textRef.current as any;
    if (!node) return;
    if (blurRadius && blurRadius > 0) {
      // 开启缓存以启用滤镜
      node.cache();
    } else {
      // 关闭滤镜时清除缓存
      if (node.clearCache) node.clearCache();
    }
    node.getLayer()?.batchDraw();
  }, [blurRadius]);
  return (
    <Text
      ref={(n) => (textRef.current = n as any)}
      key={el.id}
      id={el.id}
      x={el.position.x}
      y={el.position.y}
      text={el.data?.text || ''}
      fontSize={el.style?.fontSize || 24}
      fontFamily={el.style?.fontFamily || 'Arial'}
      align={el.style?.textAlign || 'left'}
      fontStyle={isBold ? 'bold' : 'normal'}
      fill={el.style?.fill || '#000'}
      opacity={el.style?.opacity ?? 1}
      shadowColor={(el.style as any)?.shadowColor}
      shadowBlur={(el.style as any)?.shadowBlur}
      shadowOffsetX={(el.style as any)?.shadowOffsetX}
      shadowOffsetY={(el.style as any)?.shadowOffsetY}
      shadowOpacity={(el.style as any)?.shadowOpacity}
      shadowEnabled={(el.style as any)?.shadowEnabled}
      filters={filters as any}
      blurRadius={blurRadius as any}
      draggable={activeTool === 'select'}
      onClick={() => onSelect(el.id)}
      onTap={() => onSelect(el.id)}
      onDblClick={() => onDblClick?.(el.id, el.data?.text || '')}
      onDragEnd={(e) => {
        const node = e.target as Konva.Text;
        onUpdate(el.id, {
          position: { x: node.x(), y: node.y() },
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Text;
        const scaleX = node.scaleX();
        const newWidth = Math.max(5, node.width() * scaleX);
        node.scaleX(1);
        node.scaleY(1);
        node.width(newWidth);
        onUpdate(el.id, {
          position: { x: node.x(), y: node.y() },
          size: { width: newWidth, height: node.height() },
        });
      }}
    />
  );
};
