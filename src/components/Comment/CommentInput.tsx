import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Select, ColorPicker } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { useCommentStore } from '../../stores/commentStore';
import { COMMENT_COLORS } from '../../types/comment';

interface CommentInputProps {
  position: { x: number; y: number };
  elementId?: string;
  onCancel: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({ 
  position, 
  elementId, 
  onCancel 
}) => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('用户');
  const [color, setColor] = useState(COMMENT_COLORS[0]);
  const { addComment } = useCommentStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 自动聚焦到输入框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (content.trim()) {
      addComment({
        content: content.trim(),
        position,
        elementId,
        author,
        color,
      });
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg border p-4 min-w-80 max-w-96 z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          {elementId ? '添加元素评论' : '添加画布评论'}
        </h4>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onCancel}
        />
      </div>

      {/* 评论内容输入 */}
      <Input.TextArea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入评论内容..."
        autoSize={{ minRows: 3, maxRows: 6 }}
        className="mb-3"
      />

      {/* 作者和颜色选择 */}
      <div className="flex items-center gap-2 mb-3">
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="作者"
          size="small"
          className="flex-1"
        />
        <Select
          value={color}
          onChange={setColor}
          size="small"
          className="w-20"
        >
          {COMMENT_COLORS.map((c) => (
            <Select.Option key={c} value={c}>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: c }}
              />
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2">
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          disabled={!content.trim()}
        >
          添加评论
        </Button>
      </div>

      {/* 快捷键提示 */}
      <div className="text-xs text-gray-500 mt-2">
        按 Ctrl+Enter 快速提交，Esc 取消
      </div>
    </div>
  );
};
