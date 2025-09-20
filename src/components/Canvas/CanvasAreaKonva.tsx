import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Group, Transformer, Circle } from "react-konva";
import type Konva from "konva";
import { useCanvasStore } from "@/stores/canvasStore";
import { useToolStore } from "@/stores/toolStore";
import { useCommentStore } from "@/stores/commentStore";
import type { CanvasElement } from "@/types/canvas";
import { TextEditorOverlay } from "./overlays/TextEditorOverlay";
import { CommentEditorOverlay } from "./overlays/CommentEditorOverlay";
import { useSelectionBox } from "./hooks/useSelectionBox";
import { ElementRenderer } from "./elements/ElementRenderer";
import { BezierControls } from "./elements/BezierControls";
import { LineEndpoints } from "./elements/LineEndpoints";
import { useTransformer } from "./hooks/useTransformer";
import { useCreateElement } from "./hooks/useCreateElement";
import { useStageViewport } from "./hooks/useStageViewport";

export const CanvasAreaKonva: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const {
    elements,
    selectedElement,
    selectElement,
    updateElement,
    clearSelection,
  } = useCanvasStore() as any;
  const selectedIds = (useCanvasStore as any)(
    (s: any) => s.selectedIds as string[] | undefined
  );
  const { activeTool, setActiveTool } = useToolStore();
  const {
    setCreatingComment,
    isCreatingComment,
    commentPosition,
    targetElementId,
    addComment,
  } = useCommentStore() as any;

  const { size, scale, position, setPosition, handleWheel } =
    useStageViewport(containerRef);
  const trRef = useTransformer(stageRef, selectedElement, selectedIds);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [textareaStyle, setTextareaStyle] = useState<React.CSSProperties>({
    display: "none",
  });

  const {
    isSelecting,
    selectRect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSelectionBox(activeTool);
  const {
    fileInputRef,
    createText,
    createRect,
    createImageFromDataURL,
    openImagePicker,
  } = useCreateElement({ size, scale, position });

  const handleContextMenu = (
    e: Konva.KonvaEventObject<MouseEvent | PointerEvent>
  ) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // For now, create a canvas-level comment
    const s = stage.scaleX();
    const abs = { x: pointer.x * s + stage.x(), y: pointer.y * s + stage.y() };
    setCreatingComment(true, abs);
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
      position: "absolute",
      left,
      top,
      width,
      height,
      fontSize: node.fontSize() * s + "px",
      fontFamily: node.fontFamily() || "Arial",
      color: node.fill() as string,
      padding: "2px 4px",
      margin: 0,
      border: "1px solid #3b82f6",
      background: "white",
      outline: "none",
      resize: "none",
      overflow: "hidden",
      lineHeight: "1.2",
      display: "block",
      zIndex: 30,
    });
  }, [editingId, scale, position, size]);

  // 画笔绘制状态
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // 组拖拽：记录起点指针与基准位置
  const dragBasePositionsRef = useRef<Record<string, { x: number; y: number }>>(
    {}
  );
  const [dragStartPointer, setDragStartPointer] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 连接线（直线）创建状态
  const [lineCreatingId, setLineCreatingId] = useState<string | null>(null);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lineStartElementId, setLineStartElementId] = useState<string | null>(
    null
  );
  const [hoverElementId, setHoverElementId] = useState<string | null>(null);
  const [lineEndElementId, setLineEndElementId] = useState<string | null>(null);

  // ===== 端点吸附（锚点：元素中心与四边中点） + Shift 约束 =====
  const SNAP_THRESHOLD = 8; // px
  const getElementAnchors = (el: CanvasElement) => {
    const { x, y } = el.position;
    const { width, height } = el.size;
    const cx = x + width / 2;
    const cy = y + height / 2;
    return [
      { x: cx, y }, // top
      { x: x + width, y: cy }, // right
      { x: cx, y: y + height }, // bottom
      { x, y: cy }, // left
      { x: cx, y: cy }, // center（用于吸附计算，但不显示为锚点）
    ];
  };
  // 根据方向向量挑选最合适的边锚点（忽略中心）
  const pickSideAnchorByVector = (
    el: CanvasElement,
    dir: { x: number; y: number }
  ) => {
    const anchors = getElementAnchors(el);
    const [top, right, bottom, left] = anchors;
    const ax = Math.abs(dir.x);
    const ay = Math.abs(dir.y);
    if (ax >= ay) {
      return dir.x >= 0 ? right : left;
    } else {
      return dir.y >= 0 ? bottom : top;
    }
  };
  // 评估两点的曼哈顿距离
  const manhattan = (
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  // 根据边与指向关系给方向不一致添加惩罚（鼓励从该边“出发方向”）
  const directionPenalty = (
    side: "top" | "right" | "bottom" | "left",
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    switch (side) {
      case "left":
        return dx <= 0 ? 0 : 200; // 期望向左
      case "right":
        return dx >= 0 ? 0 : 200; // 期望向右
      case "top":
        return dy <= 0 ? 0 : 200; // 期望向上
      case "bottom":
        return dy >= 0 ? 0 : 200; // 期望向下
    }
  };
  // 返回元素四边点与其 side 标签
  const getSideAnchorsLabeled = (el: CanvasElement) => {
    const { x, y } = el.position;
    const { width, height } = el.size;
    const cx = x + width / 2;
    const cy = y + height / 2;
    return [
      { pt: { x: cx, y }, side: "top" as const },
      { pt: { x: x + width, y: cy }, side: "right" as const },
      { pt: { x: cx, y: y + height }, side: "bottom" as const },
      { pt: { x, y: cy }, side: "left" as const },
    ];
  };
  // 选择最优(start,end)锚点组合（简单：曼哈顿 + 方向惩罚）
  const chooseBestAnchorPair = (
    source: CanvasElement,
    target: CanvasElement
  ) => {
    const SA = getSideAnchorsLabeled(source);
    const TA = getSideAnchorsLabeled(target);
    let best: {
      s: (typeof SA)[number];
      t: (typeof TA)[number];
      cost: number;
    } | null = null;
    for (const s of SA) {
      for (const t of TA) {
        const base = manhattan(s.pt, t.pt);
        const penS = directionPenalty(s.side, s.pt, t.pt);
        const penT = directionPenalty(t.side, t.pt, s.pt); // 反向，同样鼓励进入该边的正确方向
        const cost = base + penS + penT;
        if (!best || cost < best.cost) best = { s, t, cost };
      }
    }
    return best
      ? { start: best.s.pt, end: best.t.pt }
      : {
          start: { x: source.position.x, y: source.position.y },
          end: { x: target.position.x, y: target.position.y },
        };
  };
  const distance2 = (
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };
  const snapPoint = (p: { x: number; y: number }) => {
    let best: { x: number; y: number } | null = null;
    let bestD2 = Number.POSITIVE_INFINITY;
    for (const el of elements) {
      const anchors = getElementAnchors(el);
      for (const a of anchors) {
        const d2 = distance2(p, a);
        if (d2 < bestD2) {
          bestD2 = d2;
          best = a;
        }
      }
    }
    if (best && bestD2 <= SNAP_THRESHOLD * SNAP_THRESHOLD) return best;
    return p;
  };
  const applyShiftConstraint = (
    start: { x: number; y: number },
    current: { x: number; y: number },
    shiftKey: boolean
  ) => {
    if (!shiftKey) return current;
    const dx = Math.abs(current.x - start.x);
    const dy = Math.abs(current.y - start.y);
    if (dx >= dy) {
      return { x: current.x, y: start.y };
    } else {
      return { x: start.x, y: current.y };
    }
  };

  // 切换出 pan 工具时复位舞台位置，避免历史平移导致拖动错位的感知偏差
  useEffect(() => {
    if (activeTool !== "pan" && (position.x !== 0 || position.y !== 0)) {
      setPosition({ x: 0, y: 0 });
    }
  }, [activeTool]);

  // 获取舞台内相对坐标（考虑缩放和平移）
  const getRelativePointer = () => {
    const stage = stageRef.current;
    if (!stage) return null as null | { x: number; y: number };
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pos);
  };

  const handlePenMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent | PointerEvent | TouchEvent>
  ) => {
    if (activeTool !== "pen") return;
    const p = getRelativePointer();
    if (!p) return;
    const id = crypto.randomUUID();
    // 读取画笔默认样式
    const penOpts =
      (useToolStore.getState().getDefaultOptions("pen") as any) || {};
    const now = new Date();
    (useCanvasStore as any).getState().addElement({
      id,
      type: "line",
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
      style: {
        stroke: penOpts.strokeColor || "#000000",
        strokeWidth: penOpts.strokeWidth || 2,
        lineCap: penOpts.lineCap || "round",
        lineJoin: penOpts.lineJoin || "round",
      },
      data: { points: [{ x: p.x, y: p.y }] },
      zIndex: 0,
      createdAt: now,
      updatedAt: now,
    });
    setDrawingId(id);
    setIsDrawing(true);
  };

  const handlePenMouseMove = (
    e: Konva.KonvaEventObject<MouseEvent | PointerEvent | TouchEvent>
  ) => {
    if (activeTool !== "pen" || !isDrawing || !drawingId) return;
    const p = getRelativePointer();
    if (!p) return;
    const store = (useCanvasStore as any).getState();
    const el = store.elements.find((x: any) => x.id === drawingId);
    if (!el) return;
    const prev = (el.data?.points || []) as { x: number; y: number }[];
    const next = [...prev, { x: p.x, y: p.y }];
    store.updateElement(drawingId, {
      data: { ...(el.data || {}), points: next },
    });
  };

  const handlePenMouseUp = (
    e: Konva.KonvaEventObject<MouseEvent | PointerEvent | TouchEvent>
  ) => {
    if (activeTool !== "pen") return;
  };

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
  }, [elements, activeTool, selectElement, updateElement, selectedIds]);

  const lineEndpointControls = useMemo(() => {
    if (!selectedElement) return null;
    const lineEl = elements.find(
      (e) => e.id === selectedElement && e.type === "line"
    );
    if (!lineEl) return null;
    const pts = (lineEl.data?.points || []) as { x: number; y: number }[];
    if (!pts.length) return null;
    // 如果是曲线，显示贝塞尔控制点
    if (
      lineEl.data?.connectionType === "curved" &&
      lineEl.data.control1 &&
      lineEl.data.control2
    ) {
      return (
        <BezierControls
          element={lineEl as any}
          onUpdate={updateElement as any}
        />
      );
    }
    // 否则显示直线端点
    return (
      <LineEndpoints element={lineEl as any} onUpdate={updateElement as any} />
    );
  }, [selectedElement, elements, updateElement]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#f8f9fa]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            createImageFromDataURL(dataUrl);
          };
          reader.readAsDataURL(file);
          setActiveTool("select");
          e.currentTarget.value = "";
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
        draggable={activeTool === "pan"}
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) =>
          setPosition({ x: e.target.x(), y: e.target.y() })
        }
        onWheel={(e) => handleWheel(e as any, stageRef.current)}
        onContextMenu={handleContextMenu}
        onMouseDown={(
          e: Konva.KonvaEventObject<MouseEvent | PointerEvent | TouchEvent>
        ) => {
          if (activeTool === "pen") return handlePenMouseDown(e);
          if (activeTool === "line") {
            const p = getRelativePointer();
            if (!p) return;
            // 吸附 + Shift 约束（按下时 Shift 没必要，兼容性保留）
            const snapped = snapPoint(p);
            setLineStart(snapped);
            // 若按下位置命中某元素，则记录为从该元素内部开始
            const target: any = e.target;
            const type = target?.getType ? target.getType() : target?.className;
            const isEmpty =
              target === e.target.getStage() ||
              type === "Layer" ||
              type === "Group";
            if (!isEmpty && typeof target?.id === "function") {
              const tid = target.id();
              const el = elements.find((x: CanvasElement) => x.id === tid);
              setLineStartElementId(el ? tid : null);
            } else {
              setLineStartElementId(null);
            }
            const id = crypto.randomUUID();
            const now = new Date();
            const lineOpts =
              (useToolStore.getState().getDefaultOptions("line") as any) || {};
            (useCanvasStore as any).getState().addElement({
              id,
              type: "line",
              position: { x: 0, y: 0 },
              size: { width: 0, height: 0 },
              style: {
                stroke: lineOpts.strokeColor || "#000000",
                strokeWidth: lineOpts.strokeWidth || 2,
                lineCap: lineOpts.lineCap || "round",
                lineJoin: lineOpts.lineJoin || "round",
              },
              data: {
                points: [
                  { x: snapped.x, y: snapped.y },
                  { x: snapped.x, y: snapped.y },
                ],
                connectionType: "orthogonal",
                cornerRadius: 12,
                arrowSize: 10,
                arrowEnds: "end",
              },
              zIndex: 0,
              createdAt: now,
              updatedAt: now,
            });
            setLineCreatingId(id);
            return;
          }
          return handleMouseDown(e as any);
        }}
        onMouseMove={(
          e: Konva.KonvaEventObject<MouseEvent | PointerEvent | TouchEvent>
        ) => {
          if (activeTool === "pen") return handlePenMouseMove(e);
          if (activeTool === "line" && lineCreatingId && lineStart) {
            const p = getRelativePointer();
            if (!p) return;
            const withShift = applyShiftConstraint(
              lineStart,
              p,
              !!(e.evt as MouseEvent).shiftKey
            );
            // 检测当前指针命中的元素，若命中则使用(source,target)最优锚点对
            let snapped = withShift;
            const target: any = e.target;
            const type = target?.getType ? target.getType() : target?.className;
            const isEmpty =
              target === e.target.getStage() ||
              type === "Layer" ||
              type === "Group";
            if (!isEmpty && typeof target?.id === "function") {
              const tid = target.id();
              const endEl = elements.find((x: CanvasElement) => x.id === tid);
              if (endEl) {
                setLineEndElementId(tid);
                if (lineStartElementId) {
                  const se = elements.find(
                    (x: CanvasElement) => x.id === lineStartElementId
                  )!;
                  const pair = chooseBestAnchorPair(se, endEl);
                  // 覆盖起/终点
                  setLineStart(pair.start);
                  snapped = pair.end;
                } else {
                  // 起点不是元素内部，从自由点出发，仅优化目标端
                  const startCenter = lineStart; // 近似
                  const dirToEnd = {
                    x: endEl.position.x + endEl.size.width / 2 - startCenter!.x,
                    y:
                      endEl.position.y + endEl.size.height / 2 - startCenter!.y,
                  };
                  snapped = pickSideAnchorByVector(endEl, dirToEnd);
                }
              }
            } else {
              setLineEndElementId(null);
              snapped = snapPoint(withShift);
            }
            const store = (useCanvasStore as any).getState();
            const el = store.elements.find((x: any) => x.id === lineCreatingId);
            if (!el) return;
            // 若起点来自某元素内部，则根据方向自动挑选该元素的边锚点作为真正起点
            let startPt = lineStart;
            if (lineStartElementId) {
              const startEl = elements.find(
                (x: CanvasElement) => x.id === lineStartElementId
              );
              if (startEl) {
                const dir = {
                  x: snapped.x - (startEl.position.x + startEl.size.width / 2),
                  y: snapped.y - (startEl.position.y + startEl.size.height / 2),
                };
                startPt = pickSideAnchorByVector(startEl, dir);
                // 同步更新 lineStart 以便后续 Move/Up 一致
                setLineStart(startPt);
              }
            }
            const pts = [
              { x: startPt.x, y: startPt.y },
              { x: snapped.x, y: snapped.y },
            ];
            store.updateElement(lineCreatingId, {
              data: { ...(el.data || {}), points: pts },
            });
            return;
          }
          if (activeTool === "line" && !lineCreatingId) {
            const target: any = e.target;
            const type = target?.getType ? target.getType() : target?.className;
            const isEmpty =
              target === e.target.getStage() ||
              type === "Layer" ||
              type === "Group";
            if (!isEmpty && typeof target?.id === "function") {
              const tid = target.id();
              // 仅当对应 id 是元素 id 时高亮
              const el = elements.find((x: CanvasElement) => x.id === tid);
              setHoverElementId(el ? tid : null);
            } else {
              setHoverElementId(null);
            }
          }
          return handleMouseMove(e as any);
        }}
        onMouseUp={(
          e: Konva.KonvaEventObject<MouseEvent | PointerEvent | TouchEvent>
        ) => {
          if (activeTool === "pen") return handlePenMouseUp(e);
          if (activeTool === "line" && lineCreatingId && lineStart) {
            const p0 = getRelativePointer();
            const store = (useCanvasStore as any).getState();
            if (!p0) {
              // 取消
              setLineCreatingId(null);
              setLineStart(null);
              setLineStartElementId(null);
              return;
            }
            const withShift = applyShiftConstraint(
              lineStart,
              p0,
              !!(e.evt as MouseEvent).shiftKey
            );
            // 若结束命中了某元素，选择(source,target)最优锚点对
            let p = withShift;
            if (lineEndElementId) {
              const endEl = elements.find(
                (x: CanvasElement) => x.id === lineEndElementId
              );
              if (endEl) {
                if (lineStartElementId) {
                  const se = elements.find(
                    (x: CanvasElement) => x.id === lineStartElementId
                  )!;
                  const pair = chooseBestAnchorPair(se, endEl);
                  setLineStart(pair.start);
                  p = pair.end;
                } else {
                  const startCenter = lineStart;
                  const dirToEnd = {
                    x: endEl.position.x + endEl.size.width / 2 - startCenter!.x,
                    y:
                      endEl.position.y + endEl.size.height / 2 - startCenter!.y,
                  };
                  p = pickSideAnchorByVector(endEl, dirToEnd);
                }
              }
            } else {
              p = snapPoint(withShift);
            }
            const dx = p.x - lineStart.x;
            const dy = p.y - lineStart.y;
            const len2 = dx * dx + dy * dy;
            if (len2 < 4) {
              // 过短，移除
              store.removeElement?.(lineCreatingId);
            }
            setLineCreatingId(null);
            setLineStart(null);
            setLineStartElementId(null);
            setLineEndElementId(null);
            return;
          }
          return handleMouseUp(e as any);
        }}
        onClick={(e) => {
          const stage = e.target.getStage();
          if (!stage) return;
          if (activeTool === "pen") return; // 画笔模式下不走点击创建逻辑
          const type = (e.target as any)?.getType
            ? (e.target as any).getType()
            : (e.target as any)?.className;
          const clickedOnEmpty =
            e.target === stage || type === "Layer" || type === "Group";
          const targetId = !clickedOnEmpty
            ? (e.target as any)?.id?.()
            : undefined;
          // 选择工具：点击空白清空选中
          if (activeTool === "select" && clickedOnEmpty) {
            clearSelection?.();
            trRef.current?.nodes([]);
            return;
          }
          if (!clickedOnEmpty && activeTool !== "comment") return;
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          if (activeTool === "text") {
            createText(pointer.x, pointer.y);
          } else if (activeTool === "rect") {
            createRect(pointer.x, pointer.y);
          } else if (activeTool === "image") {
            openImagePicker();
          } else if (activeTool === "comment") {
            const s = stage.scaleX();
            const abs = {
              x: pointer.x * s + stage.x(),
              y: pointer.y * s + stage.y(),
            };
            setCreatingComment(true, abs, targetId);
          }
          return handleMouseUp(e as any);
        }}
      >
        <Layer>
          <Group>{renderedElements}</Group>
          {/* 连接线模式下的锚点提示（上/右/下/左） */}
          {activeTool === "line" &&
            !lineCreatingId &&
            hoverElementId &&
            (() => {
              const el = elements.find(
                (x: CanvasElement) => x.id === hoverElementId
              );
              if (!el) return null;
              const anchors = getElementAnchors(el);
              // 仅显示四个边锚点，排除中心（最后一个）
              const showAnchors = anchors.slice(0, 4);
              const handleAnchorDown =
                (pt: { x: number; y: number }) => (evt: any) => {
                  // 阻止事件冒泡到 Stage
                  evt.cancelBubble = true;
                  const id = crypto.randomUUID();
                  const now = new Date();
                  const lineOpts =
                    (useToolStore
                      .getState()
                      .getDefaultOptions("line") as any) || {};
                  setLineStart(pt);
                  (useCanvasStore as any).getState().addElement({
                    id,
                    type: "line",
                    position: { x: 0, y: 0 },
                    size: { width: 0, height: 0 },
                    style: {
                      stroke: lineOpts.strokeColor || "#000000",
                      strokeWidth: lineOpts.strokeWidth || 2,
                      lineCap: lineOpts.lineCap || "round",
                      lineJoin: lineOpts.lineJoin || "round",
                    },
                    data: {
                      points: [
                        { x: pt.x, y: pt.y },
                        { x: pt.x, y: pt.y },
                      ],
                      connectionType: "orthogonal",
                      cornerRadius: 12,
                      arrowSize: 10,
                      arrowEnds: "end",
                    },
                    zIndex: 0,
                    createdAt: now,
                    updatedAt: now,
                  });
                  setLineCreatingId(id);
                };
              return (
                <Group>
                  {showAnchors.map((pt, idx) => (
                    <Circle
                      key={`${hoverElementId}-anchor-${idx}`}
                      x={pt.x}
                      y={pt.y}
                      radius={6}
                      stroke={"#3b82f6"}
                      strokeWidth={2}
                      fill={"#ffffff"}
                      onMouseDown={handleAnchorDown(pt)}
                    />
                  ))}
                </Group>
              );
            })()}
          {isSelecting && selectRect && (
            <Rect
              x={selectRect.x}
              y={selectRect.y}
              width={selectRect.width}
              height={selectRect.height}
              fill={"rgba(59,130,246,0.1)"}
              stroke={"#3b82f6"}
              dash={[4, 4]}
            />
          )}
          {activeTool === "select" && (
            <Transformer
              ref={(node: any) => (trRef.current = node)}
              rotateEnabled={true}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
              anchorSize={8}
              borderStroke={"#3b82f6"}
              anchorStroke={"#3b82f6"}
              anchorFill={"#ffffff"}
            />
          )}
          {activeTool === "select" && lineEndpointControls}
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
          setTextareaStyle({ display: "none" });
          if (id) {
            updateElement(id, {
              data: {
                ...(elements.find((x) => x.id === id)?.data || {}),
                text: editingValue,
              },
              updatedAt: new Date(),
            } as any);
          }
        }}
        onCancel={() => {
          setEditingId(null);
          setTextareaStyle({ display: "none" });
        }}
      />
      {/* 评论输入浮层：使用像素坐标定位 */}
      <CommentEditorOverlay
        visible={!!isCreatingComment}
        position={commentPosition}
        onCancel={() => setCreatingComment(false)}
        onSubmit={(content) => {
          const stage = stageRef.current;
          if (!stage || !commentPosition) return setCreatingComment(false);
          const s = stage.scaleX();
          // 将像素坐标转换为舞台坐标存入评论
          const stagePos = {
            x: (commentPosition.x - stage.x()) / s,
            y: (commentPosition.y - stage.y()) / s,
          };
          addComment({
            content,
            position: stagePos,
            author: "You",
            elementId: targetElementId,
          } as any);
          setCreatingComment(false);
        }}
      />
    </div>
  );
};

export default CanvasAreaKonva;
