import React from "react";
import { Button, Space, Tooltip } from "antd";
import {
  SelectOutlined,
  FontSizeOutlined,
  BorderOutlined,
  PictureOutlined,
  EditOutlined,
  MessageOutlined,
  LineOutlined,
} from "@ant-design/icons";
import { useToolStore } from "@/stores/toolStore";
import { ToolType } from "@/types/tool";

const tools = [
  { type: "select" as ToolType, icon: <SelectOutlined />, name: "选择" },
  { type: "text" as ToolType, icon: <FontSizeOutlined />, name: "文本" },
  { type: "rect" as ToolType, icon: <BorderOutlined />, name: "矩形" },
  // { type: "circle" as ToolType, icon: <CiCircleOutlined />, name: "圆形" },
  { type: "line" as ToolType, icon: <LineOutlined />, name: "直线" },
  { type: "image" as ToolType, icon: <PictureOutlined />, name: "图片" },
  { type: "pen" as ToolType, icon: <EditOutlined />, name: "画笔" },
  { type: "comment" as ToolType, icon: <MessageOutlined />, name: "评论" },
  // { type: "zoom" as ToolType, icon: <ZoomInOutlined />, name: "缩放" },
  // { type: "pan" as ToolType, icon: <DragOutlined />, name: "平移" },
];

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useToolStore();

  return (
    <div className="w-16 h-full bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2 shadow-lg">
      <Space direction="vertical" size="small">
        {tools.map((tool) => (
          <Tooltip key={tool.type} title={tool.name} placement="right">
            <Button
              type={activeTool === tool.type ? "primary" : "text"}
              icon={tool.icon}
              size="large"
              onClick={() => setActiveTool(tool.type)}
              className="w-12 h-12 flex items-center justify-center"
            />
          </Tooltip>
        ))}
      </Space>
    </div>
  );
};
