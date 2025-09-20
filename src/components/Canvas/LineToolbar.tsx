import React, { useMemo } from "react";
import { Space, Select, InputNumber, Tooltip, ColorPicker, Slider } from "antd";
import { useCanvasStore } from "@/stores/canvasStore";
import { useToolStore } from "@/stores/toolStore";
import "./TextToolbar.css";

const TYPE_OPTIONS = [
  { label: "Orthogonal", value: "orthogonal" },
  { label: "Curved", value: "curved" },
  { label: "Straight", value: "straight" },
];
const ARROW_ENDS_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Start", value: "start" },
  { label: "End", value: "end" },
  { label: "Both", value: "both" },
];

export const LineToolbar: React.FC = () => {
  const { elements, selectedElement, updateElement } = useCanvasStore();
  const selectedIds = (useCanvasStore as any)((s: any) => s.selectedIds as string[] | undefined);
  const { updateToolOptions } = useToolStore();

  const lineIds = useMemo(() => {
    if (selectedIds && selectedIds.length) {
      return selectedIds.filter((id: string) => elements.find((e) => e.id === id && e.type === "line"));
    }
    if (selectedElement) {
      const el = elements.find((e) => e.id === selectedElement);
      return el?.type === "line" ? [selectedElement] : [];
    }
    return [];
  }, [selectedIds, selectedElement, elements]);

  const firstLine = useMemo(() => (lineIds.length ? elements.find((e) => e.id === lineIds[0]) : undefined), [lineIds, elements]);
  const style = (firstLine?.style || {}) as any;
  const data = (firstLine?.data || {}) as any;

  const batchUpdateStyle = (patch: Record<string, any>) => {
    if (lineIds.length) {
      lineIds.forEach((id) => {
        const el = elements.find((e) => e.id === id)!;
        updateElement(id, { style: { ...(el.style || {}), ...patch } });
      });
    } else {
      updateToolOptions("line", patch as any);
    }
  };
  const batchUpdateData = (patch: Record<string, any>) => {
    if (lineIds.length) {
      lineIds.forEach((id) => {
        const el = elements.find((e) => e.id === id)!;
        updateElement(id, { data: { ...(el.data || {}), ...patch } } as any);
      });
    } else {
      updateToolOptions("line", patch as any);
    }
  };

  return (
    <div className="text-toolbar">
      {/* 颜色 */}
      <span className="icon-btn color-dot">
        <Tooltip title="Stroke color">
          <ColorPicker
            value={style.stroke || "#9ca3af"}
            onChange={(c) => batchUpdateStyle({ stroke: c.toHexString() })}
          />
        </Tooltip>
      </span>

      {/* 线宽 */}
      <span className="pill">
        <Space size={6}>
          <span className="text-xs text-gray-500">Width</span>
          <InputNumber
            value={style.strokeWidth ?? 2}
            min={1}
            max={32}
            onChange={(v) => batchUpdateStyle({ strokeWidth: (v as number) ?? 2 })}
          />
        </Space>
      </span>

      {/* 圆角 */}
      <span className="pill" style={{ paddingRight: 12 }}>
        <span className="text-xs text-gray-500 mr-2">Corner</span>
        <Slider style={{ width: 120 }} value={data.cornerRadius ?? 12} min={0} max={64}
          onChange={(v) => batchUpdateData({ cornerRadius: v as number })}
        />
      </span>

      {/* 箭头大小 */}
      <span className="pill">
        <Space size={6}>
          <span className="text-xs text-gray-500">Arrow</span>
          <InputNumber
            value={data.arrowSize ?? 10}
            min={0}
            max={64}
            onChange={(v) => batchUpdateData({ arrowSize: (v as number) ?? 10 })}
          />
        </Space>
      </span>

      {/* 箭头端 */}
      <span className="pill">
        <Select
          value={data.arrowEnds ?? "start"}
          style={{ width: 120 }}
          options={ARROW_ENDS_OPTIONS}
          onChange={(v) => batchUpdateData({ arrowEnds: v })}
        />
      </span>

      {/* 连接线类型 */}
      <span className="pill">
        <Select
          value={data.connectionType ?? "orthogonal"}
          style={{ width: 140 }}
          options={TYPE_OPTIONS}
          onChange={(v) => batchUpdateData({ connectionType: v })}
        />
      </span>
    </div>
  );
}
