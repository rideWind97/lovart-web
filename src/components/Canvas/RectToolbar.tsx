import React, { useMemo, useState } from "react";
import { Button, InputNumber, Popover, Slider, Space, Tooltip, ColorPicker } from "antd";
import { useCanvasStore } from "@/stores/canvasStore";
import { useToolStore } from "@/stores/toolStore";
import { CloseOutlined, LinkOutlined, DisconnectOutlined } from "@ant-design/icons";
import "./TextToolbar.css";

export const RectToolbar: React.FC = () => {
  const { elements, selectedElement, updateElement } = useCanvasStore();
  const selectedIds = (useCanvasStore as any)((s: any) => s.selectedIds as string[] | undefined);
  const { updateToolOptions } = useToolStore();

  const rectIds = useMemo(() => {
    if (selectedIds && selectedIds.length > 0) {
      return selectedIds.filter((id: string) => elements.find((e) => e.id === id && e.type === "rect"));
    }
    if (selectedElement) {
      const el = elements.find((e) => e.id === selectedElement);
      return el?.type === "rect" ? [selectedElement] : [];
    }
    return [];
  }, [selectedIds, selectedElement, elements]);

  const firstRect = useMemo(() => (rectIds.length ? elements.find((e) => e.id === rectIds[0]) : undefined), [rectIds, elements]);
  const style = (firstRect?.style || {}) as any;
  const data = (firstRect?.data || {}) as any;
  const size = (firstRect?.size || {}) as any;

  const batchUpdate = (patch: Partial<any>, kind: "style" | "data" | "size" = "style") => {
    if (rectIds.length) {
      rectIds.forEach((id: string) => {
        const el = elements.find((e) => e.id === id)!;
        if (kind === "style") updateElement(id, { style: { ...(el.style || {}), ...(patch as any) } });
        else if (kind === "data") updateElement(id, { data: { ...(el.data || {}), ...(patch as any) } } as any);
        else if (kind === "size") updateElement(id, { size: { ...(el.size || {}), ...(patch as any) } });
      });
    } else {
      // 无选中：更新默认矩形工具样式
      if (kind === "style") updateToolOptions("rect" as any, patch as any);
    }
  };

  // 填充与描边
  const handleFill = (hex: string) => batchUpdate({ fill: hex }, "style");
  const handleStroke = (hex: string | null) => {
    if (hex === null) batchUpdate({ stroke: undefined, strokeWidth: 0 }, "style");
    else batchUpdate({ stroke: hex }, "style");
  };
  const handleStrokeWidth = (v: number) => batchUpdate({ strokeWidth: v }, "style");

  // 圆角
  const handleCorner = (v: number) => batchUpdate({ rx: v, ry: v }, "data");

  // 宽高与锁定比例
  const [lockRatio, setLockRatio] = useState(true);
  const handleWidth = (w: number) => {
    if (!firstRect) return;
    const ratio = size.height ? size.height / size.width : 1;
    if (lockRatio) {
      batchUpdate({ width: w, height: Math.round(w * ratio) }, "size");
    } else {
      batchUpdate({ width: w }, "size");
    }
  };
  const handleHeight = (h: number) => {
    if (!firstRect) return;
    const ratio = size.width ? size.width / size.height : 1;
    if (lockRatio) {
      batchUpdate({ height: h, width: Math.round(h * ratio) }, "size");
    } else {
      batchUpdate({ height: h }, "size");
    }
  };

  // 弹窗：描边设置（宽度）
  const [strokeOpen, setStrokeOpen] = useState(false);
  const StrokePanel = (
    <div className="w-72 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Stroke</span>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setStrokeOpen(false)} />
      </div>
      <div className="flex items-center gap-3">
        <Slider className="flex-1" value={style.strokeWidth ?? 1} onChange={(v) => handleStrokeWidth(v as number)} min={0} max={20} />
        <InputNumber value={style.strokeWidth ?? 1} onChange={(v) => handleStrokeWidth((v as number) ?? 1)} min={0} max={20} />
      </div>
    </div>
  );

  return (
    <div className="text-toolbar">
      {/* 填充色 */}
      <span className="icon-btn color-dot">
        <Tooltip title="Fill color">
          <ColorPicker value={style.fill || "#cccccc"} onChange={(c) => handleFill(c.toHexString())} />
        </Tooltip>
      </span>

      {/* 描边色与宽度 */}
      <span className="icon-btn color-dot">
        <Tooltip title="Stroke color">
          <ColorPicker
            value={style.stroke || "#000000"}
            onChange={(c) => handleStroke(c.toHexString())}
            showText
          />
        </Tooltip>
      </span>
      <span className="pill">
        <Space size={4}>
          <Popover placement="bottomLeft" trigger={"click"} open={strokeOpen} onOpenChange={setStrokeOpen} content={StrokePanel}>
            <Button>Stroke</Button>
          </Popover>
        </Space>
      </span>

      <span className="vdiv" />

      {/* 圆角 */}
      <span className="pill" style={{ paddingRight: 12 }}>
        <span className="text-xs text-gray-500 mr-2">Corner</span>
        <Slider style={{ width: 120 }} value={data.rx ?? 0} onChange={(v) => handleCorner(v as number)} min={0} max={100} />
      </span>

      <span className="vdiv" />

      {/* 宽度/高度 + 比例锁 */}
      <span className="pill">
        <span className="text-xs text-gray-500 mr-1">W</span>
        <InputNumber value={size.width ?? 0} min={1} onChange={(v) => handleWidth((v as number) ?? size.width)} />
      </span>
      <span className="pill">
        <span className="text-xs text-gray-500 mr-1">H</span>
        <InputNumber value={size.height ?? 0} min={1} onChange={(v) => handleHeight((v as number) ?? size.height)} />
      </span>
      <span className="icon-btn">
        <Tooltip title={lockRatio ? "解锁比例" : "锁定比例"}>
          <Button shape="circle" icon={lockRatio ? <LinkOutlined /> : <DisconnectOutlined />} onClick={() => setLockRatio(!lockRatio)} />
        </Tooltip>
      </span>
    </div>
  );
}
