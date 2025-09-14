import React, { useState, useRef } from 'react';
import { Comment } from '../../types/comment';
import { useCommentStore } from '../../stores/commentStore';

interface CommentIconProps {
  comment: Comment;
  onClick: () => void;
}

export const CommentIcon: React.FC<CommentIconProps> = ({ comment, onClick }) => {
  const { updateComment, selectedCommentIds, toggleCommentSelection } = useCommentStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  
  // 计算评论总数（包括回复）
  const totalComments = 1 + (comment.replies?.length || 0);
  
  // 检查是否被选中
  const isSelected = selectedCommentIds.includes(comment.id);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !iconRef.current) return;
    
    const canvasElement = document.querySelector('canvas');
    if (!canvasElement) return;
    
    const canvasRect = canvasElement.getBoundingClientRect();
    
    // 计算相对于画布的位置
    let newX = e.clientX - canvasRect.left - dragOffset.x;
    let newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // 限制在画布范围内
    newX = Math.max(0, Math.min(newX, canvasRect.width));
    newY = Math.max(0, Math.min(newY, canvasRect.height));
    
    // 更新评论位置
    updateComment(comment.id, {
      position: { x: newX, y: newY }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 添加全局鼠标事件监听
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd + 点击：切换选择状态
        toggleCommentSelection(comment.id);
      } else {
        // 普通点击：查看评论详情
        onClick();
      }
    }
  };
  
  return (
    <div
      ref={iconRef}
      className={`absolute group select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: comment.position.x,
        top: comment.position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 1001 : 1000,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* 评论图标 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg transition-all duration-200 ${
          isDragging 
            ? 'scale-125 shadow-2xl' 
            : 'group-hover:scale-110'
        } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        style={{ 
          backgroundColor: comment.color || '#007bff',
          opacity: isDragging ? 0.8 : 1,
          border: isSelected ? '2px solid #3b82f6' : 'none'
        }}
      >
        {totalComments}
      </div>
      
      {/* 悬停提示 */}
      {!isDragging && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {comment.content.length > 30 
            ? `${comment.content.substring(0, 30)}...` 
            : comment.content
          }
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* 拖拽提示 */}
      {isDragging && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-500 text-white text-xs rounded whitespace-nowrap">
          拖拽移动评论位置
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-500"></div>
        </div>
      )}
      
      {/* 已解决标识 */}
      {comment.isResolved && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};
