import React, { useState } from 'react';
import { Modal, Input, Button, Tag, Space, Divider, Avatar } from 'antd';
import { 
  MessageOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  CloseOutlined,
  SendOutlined
} from '@ant-design/icons';
import { Comment } from '../../types/comment';
import { useCommentStore } from '../../stores/commentStore';

interface CommentDetailProps {
  comment: Comment | null;
  visible: boolean;
  onClose: () => void;
}

export const CommentDetail: React.FC<CommentDetailProps> = ({ 
  comment, 
  visible, 
  onClose 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('用户');

  const {
    updateComment,
    deleteComment,
    resolveComment,
    addReply,
  } = useCommentStore();

  if (!comment) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      updateComment(comment.id, { content: editContent.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleAddReply = () => {
    if (replyContent.trim()) {
      addReply(comment.id, {
        content: replyContent.trim(),
        author: replyAuthor,
        position: comment.position,
        elementId: comment.elementId,
        isVisible: true,
      });
      setReplyContent('');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <MessageOutlined />
          <span>评论详情</span>
          {comment.isResolved && (
            <Tag color="green" style={{ fontSize: '12px' }}>已解决</Tag>
          )}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="comment-detail-modal"
    >
      <div className="space-y-4">
        {/* 评论内容 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar
                size="small"
                style={{ backgroundColor: comment.color }}
              >
                {comment.author.charAt(0).toUpperCase()}
              </Avatar>
              <span className="font-medium">{comment.author}</span>
              <span className="text-sm text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <Space>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
              <Button
                type="text"
                size="small"
                icon={comment.isResolved ? <CloseOutlined /> : <CheckOutlined />}
                onClick={() => resolveComment(comment.id)}
              >
                {comment.isResolved ? '标记为未解决' : '标记为已解决'}
              </Button>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  deleteComment(comment.id);
                  onClose();
                }}
              >
                删除
              </Button>
            </Space>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Input.TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
              <div className="flex justify-end gap-2">
                <Button size="small" onClick={handleCancelEdit}>
                  取消
                </Button>
                <Button size="small" type="primary" onClick={handleSaveEdit}>
                  保存
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}
        </div>

        {/* 回复列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            <Divider orientation="left">回复 ({comment.replies.length})</Divider>
            <div className="space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-white border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: reply.color }}
                    >
                      {reply.author.charAt(0).toUpperCase()}
                    </Avatar>
                    <span className="font-medium text-sm">{reply.author}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">{reply.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加回复 */}
        <div>
          <Divider orientation="left">添加回复</Divider>
          <div className="space-y-3">
            <Input
              placeholder="回复作者"
              value={replyAuthor}
              onChange={(e) => setReplyAuthor(e.target.value)}
              size="small"
            />
            <Input.TextArea
              placeholder="输入回复内容..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
            <div className="flex justify-end">
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={handleAddReply}
                disabled={!replyContent.trim()}
              >
                发送回复
              </Button>
            </div>
          </div>
        </div>

        {/* 位置信息 */}
        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
          <div>位置: ({Math.round(comment.position.x)}, {Math.round(comment.position.y)})</div>
          {comment.elementId && <div>关联元素: {comment.elementId}</div>}
          <div>创建时间: {formatDate(comment.createdAt)}</div>
          {comment.updatedAt !== comment.createdAt && (
            <div>更新时间: {formatDate(comment.updatedAt)}</div>
          )}
        </div>
      </div>
    </Modal>
  );
};
