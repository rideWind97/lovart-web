import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Slider } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ZoomControlsProps {
  canvas: any;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ canvas }) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!canvas) return;

    const updateZoom = () => {
      setZoom(Math.round(canvas.getZoom() * 100) / 100);
    };

    // 监听缩放事件
    canvas.on('mouse:wheel', updateZoom);
    canvas.on('zoom', updateZoom);

    // 初始设置
    updateZoom();

    return () => {
      canvas.off('mouse:wheel', updateZoom);
      canvas.off('zoom', updateZoom);
    };
  }, [canvas]);

  const handleZoomIn = () => {
    if (!canvas) return;
    const currentZoom = canvas.getZoom();
    const newZoom = Math.min(currentZoom * 1.2, 20);
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoom);
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const currentZoom = canvas.getZoom();
    const newZoom = Math.max(currentZoom / 1.2, 0.01);
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, newZoom);
  };

  const handleResetZoom = () => {
    if (!canvas) return;
    canvas.setZoom(1);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
  };

  const handleZoomChange = (value: number) => {
    if (!canvas) return;
    const zoomValue = value / 100;
    canvas.zoomToPoint({ x: canvas.width / 2, y: canvas.height / 2 }, zoomValue);
  };

  if (!canvas) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
      <Space direction="vertical" size="small">
        <div className="flex items-center space-x-2">
          <Button 
            type="text" 
            size="small" 
            icon={<ZoomOutOutlined />} 
            onClick={handleZoomOut}
            title="缩小"
          />
          <div className="w-20">
            <Slider
              min={1}
              max={2000}
              value={Math.round(zoom * 100)}
              onChange={handleZoomChange}
              tooltip={{ formatter: (value) => `${value}%` }}
            />
          </div>
          <Button 
            type="text" 
            size="small" 
            icon={<ZoomInOutlined />} 
            onClick={handleZoomIn}
            title="放大"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Text className="text-xs text-gray-500">
            {Math.round(zoom * 100)}%
          </Text>
          <Button 
            type="text" 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={handleResetZoom}
            title="重置缩放"
          />
        </div>
      </Space>
    </div>
  );
};
