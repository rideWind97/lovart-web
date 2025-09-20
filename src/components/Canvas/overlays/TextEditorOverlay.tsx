import React from 'react';

export interface TextEditorOverlayProps {
  visible: boolean;
  style: React.CSSProperties;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export const TextEditorOverlay: React.FC<TextEditorOverlayProps> = ({
  visible,
  style,
  value,
  onChange,
  onCommit,
  onCancel,
}) => {
  if (!visible) return null;
  return (
    <textarea
      style={style}
      value={value}
      autoFocus
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          (e.target as HTMLTextAreaElement).blur();
        } else if (e.key === 'Escape') {
          onCancel();
        }
      }}
    />
  );
};
