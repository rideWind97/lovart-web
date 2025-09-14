import React from 'react';
import { useCommentStore } from '../../stores/commentStore';

export const CommentSelectionBox: React.FC = () => {
  const { selectionBox, isSelecting } = useCommentStore();

  if (!isSelecting || !selectionBox) return null;

  return (
    <div
      className="absolute pointer-events-none border-2 border-blue-500 bg-blue-100 bg-opacity-20 z-40"
      style={{
        left: selectionBox.x,
        top: selectionBox.y,
        width: selectionBox.width,
        height: selectionBox.height,
      }}
    />
  );
};
