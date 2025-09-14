import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Popconfirm,
  Tooltip,
  Divider
} from 'antd';
import { 
  MessageOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Comment } from '../../types/comment';
import { useCommentStore } from '../../stores/commentStore';

export const CommentPanel: React.FC = () => {
  const {
    comments,
    selectedCommentId,
    selectComment,
    deleteComment,
    resolveComment,
    updateComment,
  } = useCommentStore();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // 过滤评论
  const filteredComments = comments.filter((comment) => {
    const matchesSearch = comment.content.toLowerCase().includes(searchText.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'resolved' && comment.isResolved) ||
                         (filterStatus === 'unresolved' && !comment.isResolved);
    
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editingComment && editContent.trim()) {
      updateComment(editingComment, { content: editContent.trim() });
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <MessageOutlined />
            评论列表
          </h3>
          <span className="text-sm text-gray-500">
            {filteredComments.length} 条评论
          </span>
        </div>

        {/* 搜索和过滤 */}
        <Space.Compact className="w-full">
          <Input
            placeholder="搜索评论..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 100 }}
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="unresolved">未解决</Select.Option>
            <Select.Option value="resolved">已解决</Select.Option>
          </Select>
        </Space.Compact>
      </div>

      {/* 评论列表 */}
      <div className="flex-1 overflow-y-auto">
        <List
          dataSource={filteredComments}
          renderItem={(comment) => (
            <List.Item
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedCommentId === comment.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => selectComment(comment.id)}
            >
              <div className="w-full">
                {/* 评论头部 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: comment.color }}
                    />
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {comment.isResolved && (
                      <Tag color="green" size="small">已解决</Tag>
                    )}
                    <Tooltip title="编辑">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(comment);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title={comment.isResolved ? "标记为未解决" : "标记为已解决"}>
                      <Button
                        type="text"
                        size="small"
                        icon={comment.isResolved ? <CloseOutlined /> : <CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveComment(comment.id);
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="确定删除这条评论吗？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        deleteComment(comment.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>

                {/* 评论内容 */}
                <div className="mb-2">
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Input.TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 4 }}
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
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  )}
                </div>

                {/* 回复 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-4 space-y-2">
                    <Divider className="my-2" />
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: reply.color }}
                          />
                          <span className="text-xs font-medium">{reply.author}</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{reply.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 位置信息 */}
                <div className="text-xs text-gray-400 mt-2">
                  位置: ({Math.round(comment.position.x)}, {Math.round(comment.position.y)})
                  {comment.elementId && ` • 关联元素: ${comment.elementId}`}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};
