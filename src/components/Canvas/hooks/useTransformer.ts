import { useEffect, useRef } from 'react';
import type React from 'react';
import type Konva from 'konva';

export function useTransformer(
  stageRef: React.RefObject<Konva.Stage | null>,
  selectedElement: string | null,
  selectedIds?: string[]
) {
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = trRef.current;
    if (!stage || !transformer) return;

    const ids = selectedIds && selectedIds.length ? selectedIds : (selectedElement ? [selectedElement] : []);
    if (!ids.length) {
      transformer.nodes([]);
      return;
    }

    const nodes = ids
      .map((id) => stage.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [stageRef, selectedElement, selectedIds]);

  return trRef;
}
