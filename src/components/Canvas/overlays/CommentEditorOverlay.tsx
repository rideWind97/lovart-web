import React, { useEffect, useRef, useState } from 'react';

interface Props {
  visible: boolean;
  position: { x: number; y: number } | null;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export const CommentEditorOverlay: React.FC<Props> = ({ visible, position, onSubmit, onCancel }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => ref.current?.focus(), 0);
    } else {
      setValue('');
    }
  }, [visible]);

  if (!visible || !position) return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x + 8,
    top: position.y + 8,
    width: 240,
    minHeight: 120,
    padding: '8px 10px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
    zIndex: 40,
  };

  return (
    <div style={style}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="添加评论..."
        style={{ width: '100%', height: 80, resize: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 8px', outline: 'none' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button onClick={onCancel} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>取消</button>
        <button onClick={() => value.trim() && onSubmit(value.trim())} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>提交</button>
      </div>
    </div>
  );
};
