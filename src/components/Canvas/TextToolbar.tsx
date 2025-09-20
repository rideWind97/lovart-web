import React, { useMemo, useState } from "react";
import { Space, Select, InputNumber, Popover, Slider, Button, Tooltip, ColorPicker, Divider, Checkbox } from "antd";
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined, SettingOutlined, CloseOutlined, PlusOutlined, ReloadOutlined, EyeInvisibleOutlined, EyeOutlined, BgColorsOutlined, ExperimentOutlined } from "@ant-design/icons";
import { useCanvasStore } from "@/stores/canvasStore";
import { useToolStore } from "@/stores/toolStore";
import "./TextToolbar.css";

const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "微软雅黑",
  "宋体",
  "黑体",
];

const WEIGHTS: Array<{ label: string; value: string }> = [
  { label: "Thin", value: "100" },
  { label: "Light", value: "300" },
  { label: "Regular", value: "normal" },
  { label: "Medium", value: "500" },
  { label: "SemiBold", value: "600" },
  { label: "Bold", value: "bold" },
  { label: "Black", value: "900" },
];

export const TextToolbar: React.FC = () => {
  const { selectedElement, elements, updateElement } = useCanvasStore();
  const selectedIds = (useCanvasStore as any)((s: any) => s.selectedIds as string[] | undefined);
  const { updateToolOptions } = useToolStore();
  const [opacityOpen, setOpacityOpen] = useState(false);
  const [shadowOpen, setShadowOpen] = useState(false);
  const [blurOpen, setBlurOpen] = useState(false);

  const textIds = useMemo(() => {
    if (selectedIds && selectedIds.length > 0) {
      return selectedIds.filter((id: string) => elements.find((e) => e.id === id && e.type === "text"));
    }
    if (selectedElement) {
      const el = elements.find((e) => e.id === selectedElement);
      return el?.type === "text" ? [selectedElement] : [];
    }
    return [];
  }, [selectedIds, selectedElement, elements]);

  const firstTextEl = useMemo(() => {
    return textIds.length ? elements.find((e) => e.id === textIds[0]) : undefined;
  }, [textIds, elements]);

  const style = (firstTextEl?.style || {}) as any;

  const setStyleBatch = (patch: Record<string, any>) => {
    if (textIds.length) {
      textIds.forEach((id: string) => {
        const el = elements.find((e) => e.id === id)!;
        updateElement(id, { style: { ...(el.style || {}), ...patch } });
      });
    } else {
      // 无选中时写入工具默认样式
      updateToolOptions("text", patch);
    }
  };

  const handleFontFamily = (v: string) => setStyleBatch({ fontFamily: v });
  const handleFontWeight = (v: string) => setStyleBatch({ fontWeight: v });
  const handleFontSize = (v: number | null) => {
    if (!v) return;
    setStyleBatch({ fontSize: v });
  };
  const handleAlign = (v: "left" | "center" | "right") => setStyleBatch({ textAlign: v });
  const handleColor = (hex: string) => setStyleBatch({ fill: hex });
  const handleOpacity = (percent: number) => setStyleBatch({ opacity: Math.max(0, Math.min(1, percent / 100)) });
  // Shadow
  const addShadow = () =>
    setStyleBatch({
      shadowColor: "#000000",
      shadowBlur: 4,
      shadowOffsetX: 20,
      shadowOffsetY: 20,
      shadowOpacity: 0.25,
      shadowEnabled: true,
    });
  const handleShadowToggle = (v: boolean) => setStyleBatch({ shadowEnabled: v });
  const handleShadowColor = (hex: string) => setStyleBatch({ shadowColor: hex });
  const handleShadowOpacity = (percent: number) => setStyleBatch({ shadowOpacity: Math.max(0, Math.min(1, percent / 100)) });
  const handleShadowOffsetX = (v: number) => setStyleBatch({ shadowOffsetX: v });
  const handleShadowOffsetY = (v: number) => setStyleBatch({ shadowOffsetY: v });
  const handleShadowBlur = (v: number) => setStyleBatch({ shadowBlur: v });
  // Layer blur
  const handleLayerBlur = (v: number) => setStyleBatch({ blurRadius: Math.max(0, v) });

  const opacityPercent = Math.round(((style.opacity ?? 1) as number) * 100);

  const OpacityPanel = (
    <div className="w-64 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Opacity</span>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpacityOpen(false)} />
      </div>
      <div className="flex items-center gap-3">
        <Slider className="flex-1" value={opacityPercent} onChange={handleOpacity} min={0} max={100} />
        <InputNumber value={opacityPercent} onChange={(v) => handleOpacity((v as number) ?? 100)} min={0} max={100} />
      </div>
    </div>
  );

  const shadowEnabled = (style.shadowEnabled ?? true) as boolean;
  const shadowOpacityPercent = Math.round(((style.shadowOpacity ?? 0.25) as number) * 100);
  const ShadowPanel = (
    <div className="w-80 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Shadow</span>
        <div className="flex items-center gap-1">
          <Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => setStyleBatch({ shadowColor: "#000000", shadowBlur: 4, shadowOffsetX: 20, shadowOffsetY: 20, shadowOpacity: 0.25, shadowEnabled: true })} />
          <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setShadowOpen(false)} />
        </div>
      </div>
      {!style.shadowColor && !style.shadowBlur && !style.shadowOffsetX && !style.shadowOffsetY ? (
        <Button icon={<PlusOutlined />} onClick={addShadow} type="dashed" block>
          Add shadow
        </Button>
      ) : (
        <>
          <div className="flex items-center justify-between py-1 px-2 rounded bg-gray-100">
            <div className="flex items-center gap-2">
              <Checkbox checked={shadowEnabled} onChange={(e) => handleShadowToggle(e.target.checked)} />
              <span>Shadow</span>
            </div>
            <Button type="text" size="small" icon={shadowEnabled ? <EyeOutlined /> : <EyeInvisibleOutlined />} onClick={() => handleShadowToggle(!shadowEnabled)} />
          </div>
          <Divider className="my-2" />
          <div className="space-y-3">
            <div>
              <div className="text-xs mb-1">OffsetX</div>
              <Slider value={style.shadowOffsetX ?? 0} min={-200} max={200} onChange={handleShadowOffsetX} />
            </div>
            <div>
              <div className="text-xs mb-1">OffsetY</div>
              <Slider value={style.shadowOffsetY ?? 0} min={-200} max={200} onChange={handleShadowOffsetY} />
            </div>
            <div>
              <div className="text-xs mb-1">Blur</div>
              <Slider value={style.shadowBlur ?? 0} min={0} max={100} onChange={handleShadowBlur} />
            </div>
            <div className="flex items-center gap-2">
              <ColorPicker value={style.shadowColor || "#000000"} onChange={(c) => handleShadowColor(c.toHexString())} />
              <InputNumber value={shadowOpacityPercent} min={0} max={100} onChange={(v) => handleShadowOpacity((v as number) ?? 25)} />
              <span className="text-xs text-gray-500">%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const blurRadius = Math.round((style.blurRadius ?? 0) as number);
  const BlurPanel = (
    <div className="w-64 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Layer blur</span>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setBlurOpen(false)} />
      </div>
      <div className="flex items-center gap-3">
        <Slider className="flex-1" value={blurRadius} onChange={(v) => handleLayerBlur(v as number)} min={0} max={250} />
        <InputNumber value={blurRadius} onChange={(v) => handleLayerBlur((v as number) ?? 0)} min={0} max={250} />
      </div>
    </div>
  );

  return (
    <div className="text-toolbar">
      {/* 左侧图标区：阴影 / 模糊 */}
      <span className="icon-btn">
        <Popover placement="bottomLeft" trigger={"click"} open={shadowOpen} onOpenChange={setShadowOpen} content={ShadowPanel}>
          <Tooltip title="Shadow">
            <Button shape="circle" icon={<BgColorsOutlined />} />
          </Tooltip>
        </Popover>
      </span>
      <span className="icon-btn">
        <Popover placement="bottomLeft" trigger={"click"} open={blurOpen} onOpenChange={setBlurOpen} content={BlurPanel}>
          <Tooltip title="Layer blur">
            <Button shape="circle" icon={<ExperimentOutlined />} />
          </Tooltip>
        </Popover>
      </span>

      <span className="vdiv" />

      {/* 颜色小圆点 */}
      <span className="icon-btn color-dot">
        <ColorPicker
          value={style.fill || "#000000"}
          onChange={(c) => handleColor(c.toHexString())}
          presets={[{ label: "Recent", colors: [] }]}
        />
      </span>

      <span className="vdiv" />

      {/* 字体、字重、字号 胶囊组 */}
      <span className="pill">
        <Select
          value={style.fontFamily || "Inter"}
          onChange={handleFontFamily}
          style={{ width: 140 }}
          options={FONT_FAMILIES.map((f) => ({ label: f, value: f }))}
        />
      </span>
      <span className="pill">
        <Select
          value={style.fontWeight || "normal"}
          onChange={handleFontWeight}
          style={{ width: 120 }}
          options={WEIGHTS.map((w) => ({ label: w.label, value: w.value }))}
        />
      </span>
      <span className="pill">
        <InputNumber value={style.fontSize || 24} min={1} max={512} onChange={handleFontSize} />
      </span>

      <span className="vdiv" />

      {/* 对齐 胶囊组 */}
      <span className="pill">
        <Space.Compact>
          <Tooltip title="左对齐">
            <Button
              type={style.textAlign === "left" ? "primary" : "default"}
              icon={<AlignLeftOutlined />}
              onClick={() => handleAlign("left")}
            />
          </Tooltip>
          <Tooltip title="居中">
            <Button
              type={style.textAlign === "center" ? "primary" : "default"}
              icon={<AlignCenterOutlined />}
              onClick={() => handleAlign("center")}
            />
          </Tooltip>
          <Tooltip title="右对齐">
            <Button
              type={style.textAlign === "right" ? "primary" : "default"}
              icon={<AlignRightOutlined />}
              onClick={() => handleAlign("right")}
            />
          </Tooltip>
        </Space.Compact>
      </span>

      <span className="vdiv" />

      {/* 设置（不透明度）图标按钮 */}
      <span className="icon-btn">
        <Popover placement="bottomLeft" trigger={"click"} open={opacityOpen} onOpenChange={setOpacityOpen} content={OpacityPanel}>
          <Tooltip title="Opacity">
            <Button shape="circle" icon={<SettingOutlined />} />
          </Tooltip>
        </Popover>
      </span>
    </div>
  );
}
