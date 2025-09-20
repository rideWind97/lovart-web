import { useRef } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { useToolStore } from '@/stores/toolStore';

export interface ViewportState {
  size: { width: number; height: number };
  scale: number;
  position: { x: number; y: number };
}

export function useCreateElement(viewport: ViewportState) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { setActiveTool, getDefaultOptions } = useToolStore.getState();
  const { addElement, selectElement } = useCanvasStore.getState() as any;

  const createText = (x: number, y: number) => {
    const id = crypto.randomUUID();
    const now = new Date();
    const textOpts = getDefaultOptions('text');
    addElement({
      id,
      type: 'text',
      position: { x, y },
      size: { width: 150, height: 30 },
      style: { fontSize: textOpts.fontSize || 24, fontFamily: textOpts.fontFamily || 'Arial', fill: (textOpts as any).fillColor || '#000000' },
      data: { text: '双击编辑文字' },
      zIndex: 0,
      createdAt: now,
      updatedAt: now,
    });
    selectElement(id);
    setActiveTool('select');
  };

  const createRect = (x: number, y: number) => {
    const id = crypto.randomUUID();
    const now = new Date();
    const rectOpts = getDefaultOptions('rect');
    addElement({
      id,
      type: 'rect',
      position: { x, y },
      size: { width: 120, height: 80 },
      style: { fill: rectOpts.fillColor || 'transparent', stroke: rectOpts.strokeColor || '#000000', strokeWidth: rectOpts.strokeWidth || 2 },
      data: { rx: 0, ry: 0 },
      zIndex: 0,
      createdAt: now,
      updatedAt: now,
    });
    selectElement(id);
    setActiveTool('select');
  };

  const createImageFromDataURL = (dataUrl: string) => {
    const { size, scale, position } = viewport;
    const id = crypto.randomUUID();
    const now = new Date();
    const initW = 200;
    const initH = 200;
    const pos = {
      x: size.width / scale / 2 - initW / 2 - position.x / scale,
      y: size.height / scale / 2 - initH / 2 - position.y / scale,
    };
    addElement({
      id,
      type: 'image',
      position: pos,
      size: { width: initW, height: initH },
      style: { opacity: 1 },
      data: { src: dataUrl, alt: 'Uploaded image' },
      zIndex: 0,
      createdAt: now,
      updatedAt: now,
    });
    selectElement(id);
    setActiveTool('select');
  };

  const openImagePicker = () => fileInputRef.current?.click();

  return {
    fileInputRef,
    createText,
    createRect,
    createImageFromDataURL,
    openImagePicker,
  };
}
