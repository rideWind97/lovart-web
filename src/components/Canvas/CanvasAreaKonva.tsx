import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Rect, Group, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '@/stores/canvasStore';
import { useToolStore } from '@/stores/toolStore';
import { useCommentStore } from '@/stores/commentStore';
import type { CanvasElement } from '@/types/canvas';
import { TextEditorOverlay } from './overlays/TextEditorOverlay';
import { useSelectionBox } from './hooks/useSelectionBox';
import { ElementRenderer } from './elements/ElementRenderer';
import { BezierControls } from './elements/BezierControls';
import { LineEndpoints } from './elements/LineEndpoints';
import { useTransformer } from './hooks/useTransformer';
import { useCreateElement } from './hooks/useCreateElement';
import { useStageViewport } from './hooks/useStageViewport';
export const CanvasAreaKonva: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const { elements, selectedElement, selectElement, updateElement } = useCanvasStore();
  const selectedIds = (useCanvasStore as any)((s: any) => s.selectedIds as string[] | undefined);
  const { activeTool, setActiveTool } = useToolStore();
  const { setCreatingComment } = useCommentStore();

  const { size, scale, position, setPosition, handleWheel } = useStageViewport(containerRef);
  const trRef = useTransformer(stageRef, selectedElement, selectedIds);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [textareaStyle, setTextareaStyle] = useState<React.CSSProperties>({ display: 'none' });

  const { isSelecting, selectRect, handleMouseDown, handleMouseMove, handleMouseUp } = useSelectionBox(activeTool);
  const { fileInputRef, createText, createRect, createImageFromDataURL, openImagePicker } = useCreateElement({ size, scale, position });


  const handleContextMenu = (
    e: Konva.KonvaEventObject<MouseEvent | PointerEvent>
  ) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // For now, create a canvas-level comment
    setCreatingComment(true, { x: pointer.x, y: pointer.y });
  };

  // 本地框选逻辑已移至 useSelectionBox，Transformer 由 useTransformer 绑定

  useEffect(() => {
    if (!editingId) return;
    const stage = stageRef.current;
    const container = containerRef.current;
    if (!stage || !container) return;
    const node = stage.findOne(`#${editingId}`) as Konva.Text | null;
    if (!node) return;
    const absPos = node.getAbsolutePosition();
    const s = stage.scaleX();
    const left = absPos.x * s + stage.x();
    const top = absPos.y * s + stage.y();
    const width = Math.max(30, node.width() * s);
    const height = Math.max(24, node.height() * s);
    setTextareaStyle({
      position: 'absolute',
      left,
      top,
      width,
      height,
      fontSize: (node.fontSize() * s) + 'px',
      fontFamily: node.fontFamily() || 'Arial',
      color: node.fill() as string,
      padding: '2px 4px',
      margin: 0,
      border: '1px solid #3b82f6',
      background: 'white',
      outline: 'none',
      resize: 'none',
      overflow: 'hidden',
      lineHeight: '1.2',
      display: 'block',
      zIndex: 30,
    });
  }, [editingId, scale, position, size]);

  const renderedElements = useMemo(() => {
    return elements.map((el: CanvasElement) => (
      <ElementRenderer
        key={el.id}
        element={el}
        activeTool={activeTool}
        onSelect={selectElement}
        onUpdate={updateElement}
        onTextDblClick={(id, currentText) => {
          setEditingId(id);
          setEditingValue(currentText);
          trRef.current?.nodes([]);
        }}
      />
    ));
  }, [elements, activeTool, selectElement, updateElement]);

  const lineEndpointControls = useMemo(() => {
    if (!selectedElement) return null;
    const lineEl = elements.find((e) => e.id === selectedElement && e.type === 'line');
    if (!lineEl) return null;
    const pts = (lineEl.data?.points || []) as { x: number; y: number }[];
    if (!pts.length) return null;
    // 如果是曲线，显示贝塞尔控制点
    if (lineEl.data?.connectionType === 'curved' && lineEl.data.control1 && lineEl.data.control2) {
      return <BezierControls element={lineEl as any} onUpdate={updateElement as any} />;
    }
    // 否则显示直线端点
    return <LineEndpoints element={lineEl as any} onUpdate={updateElement as any} />;
  }, [selectedElement, elements, updateElement]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#f8f9fa]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            createImageFromDataURL(dataUrl);
          };
          reader.readAsDataURL(file);
          setActiveTool('select');
          e.currentTarget.value = '';
        }}
      />
      <Stage
        ref={(node: Konva.Stage | null) => (stageRef.current = node)}
        width={size.width}
        height={size.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={activeTool === 'pan'}
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) =>
          setPosition({ x: e.target.x(), y: e.target.y() })
        }
        onWheel={(e) => handleWheel(e as any, stageRef.current)}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          const stage = e.target.getStage();
          if (!stage) return;
          const clickedOnEmpty = e.target === stage;
          if (!clickedOnEmpty) return;
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          if (activeTool === 'text') {
            createText(pointer.x, pointer.y);
          } else if (activeTool === 'rect') {
            createRect(pointer.x, pointer.y);
          } else if (activeTool === 'image') {
            openImagePicker();
          }
        }}
      >
        <Layer>
          <Group>{renderedElements}</Group>
          {isSelecting && selectRect && (
            <Rect
              x={selectRect.x}
              y={selectRect.y}
              width={selectRect.width}
              height={selectRect.height}
              fill={'rgba(59,130,246,0.1)'}
              stroke={'#3b82f6'}
              dash={[4, 4]}
            />
          )}
          {activeTool === 'select' && (
            <Transformer
              ref={(node: any) => (trRef.current = node)}
              rotateEnabled={true}
              enabledAnchors={["top-left","top-right","bottom-left","bottom-right","middle-left","middle-right","top-center","bottom-center"]}
              anchorSize={8}
              borderStroke={'#3b82f6'}
              anchorStroke={'#3b82f6'}
              anchorFill={'#ffffff'}
            />
          )}
          {activeTool === 'select' && lineEndpointControls}
        </Layer>
      </Stage>
      <TextEditorOverlay
        visible={!!editingId}
        style={textareaStyle}
        value={editingValue}
        onChange={setEditingValue}
        onCommit={() => {
          const id = editingId;
          setEditingId(null);
          setTextareaStyle({ display: 'none' });
          if (id) {
            updateElement(id, {
              data: { ...(elements.find(x => x.id === id)?.data || {}), text: editingValue },
              updatedAt: new Date(),
            } as any);
          }
        }}
        onCancel={() => {
          setEditingId(null);
          setTextareaStyle({ display: 'none' });
        }}
      />
    </div>
  );
};

export default CanvasAreaKonva;
