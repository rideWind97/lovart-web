import React, { useState, useEffect } from 'react';
import { Card, Select, ColorPicker, Slider, Space, Typography, Divider, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useCanvasStore } from '@/stores/canvasStore';
import { useToolStore } from '@/stores/toolStore';

const { Text } = Typography;
const { Option } = Select;

export const TextPropertiesPanel: React.FC = () => {
  const { selectedElement, elements, updateElement, selectElement } = useCanvasStore();
  const { updateToolOptions } = useToolStore();
  const [isVisible, setIsVisible] = useState(false);

  const selectedTextElement = selectedElement 
    ? elements.find(el => el.id === selectedElement && el.type === 'text')
    : null;

  // 当选中文本元素时显示面板
  useEffect(() => {
    if (selectedTextElement) {
      setIsVisible(true);
    }
  }, [selectedTextElement]);

  // 调试信息
  console.log('TextPropertiesPanel render:', {
    selectedElement,
    selectedTextElement: selectedTextElement?.id,
    isVisible
  });

  const handleFontSizeChange = (value: number) => {
    if (selectedTextElement) {
      updateElement(selectedTextElement.id, {
        style: { ...selectedTextElement.style, fontSize: value }
      });
    } else {
      updateToolOptions('text', { fontSize: value });
    }
  };

  const handleFontFamilyChange = (value: string) => {
    if (selectedTextElement) {
      updateElement(selectedTextElement.id, {
        style: { ...selectedTextElement.style, fontFamily: value }
      });
    } else {
      updateToolOptions('text', { fontFamily: value });
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedTextElement) {
      updateElement(selectedTextElement.id, {
        style: { ...selectedTextElement.style, fill: color }
      });
    } else {
      updateToolOptions('text', { fillColor: color });
    }
  };

  const handleTextAlignChange = (value: string) => {
    if (selectedTextElement) {
      updateElement(selectedTextElement.id, {
        style: { ...selectedTextElement.style, textAlign: value as any }
      });
    } else {
      updateToolOptions('text', { textAlign: value as any });
    }
  };

  const handleFontWeightChange = (value: string) => {
    if (selectedTextElement) {
      updateElement(selectedTextElement.id, {
        style: { ...selectedTextElement.style, fontWeight: value }
      });
    } else {
      updateToolOptions('text', { fontWeight: value });
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    selectElement(null);
  };

  if (!isVisible || !selectedTextElement) {
    return null;
  }

  return (
    <Card 
      size="small" 
      title={
        <div className="flex items-center justify-between">
          <span>文本属性</span>
          <Button 
            type="text" 
            size="small" 
            icon={<CloseOutlined />} 
            onClick={handleClose}
          />
        </div>
      } 
      className="w-64"
    >
      <Space direction="vertical" className="w-full">
        {/* 字体大小 */}
        <div>
          <Text className="text-sm font-medium">字体大小</Text>
          <Slider
            min={8}
            max={72}
            value={selectedTextElement.style.fontSize || 16}
            onChange={handleFontSizeChange}
            className="mt-2"
          />
        </div>

        <Divider className="my-2" />

        {/* 字体族 */}
        <div>
          <Text className="text-sm font-medium">字体</Text>
          <Select
            value={selectedTextElement.style.fontFamily || 'Arial'}
            onChange={handleFontFamilyChange}
            className="w-full mt-2"
          >
            <Option value="Arial">Arial</Option>
            <Option value="Helvetica">Helvetica</Option>
            <Option value="Times New Roman">Times New Roman</Option>
            <Option value="Georgia">Georgia</Option>
            <Option value="Verdana">Verdana</Option>
            <Option value="Courier New">Courier New</Option>
            <Option value="微软雅黑">微软雅黑</Option>
            <Option value="宋体">宋体</Option>
            <Option value="黑体">黑体</Option>
          </Select>
        </div>

        <Divider className="my-2" />

        {/* 字体颜色 */}
        <div>
          <Text className="text-sm font-medium">颜色</Text>
          <ColorPicker
            value={selectedTextElement.style.fill || '#000000'}
            onChange={(color) => handleColorChange(color.toHexString())}
            className="w-full mt-2"
            showText
          />
        </div>

        <Divider className="my-2" />

        {/* 文本对齐 */}
        <div>
          <Text className="text-sm font-medium">对齐方式</Text>
          <Select
            value={selectedTextElement.style.textAlign || 'left'}
            onChange={handleTextAlignChange}
            className="w-full mt-2"
          >
            <Option value="left">左对齐</Option>
            <Option value="center">居中</Option>
            <Option value="right">右对齐</Option>
          </Select>
        </div>

        <Divider className="my-2" />

        {/* 字体粗细 */}
        <div>
          <Text className="text-sm font-medium">字体粗细</Text>
          <Select
            value={selectedTextElement.style.fontWeight || 'normal'}
            onChange={handleFontWeightChange}
            className="w-full mt-2"
          >
            <Option value="normal">正常</Option>
            <Option value="bold">粗体</Option>
            <Option value="lighter">细体</Option>
            <Option value="bolder">更粗</Option>
          </Select>
        </div>
      </Space>
    </Card>
  );
};
