import React, { useState } from 'react';
import { Card, Input, Button, Space, Typography, Avatar, List, Spin, Progress } from 'antd';
import { SendOutlined, PlusOutlined, SettingOutlined, ShareAltOutlined, ExpandOutlined, CloseOutlined } from '@ant-design/icons';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/types/chat';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ChatPanel: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { messages, aiStatus, generationQueue, addMessage, setTyping } = useChatStore();

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // 添加用户消息
    addMessage({
      type: 'user',
      content: inputValue,
    });

    // 模拟AI回复
    setTyping(true);
    setTimeout(() => {
      addMessage({
        type: 'assistant',
        content: '让我思考一下...',
      });
      setTyping(false);
    }, 1000);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message: Message) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar
          size="small"
          icon={message.type === 'user' ? '👤' : '🤖'}
          className={message.type === 'user' ? 'ml-2' : 'mr-2'}
        />
        <div
          className={`px-3 py-2 rounded-lg ${
            message.type === 'user'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <Text className={message.type === 'user' ? 'text-white' : 'text-gray-800'}>
            {message.content}
          </Text>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <Title level={5} className="!mb-0">
          小宝宝开摩托起飞
        </Title>
        <Space>
          <Button type="text" icon={<PlusOutlined />} size="small" />
          <Button type="text" icon={<SettingOutlined />} size="small" />
          <Button type="text" icon={<ShareAltOutlined />} size="small" />
          <Button type="text" icon={<ExpandOutlined />} size="small" />
          <Button type="text" icon={<CloseOutlined />} size="small" />
        </Space>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 mb-4">Sep 10, 2025</div>
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-4">🤖</div>
            <div>让我思考一下...</div>
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={renderMessage}
            locale={{ emptyText: '' }}
          />
        )}

        {aiStatus === 'thinking' && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-2">
              <Avatar size="small" icon="🤖" className="mr-2" />
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <Spin size="small" />
                <Text className="ml-2 text-gray-600">AI正在思考...</Text>
              </div>
            </div>
          </div>
        )}

        {generationQueue.length > 0 && (
          <div className="space-y-2">
            {generationQueue.map((task) => (
              <Card key={task.id} size="small">
                <div className="flex items-center justify-between">
                  <Text className="text-sm">{task.prompt}</Text>
                  <Progress
                    percent={task.progress}
                    size="small"
                    status={task.status === 'failed' ? 'exception' : 'active'}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200">
        <Space.Compact className="w-full">
          <Button icon={<PlusOutlined />} />
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Start with an idea or task."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim()}
          />
        </Space.Compact>
      </div>
    </div>
  );
};
